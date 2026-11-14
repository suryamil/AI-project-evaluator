"""
Pydantic Response Schemas for AI Project Evaluator Engine.

Defines the comprehensive 10-criteria evaluation model with transparent scoring methodology:
1. feasibility_score (0-100) & feasibility_explanation
2. innovation_score (0-100) & innovation_explanation
3. technical_complexity ("Low", "Moderate", "High", "Very High") & complexity_explanation
4. estimated_development_difficulty ("Beginner", "Intermediate", "Advanced") & difficulty_explanation
5. required_skills (List[str])
6. technology_recommendations (List[str])
7. project_strengths (List[str])
8. project_weaknesses (List[str])
9. missing_information (List[str]) - Critical specification gaps
10. improvement_suggestions (List[str])
11. scoring_methodology (ScoringMethodology) - Explicit distinction between feasibility and statistical failure probability
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.risk_schemas import (
    ProjectFailureRiskAnalysis,
    RiskItem,
    RiskLevel,
    RiskCategory
)

class TechnicalDifficulty(str, Enum):
    """Permitted technical difficulty tiers."""
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class TechnicalComplexity(str, Enum):
    """Permitted technical complexity tiers."""
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    VERY_HIGH = "Very High"

class DimensionWeights(BaseModel):
    """Transparent heuristic weighting breakdown for feasibility calculation."""
    architecture_hardware: str = Field(default="35%", description="Architecture & hardware bounds weight")
    tech_stack_skills: str = Field(default="25%", description="Tech stack & skill alignment weight")
    scope_timeline_budget: str = Field(default="25%", description="Scope, timeline & budget realism weight")
    data_testing_rigor: str = Field(default="15%", description="Data pipeline & testing rigor weight")

class ScoringMethodology(BaseModel):
    """
    Transparent scoring methodology and scientific rigor disclaimer.
    Strictly distinguishes subjective LLM architectural heuristics
    from deterministic statistical failure probabilities.
    """
    methodology_disclaimer: str = Field(
        default=(
            "This evaluation provides qualitative architectural heuristics and engineering readiness indicators "
            "based on submitted parameters. It does NOT treat LLM output as a scientifically validated deterministic "
            "failure probability or guaranteed real-world outcome."
        ),
        description="Disclaimer on heuristic vs statistical probability distinction."
    )
    feasibility_vs_failure_distinction: str = Field(
        default=(
            "Feasibility score (0-100) measures static engineering readiness, hardware viability, and scope alignment. "
            "Actual project failure probability is dynamic and driven by runtime execution, team communication, and edge-case testing."
        ),
        description="Clear differentiation between feasibility scores and actual failure probabilities."
    )
    failure_risk_tier: str = Field(
        default="Moderate Risk",
        description="Categorical risk tier: 'Low Risk', 'Moderate Risk', 'High Risk', or 'Critical Risk'",
        example="Moderate Risk"
    )
    empirical_failure_factors: List[str] = Field(
        default_factory=lambda: [
            "Hardware/VRAM bounds during batched inference",
            "Scope creep relative to stated timeline",
            "Skill mismatch with high-complexity frameworks"
        ],
        description="Real-world failure vectors observed in comparable software engineering projects"
    )
    dimension_weights: DimensionWeights = Field(
        default_factory=DimensionWeights,
        description="Transparent weighting breakdown used to calculate feasibility"
    )

class ProjectEvaluationResponse(BaseModel):
    """
    Standardized AI Project Evaluation Engine Response Model.
    Enforces all 10 evaluation criteria, score explanations, and transparent scoring methodology.
    """
    # 1. Feasibility Score & Explanation
    feasibility_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall project feasibility score from 0 (impossible) to 100 (fully viable)",
        example=82
    )
    feasibility_explanation: str = Field(
        default="The proposed stack is technically viable within the given capstone timeline, though VRAM limits on the target device require INT8 quantization.",
        min_length=10,
        description="Detailed explanation for how the feasibility score was calculated",
        example="The proposed stack is technically viable within a 3-4 month capstone timeline, though VRAM limits on the edge device require INT8 quantization."
    )

    # 2. Innovation Score & Explanation
    innovation_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Innovation and novelty score from 0 (standard clone) to 100 (breakthrough novelty)",
        example=75
    )
    innovation_explanation: str = Field(
        default="Combines domain application with modern deep learning. While the task is established, the proposed execution demonstrates practical innovation.",
        min_length=10,
        description="Clear explanation of the novelty, unique value proposition, or common clone patterns identified",
        example="Combines lightweight edge vision with agricultural pathology. While crop classification is established, edge inference on constrained drones represents practical innovation."
    )

    # 3. Technical Complexity & Explanation
    technical_complexity: TechnicalComplexity = Field(
        default=TechnicalComplexity.MODERATE,
        description="Assessed technical complexity: 'Low', 'Moderate', 'High', or 'Very High'",
        example="Moderate"
    )
    complexity_explanation: str = Field(
        default="Moderate complexity driven by real-time hardware interfacing and model optimization.",
        min_length=10,
        description="Explanation of architectural, algorithmic, and integration complexity",
        example="Moderate complexity driven by real-time hardware interfacing and model optimization for edge CPU/GPU."
    )

    # 4. Estimated Development Difficulty & Explanation
    estimated_development_difficulty: TechnicalDifficulty = Field(
        default=TechnicalDifficulty.INTERMEDIATE,
        description="Estimated development difficulty tier: 'Beginner', 'Intermediate', or 'Advanced'",
        example="Intermediate"
    )
    difficulty_explanation: str = Field(
        default="Requires intermediate knowledge of software development and hands-on familiarity with the chosen framework.",
        min_length=10,
        description="Explanation of why this development difficulty tier applies to this team and stack",
        example="Requires intermediate knowledge of Python and PyTorch plus hands-on familiarity with embedded Linux deployment."
    )

    # 5. Required Skills
    required_skills: List[str] = Field(
        ...,
        description="Core technical competencies and prerequisites required to execute the project",
        example=["Python", "PyTorch", "Computer Vision Fundamentals", "FastAPI"]
    )

    # 6. Technology Recommendations
    technology_recommendations: List[str] = Field(
        default_factory=list,
        description="Production-grade frameworks, libraries, runtimes, and databases recommended for implementation",
        example=["FastAPI", "PyTorch", "YOLOv8", "Docker", "ONNX Runtime"]
    )

    # 7. Project Strengths
    project_strengths: List[str] = Field(
        default_factory=list,
        description="Key architectural strengths, viable technical decisions, and unique advantages of the project",
        example=["Realistic scope for academic timeline", "Clear user beneficiaries", "Appropriate framework choices"]
    )

    # 8. Project Weaknesses
    project_weaknesses: List[str] = Field(
        default_factory=list,
        description="Identified architectural gaps, unaddressed edge cases, or potential design oversights",
        example=["Missing dataset validation pipeline", "Unspecified latency targets under peak concurrency"]
    )

    # 9. Missing Information
    missing_information: List[str] = Field(
        default_factory=lambda: [
            "Exact dataset sample volume and image resolution",
            "Specific target inference latency / FPS threshold",
            "Hardware fallback behavior under compute or thermal throttling"
        ],
        description="Critical specification gaps, unstated assumptions, missing data volumes, or unverified hardware bounds",
        example=["Exact dataset image count and resolution", "Specific target inference frames-per-second (FPS) SLA"]
    )

    # 10. Improvement Suggestions
    improvement_suggestions: List[str] = Field(
        ...,
        description="Prioritized, actionable recommendations to improve project robustness and execution feasibility",
        example=["Apply INT8 model quantization via ONNX Runtime", "Implement stratified cross-validation to prevent data leakage"]
    )

    # Holistic Executive Summary
    evaluation_summary: str = Field(
        ...,
        min_length=10,
        description="Executive summary providing a holistic verdict on project viability and next steps",
        example="A viable and well-structured project with solid practical application. Focus on edge quantization and data pipeline integrity to avoid common deployment pitfalls."
    )

    # Transparent Scoring Methodology
    scoring_methodology: ScoringMethodology = Field(
        default_factory=ScoringMethodology,
        description="Transparent scoring methodology detailing dimension weights and distinguishing feasibility from probability"
    )

    # Project Failure Risk Analysis (8 Core Categories + Mitigation Plan)
    failure_risk_analysis: Optional[ProjectFailureRiskAnalysis] = Field(
        default=None,
        description="Comprehensive 8-category project failure risk analysis and mitigation plan"
    )

    # Aliases for direct dictionary/JSON access and backward compatibility
    technical_difficulty: Optional[TechnicalDifficulty] = None
    recommended_technologies: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    development_challenges: Optional[List[str]] = None
    risk_analysis: Optional[ProjectFailureRiskAnalysis] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_legacy_and_new_fields(cls, data: Any) -> Any:
        """
        Ensures seamless bidirectional compatibility between legacy field names
        (e.g., 'technical_difficulty', 'strengths', 'weaknesses') and the new 10 criteria.
        """
        if not isinstance(data, dict):
            return data

        # Map technical_difficulty <-> estimated_development_difficulty
        if "technical_difficulty" in data and "estimated_development_difficulty" not in data:
            data["estimated_development_difficulty"] = data["technical_difficulty"]
        elif "estimated_development_difficulty" in data and "technical_difficulty" not in data:
            data["technical_difficulty"] = data["estimated_development_difficulty"]
        elif "estimated_development_difficulty" not in data and "technical_difficulty" not in data:
            data["estimated_development_difficulty"] = TechnicalDifficulty.INTERMEDIATE
            data["technical_difficulty"] = TechnicalDifficulty.INTERMEDIATE

        # Map recommended_technologies <-> technology_recommendations
        if "recommended_technologies" in data and not data.get("technology_recommendations"):
            data["technology_recommendations"] = data["recommended_technologies"]
        elif "technology_recommendations" in data and not data.get("recommended_technologies"):
            data["recommended_technologies"] = data["technology_recommendations"]

        # Map strengths <-> project_strengths
        if "strengths" in data and not data.get("project_strengths"):
            data["project_strengths"] = data["strengths"]
        elif "project_strengths" in data and not data.get("strengths"):
            data["strengths"] = data["project_strengths"]

        # Map weaknesses <-> project_weaknesses
        if "weaknesses" in data and not data.get("project_weaknesses"):
            data["project_weaknesses"] = data["weaknesses"]
        elif "project_weaknesses" in data and not data.get("weaknesses"):
            data["weaknesses"] = data["project_weaknesses"]

        # Map development_challenges to empirical_failure_factors in methodology if present
        if "development_challenges" in data and data["development_challenges"]:
            if "scoring_methodology" not in data:
                data["scoring_methodology"] = ScoringMethodology(
                    empirical_failure_factors=data["development_challenges"]
                )
            elif isinstance(data["scoring_methodology"], dict) and "empirical_failure_factors" not in data["scoring_methodology"]:
                data["scoring_methodology"]["empirical_failure_factors"] = data["development_challenges"]

        if "risk_analysis" in data and not data.get("failure_risk_analysis"):
            data["failure_risk_analysis"] = data["risk_analysis"]
        elif "failure_risk_analysis" in data and not data.get("risk_analysis"):
            data["risk_analysis"] = data["failure_risk_analysis"]

        return data

    @field_validator(
        "required_skills", 
        "technology_recommendations", 
        "project_strengths", 
        "project_weaknesses", 
        "missing_information", 
        "improvement_suggestions"
    )
    @classmethod
    def validate_non_empty_list_items(cls, v: List[str], info) -> List[str]:
        """Ensures string lists do not contain empty or whitespace-only elements."""
        cleaned = [item.strip() for item in v if item and item.strip()]
        if not cleaned:
            raise ValueError(f"Field '{info.field_name}' must contain at least one non-empty string item.")
        return cleaned

    class Config:
        use_enum_values = True
