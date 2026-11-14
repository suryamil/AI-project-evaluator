"""
MongoDB Document Schemas for the 5 Collections:
1. Users
2. Projects
3. Evaluations
4. RiskReports
5. ChatHistory
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# -------------------------------------------------------------------
# 1. Users Collection Document Schema
# -------------------------------------------------------------------
class UserDocument(BaseModel):
    id: str = Field(..., description="Unique user identifier (usr_...)")
    email: str = Field(..., description="Unique email address (indexed)")
    full_name: str = Field(...)
    password_hash: str = Field(..., description="Cryptographic PBKDF2 hash")
    salt: str = Field(..., description="16-byte random salt")
    university: Optional[str] = "Student Researcher"
    role: str = "student"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    is_active: bool = True

    class Config:
        populate_by_name = True

# -------------------------------------------------------------------
# 2. Projects Collection Document Schema
# -------------------------------------------------------------------
class ProjectDocument(BaseModel):
    id: str = Field(..., description="Unique project identifier (proj_...)")
    user_id: str = Field(..., description="Owner's User ID (indexed for private access isolation)")
    user_email: str = Field(...)
    title: str = Field(...)
    description: str = Field(...)
    problem_statement: str = Field(...)
    domain: str = Field(...)
    target_users: str = Field(...)
    technologies: str = Field(...)
    budget: str = Field(...)
    timeline: str = Field(...)
    team_size: str = Field(...)
    skill_level: str = Field(...)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# -------------------------------------------------------------------
# 3. Evaluations Collection Document Schema
# -------------------------------------------------------------------
class EvaluationDocument(BaseModel):
    id: str = Field(..., description="Unique evaluation identifier (eval_...)")
    project_id: str = Field(..., description="Associated Project ID (indexed)")
    user_id: str = Field(..., description="Owner's User ID (indexed for private data security)")
    feasibility_score: int = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="'Low Risk', 'Moderate Risk', or 'High Risk'")
    risk_color: str = Field(...)
    radar_scores: Dict[str, int] = Field(
        ...,
        description="5 dimensions: memory_feasibility, latency_feasibility, data_integrity, cost_viability, team_capability"
    )
    evaluator_source: str = Field(default="heuristic_baseline", description="'google_gemini' or 'heuristic_baseline'")
    ai_model: Optional[str] = Field(default=None, description="e.g. 'gemini-2.5-flash'")
    innovation_score: Optional[int] = Field(default=None, description="Gemini evaluated novelty score (0-100)")
    novelty_tier: Optional[str] = Field(default=None)
    difficulty_score: Optional[int] = Field(default=None, description="Gemini evaluated difficulty index (0-100)")
    difficulty_level: Optional[str] = Field(default=None)
    feasibility_explanation: Optional[str] = Field(default=None, description="Detailed explanation of feasibility score")
    innovation_explanation: Optional[str] = Field(default=None, description="Detailed explanation of innovation score")
    technical_complexity: Optional[str] = Field(default=None, description="Assessed technical complexity tier")
    complexity_explanation: Optional[str] = Field(default=None, description="Explanation of technical complexity")
    difficulty_explanation: Optional[str] = Field(default=None, description="Explanation of development difficulty")
    missing_information: Optional[List[str]] = Field(default_factory=list, description="Critical specification gaps")
    scoring_methodology: Optional[Dict[str, Any]] = Field(default=None, description="Transparent methodology and failure probability distinction")
    executive_summary: Optional[str] = Field(default=None)
    full_gemini_analysis: Optional[Dict[str, Any]] = Field(default=None, description="Complete structured Gemini output payload")
    evaluated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# -------------------------------------------------------------------
# 4. RiskReports Collection Document Schema
# -------------------------------------------------------------------
class RiskReportDocument(BaseModel):
    id: str = Field(..., description="Unique risk report identifier (report_...)")
    project_id: str = Field(..., description="Associated Project ID (indexed)")
    evaluation_id: str = Field(..., description="Associated Evaluation ID")
    user_id: str = Field(..., description="Owner's User ID (indexed for private data security)")
    primary_risk: str = Field(..., description="Dominant architectural failure point")
    overall_risk_level: Optional[str] = Field(default="Medium", description="'Low', 'Medium', or 'High'")
    risk_summary: Optional[str] = Field(default=None, description="Executive risk synthesis")
    risk_mitigation_plan: Optional[List[str]] = Field(default_factory=list, description="Phased risk mitigation checklist")
    structured_risks: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="All 8 categorized failure risk breakdowns")
    identified_risks: List[str] = Field(default_factory=list, description="All identified failure vectors")
    recommendations: List[str] = Field(default_factory=list, description="Actionable engineering fixes")
    vram_required: str = Field(default="4.0 GB (FP16)")
    cloud_estimate: str = Field(default="$0 (Local Dev)")
    evaluator_source: str = Field(default="heuristic_baseline", description="'google_gemini' or 'heuristic_baseline'")
    complexity_factors: List[str] = Field(default_factory=list)
    prerequisite_skills: List[str] = Field(default_factory=list)
    skill_gap_analysis: Optional[str] = None
    recommended_learning_roadmap: List[str] = Field(default_factory=list)
    architecture_pattern: Optional[str] = None
    potential_bottlenecks: List[str] = Field(default_factory=list)
    failure_scenarios: List[str] = Field(default_factory=list)
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# -------------------------------------------------------------------
# 5. ChatHistory Collection Document Schema
# -------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(...)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ChatHistoryDocument(BaseModel):
    id: str = Field(..., description="Unique chat session ID (chat_...)")
    project_id: str = Field(..., description="Associated Project ID (indexed)")
    user_id: str = Field(..., description="Owner's User ID (indexed for private data security)")
    messages: List[ChatMessage] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# -------------------------------------------------------------------
# 6. Roadmaps Collection Document Schema
# -------------------------------------------------------------------
class RoadmapDocument(BaseModel):
    id: str = Field(..., description="Unique roadmap ID (rdm_...)")
    project_id: str = Field(..., description="Associated Project ID (indexed)")
    user_id: str = Field(..., description="Owner's User ID (indexed for private data security)")
    title: str = Field(...)
    overall_duration: str = Field(default="12 Weeks")
    methodology: str = Field(default="Agile Sprint Iterations")
    phases: List[Dict[str, Any]] = Field(default_factory=list)
    total_tasks: int = Field(default=0)
    completed_tasks: int = Field(default=0)
    progress_percentage: float = Field(default=0.0)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

