from __future__ import annotations
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from shared.llm import call_llm
from shared.schemas import ProjectRequirements, DesignVariant

SYSTEM_PROMPT = """You are a Principal Architect designing three distinct system architectures for an engineering project.

Always produce Budget, Balanced, and Premium variants.

Rules:
- Every technology recommendation must be justified by the project's requirements.
- Never recommend a technology simply because it is popular.
- Budget: minimize cost, maximize use of open-source and self-hosted.
- Balanced: pragmatic choices that balance cost, complexity, and scalability.
- Premium: best-in-class tools, managed services, maximum reliability and performance.
- Each variant must be internally consistent (all choices work together).
- Include hardware components for hardware/robotics/embedded projects."""


class ArchitectureOutput(BaseModel):
    system_overview: str
    budget: DesignVariant
    balanced: DesignVariant
    premium: DesignVariant
    core_architecture_description: str
    key_architectural_decisions: list[str] = Field(default_factory=list)
    apis_required: list[str] = Field(default_factory=list)
    libraries_required: list[str] = Field(default_factory=list)
    models_required: list[str] = Field(default_factory=list)
    datasets_required: list[str] = Field(default_factory=list)


class ArchitectureAgent(BaseAgent):
    name = "Architecture"
    description = "Designs Budget, Balanced, and Premium system architectures"

    async def run(self, input_data: ProjectRequirements) -> ArchitectureOutput:
        user_message = f"""Project: {input_data.idea}
Goal: {input_data.goal}
Type: {input_data.project_type}
Budget: ${input_data.budget_usd if input_data.budget_usd else 'not specified'}
Timeline: {input_data.timeline_months} months
Team: {input_data.team_size} people
Experience: {input_data.experience_level}
Deployment: {input_data.deployment_target}
Offline required: {input_data.offline_required}
Performance needs: {input_data.performance_needs or 'not specified'}
Constraints: {', '.join(input_data.constraints) if input_data.constraints else 'none'}

Design three complete architectures. For each variant include: estimated cost, performance level,
complexity, tech stack, hardware list (if applicable), advantages, and disadvantages.
Also provide: system overview, core architecture description, key decisions, APIs, libraries, models, datasets."""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=ArchitectureOutput,
            temperature=0.3,
        )
        return ArchitectureOutput(**result)
