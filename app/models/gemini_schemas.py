"""
Pydantic Schemas for Google Gemini Structured Project Evaluation.
Defines explicit contracts for:
1. Project Feasibility
2. Innovation & Novelty
3. Technical Difficulty
4. Required Skills & Learning Path
5. Technology Recommendations & Architecture
6. Development Challenges & Failure Mitigations
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FeasibilityAnalysis(BaseModel):
    feasibility_score: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Overall project feasibility score from 0 (impossible) to 100 (fully viable)"
    )
    feasibility_verdict: str = Field(
        ..., 
        description="'Highly Feasible', 'Feasible with Architectural Oversight', or 'High Risk of Failure'"
    )
    memory_feasibility: int = Field(..., ge=0, le=100, description="VRAM / RAM hardware viability score (0-100)")
    latency_feasibility: int = Field(..., ge=0, le=100, description="Inference latency and throughput score (0-100)")
    data_integrity: int = Field(..., ge=0, le=100, description="Dataset availability and leakage resistance score (0-100)")
    cost_viability: int = Field(..., ge=0, le=100, description="Budget sustainability vs cloud cost score (0-100)")
    team_capability: int = Field(..., ge=0, le=100, description="Team execution readiness for this complexity (0-100)")
    detailed_feasibility_rationale: str = Field(
        ..., 
        description="Deep engineering rationale explaining why this project succeeds or fails."
    )

class InnovationAnalysis(BaseModel):
    innovation_score: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Novelty and creativity score from 0 (generic clone) to 100 (breakthrough research)"
    )
    novelty_tier: str = Field(
        ..., 
        description="'Incremental Improvement', 'Substantial Novelty', or 'Breakthrough Architecture'"
    )
    unique_selling_proposition: str = Field(
        ..., 
        description="The primary technological advantage or unique differentiator of this idea."
    )
    differentiation_from_existing_solutions: str = Field(
        ..., 
        description="How this proposal contrasts with existing commercial products or open-source GitHub projects."
    )

class TechnicalDifficultyAnalysis(BaseModel):
    difficulty_level: str = Field(
        ..., 
        description="'Beginner', 'Intermediate', 'Advanced', or 'Expert / Research-Grade'"
    )
    difficulty_score: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Engineering difficulty index from 0 to 100"
    )
    architectural_complexity: str = Field(
        ..., 
        description="Analysis of distributed pipeline, synchronization, or algorithmic complexity."
    )
    complexity_factors: List[str] = Field(
        default_factory=list,
        description="Specific technical layers contributing to difficulty (e.g. CUDA memory limits, data annotation, quantization)"
    )

class RequiredSkillsAnalysis(BaseModel):
    prerequisite_skills: List[str] = Field(
        default_factory=list,
        description="Core technical competencies required before writing code (e.g. PyTorch, Docker, TensorRT)"
    )
    missing_or_gap_skills: List[str] = Field(
        default_factory=list,
        description="Skills students commonly lack for this project domain"
    )
    skill_gap_analysis: str = Field(
        ..., 
        description="Evaluation comparing student skill level to the project's technical demands."
    )
    recommended_learning_roadmap: List[str] = Field(
        default_factory=list,
        description="Ordered sequence of topics or tutorials the student team must complete to succeed."
    )

class TechnologyRecommendations(BaseModel):
    recommended_primary_stack: List[str] = Field(
        default_factory=list,
        description="Most suitable programming languages and core runtimes"
    )
    recommended_libraries_and_frameworks: List[str] = Field(
        default_factory=list,
        description="Specific production-tested AI/ML libraries, databases, and APIs"
    )
    architecture_pattern: str = Field(
        ..., 
        description="Optimal system architecture (e.g. Microservices with Redis Queue, Serverless RAG, Edge ONNX)"
    )
    vram_and_gpu_specs: str = Field(
        ..., 
        description="Realistic VRAM and compute tier (e.g. '8GB VRAM (RTX 4060)' or 'A100 Cloud 40GB')"
    )
    estimated_cloud_hosting_cost: str = Field(
        ..., 
        description="Realistic monthly cloud cost tier (e.g. '$0 Free Tier Colab', '$40-$80/mo RunPod')"
    )

class DevelopmentChallenges(BaseModel):
    primary_architectural_risk: str = Field(
        ..., 
        description="Single biggest point of potential failure if left unaddressed."
    )
    potential_bottlenecks: List[str] = Field(
        default_factory=list,
        description="System bottlenecks (e.g. I/O latency, GPU out-of-memory, gradient explosion)"
    )
    failure_scenarios: List[str] = Field(
        default_factory=list,
        description="Scenarios where the project will deliver inaccurate results or fail project review"
    )
    actionable_mitigation_steps: List[str] = Field(
        default_factory=list,
        description="Concrete, prioritized engineering fixes to neutralize each failure scenario"
    )

class GeminiProjectEvaluation(BaseModel):
    """Complete root structured schema for Google Gemini Project Evaluation."""
    project_title: str = Field(..., description="Project title being evaluated")
    executive_summary: str = Field(
        ..., 
        description="Crisp 2-3 sentence executive evaluation summarizing viability and recommendations."
    )
    feasibility: FeasibilityAnalysis
    innovation: InnovationAnalysis
    technical_difficulty: TechnicalDifficultyAnalysis
    required_skills: RequiredSkillsAnalysis
    technology_recommendations: TechnologyRecommendations
    development_challenges: DevelopmentChallenges

class GeminiEvaluationStatusResponse(BaseModel):
    is_gemini_configured: bool
    model_name: str
    status: str
    message: str
