"""
Reusable Google Gemini API Client Configuration.

Security & Architecture Guarantees:
1. Reads GEMINI_API_KEY and GEMINI_MODEL strictly from environment variables via core/config.py.
2. Never hardcodes API keys or secrets.
3. Never exposes API keys in client responses, logs, or frontend code.
4. Provides a reusable client provider (get_gemini_client) with singleton caching.
5. Displays a clear, actionable error if the API key is missing or is an unreplaced placeholder.
"""

import logging
from typing import Optional, Dict, Any
from google import genai
from app.core.config import settings

logger = logging.getLogger("gemini_config")

class GeminiCredentialsError(ValueError):
    """Raised when Google Gemini API credentials are not properly configured."""
    pass

class GeminiClientManager:
    """Manages the lifecycle and safe retrieval of the Google GenAI Client."""
    _client_instance: Optional[genai.Client] = None
    _cached_api_key: Optional[str] = None

    @classmethod
    def is_configured(cls) -> bool:
        """
        Validates if GEMINI_API_KEY is present and is not an empty string or placeholder.
        Never prints or exposes the actual key value.
        """
        api_key = (settings.GEMINI_API_KEY or "").strip()
        invalid_placeholders = {
            "",
            "your-google-gemini-api-key-here",
            "AIzaSyYourGeminiApiKeyHere",
            "your_api_key_here"
        }
        return bool(api_key and api_key not in invalid_placeholders and len(api_key) >= 15)

    @classmethod
    def get_client(cls) -> genai.Client:
        """
        Returns a cached or newly initialized Google GenAI client instance.
        Raises GeminiCredentialsError with instructions if the key is missing.
        """
        if not cls.is_configured():
            logger.error("Attempted to access Gemini API without a valid GEMINI_API_KEY configured.")
            raise GeminiCredentialsError(
                "Google Gemini API key is missing or not configured. "
                "Please add a valid GEMINI_API_KEY to your backend/.env file. "
                "You can generate a free API key at https://aistudio.google.com/."
            )

        current_key = settings.GEMINI_API_KEY.strip()

        # Cache reuse if the key hasn't changed
        if cls._client_instance is None or cls._cached_api_key != current_key:
            try:
                cls._client_instance = genai.Client(api_key=current_key)
                cls._cached_api_key = current_key
                logger.info(
                    "Google GenAI Client successfully initialized. Target model: %s",
                    settings.GEMINI_MODEL
                )
            except Exception as exc:
                logger.error("Failed to initialize Google GenAI Client: %s", str(exc))
                raise GeminiCredentialsError(f"Failed to initialize Google GenAI Client: {str(exc)}")

        return cls._client_instance

    @classmethod
    def get_safe_config_summary(cls) -> Dict[str, Any]:
        """
        Returns safe configuration status for health checks and diagnostics.
        NEVER returns the actual API key.
        """
        return {
            "configured": cls.is_configured(),
            "model": settings.GEMINI_MODEL,
            "timeout_seconds": settings.GEMINI_TIMEOUT_SECONDS
        }

# Convenient module-level aliases
get_gemini_client = GeminiClientManager.get_client
is_gemini_configured = GeminiClientManager.is_configured
get_gemini_config_summary = GeminiClientManager.get_safe_config_summary
