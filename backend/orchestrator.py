from __future__ import annotations
import asyncio
import json
import logging
from typing import AsyncGenerator
from shared.schemas import ProjectRequirements, Blueprint
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

logger = logging.getLogger(__name__)


class OrchestratorEvent:
    def __init__(self, event_type: str, agent: str, data: dict | None = None, error: str | None = None):
        self.event_type = event_type  # start | complete | error | blueprint_ready
        self.agent = agent
        self.data = data or {}
        self.error = error

    def to_sse(self) -> str:
        payload = {"type": self.event_type, "agent": self.agent}
        if self.error:
            payload["error"] = self.error
        if self.data and self.event_type == "complete":
            # Send a summary, not the full data (full data fetched separately)
            payload["summary"] = f"{self.agent} analysis complete"
        return json.dumps(payload)


async def orchestrate(
    requirements: ProjectRequirements,
) -> AsyncGenerator[OrchestratorEvent, None]:
    """
    Run all agents concurrently where possible, yielding progress events.

    Phase 1 (concurrent): planner, github, research, budget, architecture, roadmap, skill_gap, risk
    Phase 2 (sequential): devils_advocate (uses architecture from phase 1)
    Phase 3 (sequential): blueprint synthesizer (uses everything)
    """
    queue: asyncio.Queue[OrchestratorEvent] = asyncio.Queue()
    results: dict = {}

    async def wrap(agent_name: str, coro):
        await queue.put(OrchestratorEvent("start", agent_name))
        try:
            result = await coro
            results[agent_name] = result.model_dump() if hasattr(result, "model_dump") else result
            await queue.put(OrchestratorEvent("complete", agent_name))
        except Exception as exc:
            logger.exception("Agent %s failed", agent_name)
            results[agent_name] = {}
            await queue.put(OrchestratorEvent("error", agent_name, error=str(exc)))
        finally:
            await queue.put(OrchestratorEvent("_done", agent_name))

    # Phase 1: independent agents run concurrently
    phase1_agents = {
        "Planner": PlannerAgent().run(requirements),
        "GitHub": GitHubAgent().run(requirements),
        "Research": ResearchAgent().run(requirements),
        "Budget": BudgetAgent().run(requirements),
        "Architecture": ArchitectureAgent().run(requirements),
        "Roadmap": RoadmapAgent().run(requirements),
        "SkillGap": SkillGapAgent().run(requirements),
        "Risk": RiskAgent().run(requirements),
    }

    tasks = [
        asyncio.create_task(wrap(name, coro))
        for name, coro in phase1_agents.items()
    ]

    done_count = 0
    while done_count < len(tasks):
        event = await queue.get()
        if event.event_type == "_done":
            done_count += 1
        else:
            yield event

    await asyncio.gather(*tasks, return_exceptions=True)

    # Phase 2: Devil's Advocate — needs architecture output
    arch = results.get("Architecture", {})
    da_input = DevilsAdvocateInput(
        requirements=requirements.model_dump(),
        architecture_summary=arch.get("core_architecture_description", ""),
        tech_stack=arch.get("balanced", {}).get("tech_stack", []),
        estimated_cost=arch.get("balanced", {}).get("estimated_cost_usd", 0),
        timeline_months=requirements.timeline_months or 6,
    )

    da_queue: asyncio.Queue[OrchestratorEvent] = asyncio.Queue()
    da_task = asyncio.create_task(wrap("DevilsAdvocate", DevilsAdvocateAgent().run(da_input)))

    da_done = False
    while not da_done:
        event = await queue.get()
        if event.event_type == "_done":
            da_done = True
        else:
            yield event

    await da_task

    # Phase 3: Blueprint Synthesizer
    synthesis_input = SynthesisInput(
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

    yield OrchestratorEvent("start", "Blueprint")
    try:
        blueprint = await BlueprintAgent().run(synthesis_input)
        results["Blueprint"] = blueprint.model_dump()
        yield OrchestratorEvent("blueprint_ready", "Blueprint", data={"project_id": requirements.project_id})
    except Exception as exc:
        logger.exception("Blueprint synthesis failed")
        yield OrchestratorEvent("error", "Blueprint", error=str(exc))
