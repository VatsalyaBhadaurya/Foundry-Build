from __future__ import annotations

from pydantic import BaseModel, Field

from agents.base import BaseAgent
from shared.llm import call_llm
from shared.schemas import BOMItem, ProjectRequirements

SYSTEM_PROMPT = """You are a Cost Estimation Engineer producing realistic budget breakdowns for engineering projects.

Rules:
- Use real, current market prices. Never fabricate specs or costs.
- If uncertain about a price, give a realistic range and note the assumption.
- Include ALL cost categories: hardware, software licenses, cloud/hosting, labor (if relevant), tooling.
- Provide BOM for hardware projects with individual component costs.
- Include one-time costs vs recurring monthly costs separately.
- Identify cost reduction opportunities."""


class CostCategory(BaseModel):
    category: str
    items: list[BOMItem]
    subtotal_usd: float
    notes: str = ""


class BudgetOutput(BaseModel):
    bom: list[BOMItem]
    cost_categories: list[CostCategory]
    one_time_total_usd: float
    monthly_recurring_usd: float
    yearly_total_usd: float
    budget_variant_total_usd: float
    balanced_variant_total_usd: float
    premium_variant_total_usd: float
    cost_reduction_tips: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)


class BudgetAgent(BaseAgent):
    name = "Budget"
    description = "Produces detailed cost breakdown and bill of materials"

    async def run(self, input_data: ProjectRequirements) -> BudgetOutput:
        user_message = f"""Project: {input_data.idea}
Type: {input_data.project_type}
Deployment: {input_data.deployment_target}
Team size: {input_data.team_size}
Timeline: {input_data.timeline_months} months
Budget constraint: ${input_data.budget_usd if input_data.budget_usd else 'not specified'}
Offline required: {input_data.offline_required}
Constraints: {', '.join(input_data.constraints) if input_data.constraints else 'none'}

Produce a detailed cost breakdown. Include:
- Hardware BOM with quantities and unit prices (if applicable)
- Software/cloud/API costs
- One-time vs recurring costs
- Total cost for Budget, Balanced, and Premium variants
- Cost reduction tips
- Key assumptions made"""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=BudgetOutput,
            temperature=0.2,
        )
        return BudgetOutput(**result)
