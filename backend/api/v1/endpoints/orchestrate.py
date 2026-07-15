from __future__ import annotations
import asyncio
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from shared.schemas import Project, ProjectRequirements
from orchestrator import orchestrate, OrchestratorEvent
import database.client as db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orchestrate", tags=["orchestrate"])


@router.post("/{project_id}")
async def start_orchestration(project_id: str):
    """Start multi-agent orchestration for a completed interview."""
    project_data = await db.get_project(project_id)
    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = Project(**project_data)

    if project.status not in ("ready", "error"):
        raise HTTPException(
            status_code=400,
            detail=f"Project not ready for orchestration (status: {project.status})"
        )

    if not project.interview or not project.interview.requirements:
        raise HTTPException(status_code=400, detail="Interview not completed")

    # Mark as orchestrating
    project.status = "orchestrating"
    project.updated_at = datetime.now(timezone.utc).isoformat()
    await db.save_project(project_id, project.model_dump())

    return {"status": "started", "project_id": project_id}


@router.get("/{project_id}/stream")
async def stream_orchestration(project_id: str):
    """SSE stream of agent progress and final blueprint."""
    project_data = await db.get_project(project_id)
    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = Project(**project_data)

    if not project.interview or not project.interview.requirements:
        raise HTTPException(status_code=400, detail="Interview not completed")

    requirements = project.interview.requirements

    async def event_generator():
        blueprint_data: dict | None = None

        try:
            async for event in orchestrate(requirements):
                yield {"data": event.to_sse()}

                if event.event_type == "blueprint_ready":
                    # Fetch the blueprint from the last orchestrate call
                    # (stored by the blueprint agent in the results dict)
                    pass

            # After orchestration completes, save blueprint
            # The orchestrate generator's last action stores the blueprint
            # We re-run to collect the final blueprint
            # Instead, we track it via a separate mechanism below

        except Exception as exc:
            logger.exception("Orchestration stream failed")
            yield {"data": json.dumps({"type": "error", "agent": "Orchestrator", "error": str(exc)})}

    # Use a queue to get the blueprint out of the generator
    async def event_generator_with_save():
        blueprint_result: dict | None = None
        final_results: dict = {}

        async def collect_orchestration():
            nonlocal blueprint_result, final_results

            queue: asyncio.Queue = asyncio.Queue()
            results: dict = {}

            from agents.planner.agent import PlannerAgent
            from agents.github.agent import GitHubAgent
            from agents.research.agent import ResearchAgent
            from agents.budget.agent import BudgetAgent
            from agents.architecture.agent import ArchitectureAgent
            from agents.roadmap.agent import RoadmapAgent
            from agents.skill_gap.agent import SkillGapAgent
            from agents.risk.agent import RiskAgent
            from agents.devils_advocate.agent import DevilsAdvocateAgent, DevilsAdvocateInput
            from agents.blueprint.agent import BlueprintAgent, SynthesisInput

            async def wrap(agent_name: str, coro):
                await queue.put({"type": "start", "agent": agent_name})
                try:
                    result = await coro
                    results[agent_name] = result.model_dump() if hasattr(result, "model_dump") else {}
                    await queue.put({"type": "complete", "agent": agent_name})
                except Exception as exc:
                    logger.exception("Agent %s failed", agent_name)
                    results[agent_name] = {}
                    await queue.put({"type": "error", "agent": agent_name, "error": str(exc)})
                finally:
                    await queue.put({"type": "_done", "agent": agent_name})

            phase1 = {
                "Planner": PlannerAgent().run(requirements),
                "GitHub": GitHubAgent().run(requirements),
                "Research": ResearchAgent().run(requirements),
                "Budget": BudgetAgent().run(requirements),
                "Architecture": ArchitectureAgent().run(requirements),
                "Roadmap": RoadmapAgent().run(requirements),
                "SkillGap": SkillGapAgent().run(requirements),
                "Risk": RiskAgent().run(requirements),
            }
            tasks = [asyncio.create_task(wrap(n, c)) for n, c in phase1.items()]

            done = 0
            while done < len(tasks):
                event = await queue.get()
                await output_queue.put(event)
                if event["type"] == "_done":
                    done += 1

            await asyncio.gather(*tasks, return_exceptions=True)

            # Phase 2: Devil's Advocate
            arch = results.get("Architecture", {})
            da_input = DevilsAdvocateInput(
                requirements=requirements.model_dump(),
                architecture_summary=arch.get("core_architecture_description", ""),
                tech_stack=arch.get("balanced", {}).get("tech_stack", []),
                estimated_cost=arch.get("balanced", {}).get("estimated_cost_usd", 0),
                timeline_months=requirements.timeline_months or 6,
            )
            da_task = asyncio.create_task(wrap("DevilsAdvocate", DevilsAdvocateAgent().run(da_input)))
            done = 0
            while done < 1:
                event = await queue.get()
                await output_queue.put(event)
                if event["type"] == "_done":
                    done += 1
            await da_task

            # Phase 3: Blueprint
            await output_queue.put({"type": "start", "agent": "Blueprint"})
            try:
                synthesis = SynthesisInput(
                    requirements=requirements.model_dump(),
                    planner_output=results.get("Planner", {}),
                    architecture_output=results.get("Architecture", {}),
                    budget_output=results.get("Budget", {}),
                    roadmap_output=results.get("Roadmap", {}),
                    skill_gap_output=results.get("SkillGap", {}),
                    risk_output=results.get("Risk", {}),
                    github_output=results.get("GitHub", {}),
                    research_output=results.get("Research", {}),
                    devils_advocate_output=results.get("DevilsAdvocate", {}),
                )
                blueprint = await BlueprintAgent().run(synthesis)
                blueprint_result = blueprint.model_dump()
                await output_queue.put({"type": "blueprint_ready", "agent": "Blueprint"})
            except Exception as exc:
                logger.exception("Blueprint failed")
                await output_queue.put({"type": "error", "agent": "Blueprint", "error": str(exc)})
            finally:
                await output_queue.put({"type": "_done", "agent": "Blueprint"})

            final_results.update(results)

        output_queue: asyncio.Queue = asyncio.Queue()
        orch_task = asyncio.create_task(collect_orchestration())

        while True:
            event = await output_queue.get()
            if event["type"] != "_done":
                yield {"data": json.dumps(event)}

            if event["type"] == "_done" and event["agent"] == "Blueprint":
                break

        await orch_task

        # Save blueprint to DB
        if blueprint_result:
            p_data = await db.get_project(project_id)
            if p_data:
                p = Project(**p_data)
                from shared.schemas import Blueprint
                p.blueprint = Blueprint(**blueprint_result)
                p.status = "complete"
                p.updated_at = datetime.now(timezone.utc).isoformat()
                await db.save_project(project_id, p.model_dump())

        yield {"data": json.dumps({"type": "done", "agent": "System", "project_id": project_id})}

    return EventSourceResponse(event_generator_with_save())
