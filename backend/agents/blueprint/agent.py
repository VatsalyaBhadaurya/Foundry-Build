from __future__ import annotations

import json
from datetime import datetime, timezone

from pydantic import BaseModel

from agents.base import BaseAgent
from shared.llm import call_llm, call_llm_text
from shared.schemas import (
    Blueprint,
    BOMItem,
    DesignVariant,
    DevilCritique,
    FeasibilityScores,
    GitHubRepo,
    Milestone,
    ResearchPaper,
    Risk,
    SkillRequirement,
    TalentFinderOutput,
)

SYSTEM_PROMPT = """You are a Blueprint Synthesizer — a senior CTO producing the final engineering document.

Your job is to synthesize all agent outputs into a coherent, professional engineering blueprint.

Rules:
- Every section must be specific to this project, never generic.
- The executive summary must be 3-5 sentences and capture the entire picture.
- Feasibility scores must be justified by specific evidence from the project.
- The markdown output must be a complete, professional technical document.
- Do not repeat information across sections.
- Write for an engineering team that will immediately begin implementation."""


class SynthesisInput(BaseModel):
    requirements: dict
    planner_output: dict
    architecture_output: dict
    budget_output: dict
    roadmap_output: dict
    skill_gap_output: dict
    risk_output: dict
    github_output: dict
    research_output: dict
    devils_advocate_output: dict
    talent_output: dict | None = None


class SynthesisCore(BaseModel):
    executive_summary: str
    problem_statement: str
    objectives: list[str]
    assumptions: list[str]
    future_work: list[str]
    feasibility: FeasibilityScores


class BlueprintAgent(BaseAgent):
    name = "Blueprint"
    description = "Synthesizes all agent outputs into the final engineering blueprint"

    async def run(self, input_data: SynthesisInput) -> Blueprint:
        # Step 1: Generate core synthesis fields
        core_result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=f"""Synthesize this engineering blueprint.

Requirements: {json.dumps(input_data.requirements, indent=2)}
Architecture: {json.dumps(input_data.architecture_output, indent=2)}
Budget: {json.dumps(input_data.budget_output, indent=2)}
Risks: {json.dumps(input_data.risk_output, indent=2)}
Devil's Critique: {json.dumps(input_data.devils_advocate_output, indent=2)}

Generate:
1. Executive summary (3-5 sentences, capture full picture)
2. Problem statement
3. Key objectives (5-8 specific, measurable)
4. Engineering assumptions made
5. Future work (post-MVP enhancements)
6. Feasibility scores with explanations for all 6 dimensions""",
            response_schema=SynthesisCore,
            temperature=0.3,
        )
        core = SynthesisCore(**core_result)

        # Step 2: Generate the full markdown document
        markdown = await call_llm_text(
            system_prompt=SYSTEM_PROMPT,
            user_message=f"""Generate a complete professional engineering blueprint in Markdown.

Project: {input_data.requirements.get('idea', '')}

Include ALL sections in this exact order:
# Executive Summary
# Problem Statement
# Objectives
# Assumptions & Constraints
# System Architecture
# Technology Stack
# Hardware Components (if applicable)
# Software Components
# APIs & Services
# Models & Datasets (if applicable)
# Development Roadmap
# Bill of Materials & Cost Estimates
# Skill Requirements & Gap Analysis
# Risk Analysis
# Three Design Alternatives (Budget / Balanced / Premium)
# Devil's Advocate Critique
# Feasibility Assessment
# GitHub Resources
# Research References
# Future Work

Use tables, bullet lists, and clear headings. Be specific to this project.

Data to use:
Requirements: {json.dumps(input_data.requirements)}
Architecture: {json.dumps(input_data.architecture_output)}
Roadmap: {json.dumps(input_data.roadmap_output)}
Budget: {json.dumps(input_data.budget_output)}
Skills: {json.dumps(input_data.skill_gap_output)}
Risks: {json.dumps(input_data.risk_output)}
GitHub: {json.dumps(input_data.github_output)}
Research: {json.dumps(input_data.research_output)}
Critique: {json.dumps(input_data.devils_advocate_output)}
Feasibility: {json.dumps(core.feasibility.model_dump())}""",
            temperature=0.4,
        )

        # Assemble the final Blueprint
        req = input_data.requirements
        arch = input_data.architecture_output
        budget = input_data.budget_output
        github = input_data.github_output
        research = input_data.research_output
        roadmap = input_data.roadmap_output
        skills = input_data.skill_gap_output
        risks = input_data.risk_output
        devil = input_data.devils_advocate_output

        three_designs = [
            DesignVariant(**arch.get("budget", {})) if arch.get("budget") else
            DesignVariant(label="Budget", estimated_cost_usd=0, performance="", complexity="low", advantages=[], disadvantages=[], tech_stack=[]),
            DesignVariant(**arch.get("balanced", {})) if arch.get("balanced") else
            DesignVariant(label="Balanced", estimated_cost_usd=0, performance="", complexity="medium", advantages=[], disadvantages=[], tech_stack=[]),
            DesignVariant(**arch.get("premium", {})) if arch.get("premium") else
            DesignVariant(label="Premium", estimated_cost_usd=0, performance="", complexity="high", advantages=[], disadvantages=[], tech_stack=[]),
        ]

        return Blueprint(
            project_id=req.get("project_id", ""),
            executive_summary=core.executive_summary,
            problem_statement=core.problem_statement,
            objectives=core.objectives,
            assumptions=core.assumptions,
            constraints=req.get("constraints", []),
            system_architecture=arch.get("core_architecture_description", ""),
            architecture_diagram=arch.get("mermaid_diagram", ""),
            talent=TalentFinderOutput.model_validate(input_data.talent_output) if input_data.talent_output else None,
            tech_stack=arch.get("balanced", {}).get("tech_stack", []),
            hardware=arch.get("balanced", {}).get("hardware", []),
            software_components=arch.get("software_components", []),
            apis=arch.get("apis_required", []),
            libraries=arch.get("libraries_required", []),
            models=arch.get("models_required", []),
            datasets=arch.get("datasets_required", []),
            roadmap=[Milestone(**m) for m in roadmap.get("milestones", [])],
            bom=[BOMItem(**b) for b in budget.get("bom", [])],
            estimated_cost={
                "budget": budget.get("budget_variant_total_usd", 0),
                "balanced": budget.get("balanced_variant_total_usd", 0),
                "premium": budget.get("premium_variant_total_usd", 0),
            },
            risks=[Risk(**r) for r in risks.get("risks", [])],
            skill_requirements=[SkillRequirement(**s) for s in skills.get("skills_required", [])],
            github_repos=[GitHubRepo(**r) for r in github.get("repos", [])],
            research_papers=[ResearchPaper(**p) for p in research.get("papers", [])],
            future_work=core.future_work,
            three_designs=three_designs,
            devil_critique=DevilCritique(**devil) if devil else DevilCritique(
                wrong_assumptions=[], failure_points=[], over_engineered=[],
                under_engineered=[], hidden_costs=[], simplifications=[], senior_challenges=[]
            ),
            feasibility=core.feasibility,
            markdown=markdown,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
