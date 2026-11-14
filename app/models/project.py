from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class RadarScores(BaseModel):
    memory_feasibility: int = Field(..., ge=0, le=100, description="Memory / VRAM viability score (0-100)")
    latency_feasibility: int = Field(..., ge=0, le=100, description="Inference latency viability score (0-100)")
    data_integrity: int = Field(..., ge=0, le=100, description="Data volume & leakage protection score (0-100)")
    cost_viability: int = Field(..., ge=0, le=100, description="Cloud / Hardware budget sustainability (0-100)")
    team_capability: int = Field(..., ge=0, le=100, description="Team execution readiness score (0-100)")

class ProjectEvaluationRequest(BaseModel):
    """Payload for evaluating a project without saving."""
    title: str = Field(..., min_length=3, max_length=150, description="Project title", example="Drone Vineyard Pathology")
    domain: str = Field(..., description="Project domain", example="Computer Vision & Autonomous Robotics")
    technologies: str = Field(..., min_length=2, description="Planned technologies", example="Python, YOLOv8, PyTorch, Raspberry Pi 4")
    skill_level: str = Field(..., description="Current skill level", example="Intermediate")
    timeline: str = Field(..., description="Project timeline", example="3 - 4 Months")
    budget: str = Field(..., description="Available budget tier", example="$300 - $1,000")
    team_size: str = Field(..., description="Team size", example="Small Capstone Team (3 - 4 Students)")
    description: Optional[str] = Field(None, description="Project scope and description")
    problem_statement: Optional[str] = Field(None, description="Problem being addressed")
    target_users: Optional[str] = Field(None, description="Intended end users")

class ProjectSubmissionRequest(BaseModel):
    """Payload for submitting and persisting a project."""
    title: str = Field(..., min_length=3, max_length=150, description="Project title", example="Drone Vineyard Pathology")
    description: str = Field(..., min_length=10, description="Project description", example="Real-time crop disease detection on edge devices.")
    problem_statement: str = Field(..., min_length=10, description="Problem being solved", example="Manual inspection takes days and causes crop loss.")
    domain: str = Field(..., description="Project domain", example="Computer Vision & Autonomous Robotics")
    target_users: str = Field(..., min_length=2, description="Target users", example="Vineyard farmers and field inspectors")
    technologies: str = Field(..., min_length=2, description="Planned technologies", example="Python, YOLOv8, PyTorch, FastAPI")
    budget: str = Field(..., description="Available budget tier", example="$300 - $1,000")
    timeline: str = Field(..., description="Project timeline", example="3 - 4 Months")
    team_size: str = Field(..., description="Team size", example="Small Capstone Team (3 - 4 Students)")
    skill_level: str = Field(..., description="Current technical skill level", example="Intermediate")

class EvaluationMetrics(BaseModel):
    feasibility_score: int = Field(..., ge=0, le=100, description="Overall feasibility score (0-100)")
    risk_level: str = Field(..., description="'Low Risk', 'Moderate Risk', or 'High Risk'")
    risk_color: str = Field(..., description="UI styling class for risk level")
    primary_risk: str = Field(..., description="Core identified architectural failure vector")
    identified_risks: List[str] = Field(default_factory=list, description="Specific technical failure points")
    recommendations: List[str] = Field(default_factory=list, description="Actionable engineering recommendations")
    radar_scores: RadarScores
    vram_required: str = Field(..., description="Estimated VRAM requirement")
    cloud_estimate: str = Field(..., description="Estimated cloud hosting cost")

class EvaluationResultResponse(BaseModel):
    status: str = "success"
    message: str = "AI feasibility evaluation complete"
    metrics: EvaluationMetrics

class ProjectResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    isDemo: bool = False
    title: str
    description: str
    problemStatement: str
    domain: str
    targetUsers: str
    technologies: str
    model: str
    hardware: str
    dataset: str
    budget: str
    timeline: str
    teamSize: str
    skillLevel: str
    feasibilityScore: int
    riskLevel: str
    riskColor: str
    primaryRisk: str
    fixes: List[str]
    radarScores: Optional[RadarScores] = None
    evaluatedAt: str
    saved_at: Optional[str] = None
    evaluatorSource: Optional[str] = "heuristic_baseline"
    aiModel: Optional[str] = None
    innovationScore: Optional[int] = None
    noveltyTier: Optional[str] = None
    difficultyLevel: Optional[str] = None
    difficultyScore: Optional[int] = None
    executiveSummary: Optional[str] = None

class ProjectSubmissionResponse(BaseModel):
    status: str = "success"
    message: str
    project: ProjectResponse

class ProjectListResponse(BaseModel):
    status: str = "success"
    total: int
    projects: List[ProjectResponse]
