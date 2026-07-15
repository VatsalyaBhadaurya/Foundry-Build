from __future__ import annotations
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from shared.llm import call_llm
from shared.schemas import ProjectRequirements, Milestone

SYSTEM_PROMPT = """You are a Technical Program Manager designing a development roadmap.

Rules:
- Break the project into concrete, achievable phases (typically 3-6 phases).
- Each phase must have clear deliverables a team can demo or measure.
- Phases must be sequenced correctly — no phase should depend on something not yet built.
- Duration estimates must be realistic for the stated team size and experience.
- Success criteria must be binary (pass/fail), not vague.
- Identify critical path clearly."""


class RoadmapOutput(BaseModel):
    milestones: list[Milestone]
    total_duration_weeks: int
    critical_path: list[str] = Field(default_factory=list)
    key_risks_to_schedule: list[str] = Field(default_factory=list)
    recommended_team_structure: str = ""


class RoadmapAgent(BaseAgent):
    name = "Roadmap"
    description = "Creates a phased development roadmap with milestones and success criteria"

    async def run(self, input_data: ProjectRequirements) -> RoadmapOutput:
        user_message = f"""Project: {input_data.idea}
Goal: {input_data.goal}
Type: {input_data.project_type}
Timeline: {input_data.timeline_months} months ({(input_data.timeline_months or 6) * 4} weeks)
Team: {input_data.team_size} people
Experience: {input_data.experience_level}
Deployment: {input_data.deployment_target}
Constraints: {', '.join(input_data.constraints) if input_data.constraints else 'none'}

Design a complete development roadmap. Each milestone needs:
- Phase number and title
- Specific objectives
- Concrete deliverables
- Realistic duration in weeks
- Dependencies on previous phases
- Clear success criteria (binary pass/fail)

Also identify the critical path and schedule risks."""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=RoadmapOutput,
            temperature=0.3,
        )
        return RoadmapOutput(**result)
