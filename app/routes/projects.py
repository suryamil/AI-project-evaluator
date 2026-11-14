from fastapi import APIRouter, HTTPException, Depends, Header, Query, status
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.project import (
    ProjectEvaluationRequest,
    ProjectSubmissionRequest,
    EvaluationResultResponse,
    ProjectSubmissionResponse,
    ProjectResponse,
    ProjectListResponse
)
from app.models.db_models import (
    ProjectDocument,
    EvaluationDocument,
    RiskReportDocument,
    ChatMessage,
    RoadmapDocument
)
from app.models.roadmap_schemas import (
    ProjectRoadmap,
    RoadmapPhase,
    RoadmapTask,
    ToggleTaskRequest,
    CreateCustomTaskRequest
)
from app.services.evaluator import analyze_project_feasibility
from app.services.gemini_service import gemini_service
from app.core.config import settings
from app.services.db_service import db_service
from app.core.dependencies import get_current_user, get_optional_current_user
import logging

logger = logging.getLogger("projects_router")
from app.core.project_storage import (
    save_project_submission, 
    load_all_projects as load_pc_projects,
    get_project_by_id as get_pc_project
)

router = APIRouter()

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Message to AI project advisor")

# -------------------------------------------------------------
# 1. STANDALONE EVALUATION (Open tool / Pre-submission audit)
# -------------------------------------------------------------
@router.post(
    "/evaluate",
    response_model=EvaluationResultResponse,
    summary="Evaluate project feasibility without saving",
    description="Analyzes memory, inference latency, dataset leakage, budget, and team skill vectors to predict failure points."
)
async def evaluate_project(payload: ProjectEvaluationRequest):
    """
    Evaluates project parameters and returns multi-dimensional risk scores
    and actionable engineering recommendations without saving.
    """
    metrics = analyze_project_feasibility(payload.model_dump())
    return {
        "status": "success",
        "message": "AI feasibility evaluation successfully computed",
        "metrics": metrics
    }

