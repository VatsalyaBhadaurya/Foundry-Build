from __future__ import annotations

import logging
import re

from pydantic import BaseModel, Field

from agents.base import BaseAgent
from shared.llm import call_llm, call_llm_text
from shared.schemas import DesignVariant, ProjectRequirements

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a Principal Architect designing three distinct system architectures for an engineering project.

Always produce Budget, Balanced, and Premium variants.

Rules:
- Every technology recommendation must be justified by the project's requirements.
- Never recommend a technology simply because it is popular.
- Budget: minimize cost, maximize use of open-source and self-hosted.
- Balanced: pragmatic choices that balance cost, complexity, and scalability.
- Premium: best-in-class tools, managed services, maximum reliability and performance.
- Each variant must be internally consistent (all choices work together).
- Include hardware components for hardware/robotics/embedded projects."""

DIAGRAM_SYSTEM_PROMPT = """You are a systems architect. Generate concise Mermaid.js flowchart diagrams.

Rules:
- Start with "flowchart TD"
- Node IDs must be alphanumeric only, no spaces or hyphens (e.g. UserClient, APIGateway, DB)
- Node labels in brackets: NodeId[Label]
- Special shapes: NodeId[(Database)], NodeId([Rounded])
- Arrows: --> for flow, -- label --> for labeled flow
- Use subgraph to group related nodes: subgraph Name\\n  nodes\\nend
- Maximum 14 nodes total
- Output ONLY the Mermaid code — no fences, no explanation"""


def _clean_mermaid(code: str) -> str:
    code = re.sub(r"^```(?:mermaid)?\s*\n?", "", code.strip(), flags=re.MULTILINE)
    code = re.sub(r"\n?```\s*$", "", code.strip(), flags=re.MULTILINE)
    return code.strip()


class _ArchitectureCore(BaseModel):
    system_overview: str
    budget: DesignVariant
    balanced: DesignVariant
    premium: DesignVariant
    core_architecture_description: str
    key_architectural_decisions: list[str] = Field(default_factory=list)
    apis_required: list[str] = Field(default_factory=list)
    libraries_required: list[str] = Field(default_factory=list)
    models_required: list[str] = Field(default_factory=list)
    datasets_required: list[str] = Field(default_factory=list)
    software_components: list[str] = Field(default_factory=list)


class ArchitectureOutput(_ArchitectureCore):
    mermaid_diagram: str = ""


class ArchitectureAgent(BaseAgent):
    name = "Architecture"
    description = "Designs Budget, Balanced, and Premium system architectures with a Mermaid flow diagram"

    async def run(self, input_data: ProjectRequirements) -> ArchitectureOutput:
        user_message = f"""Project: {input_data.idea}
Goal: {input_data.goal}
Type: {input_data.project_type}
Budget: ${input_data.budget_usd if input_data.budget_usd else 'not specified'}
Timeline: {input_data.timeline_months} months
Team: {input_data.team_size} people
Experience: {input_data.experience_level}
Deployment: {input_data.deployment_target}
Offline required: {input_data.offline_required}
Performance needs: {input_data.performance_needs or 'not specified'}
Constraints: {', '.join(input_data.constraints) if input_data.constraints else 'none'}

Design three complete architectures. For each variant include: estimated cost, performance level,
complexity, tech stack, hardware list (if applicable), advantages, and disadvantages.
Also provide: system overview, core architecture description, key decisions, APIs, libraries, models, datasets."""

        result = await call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            response_schema=_ArchitectureCore,
            temperature=0.3,
        )
        output = ArchitectureOutput(**result)

        # Generate Mermaid diagram as free text (avoids JSON encoding issues)
        try:
            tech_stack = ", ".join(output.balanced.tech_stack[:6]) or "standard stack"
            raw = await call_llm_text(
                system_prompt=DIAGRAM_SYSTEM_PROMPT,
                user_message=f"""Project: {input_data.idea}
Architecture: {output.core_architecture_description}
Tech stack (balanced): {tech_stack}
Key decisions: {", ".join(output.key_architectural_decisions[:4]) or "none"}
Deployment: {input_data.deployment_target}

Generate the Mermaid flowchart showing the system's main components and data flow.""",
                temperature=0.2,
            )
            output.mermaid_diagram = _clean_mermaid(raw)
        except Exception as exc:
            logger.warning("Mermaid diagram generation failed: %s", exc)
            output.mermaid_diagram = ""

        return output
