from fastapi import APIRouter
from api.v1.endpoints import interview, orchestrate, projects, export

router = APIRouter(prefix="/api/v1")
router.include_router(interview.router)
router.include_router(orchestrate.router)
router.include_router(projects.router)
router.include_router(export.router)