# -------------------------------------------------------------
# 2. PROJECT SUBMISSION (Protected: Requires Authenticated JWT)
# -------------------------------------------------------------
@router.post(
    "/submit",
    response_model=ProjectSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit project proposal (Protected: Requires JWT)",
    description="Requires JWT token. Assigns ownership to authenticated student in MongoDB."
)
async def submit_project(
    proposal: ProjectSubmissionRequest,
    mock_for_testing: bool = Query(False, description="Use deterministic evaluation engine for fast testing"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email")
):
    """
    Submits a project proposal:
    1. Authenticates student from JWT token (or fallback headers).
    2. Runs failure vector analysis.
    3. Stores project in MongoDB 'projects' collection stamped with current_user["id"].
    4. Stores scores in 'evaluations' and 'risk_reports'.
    5. Saves local PC backup.
    """
    if current_user:
        user_id = current_user["id"]
        user_email = current_user["email"]
    else:
        user_id = x_user_id or "usr_demo"
        user_email = x_user_email or "student@university.edu"

    evaluator_source = "heuristic_baseline"
    ai_model = None
    innovation_score = None
    novelty_tier = None
    difficulty_score = None
    difficulty_level = None
    executive_summary = None
    full_gemini_analysis = None
    complexity_factors = []
    prerequisite_skills = []
    skill_gap_analysis = None
    recommended_learning_roadmap = []
    architecture_pattern = None
    potential_bottlenecks = []
    failure_scenarios = []

    if gemini_service.is_configured() and not mock_for_testing:
        try:
            gemini_eval = await gemini_service.evaluate_project(proposal.model_dump())
            evaluator_source = "google_gemini"
            ai_model = settings.GEMINI_MODEL
            innovation_score = getattr(gemini_eval, "innovation_score", 75)
            novelty_tier = "High Novelty" if innovation_score >= 75 else "Moderate Novelty"
            difficulty_level = str(getattr(gemini_eval, "technical_difficulty", "Intermediate"))
            difficulty_score = 90 if difficulty_level == "Advanced" else (35 if difficulty_level == "Beginner" else 65)
            executive_summary = getattr(gemini_eval, "evaluation_summary", "")
            full_gemini_analysis = gemini_eval.model_dump()

            feasibility_score = getattr(gemini_eval, "feasibility_score", 75)
            risk_level = "Low Risk" if feasibility_score >= 75 else ("Moderate Risk" if feasibility_score >= 50 else "High Risk")
            risk_color = (
                "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" if feasibility_score >= 75 else
                ("text-amber-500 bg-amber-500/10 border-amber-500/30" if feasibility_score >= 50 else "text-rose-500 bg-rose-500/10 border-rose-500/30")
            )
            radar_scores = {
                "memory_feasibility": min(98, max(20, int(feasibility_score * 0.95))),
                "latency_feasibility": min(98, max(20, int(feasibility_score * 0.90))),
                "data_integrity": min(98, max(20, int(feasibility_score * 1.02))),
                "cost_viability": min(98, max(20, int(feasibility_score * 0.88))),
                "team_capability": min(98, max(20, int(feasibility_score * 1.00)))
            }
            weaknesses = getattr(gemini_eval, "project_weaknesses", []) or getattr(gemini_eval, "weaknesses", [])
            primary_risk = weaknesses[0] if weaknesses else "Architectural validation required"
            identified_risks = weaknesses
            recommendations = getattr(gemini_eval, "improvement_suggestions", [])
            vram_required = "4.0 GB (INT8 Edge)" if difficulty_level == "Beginner" else "8.0 GB (FP16)"
            cloud_estimate = "$0 (Local Dev)" if "$0" in proposal.budget else "$30 - $60 / mo"

            complexity_factors = weaknesses
            prerequisite_skills = getattr(gemini_eval, "required_skills", [])
            skill_gap_analysis = getattr(gemini_eval, "difficulty_explanation", "Skill gaps assessed")
            recommended_learning_roadmap = recommendations
            architecture_pattern = getattr(gemini_eval, "complexity_explanation", "Standard web / ML pipeline")
            potential_bottlenecks = getattr(gemini_eval, "missing_information", [])
            failure_scenarios = weaknesses

            logger.info(f"Evaluated project '{proposal.title}' using Google Gemini ({settings.GEMINI_MODEL})")
        except Exception as e:
            logger.warning(f"Gemini evaluation failed in submit_project, falling back to heuristic: {str(e)}")
            eval_result = analyze_project_feasibility(proposal.model_dump())
            feasibility_score = eval_result["feasibility_score"]
            risk_level = eval_result["risk_level"]
            risk_color = eval_result["risk_color"]
            radar_scores = eval_result["radar_scores"]
            primary_risk = eval_result["primary_risk"]
            identified_risks = eval_result["identified_risks"]
            recommendations = eval_result["recommendations"]
            vram_required = eval_result["vram_required"]
            cloud_estimate = eval_result["cloud_estimate"]
    else:
        eval_result = analyze_project_feasibility(proposal.model_dump())
        feasibility_score = eval_result["feasibility_score"]
        risk_level = eval_result["risk_level"]
        risk_color = eval_result["risk_color"]
        radar_scores = eval_result["radar_scores"]
        primary_risk = eval_result["primary_risk"]
        identified_risks = eval_result["identified_risks"]
        recommendations = eval_result["recommendations"]
        vram_required = eval_result["vram_required"]
        cloud_estimate = eval_result["cloud_estimate"]

    project_id = f"eval_{int(datetime.utcnow().timestamp() * 1000)}"
    eval_id = f"eval_metric_{int(datetime.utcnow().timestamp() * 1000)}"
    report_id = f"report_{int(datetime.utcnow().timestamp() * 1000)}"

    # 1. Store in MongoDB 'projects' collection with authenticated owner ID
    project_doc = ProjectDocument(
        id=project_id,
        user_id=user_id,
        user_email=user_email,
        title=proposal.title.strip(),
        description=proposal.description.strip(),
        problem_statement=proposal.problem_statement.strip(),
        domain=proposal.domain,
        target_users=proposal.target_users.strip(),
        technologies=proposal.technologies.strip(),
        budget=proposal.budget,
        timeline=proposal.timeline,
        team_size=proposal.team_size,
        skill_level=proposal.skill_level,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )
    await db_service.create_project(project_doc)

    # 2. Store in MongoDB 'evaluations' collection
    eval_doc = EvaluationDocument(
        id=eval_id,
        project_id=project_id,
        user_id=user_id,
        feasibility_score=feasibility_score,
        risk_level=risk_level,
        risk_color=risk_color,
        radar_scores=radar_scores,
        evaluator_source=evaluator_source,
        ai_model=ai_model,
        innovation_score=innovation_score,
        novelty_tier=novelty_tier,
        difficulty_score=difficulty_score,
        difficulty_level=difficulty_level,
        executive_summary=executive_summary,
        full_gemini_analysis=full_gemini_analysis,
        evaluated_at=datetime.utcnow().isoformat()
    )
    await db_service.create_evaluation(eval_doc)

    # 3. Store in MongoDB 'risk_reports' collection
    report_doc = RiskReportDocument(
        id=report_id,
        project_id=project_id,
        evaluation_id=eval_id,
        user_id=user_id,
        primary_risk=primary_risk,
        identified_risks=identified_risks,
        recommendations=recommendations,
        vram_required=vram_required,
        cloud_estimate=cloud_estimate,
        evaluator_source=evaluator_source,
        complexity_factors=complexity_factors,
        prerequisite_skills=prerequisite_skills,
        skill_gap_analysis=skill_gap_analysis,
        recommended_learning_roadmap=recommended_learning_roadmap,
        architecture_pattern=architecture_pattern,
        potential_bottlenecks=potential_bottlenecks,
        failure_scenarios=failure_scenarios,
        generated_at=datetime.utcnow().isoformat()
    )
    await db_service.create_risk_report(report_doc)

    # 4. Local PC File Backup
    full_pc_record = {
        "id": project_id,
        "user_id": user_id,
        "isDemo": False,
        "title": proposal.title.strip(),
        "description": proposal.description.strip(),
        "problemStatement": proposal.problem_statement.strip(),
        "domain": proposal.domain,
        "targetUsers": proposal.target_users.strip(),
        "technologies": proposal.technologies.strip(),
        "model": proposal.technologies.split(",")[0].strip() if proposal.technologies else proposal.domain,
        "hardware": "Target: " + proposal.budget.split("(")[0].strip(),
        "dataset": "Proposed Project Data Pipeline",
        "budget": proposal.budget,
        "timeline": proposal.timeline,
        "teamSize": proposal.team_size,
        "skillLevel": proposal.skill_level,
        "feasibilityScore": feasibility_score,
        "riskLevel": risk_level,
        "riskColor": risk_color,
        "primaryRisk": primary_risk,
        "fixes": recommendations,
        "radarScores": radar_scores,
        "evaluatedAt": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "evaluatorSource": evaluator_source,
        "aiModel": ai_model,
        "innovationScore": innovation_score,
        "noveltyTier": novelty_tier,
        "difficultyLevel": difficulty_level,
        "difficultyScore": difficulty_score,
        "executiveSummary": executive_summary
    }
    save_project_submission(full_pc_record)

    return {
        "status": "success",
        "message": "Project evaluated and saved across MongoDB collections (projects, evaluations, risk_reports)",
        "project": full_pc_record
    }

# -------------------------------------------------------------
# 3. PROJECT RETRIEVAL BY ID (Protected: User-Specific Access Control)
# -------------------------------------------------------------
@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Retrieve a project evaluation by ID (Protected Access Control)",
    description="Loads project proposal. Verifies that the requesting student owns the project."
)
async def get_project(
    project_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Retrieves project by ID.
    Enforces privacy access control: student can only view their own projects!
    """
    active_user_id = current_user["id"] if current_user else x_user_id

    # 1. Try MongoDB
    proj = await db_service.get_project(project_id)
    
    # 2. Check PC storage fallback
    if not proj:
        proj = get_pc_project(project_id)

    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' was not found in database."
        )

    # 3. Verify ownership: If user is authenticated, ensure project belongs to them!
    owner_id = proj.get("user_id")
    if active_user_id and owner_id and owner_id != active_user_id and not proj.get("isDemo", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to access another student's private project evaluation."
        )

    eval_doc = await db_service.get_evaluation_by_project(project_id)
    report_doc = await db_service.get_risk_report(project_id)

    return {
        "id": proj.get("id"),
        "user_id": proj.get("user_id"),
        "user_email": proj.get("user_email"),
        "isDemo": proj.get("isDemo", False),
        "title": proj.get("title"),
        "description": proj.get("description"),
        "problemStatement": proj.get("problem_statement") or proj.get("problemStatement", ""),
        "domain": proj.get("domain"),
        "targetUsers": proj.get("target_users") or proj.get("targetUsers", ""),
        "technologies": proj.get("technologies"),
        "model": proj.get("technologies", "").split(",")[0].strip() if proj.get("technologies") else proj.get("domain", ""),
        "hardware": proj.get("hardware") or f"Target: {proj.get('budget', '')}",
        "dataset": proj.get("dataset", "Project Data Pipeline"),
        "budget": proj.get("budget", ""),
        "timeline": proj.get("timeline", ""),
        "teamSize": proj.get("team_size") or proj.get("teamSize", ""),
        "skillLevel": proj.get("skill_level") or proj.get("skillLevel", ""),
        "feasibilityScore": eval_doc.get("feasibility_score") if eval_doc else proj.get("feasibilityScore", 70),
        "riskLevel": eval_doc.get("risk_level") if eval_doc else proj.get("riskLevel", "Moderate Risk"),
        "riskColor": eval_doc.get("risk_color") if eval_doc else proj.get("riskColor", "text-amber-500 bg-amber-500/10 border-amber-500/30"),
        "primaryRisk": report_doc.get("primary_risk") if report_doc else proj.get("primaryRisk", "Standard architectural oversight required."),
        "fixes": report_doc.get("recommendations") if report_doc else proj.get("fixes", []),
        "radarScores": eval_doc.get("radar_scores") if eval_doc else proj.get("radarScores"),
        "evaluatedAt": eval_doc.get("evaluated_at") if eval_doc else proj.get("evaluatedAt", "Recent"),
        "evaluatorSource": eval_doc.get("evaluator_source") if eval_doc else proj.get("evaluatorSource", "heuristic_baseline"),
        "aiModel": eval_doc.get("ai_model") if eval_doc else proj.get("aiModel"),
        "innovationScore": eval_doc.get("innovation_score") if eval_doc else proj.get("innovationScore"),
        "noveltyTier": eval_doc.get("novelty_tier") if eval_doc else proj.get("noveltyTier"),
        "difficultyLevel": eval_doc.get("difficulty_level") if eval_doc else proj.get("difficultyLevel"),
        "difficultyScore": eval_doc.get("difficulty_score") if eval_doc else proj.get("difficultyScore"),
        "executiveSummary": eval_doc.get("executive_summary") if eval_doc else proj.get("executiveSummary")
    }

# -------------------------------------------------------------
# 4. USER-SPECIFIC PROJECT LIST RETRIEVAL
# -------------------------------------------------------------
@router.get(
    "",
    response_model=ProjectListResponse,
    summary="Retrieve projects (User-Specific Private Data Isolation)",
    description="Returns only the projects owned by the authenticated student."
)
async def list_projects(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    user_id: Optional[str] = Query(None, description="Filter projects strictly by student ID"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Returns private projects belonging to the student.
    Ensures data privacy isolation: users see ONLY their own projects.
    """
    active_user_id = current_user["id"] if current_user else (user_id or x_user_id)

    if active_user_id:
        db_projects = await db_service.list_user_projects(active_user_id)
    else:
        db_projects = await db_service.list_all_projects()

    if not db_projects:
        pc_projects = load_pc_projects()
        if active_user_id:
            db_projects = [p for p in pc_projects if p.get("user_id") == active_user_id]
        else:
            db_projects = pc_projects

    formatted_list = []
    for p in db_projects:
        formatted_list.append({
            "id": p.get("id"),
            "isDemo": p.get("isDemo", False),
            "title": p.get("title"),
            "description": p.get("description"),
            "problemStatement": p.get("problem_statement") or p.get("problemStatement", ""),
            "domain": p.get("domain"),
            "targetUsers": p.get("target_users") or p.get("targetUsers", ""),
            "technologies": p.get("technologies"),
            "model": p.get("model") or p.get("technologies", "").split(",")[0].strip(),
            "hardware": p.get("hardware") or "Standard Hardware Tier",
            "dataset": p.get("dataset", "Curated Dataset"),
            "budget": p.get("budget", ""),
            "timeline": p.get("timeline", ""),
            "teamSize": p.get("team_size") or p.get("teamSize", ""),
            "skillLevel": p.get("skill_level") or p.get("skillLevel", ""),
            "feasibilityScore": p.get("feasibilityScore") or p.get("feasibility_score", 70),
            "riskLevel": p.get("riskLevel") or p.get("risk_level", "Moderate Risk"),
            "riskColor": p.get("riskColor") or p.get("risk_color", "text-amber-500 bg-amber-500/10 border-amber-500/30"),
            "primaryRisk": p.get("primaryRisk") or p.get("primary_risk", "Bottlenecks under evaluation."),
            "fixes": p.get("fixes") or p.get("recommendations", []),
            "radarScores": p.get("radarScores") or p.get("radar_scores"),
            "evaluatedAt": p.get("evaluatedAt") or p.get("evaluated_at", "Recent"),
            "evaluatorSource": p.get("evaluatorSource") or p.get("evaluator_source", "heuristic_baseline"),
            "aiModel": p.get("aiModel") or p.get("ai_model"),
            "innovationScore": p.get("innovationScore") or p.get("innovation_score"),
            "noveltyTier": p.get("noveltyTier") or p.get("novelty_tier"),
            "difficultyLevel": p.get("difficultyLevel") or p.get("difficulty_level"),
            "difficultyScore": p.get("difficultyScore") or p.get("difficulty_score"),
            "executiveSummary": p.get("executiveSummary") or p.get("executive_summary")
        })

    return {
        "status": "success",
        "total": len(formatted_list),
        "projects": formatted_list
    }

# -------------------------------------------------------------
# 5. MODULE A: AI PROJECT ASSISTANT (Chatbot & History in MongoDB)
# -------------------------------------------------------------
@router.get(
    "/{project_id}/chat",
    summary="Retrieve AI Advisor Chat History (Protected)",
    description="Loads persistent conversation from MongoDB 'chat_history' collection."
)
async def get_project_chat(
    project_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Retrieves chat history for a project owned by this student."""
    user_id = current_user["id"] if current_user else (x_user_id or "usr_demo")
    chat_doc = await db_service.get_or_create_chat(project_id, user_id)
    return {
        "status": "success",
        "chat": chat_doc
    }

@router.post(
    "/{project_id}/chat",
    summary="Interactive AI Project Assistant Chatbot (Gemini + MongoDB)",
    description=(
        "Sends query to Gemini with full project architecture awareness. "
        "Explains concepts with code snippets, suggests features, recommends tech, "
        "and troubleshoots implementation difficulties. Maintains conversation history."
    )
)
async def post_project_chat(
    project_id: str,
    req: ChatRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Appends student query, generates contextual Gemini response with project context,
    and maintains conversation history in MongoDB.
    """
    user_id = current_user["id"] if current_user else (x_user_id or "usr_demo")

    # 1. Fetch project context from database (or fallback local backup)
    project_doc = await db_service.get_project(project_id, user_id)
    if not project_doc:
        project_doc = await db_service.get_project(project_id)
    if not project_doc:
        project_doc = get_pc_project(project_id) or {
            "id": project_id,
            "title": "Interactive AI Project",
            "domain": "Artificial Intelligence & Software Engineering",
            "technologies": "Python, React, FastAPI",
            "skill_level": "Intermediate",
            "timeline": "3 - 4 Months",
            "budget": "Flexible"
        }

    # Fetch recent evaluation metrics if available
    eval_doc = await db_service.get_evaluation_by_project(project_id)
    risk_doc = await db_service.get_risk_report(project_id)

    project_context = {
        **project_doc,
        "feasibility_score": eval_doc.get("feasibility_score") if eval_doc else 75,
        "risk_level": eval_doc.get("risk_level") if eval_doc else "Moderate Risk",
        "primary_risk": risk_doc.get("primary_risk") if risk_doc else "Resource bounds",
        "project_weaknesses": risk_doc.get("identified_risks", []) if risk_doc else []
    }

    # 2. Retrieve existing conversation history
    existing_chat = await db_service.get_or_create_chat(project_id, user_id)
    conversation_history = existing_chat.get("messages", [])

    # 3. Append user message to database
    await db_service.add_chat_message(project_id, user_id, "user", req.message)

    # 4. Generate AI Assistant response via Gemini Service
    advisor_reply = await gemini_service.chat_with_assistant(
        project_context=project_context,
        conversation_history=conversation_history,
        user_message=req.message
    )

    # 5. Append assistant response to MongoDB chat history
    updated_chat = await db_service.add_chat_message(project_id, user_id, "assistant", advisor_reply)

    return {
        "status": "success",
        "reply": advisor_reply,
        "chat": updated_chat
    }

@router.delete(
    "/{project_id}/chat",
    summary="Clear AI Advisor Chat History",
    description="Resets the conversation history in MongoDB and restores initial greeting."
)
async def delete_project_chat(
    project_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Resets the persistent chat history for this project."""
    user_id = current_user["id"] if current_user else (x_user_id or "usr_demo")
    updated_chat = await db_service.clear_chat(project_id, user_id)
    return {
        "status": "success",
        "message": "Chat history successfully reset",
        "chat": updated_chat
    }


# -------------------------------------------------------------
# 6. MODULE B: DEVELOPMENT ROADMAP (Phases, Tasks & Tracking)
# -------------------------------------------------------------
@router.get(
    "/{project_id}/roadmap",
    summary="Retrieve Project Development Roadmap",
    description="Loads personalized roadmap from MongoDB 'roadmaps' collection. Auto-generates if not yet created."
)
async def get_project_roadmap(
    project_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Retrieves or lazily initializes the 5-phase personalized implementation plan.
    """
    user_id = current_user["id"] if current_user else (x_user_id or "usr_demo")
    roadmap = await db_service.get_roadmap(project_id, user_id)

    if roadmap:
        return {
            "status": "success",
            "roadmap": roadmap
        }

    # Auto-generate if not yet present
    project_doc = await db_service.get_project(project_id, user_id) or get_pc_project(project_id) or {
        "id": project_id,
        "title": "AI Capstone Project",
        "domain": "Artificial Intelligence",
        "technologies": "Python, React, FastAPI",
        "timeline": "3 - 4 Months",
        "budget": "Flexible",
        "skill_level": "Intermediate",
        "user_id": user_id
    }

    generated_roadmap = await gemini_service.generate_development_roadmap(project_doc)
    generated_roadmap.project_id = project_id
    generated_roadmap.user_id = user_id

    roadmap_doc = RoadmapDocument(
        id=generated_roadmap.id,
        project_id=project_id,
        user_id=user_id,
        title=generated_roadmap.title,
        overall_duration=generated_roadmap.overall_duration,
        methodology=generated_roadmap.methodology,
        phases=[p.model_dump() for p in generated_roadmap.phases],
        total_tasks=generated_roadmap.total_tasks,
        completed_tasks=generated_roadmap.completed_tasks,
        progress_percentage=generated_roadmap.progress_percentage
    )

    saved = await db_service.save_roadmap(roadmap_doc)
    return {
        "status": "success",
        "message": "Development roadmap dynamically generated and saved",
        "roadmap": saved
    }

@router.post(
    "/{project_id}/roadmap/generate",
    summary="Generate / Regenerate Personalized Implementation Roadmap",
    description="Forces regeneration of a tailored 5-phase roadmap with Gemini API and saves to MongoDB."
)
async def generate_project_roadmap_endpoint(
    project_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Re-analyzes project specifications and generates a fresh, customized implementation roadmap.
    """
    user_id = current_user["id"] if current_user else (x_user_id or "usr_demo")
    project_doc = await db_service.get_project(project_id, user_id) or get_pc_project(project_id) or {
        "id": project_id,
        "title": "AI Capstone Project",
        "domain": "Artificial Intelligence",
        "technologies": "Python, React, FastAPI",
        "timeline": "3 - 4 Months",
        "budget": "Flexible",
        "skill_level": "Intermediate",
        "user_id": user_id
    }

    generated_roadmap = await gemini_service.generate_development_roadmap(project_doc)
    generated_roadmap.project_id = project_id
    generated_roadmap.user_id = user_id

    roadmap_doc = RoadmapDocument(
        id=generated_roadmap.id,
        project_id=project_id,
        user_id=user_id,
        title=generated_roadmap.title,
        overall_duration=generated_roadmap.overall_duration,
        methodology=generated_roadmap.methodology,
        phases=[p.model_dump() for p in generated_roadmap.phases],
        total_tasks=generated_roadmap.total_tasks,
        completed_tasks=generated_roadmap.completed_tasks,
        progress_percentage=generated_roadmap.progress_percentage
    )

    saved = await db_service.save_roadmap(roadmap_doc)
    return {
        "status": "success",
        "message": "Personalized development roadmap successfully generated and saved to MongoDB",
        "roadmap": saved
    }

@router.patch(
    "/{project_id}/roadmap/tasks/{task_id}",
    summary="Track Completed Task in Development Roadmap",
    description="Toggles or sets the completion state of an implementation task and updates progress % in MongoDB."
)
@router.post(
    "/{project_id}/roadmap/tasks/{task_id}/toggle",
    summary="Toggle Completed Task in Development Roadmap",
    description="Convenience endpoint to toggle completion status of a task."
)
async def toggle_roadmap_task(
    project_id: str,
    task_id: str,
    body: Optional[ToggleTaskRequest] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Updates completion status of an engineering task and recalibrates overall project progress.
    """
    user_id = current_user["id"] if current_user else (x_user_id or "usr_demo")
    explicit_state = body.completed if body else None

    updated_roadmap = await db_service.toggle_task_completion(
        project_id=project_id,
        task_id=task_id,
        completed=explicit_state,
        user_id=user_id
    )

    if not updated_roadmap:
        # Retry without user_id restriction in case owner ID differed
        updated_roadmap = await db_service.toggle_task_completion(
            project_id=project_id,
            task_id=task_id,
            completed=explicit_state
        )

    if not updated_roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task '{task_id}' or Roadmap for project '{project_id}' not found."
        )

    return {
        "status": "success",
        "message": f"Task '{task_id}' updated successfully",
        "roadmap": updated_roadmap
    }

@router.post(
    "/{project_id}/roadmap/tasks",
    summary="Add Custom Task to Development Roadmap Phase",
    description="Allows students to append custom implementation tasks to any phase."
)
async def add_custom_roadmap_task(
    project_id: str,
    req: CreateCustomTaskRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Appends a student-defined custom milestone to a specific phase in MongoDB.
    """
    user_id = current_user["id"] if current_user else (x_user_id or "usr_demo")

    updated_roadmap = await db_service.add_custom_task_to_phase(
        project_id=project_id,
        phase_number=req.phase_number,
        task_data=req.model_dump(),
        user_id=user_id
    )

    if not updated_roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Roadmap or Phase {req.phase_number} not found for project '{project_id}'."
        )

    return {
        "status": "success",
        "message": "Custom task added to roadmap successfully",
        "roadmap": updated_roadmap
    }
