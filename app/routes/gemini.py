"""
Google Gemini AI API Router.

Endpoints:
- GET  /api/ai/status: Checks if Gemini API key is configured.
- POST /api/ai/evaluate: Evaluates project feasibility, innovation, difficulty, skills, recommendations, challenges via Gemini.
- POST /api/ai/test-connection: Tests live Gemini connection with a sample project idea.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any, Optional
from app.models.project import ProjectEvaluationRequest
from app.models.gemini_schemas import (
    GeminiProjectEvaluation,
    GeminiEvaluationStatusResponse
)
from app.services.gemini_service import (
    gemini_service,
    GeminiConfigurationError,
    GeminiQuotaExceededError,
    GeminiTimeoutError,
    GeminiValidationError,
    GeminiServiceException
)
from app.core.config import settings
from app.core.dependencies import get_optional_current_user

router = APIRouter()

@router.get(
    "/status",
    response_model=GeminiEvaluationStatusResponse,
    summary="Check Google Gemini API configuration status",
    description="Returns whether the backend has a valid GEMINI_API_KEY without exposing key secrets."
)
async def check_gemini_status():
    """Returns Gemini AI service readiness status."""
    is_ready = gemini_service.is_configured()
    if is_ready:
        return {
            "is_gemini_configured": True,
            "model_name": settings.GEMINI_MODEL,
            "status": "ready",
            "message": f"Google Gemini API is configured and ready with model '{settings.GEMINI_MODEL}'."
        }
    else:
        return {
            "is_gemini_configured": False,
            "model_name": settings.GEMINI_MODEL,
            "status": "unconfigured",
            "message": (
                "Google Gemini API key is not configured. "
                "To enable real AI evaluations, obtain a free key at https://aistudio.google.com/ "
                "and set GEMINI_API_KEY in backend/.env."
            )
        }

@router.post(
    "/evaluate",
    summary="Evaluate project with Google Gemini AI",
    description="Sends project details to Gemini to analyze feasibility, innovation, difficulty, skills, and challenges using strict structured JSON."
)
async def evaluate_project_with_gemini(
    payload: ProjectEvaluationRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    """
    Submits project details to Google Gemini:
    1. Validates input fields.
    2. Enforces structured JSON output schema (GeminiProjectEvaluation).
    3. Validates AI response before returning.
    4. Handles timeouts, invalid schemas, quota limits (429), and bad credentials.
    """
    if not gemini_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Google Gemini API key is not configured in backend/.env. "
                "Please add a valid GEMINI_API_KEY from https://aistudio.google.com/ to enable real AI evaluations."
            )
        )

    try:
        evaluation: GeminiProjectEvaluation = await gemini_service.evaluate_project(payload.model_dump())
        return {
            "status": "success",
            "evaluator_source": "google_gemini",
            "ai_model": settings.GEMINI_MODEL,
            "evaluation": evaluation.model_dump()
        }

    except GeminiQuotaExceededError as q_err:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=q_err.message
        )
    except GeminiTimeoutError as t_err:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=t_err.message
        )
    except GeminiValidationError as v_err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=v_err.message
        )
    except GeminiServiceException as s_err:
        raise HTTPException(
            status_code=s_err.status_code,
            detail=s_err.message
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during Gemini AI evaluation: {str(exc)}"
        )

@router.post(
    "/test-connection",
    summary="Test live Google Gemini API connection",
    description="Sends a benchmark sample project idea to Gemini to verify API key, network latency, and JSON schema."
)
async def test_gemini_connection(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    """Executes a live test against Google Gemini API using a benchmark sample project."""
    if not gemini_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cannot test connection: GEMINI_API_KEY is not configured in backend/.env."
        )

    try:
        test_result = await gemini_service.test_sample_connection()
        return {
            "status": "success",
            "message": "Successfully connected to Google Gemini API and generated validated structured evaluation.",
            "details": test_result
        }
    except GeminiQuotaExceededError as q_err:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=q_err.message)
    except GeminiServiceException as s_err:
        raise HTTPException(status_code=s_err.status_code, detail=s_err.message)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
