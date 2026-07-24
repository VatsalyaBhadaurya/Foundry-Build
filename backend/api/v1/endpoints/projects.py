from __future__ import annotations

from fastapi import APIRouter, HTTPException

import database.client as db
from shared.schemas import Project

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/{project_id}")
async def get_project(project_id: str):
    """Get full project state including blueprint if complete."""
    data = await db.get_project(project_id)
    if not data:
        raise HTTPException(status_code=404, detail="Project not found")
    return data


@router.get("/{project_id}/blueprint")
async def get_blueprint(project_id: str):
    """Get the generated blueprint for a completed project."""
    data = await db.get_project(project_id)
    if not data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = Project(**data)
    if project.status != "complete" or not project.blueprint:
        raise HTTPException(status_code=400, detail=f"Blueprint not ready (status: {project.status})")

    return project.blueprint.model_dump()


@router.get("/")
async def list_projects():
    """List recent projects."""
    return await db.list_projects()


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """Delete a project."""
    deleted = await db.delete_project(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"deleted": project_id}
