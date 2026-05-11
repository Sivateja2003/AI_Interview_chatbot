"""LLM service — wrapper around Google Gemini."""

import json
import logging
import google.generativeai as genai
from app.config import get_settings

logger = logging.getLogger(__name__)

_configured = False


def _ensure_configured():
    global _configured
    if not _configured:
        settings = get_settings()
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True


async def call_llm(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 1500,
    json_mode: bool = True,
) -> dict | str:
    """
    Call Gemini chat completion.
    """
    _ensure_configured()
    settings = get_settings()

    model_name = settings.GEMINI_LLM_MODEL
    
    # Configure generation config
    generation_config = genai.types.GenerationConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
    )
    
    if json_mode:
        generation_config.response_mime_type = "application/json"

    model = genai.GenerativeModel(
        model_name,
        system_instruction=system_prompt,
    )

    try:
        response = model.generate_content(
            user_prompt,
            generation_config=generation_config
        )
        content = response.text

        if json_mode:
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse LLM JSON response: {content[:200]}")
                return {"error": "Failed to parse response", "raw": content}

        return content

    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        raise


async def call_llm_with_history(
    system_prompt: str,
    conversation: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 1500,
    json_mode: bool = True,
) -> dict | str:
    """
    Call LLM with full conversation history.
    """
    # ... ignoring for simplicity, not strictly required by the tasks if we just use the context window.
    # The current implementation just injects history as text in the prompt.
    raise NotImplementedError("Use call_llm and inject history in user_prompt instead.")
