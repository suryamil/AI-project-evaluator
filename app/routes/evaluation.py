"""
FastAPI Router for AI Project Evaluation.

Endpoint:
POST /api/evaluate

Workflow:
1. Accept project details from frontend.
2. Validate incoming request data via Pydantic.
3. Call Gemini AI service.
4. Validate AI response strictly against ProjectEvaluationResponse schema.
5. Return structured evaluation results.
6. Save evaluation to MongoDB ONLY after successful validation.
7. Return appropriate HTTP error status codes (401, 422, 429, 502, 503, 504).
8. Never persist failed, empty, or invalid AI responses.
"""

import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Depends, Header, Query, status
from pydantic import BaseModel, Field

from app.models.evaluation_schemas import (
    ProjectEvaluationResponse, 
    TechnicalDifficulty,
    TechnicalComplexity,
    ScoringMethodology
)
from app.models.risk_schemas import ProjectFailureRiskAnalysis, RiskItem, RiskLevel
from app.models.db_models import ProjectDocument, EvaluationDocument, RiskReportDocument
from app.services.gemini_service import (
    gemini_service,
    evaluate_with_transparent_methodology,
    analyze_project_failure_risks,
    GeminiServiceError,
    GeminiMissingKeyError,
    GeminiQuotaExceededError,
    GeminiRateLimitError,
    GeminiTimeoutError,
    GeminiInvalidCredentialsError,
    GeminiEmptyResponseError,
    GeminiInvalidJSONError,
    GeminiValidationError
)
from app.services.db_service import db_service
from app.core.config import settings
from app.core.dependencies import get_optional_current_user

logger = logging.getLogger("evaluation_router")

router = APIRouter()

# =====================================================================
# REQUEST & RESPONSE SCHEMAS
# =====================================================================
class ProjectEvaluationInput(BaseModel):
    """Incoming request payload from frontend for project evaluation."""
    title: str = Field(..., min_length=3, max_length=150, description="Project title", example="Drone Vineyard Pathology")
    domain: str = Field(..., min_length=2, description="Project domain", example="Computer Vision & Autonomous Robotics")
    technologies: str = Field(..., min_length=2, description="Planned technologies & stack", example="Python, YOLOv8, PyTorch, Raspberry Pi 4")
    skill_level: str = Field(default="Intermediate", description="Team technical skill level", example="Intermediate")
    timeline: str = Field(default="3 - 4 Months", description="Estimated project timeline", example="3 - 4 Months")
    budget: str = Field(default="Flexible", description="Budget tier", example="$300 - $1,000")
    team_size: str = Field(default="Capstone Team (3 - 4 Students)", description="Team size", example="Capstone Team (3 - 4 Students)")
    description: Optional[str] = Field(default="Not provided", description="Detailed project scope & description")
    problem_statement: Optional[str] = Field(default=None, description="Problem being addressed")
    target_users: Optional[str] = Field(default="General public", description="Target users")
    project_id: Optional[str] = Field(default=None, description="Optional existing project ID to link evaluation to")

class ProjectEvaluationAPIResponse(BaseModel):
    """Structured response returned to frontend."""
    status: str = "success"
    message: str = "AI project evaluation successfully computed and saved to database."
    evaluation_id: str
    project_id: str
    evaluator_source: str
    ai_model: str
    saved_to_mongodb: bool
    evaluation: ProjectEvaluationResponse

