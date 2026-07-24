from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class BaseAgent(ABC):
    name: str = ""
    description: str = ""

    @abstractmethod
    async def run(self, input_data: BaseModel) -> BaseModel:
        """Execute the agent and return structured output."""
        ...

    def _build_context(self, requirements_dict: dict[str, Any]) -> str:
        lines = []
        for key, value in requirements_dict.items():
            if value is not None and value != "" and value != []:
                lines.append(f"{key}: {value}")
        return "\n".join(lines)
