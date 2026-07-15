from __future__ import annotations
import json
import asyncio
import logging
from typing import Any, Type
from google import genai
from google.genai import types
from pydantic import BaseModel
from config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


async def call_llm(
    system_prompt: str,
    user_message: str,
    response_schema: Type[BaseModel],
    temperature: float = 0.3,
    max_retries: int = 3,
) -> dict[str, Any]:
    client = get_client()
    last_error: Exception | None = None

    for attempt in range(max_retries):
        try:
            response = await client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    response_schema=response_schema,
                    temperature=temperature,
                    max_output_tokens=8192,
                ),
            )
            return json.loads(response.text)
        except Exception as exc:
            last_error = exc
            logger.warning("LLM call attempt %d failed: %s", attempt + 1, exc)
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)

    raise RuntimeError(f"LLM call failed after {max_retries} attempts: {last_error}")


async def call_llm_text(
    system_prompt: str,
    user_message: str,
    temperature: float = 0.5,
    max_retries: int = 3,
) -> str:
    client = get_client()
    last_error: Exception | None = None

    for attempt in range(max_retries):
        try:
            response = await client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=temperature,
                    max_output_tokens=8192,
                ),
            )
            return response.text
        except Exception as exc:
            last_error = exc
            logger.warning("LLM text call attempt %d failed: %s", attempt + 1, exc)
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)

    raise RuntimeError(f"LLM text call failed after {max_retries} attempts: {last_error}")
