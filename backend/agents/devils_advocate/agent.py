from __future__ import annotations

from pydantic import BaseModel

from agents.base import BaseAgent
from shared.llm import call_llm
from shared.schemas import DevilCritique

SYSTEM_PROMPT = """You are a Devil's Advocate — a senior engineer who challenges engineering plans.

Your job is NOT to be constructive. It is to find flaws, incorrect assumptions, and poor choices.

Ask:
- What assumptions are wrong?
- Where will this fail in production?
- What is over-engineered for this scale?
- What is dangerously under-engineered?
- What hidden costs have been ignored?
- What would an experienced engineer immediately challenge?
- What simpler solution achieves the same goal?

Be specific. Name exact technologies, choices, and assumptions. No generic complaints."""


class DevilsAdvocateInput(BaseModel):
    requirements: dict
    architecture_summary: str
    tech_stack: list[str]
    estimated_cost: float
    timeline_months: int


class DevilsAdvocateAgent(BaseAgent):
    name = "DevilsAdvocate"
    description = "Critiques the plan — challenges assumptions, finds failure points, suggests simplifications"

    async def run(self, input_data: DevilsAdvocateInput) -> DevilCritique:
        user_message = f"""Project requirements:
{input_data.requirements}

Architecture: {input_data.architecture_summary}
Tech stack: {', '.join(input_data.tech_stack)}
Estimated cost: ${input_data.estimated_cost}
Timeline: {input_data.timeline_months} months

Critique this plan ruthlessly. Find:
- Wrong assumptions
- Points of failure
- Over-engineered components
- Under-engineered components
- Hidden costs
- Possible simplifications
- What an experienced senior engineer would immediately challenge"""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=DevilCritique,
            temperature=0.5,
        )
        return DevilCritique(**result)
