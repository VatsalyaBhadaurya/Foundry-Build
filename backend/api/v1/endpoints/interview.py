from __future__ import annotations
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.schemas import InterviewState, InterviewTurn, Project
from agents.interview.agent import InterviewAgent
import database.client as db

router = APIRouter(prefix="/interview", tags=["interview"])
_agent = InterviewAgent()


class StartRequest(BaseModel):
    idea: str


class AnswerRequest(BaseModel):
    answer: str


class InterviewTurnResponse(BaseModel):
    project_id: str
    question: str | None
    complete: bool
    turn: int


@router.post("/start", response_model=InterviewTurnResponse)
async def start_interview(body: StartRequest):
    """Start a new project interview. Returns first question."""
    if not body.idea.strip():
        raise HTTPException(status_code=400, detail="Project idea cannot be empty")

    project_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    state = InterviewState(project_id=project_id, idea=body.idea.strip())
    response = await _agent.get_next_question(state)

    project = Project(
        project_id=project_id,
        idea=body.idea.strip(),
        status="interview",
        interview=state,
        created_at=now,
        updated_at=now,
    )
    await db.save_project(project_id, project.model_dump())

    return InterviewTurnResponse(
        project_id=project_id,
        question=response.question,
        complete=response.complete,
        turn=0,
    )


@router.post("/{project_id}/answer", response_model=InterviewTurnResponse)
async def answer_question(project_id: str, body: AnswerRequest):
    """Submit an answer and get the next question (or complete the interview)."""
    project_data = await db.get_project(project_id)
    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = Project(**project_data)
    if project.status != "interview":
        raise HTTPException(status_code=400, detail=f"Project is not in interview state (status: {project.status})")

    state = project.interview
    if not state:
        raise HTTPException(status_code=400, detail="Interview state missing")

    # Get the last question that was asked
    last_question = ""
    if state.turns:
        last_question = state.turns[-1].question if state.turns else ""
    else:
        # First answer — retrieve the initial question from the project data
        # We stored first question in a separate field via the start endpoint
        last_question = project_data.get("_last_question", "")

    state.turns.append(InterviewTurn(question=last_question, answer=body.answer.strip()))
    response = await _agent.get_next_question(state)

    if response.complete:
        requirements = await _agent.extract_requirements(state, project_id)
        state.requirements = requirements
        state.complete = True
        project.status = "ready"

    project.interview = state
    project.updated_at = datetime.now(timezone.utc).isoformat()

    project_dict = project.model_dump()
    if response.question:
        project_dict["_last_question"] = response.question

    await db.save_project(project_id, project_dict)

    return InterviewTurnResponse(
        project_id=project_id,
        question=response.question,
        complete=response.complete,
        turn=len(state.turns),
    )
