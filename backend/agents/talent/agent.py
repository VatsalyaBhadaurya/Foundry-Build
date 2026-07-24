from __future__ import annotations

import logging

import httpx
from pydantic import BaseModel, Field

from agents.base import BaseAgent
from config import settings
from shared.llm import call_llm
from shared.schemas import (
    Community,
    PersonProfile,
    ProjectRequirements,
    TalentFinderOutput,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a talent and community scout for technical projects.

Given a project idea, identify:
1. The exact roles/skills needed to build it
2. Real, well-known people (researchers, engineers, open-source authors) who are experts in the relevant domain — name them specifically with their actual platform handles where known
3. The best online communities (Reddit, Discord, Slack, GitHub Orgs, forums) where these people gather
4. GitHub search queries to find contributors with the right skills
5. Best platforms to hire or connect with the right people
6. Short, practical outreach tips

Be specific to THIS project — not generic advice. Name real communities and real people."""


class _LLMPlan(BaseModel):
    key_roles_needed: list[str] = Field(description="Exact job titles / skill sets needed")
    notable_people: list[PersonProfile] = Field(description="8-12 specific real people relevant to this domain")
    communities: list[Community] = Field(description="6-10 specific communities with URLs")
    github_search_queries: list[str] = Field(description="5-8 GitHub user/repo search queries")
    hiring_platforms: list[str] = Field(description="Best platforms to find talent for this project")
    outreach_tips: str = Field(description="2-3 sentence practical advice on approaching these people")


class TalentFinderAgent(BaseAgent):
    name = "TalentFinder"
    description = "Finds relevant people, experts, and communities for the project"

    async def _github_user_search(self, query: str) -> list[PersonProfile]:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if settings.github_token:
            headers["Authorization"] = f"Bearer {settings.github_token}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    "https://api.github.com/search/users",
                    params={"q": query, "sort": "followers", "per_page": 5},
                    headers=headers,
                )
                if resp.status_code == 200:
                    items = resp.json().get("items", [])
                    return [
                        PersonProfile(
                            name=u.get("login", ""),
                            role="GitHub Developer",
                            platform="GitHub",
                            profile_url=u.get("html_url", ""),
                            relevance=f"Top GitHub result for: {query}",
                        )
                        for u in items
                    ]
        except Exception as exc:
            logger.warning("GitHub user search failed: %s", exc)
        return []

    async def run(self, input_data: ProjectRequirements) -> TalentFinderOutput:
        plan_result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=f"""Project idea: {input_data.idea}
Type: {input_data.project_type}
Goal: {input_data.goal}
Team size: {input_data.team_size}
Experience level: {input_data.experience_level}

Identify the people, communities, and talent sources for this specific project.""",
            response_schema=_LLMPlan,
            temperature=0.3,
        )
        plan = _LLMPlan(**plan_result)

        # Enrich with real GitHub user search for top 2 queries
        github_people: list[PersonProfile] = []
        for query in plan.github_search_queries[:2]:
            found = await self._github_user_search(query)
            for p in found:
                if not any(x.profile_url == p.profile_url for x in github_people):
                    github_people.append(p)

        # Merge LLM notable people + real GitHub hits (GitHub hits first, max 5)
        all_people = github_people[:5] + [
            p for p in plan.notable_people
            if not any(x.profile_url == p.profile_url for x in github_people)
        ]

        return TalentFinderOutput(
            key_roles_needed=plan.key_roles_needed,
            notable_people=all_people[:15],
            communities=plan.communities,
            github_search_queries=plan.github_search_queries,
            hiring_platforms=plan.hiring_platforms,
            outreach_tips=plan.outreach_tips,
        )
