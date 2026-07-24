from __future__ import annotations

import logging

import httpx
from pydantic import BaseModel, Field

from agents.base import BaseAgent
from config import settings
from shared.llm import call_llm
from shared.schemas import GitHubRepo, ProjectRequirements

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a senior engineer identifying the most relevant open-source repositories for a project.

Given a project description, generate a list of highly relevant GitHub repositories.
Focus on:
- Core frameworks and libraries the project would use
- Reference implementations of similar systems
- Tools that would accelerate development

Be specific. Name real, well-known repositories that actually exist.
For each repo, explain exactly why it is relevant to THIS specific project."""


class GitHubSearchInput(BaseModel):
    queries: list[str] = Field(description="Specific search queries to find relevant repos")
    repos: list[GitHubRepo] = Field(description="Relevant repositories with full details")


class GitHubAgent(BaseAgent):
    name = "GitHub"
    description = "Finds relevant open-source repositories for the project"

    async def _search_github(self, query: str) -> list[dict]:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if settings.github_token:
            headers["Authorization"] = f"Bearer {settings.github_token}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://api.github.com/search/repositories",
                    params={"q": query, "sort": "stars", "per_page": 5},
                    headers=headers,
                )
                if response.status_code == 200:
                    return response.json().get("items", [])
        except Exception as exc:
            logger.warning("GitHub API call failed: %s", exc)
        return []

    async def run(self, input_data: ProjectRequirements) -> GitHubSearchInput:
        # Phase 1: Ask LLM to identify which repos to look for
        class QueryPlan(BaseModel):
            queries: list[str]
            known_repos: list[GitHubRepo]

        plan_result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=f"""Project: {input_data.idea}
Type: {input_data.project_type}
Goal: {input_data.goal}
Deployment: {input_data.deployment_target}

List 3 specific GitHub search queries AND 6-10 directly relevant repositories.
Include repos for: core framework, similar systems, key libraries, tooling.
For each repo include: exact owner/name, URL, description, approximate stars, language, and why it's relevant.""",
            response_schema=QueryPlan,
            temperature=0.2,
        )
        plan = QueryPlan(**plan_result)

        # Phase 2: Enrich with real GitHub data where possible
        enriched: list[GitHubRepo] = list(plan.known_repos)
        for query in plan.queries[:2]:
            items = await self._search_github(query)
            for item in items[:3]:
                repo = GitHubRepo(
                    name=item.get("full_name", ""),
                    url=item.get("html_url", ""),
                    description=item.get("description", "") or "",
                    stars=item.get("stargazers_count", 0),
                    language=item.get("language", "") or "",
                    relevance=f"Found via search: {query}",
                )
                # Avoid duplicates
                if not any(r.url == repo.url for r in enriched):
                    enriched.append(repo)

        return GitHubSearchInput(queries=plan.queries, repos=enriched[:12])
