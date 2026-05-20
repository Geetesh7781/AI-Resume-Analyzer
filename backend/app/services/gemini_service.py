import json
import re
from functools import lru_cache
from typing import Any

import google.generativeai as genai
from loguru import logger

from app.config import get_settings

settings = get_settings()

# Preferred order when auto-selecting (newest flash models first)
PREFERRED_MODELS = (
    "gemini-2.5-flash",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-1.5-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.5-pro-002",
    "gemini-pro",
)


def _normalize_model_name(name: str) -> str:
    """API returns 'models/gemini-2.0-flash' — GenerativeModel wants 'gemini-2.0-flash'."""
    return name.removeprefix("models/")


@lru_cache(maxsize=1)
def _discover_available_models() -> tuple[str, ...]:
    """List models that support generateContent for this API key."""
    available: list[str] = []
    try:
        for model in genai.list_models():
            methods = getattr(model, "supported_generation_methods", None) or []
            if "generateContent" not in methods:
                continue
            short = _normalize_model_name(model.name)
            if short and short not in available:
                available.append(short)
    except Exception as exc:
        logger.warning(f"Could not list Gemini models: {exc}")
    return tuple(available)


def _pick_model(requested: str) -> str:
    available = _discover_available_models()
    requested = _normalize_model_name(requested.strip())

    if available:
        if requested in available:
            return requested
        for preferred in PREFERRED_MODELS:
            if preferred in available:
                logger.info(f"Using Gemini model: {preferred} (requested '{requested}' not available)")
                return preferred
        # Any flash model
        for name in available:
            if "flash" in name.lower():
                logger.info(f"Using Gemini model: {name}")
                return name
        logger.info(f"Using Gemini model: {available[0]}")
        return available[0]

    # list_models failed — try requested then a small safe set (no -latest suffixes)
    logger.warning("Model discovery failed; trying built-in fallbacks")
    for name in (requested, *PREFERRED_MODELS):
        if name:
            return name
    return "gemini-2.0-flash"


class GeminiService:
    def __init__(self) -> None:
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
        self._resolved_model: str | None = None

    @property
    def model_name(self) -> str:
        if not self._resolved_model:
            self._resolved_model = _pick_model(settings.gemini_model)
        return self._resolved_model

    def generate(self, prompt: str, temperature: float = 0.3) -> str:
        if not settings.gemini_api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set. Add it to backend/.env and restart the server."
            )

        model_name = self.model_name
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": 4096,
                },
            )
            if not response.text:
                raise ValueError("Gemini returned an empty response")
            return response.text
        except Exception as exc:
            # Clear cache and retry once with fresh discovery
            _discover_available_models.cache_clear()
            self._resolved_model = None
            retry_model = self.model_name
            if retry_model != model_name:
                logger.info(f"Retrying with discovered model: {retry_model}")
                model = genai.GenerativeModel(retry_model)
                response = model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": temperature,
                        "max_output_tokens": 4096,
                    },
                )
                if response.text:
                    return response.text

            available = _discover_available_models()
            hint = ", ".join(available[:8]) if available else "run ListModels in Google AI Studio"
            raise ValueError(
                f"Gemini failed ({exc}). "
                f"Set GEMINI_MODEL in backend/.env to one of: {hint}"
            ) from exc

    def generate_json(self, prompt: str) -> dict[str, Any]:
        text = self.generate(prompt + "\n\nRespond with valid JSON only, no markdown.")
        cleaned = re.sub(r"^```json\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise ValueError("Failed to parse Gemini JSON response") from None


gemini_service = GeminiService()
