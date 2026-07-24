from __future__ import annotations

import json
import logging

from config import settings

logger = logging.getLogger(__name__)

# In-memory fallback store (used when Supabase is not configured)
_store: dict[str, dict] = {}


def _use_supabase() -> bool:
    return bool(settings.supabase_url and settings.supabase_key)


def _get_supabase():
    from supabase import create_client
    return create_client(settings.supabase_url, settings.supabase_key)


async def save_project(project_id: str, data: dict) -> None:
    if _use_supabase():
        try:
            client = _get_supabase()
            client.table("projects").upsert({"id": project_id, "data": json.dumps(data)}).execute()
            return
        except Exception as exc:
            logger.warning("Supabase save failed, falling back to memory: %s", exc)
    _store[project_id] = data


async def get_project(project_id: str) -> dict | None:
    if _use_supabase():
        try:
            client = _get_supabase()
            result = client.table("projects").select("data").eq("id", project_id).single().execute()
            if result.data:
                return json.loads(result.data["data"])
        except Exception as exc:
            logger.warning("Supabase get failed, falling back to memory: %s", exc)
    return _store.get(project_id)


async def list_projects() -> list[dict]:
    if _use_supabase():
        try:
            client = _get_supabase()
            result = client.table("projects").select("id, data").order("created_at", desc=True).limit(50).execute()
            return [{"id": r["id"], **json.loads(r["data"])} for r in result.data]
        except Exception as exc:
            logger.warning("Supabase list failed, falling back to memory: %s", exc)
    return list(_store.values())


async def delete_project(project_id: str) -> bool:
    if _use_supabase():
        try:
            client = _get_supabase()
            client.table("projects").delete().eq("id", project_id).execute()
            return True
        except Exception as exc:
            logger.warning("Supabase delete failed: %s", exc)
    if project_id in _store:
        del _store[project_id]
        return True
    return False
