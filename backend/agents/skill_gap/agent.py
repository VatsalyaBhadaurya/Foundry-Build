from __future__ import annotations
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from shared.llm import call_llm
from shared.schemas import ProjectRequirements, SkillRequirement

SYSTEM_PROMPT = """You are a Technical Mentor performing a skill gap analysis for an engineering project.

Rules:
- Assess skills realistically based on the stated experience level.
- Rank skills by how critical they are to project success.
- Provide specific, high-quality learning resources (not just "read the docs").
- Learning time estimates must be realistic.
- Distinguish between skills to learn vs skills to hire for."""


class SkillGapOutput(BaseModel):
    skills_required: list[SkillRequirement]
    critical_missing_skills: list[str] = Field(default_factory=list)
    recommended_learning_order: list[str] = Field(default_factory=list)
    hire_vs_learn_recommendation: str = ""
    estimated_ramp_up_weeks: int = 0


class SkillGapAgent(BaseAgent):
    name = "SkillGap"
    description = "Analyzes skill requirements and identifies gaps with learning resources"

    async def run(self, input_data: ProjectRequirements) -> SkillGapOutput:
        user_message = f"""Project: {input_data.idea}
Type: {input_data.project_type}
Team experience: {input_data.experience_level}
Team size: {input_data.team_size}
Deployment: {input_data.deployment_target}
Timeline: {input_data.timeline_months} months

Analyze skill requirements. For each skill:
- Name the skill
- Level required (beginner/intermediate/senior)
- Whether a team at '{input_data.experience_level}' level likely has it
- Realistic weeks to learn if missing
- 2-3 specific high-quality learning resources (courses, books, tutorials)

Then identify: critical missing skills, recommended learning order,
hire-vs-learn recommendation, total ramp-up time."""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=SkillGapOutput,
            temperature=0.2,
        )
        return SkillGapOutput(**result)
