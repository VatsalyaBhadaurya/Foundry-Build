from __future__ import annotations
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from shared.llm import call_llm
from shared.schemas import ProjectRequirements, Risk

SYSTEM_PROMPT = """You are a Risk Assessment Engineer identifying threats to project success.

Risk categories to cover: technical, financial, manufacturing, deployment, scalability, security, maintenance.

Rules:
- Be specific to this project, not generic platitudes.
- Every risk must have a concrete mitigation, not vague advice.
- Score likelihood and impact honestly — don't sugarcoat.
- Identify the top 3 risks that could kill the project.
- For security risks, be specific about attack vectors."""


class RiskOutput(BaseModel):
    risks: list[Risk]
    top_critical_risks: list[str] = Field(default_factory=list)
    overall_risk_level: str = "medium"  # low | medium | high | critical
    risk_summary: str = ""


class RiskAgent(BaseAgent):
    name = "Risk"
    description = "Identifies and categorizes project risks with concrete mitigations"

    async def run(self, input_data: ProjectRequirements) -> RiskOutput:
        user_message = f"""Project: {input_data.idea}
Goal: {input_data.goal}
Type: {input_data.project_type}
Budget: ${input_data.budget_usd if input_data.budget_usd else 'unspecified'}
Timeline: {input_data.timeline_months} months
Team: {input_data.team_size} people at {input_data.experience_level} level
Deployment: {input_data.deployment_target}
Offline required: {input_data.offline_required}
Constraints: {', '.join(input_data.constraints) if input_data.constraints else 'none'}

Identify all significant risks across all 7 categories.
For each risk: category, specific description, likelihood (low/medium/high), impact (low/medium/high), concrete mitigation.
Then identify top 3 critical risks, overall risk level, and summary."""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=RiskOutput,
            temperature=0.3,
        )
        return RiskOutput(**result)
