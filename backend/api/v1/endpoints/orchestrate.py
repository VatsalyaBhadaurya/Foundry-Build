from __future__ import annotations
import asyncio
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from shared.schemas import Project
import database.client as db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orchestrate", tags=["orchestrate"])


@router.post("/{project_id}")
async def start_orchestration(project_id: str):
    project_data = await db.get_project(project_id)
    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")
    project = Project(**project_data)
    if project.status not in ("ready", "error"):
        raise HTTPException(status_code=400, detail=f"Project not ready (status: {project.status})")
    if not project.interview or not project.interview.requirements:
        raise HTTPException(status_code=400, detail="Interview not completed")
    project.status = "orchestrating"
    project.updated_at = datetime.now(timezone.utc).isoformat()
    await db.save_project(project_id, project.model_dump())
    return {"status": "started", "project_id": project_id}


@router.get("/{project_id}/stream")
async def stream_orchestration(project_id: str):
    project_data = await db.get_project(project_id)
    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")
    project = Project(**project_data)
    if not project.interview or not project.interview.requirements:
        raise HTTPException(status_code=400, detail="Interview not completed")

    requirements = project.interview.requirements

    async def generate():
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
        from shared.schemas import Blueprint

        # Single queue — only run_all writes, only generate() reads
        queue: asyncio.Queue[dict] = asyncio.Queue()
        results: dict = {}

        # Each phase tracks its own completion via asyncio.Event
        # so run_all never reads from queue (no race condition)

        def make_wrap(phase_events: list[asyncio.Event], idx: int):
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
                    phase_events[idx].set()
            return wrap

        async def run_all():
            # ── Phase 1: independent agents ──────────────────────────────
            phase1_agents = {
                "Planner":      PlannerAgent().run(requirements),
                "GitHub":       GitHubAgent().run(requirements),
                "Research":     ResearchAgent().run(requirements),
                "Budget":       BudgetAgent().run(requirements),
                "Architecture": ArchitectureAgent().run(requirements),
                "Roadmap":      RoadmapAgent().run(requirements),
                "SkillGap":     SkillGapAgent().run(requirements),
                "Risk":         RiskAgent().run(requirements),
            }
            phase1_events = [asyncio.Event() for _ in phase1_agents]
            tasks = [
                asyncio.create_task(make_wrap(phase1_events, i)(name, coro))
                for i, (name, coro) in enumerate(phase1_agents.items())
            ]
            # Wait for ALL phase 1 agents via their events (no queue reads here)
            await asyncio.gather(*[e.wait() for e in phase1_events])
            await asyncio.gather(*tasks, return_exceptions=True)

            # ── Phase 2: Devil's Advocate ─────────────────────────────────
            arch = results.get("Architecture", {})
            da_input = DevilsAdvocateInput(
                requirements=requirements.model_dump(),
                architecture_summary=arch.get("core_architecture_description", ""),
                tech_stack=arch.get("balanced", {}).get("tech_stack", []),
                estimated_cost=arch.get("balanced", {}).get("estimated_cost_usd", 0),
                timeline_months=requirements.timeline_months or 6,
            )
            da_done = asyncio.Event()
            da_task = asyncio.create_task(
                make_wrap([da_done], 0)("DevilsAdvocate", DevilsAdvocateAgent().run(da_input))
            )
            await da_done.wait()
            await da_task

            # ── Phase 3: Blueprint synthesis ──────────────────────────────
            await queue.put({"type": "start", "agent": "Blueprint"})
            blueprint_result = None
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
                bp = await BlueprintAgent().run(synthesis)
                blueprint_result = bp.model_dump()
                await queue.put({"type": "complete", "agent": "Blueprint"})
                await queue.put({"type": "blueprint_ready", "agent": "Blueprint"})
            except Exception as exc:
                logger.exception("Blueprint synthesis failed")
                await queue.put({"type": "error", "agent": "Blueprint", "error": str(exc)})

            # Persist to DB
            if blueprint_result:
                try:
                    p_data = await db.get_project(project_id)
                    if p_data:
                        p = Project(**p_data)
                        p.blueprint = Blueprint(**blueprint_result)
                        p.status = "complete"
                        p.updated_at = datetime.now(timezone.utc).isoformat()
                        await db.save_project(project_id, p.model_dump())
                except Exception:
                    logger.exception("Failed to persist blueprint")

            # Signal stream to end
            await queue.put({"type": "done", "agent": "System", "project_id": project_id})

        orch_task = asyncio.create_task(run_all())

        # Stream events to client; send heartbeat pings on timeout
        terminal_types = {"done", "blueprint_ready"}
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=20)
            except asyncio.TimeoutError:
                yield {"data": json.dumps({"type": "ping"})}
                continue

            yield {"data": json.dumps(event)}

            if event["type"] in terminal_types:
                break

        await orch_task

    return EventSourceResponse(generate(), ping=20)
