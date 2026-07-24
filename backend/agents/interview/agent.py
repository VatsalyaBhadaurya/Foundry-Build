from __future__ import annotations

from pydantic import BaseModel, Field

from agents.base import BaseAgent
from config import settings
from shared.llm import call_llm
from shared.schemas import InterviewState, ProjectRequirements

SYSTEM_PROMPT = """You are an AI CTO conducting a requirements interview before designing an engineering blueprint.

Your job is to gather just enough information to produce a precise, actionable engineering plan.

Rules:
- Ask ONE focused question per turn. Never ask multiple questions at once.
- Only ask questions relevant to this specific project type. Skip irrelevant ones.
- If the user's idea already implies an answer, skip that question.
- After 6-8 questions, or when you have enough to produce a complete blueprint, mark complete.
- Be direct and professional. No filler phrases.
- Infer obvious things rather than asking about them.

Information to gather (in order of priority):
1. Primary goal / success metric
2. Budget (if hardware or paid services involved)
3. Timeline
4. Experience level and team size
5. Deployment target (cloud/edge/embedded/mobile)
6. Key constraints or requirements
7. Performance requirements (if relevant)
8. Offline/connectivity requirements (if relevant)

When complete, extract all gathered information into structured requirements."""


class InterviewResponse(BaseModel):
    complete: bool
    question: str | None = None
    inferred_project_type: str = "software"


class InterviewAgent(BaseAgent):
    name = "Interview"
    description = "Conducts a structured CTO interview to gather project requirements"

    async def get_next_question(self, state: InterviewState) -> InterviewResponse:
        history_text = ""
        if state.turns:
            history_text = "\n".join(
                f"Q: {t.question}\nA: {t.answer}" for t in state.turns
            )

        user_message = f"""Project idea: {state.idea}

Interview history so far:
{history_text if history_text else "(No questions asked yet)"}

Number of turns completed: {len(state.turns)}
Maximum turns allowed: {settings.max_interview_turns}

Decide: Should you ask another question, or do you have enough information?
If asking another question, make it the single most valuable missing piece of information.
If complete, extract all requirements from the conversation."""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=InterviewResponse,
            temperature=0.2,
        )
        return InterviewResponse(**result)

    async def extract_requirements(
        self, state: InterviewState, project_id: str
    ) -> ProjectRequirements:
        history_text = "\n".join(
            f"Q: {t.question}\nA: {t.answer}" for t in state.turns
        )

        class RequirementsExtraction(BaseModel):
            goal: str
            budget_usd: float | None = None
            timeline_months: int | None = None
            experience_level: str = "intermediate"
            team_size: int = 1
            country: str | None = None
            deployment_target: str = "cloud"
            performance_needs: str | None = None
            offline_required: bool = False
            constraints: list[str] = Field(default_factory=list)
            project_type: str = "software"

        result = await call_llm(
            system_prompt="""Extract structured project requirements from this interview transcript.
Be precise. Infer reasonable defaults for anything not explicitly mentioned.
project_type must be one of: software, hardware, robotics, ai, embedded, web, mobile, research""",
            user_message=f"""Project idea: {state.idea}

Interview transcript:
{history_text}

Extract all requirements.""",
            response_schema=RequirementsExtraction,
            temperature=0.1,
        )

        return ProjectRequirements(
            project_id=project_id,
            idea=state.idea,
            **{k: v for k, v in result.items() if v is not None},
        )

    async def run(self, input_data: InterviewState) -> InterviewState:
        response = await self.get_next_question(input_data)

        if response.complete:
            requirements = await self.extract_requirements(input_data, input_data.project_id)
            input_data.requirements = requirements
            input_data.complete = True
        else:
            input_data.complete = False

        return input_data