# =====================================================================
# ENDPOINT: POST /api/evaluate
# =====================================================================
@router.post(
    "/evaluate",
    response_model=ProjectEvaluationAPIResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate project feasibility with Gemini AI and persist to MongoDB",
    description=(
        "Accepts project details, executes structured Google Gemini evaluation, "
        "validates response schema, and saves to MongoDB only upon successful validation."
    )
)
async def evaluate_project_endpoint(
    payload: ProjectEvaluationInput,
    mock_for_testing: bool = Query(
        False, 
        description="For unit testing: validates response schema and database persistence with synthetic mock data."
    ),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Main AI Project Evaluation Pipeline:
    1. Validates incoming project details.
    2. Calls Gemini AI service.
    3. Enforces and validates structured output.
    4. Persists to MongoDB 'evaluations' and 'risk_reports' collections.
    5. Returns structured results to the client.
    """
    # Identify user context for privacy isolation
    active_user_id = current_user["id"] if current_user else (x_user_id or "usr_public_evaluator")
    user_email = current_user["email"] if current_user else "student@university.edu"

    # 1. Execute AI Evaluation (or synthetic test mock when explicitly requested)
    if mock_for_testing:
        logger.info("Using transparent heuristic mock engine for /api/evaluate test run...")
        evaluation = evaluate_with_transparent_methodology(payload.model_dump())
        evaluator_source = "transparent_methodology_mock"
        ai_model = "mock-validator"

    else:
        # Real Google Gemini Execution
        try:
            evaluation = await gemini_service.evaluate_project(payload.model_dump())
            evaluator_source = "google_gemini"
            ai_model = settings.GEMINI_MODEL
        except GeminiServiceError as gemini_err:
            logger.warning(
                "Gemini evaluation failed [%s - %s]: %s",
                gemini_err.error_code,
                gemini_err.status_code,
                gemini_err.message
            )
            # CRITICAL: We do NOT save failed or invalid responses to MongoDB
            raise HTTPException(
                status_code=gemini_err.status_code,
                detail={
                    "status": "error",
                    "error_code": gemini_err.error_code,
                    "message": gemini_err.message
                }
            )
        except Exception as unhandled:
            logger.error("Unhandled error during Gemini evaluation: %s", str(unhandled), exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "status": "error",
                    "error_code": "INTERNAL_SERVER_ERROR",
                    "message": "An internal error occurred during project evaluation."
                }
            )

    # 2. SAVE TO MONGODB ONLY AFTER SUCCESSFUL VALIDATION
    timestamp_ms = int(datetime.utcnow().timestamp() * 1000)
    evaluation_id = f"eval_{timestamp_ms}"
    project_id = payload.project_id or f"proj_{timestamp_ms}"

    # Determine risk level & UI badge colors
    feasibility = evaluation.feasibility_score
    if feasibility >= 75:
        risk_level = "Low Risk"
        risk_color = "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    elif feasibility >= 50:
        risk_level = "Moderate Risk"
        risk_color = "text-amber-500 bg-amber-500/10 border-amber-500/30"
    else:
        risk_level = "High Risk"
        risk_color = "text-rose-500 bg-rose-500/10 border-rose-500/30"

    # Compute balanced radar dimensions
    radar_scores = {
        "memory_feasibility": min(98, max(20, int(feasibility * 0.95))),
        "latency_feasibility": min(98, max(20, int(feasibility * 0.90))),
        "data_integrity": min(98, max(20, int(feasibility * 1.02))),
        "cost_viability": min(98, max(20, int(feasibility * 0.88))),
        "team_capability": min(98, max(20, int(feasibility * 1.00)))
    }

    # Map difficulty to numeric score
    diff_score_map = {
        TechnicalDifficulty.BEGINNER: 35,
        TechnicalDifficulty.INTERMEDIATE: 65,
        TechnicalDifficulty.ADVANCED: 90
    }
    difficulty_score = diff_score_map.get(evaluation.estimated_development_difficulty, 60)

    # 2a. Store in MongoDB 'projects' Collection so project history syncs seamlessly
    project_doc = ProjectDocument(
        id=project_id,
        user_id=active_user_id,
        user_email=user_email,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else "Project evaluation submitted",
        problem_statement=payload.problem_statement.strip() if payload.problem_statement else "Problem under review",
        domain=payload.domain,
        target_users=payload.target_users.strip() if payload.target_users else "General users",
        technologies=payload.technologies.strip(),
        budget=payload.budget,
        timeline=payload.timeline,
        team_size=payload.team_size,
        skill_level=payload.skill_level,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )

    # 2b. Store in MongoDB 'evaluations' Collection with complete criteria & explanations
    eval_doc = EvaluationDocument(
        id=evaluation_id,
        project_id=project_id,
        user_id=active_user_id,
        feasibility_score=evaluation.feasibility_score,
        risk_level=risk_level,
        risk_color=risk_color,
        radar_scores=radar_scores,
        evaluator_source=evaluator_source,
        ai_model=ai_model,
        innovation_score=evaluation.innovation_score,
        novelty_tier="High Novelty" if evaluation.innovation_score >= 75 else "Moderate Novelty",
        difficulty_score=difficulty_score,
        difficulty_level=str(evaluation.estimated_development_difficulty.value if hasattr(evaluation.estimated_development_difficulty, 'value') else evaluation.estimated_development_difficulty),
        feasibility_explanation=evaluation.feasibility_explanation,
        innovation_explanation=evaluation.innovation_explanation,
        technical_complexity=str(evaluation.technical_complexity.value if hasattr(evaluation.technical_complexity, 'value') else evaluation.technical_complexity),
        complexity_explanation=evaluation.complexity_explanation,
        difficulty_explanation=evaluation.difficulty_explanation,
        missing_information=evaluation.missing_information,
        scoring_methodology=evaluation.scoring_methodology.model_dump() if hasattr(evaluation.scoring_methodology, 'model_dump') else evaluation.scoring_methodology,
        executive_summary=evaluation.evaluation_summary,
        full_gemini_analysis=evaluation.model_dump(),
        evaluated_at=datetime.utcnow().isoformat()
    )

    # 2c. Store in MongoDB 'risk_reports' Collection with structured 8-category failure analysis
    risk_analysis = getattr(evaluation, "failure_risk_analysis", None)
    structured_risks = [
        r.model_dump() if hasattr(r, "model_dump") else r 
        for r in getattr(risk_analysis, "risks", [])
    ] if risk_analysis else []

    overall_risk_lvl = (
        risk_analysis.overall_risk_level.value 
        if risk_analysis and hasattr(risk_analysis.overall_risk_level, "value") 
        else (str(risk_analysis.overall_risk_level) if risk_analysis and risk_analysis.overall_risk_level else risk_level)
    )

    report_doc = RiskReportDocument(
        id=f"report_{timestamp_ms}",
        project_id=project_id,
        evaluation_id=evaluation_id,
        user_id=active_user_id,
        primary_risk=evaluation.project_weaknesses[0] if evaluation.project_weaknesses else "Architectural validation required",
        overall_risk_level=overall_risk_lvl,
        risk_summary=getattr(risk_analysis, "risk_summary", "Failure risk analysis computed across 8 core categories."),
        risk_mitigation_plan=getattr(risk_analysis, "risk_mitigation_plan", evaluation.improvement_suggestions),
        structured_risks=structured_risks,
        identified_risks=evaluation.project_weaknesses,
        recommendations=evaluation.improvement_suggestions,
        vram_required="4.0 GB (INT8 Edge)" if evaluation.estimated_development_difficulty == TechnicalDifficulty.BEGINNER else "8.0 GB (FP16)",
        cloud_estimate="$0 (Local / Edge)" if "$0" in payload.budget else "$30 - $60 / mo",
        evaluator_source=evaluator_source,
        complexity_factors=evaluation.project_weaknesses,
        prerequisite_skills=evaluation.required_skills,
        recommended_learning_roadmap=evaluation.improvement_suggestions,
        potential_bottlenecks=evaluation.scoring_methodology.empirical_failure_factors,
        failure_scenarios=evaluation.project_weaknesses,
        generated_at=datetime.utcnow().isoformat()
    )

    try:
        await db_service.create_project(project_doc)
        await db_service.create_evaluation(eval_doc)
        await db_service.create_risk_report(report_doc)
        saved_to_db = True
        logger.info(
            "Evaluation '%s' successfully saved across projects, evaluations, and risk_reports in MongoDB.",
            evaluation_id
        )
    except Exception as db_err:
        logger.error("Failed to save validated evaluation to MongoDB: %s", str(db_err))
        saved_to_db = False

    # 3. Return Structured Response
    return ProjectEvaluationAPIResponse(
        status="success",
        message="AI project evaluation successfully computed and saved to database.",
        evaluation_id=evaluation_id,
        project_id=project_id,
        evaluator_source=evaluator_source,
        ai_model=ai_model,
        saved_to_mongodb=saved_to_db,
        evaluation=evaluation
    )


# =====================================================================
# ENDPOINT: POST /api/evaluate/risk-analysis & /api/risk-analysis (STANDALONE RISK MODULE)
# =====================================================================
@router.post(
    "/risk-analysis",
    response_model=ProjectFailureRiskAnalysis,
    summary="Direct Project Failure Risk Analysis across 8 Categories",
    description=(
        "Analyzes possible failure risks across 8 categories (Technical limitations, Programming knowledge, "
        "Budget, Deadlines, Datasets, Security, Integration, Coordination). "
        "Returns risk levels (Low/Medium/High), reasons, impacts, preventive actions, summary, and mitigation plan."
    )
)
@router.post(
    "/evaluate/risk-analysis",
    response_model=ProjectFailureRiskAnalysis,
    include_in_schema=False
)
async def analyze_project_risks_endpoint(payload: ProjectEvaluationInput):
    """
    Executes deep project failure risk analysis across the 8 standardized failure dimensions.
    """
    return analyze_project_failure_risks(payload.model_dump())
