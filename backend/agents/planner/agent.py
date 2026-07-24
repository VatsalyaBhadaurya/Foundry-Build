from __future__ import annotations

from pydantic import BaseModel, Field

from agents.base import BaseAgent
from shared.llm import call_llm
from shared.schemas import ProjectRequirements

SYSTEM_PROMPT = """You are a Principal Systems Architect decomposing an engineering project into its subsystems.

Your job is to break a project into clear subsystems, components, and their relationships.

Rules:
- Be specific to this exact project, not generic.
- Every subsystem must have a clear, singular responsibility.
- Identify inter-subsystem dependencies explicitly.
- Include data flow between subsystems.
- Think in terms of what would actually need to be built, not abstract concepts."""


class Component(BaseModel):
    name: str
    description: str
    technology_hint: str = ""


class Subsystem(BaseModel):
    name: str
    description: str
    responsibility: str
    components: list[Component] = Field(default_factory=list)
    depends_on: list[str] = Field(default_factory=list)


class PlannerOutput(BaseModel):
    overview: str
    subsystems: list[Subsystem]
    data_flows: list[str] = Field(default_factory=list)
    critical_path: list[str] = Field(default_factory=list)
    key_interfaces: list[str] = Field(default_factory=list)


class PlannerAgent(BaseAgent):
    name = "Planner"
    description = "Decomposes the project into subsystems, components, and dependencies"

    async def run(self, input_data: ProjectRequirements) -> PlannerOutput:
        user_message = f"""Project: {input_data.idea}
Goal: {input_data.goal}
Type: {input_data.project_type}
Deployment: {input_data.deployment_target}
Constraints: {', '.join(input_data.constraints) if input_data.constraints else 'none specified'}
Timeline: {input_data.timeline_months} months
Team size: {input_data.team_size}

Decompose this project into its core subsystems and components."""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=PlannerOutput,
            temperature=0.3,
        )
        return PlannerOutput(**result)
