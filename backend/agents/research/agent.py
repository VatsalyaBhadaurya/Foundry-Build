from __future__ import annotations
import logging
import httpx
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from shared.llm import call_llm
from shared.schemas import ProjectRequirements, ResearchPaper

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a research engineer identifying foundational papers, benchmarks, and technical literature relevant to an engineering project.

Focus on:
- Foundational papers that define the approach or technique
- Benchmark papers that establish performance targets
- Survey papers that provide architectural overview
- Implementation papers that inform practical design choices

Be specific. Only cite papers that genuinely inform engineering decisions for this project."""


class ResearchOutput(BaseModel):
    papers: list[ResearchPaper]
    key_topics: list[str] = Field(default_factory=list)
    recommended_reading_order: list[str] = Field(default_factory=list)


class ResearchAgent(BaseAgent):
    name = "Research"
    description = "Finds relevant research papers and technical literature"

    async def _search_semantic_scholar(self, query: str) -> list[dict]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://api.semanticscholar.org/graph/v1/paper/search",
                    params={
                        "query": query,
                        "limit": 5,
                        "fields": "title,authors,year,abstract,externalIds,citationCount",
                    },
                )
                if response.status_code == 200:
                    return response.json().get("data", [])
        except Exception as exc:
            logger.warning("Semantic Scholar API call failed: %s", exc)
        return []

    async def run(self, input_data: ProjectRequirements) -> ResearchOutput:
        class PaperPlan(BaseModel):
            search_queries: list[str]
            papers: list[ResearchPaper]
            key_topics: list[str]
            recommended_reading_order: list[str]

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=f"""Project: {input_data.idea}
Type: {input_data.project_type}
Goal: {input_data.goal}

Identify 2 search queries AND 5-8 highly relevant papers/technical resources.
Include arxiv papers, IEEE papers, conference proceedings.
For each paper: real title, real authors, year, abstract summary, URL if known, why it's relevant.
Also identify key technical topics and recommended reading order.""",
            response_schema=PaperPlan,
            temperature=0.2,
        )
        plan = PaperPlan(**result)

        # Enrich with real data from Semantic Scholar
        enriched: list[ResearchPaper] = list(plan.papers)
        for query in plan.search_queries[:2]:
            items = await self._search_semantic_scholar(query)
            for item in items[:3]:
                authors = [a.get("name", "") for a in item.get("authors", [])]
                ext_ids = item.get("externalIds", {})
                url = ""
                if "ArXiv" in ext_ids:
                    url = f"https://arxiv.org/abs/{ext_ids['ArXiv']}"
                elif "DOI" in ext_ids:
                    url = f"https://doi.org/{ext_ids['DOI']}"

                paper = ResearchPaper(
                    title=item.get("title", ""),
                    authors=authors,
                    year=item.get("year"),
                    abstract=item.get("abstract", "") or "",
                    url=url,
                    relevance=f"Found via search: {query}",
                )
                if paper.title and not any(p.title == paper.title for p in enriched):
                    enriched.append(paper)

        return ResearchOutput(
            papers=enriched[:10],
            key_topics=plan.key_topics,
            recommended_reading_order=plan.recommended_reading_order,
        )
