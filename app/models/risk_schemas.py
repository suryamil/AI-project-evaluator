"""
Pydantic Schemas for Project Failure Risk Analysis Module.

Analyzes 8 core failure risk categories:
1. Technical limitations
2. Lack of programming knowledge
3. Insufficient budget
4. Unrealistic deadlines
5. Lack of datasets
6. Security vulnerabilities
7. Integration problems
8. Team coordination issues

For every risk, displays:
- category: str
- risk_level: Low, Medium, or High
- reason: str
- possible_impact: str
- recommended_preventive_action: str

Plus:
- risk_summary: str
- risk_mitigation_plan: List[str]
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class RiskLevel(str, Enum):
    """Categorical risk severity level."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class RiskCategory(str, Enum):
    """The 8 standardized project failure risk categories."""
    TECHNICAL_LIMITATIONS = "Technical limitations"
    LACK_OF_PROGRAMMING_KNOWLEDGE = "Lack of programming knowledge"
    INSUFFICIENT_BUDGET = "Insufficient budget"
    UNREALISTIC_DEADLINES = "Unrealistic deadlines"
    LACK_OF_DATASETS = "Lack of datasets"
    SECURITY_VULNERABILITIES = "Security vulnerabilities"
    INTEGRATION_PROBLEMS = "Integration problems"
    TEAM_COORDINATION_ISSUES = "Team coordination issues"

class RiskItem(BaseModel):
    """
    Detailed failure vector analysis for a single risk category.
    """
    category: str = Field(
        ...,
        description="One of the 8 failure risk categories",
        example="Technical limitations"
    )
    risk_level: RiskLevel = Field(
        ...,
        description="Assessed severity level: 'Low', 'Medium', or 'High'",
        example="Medium"
    )
    reason: str = Field(
        ...,
        min_length=10,
        description="Detailed technical reason why this risk applies to this specific project",
        example="High VRAM requirement of YOLOv8x will exceed local edge CPU/GPU hardware during batched inference."
    )
    possible_impact: str = Field(
        ...,
        min_length=10,
        description="Direct consequence if this risk materializes during development or deployment",
        example="Frame rate drops below 5 FPS, thermal throttling on the Raspberry Pi, and crash under memory exhaustion."
    )
    recommended_preventive_action: str = Field(
        ...,
        min_length=10,
        description="Concrete, actionable engineering step to prevent or mitigate this risk",
        example="Downscale to YOLOv8-Nano and apply INT8 quantization using ONNX Runtime for 3x throughput speedup."
    )

    class Config:
        use_enum_values = True

class ProjectFailureRiskAnalysis(BaseModel):
    """
    Comprehensive Failure Risk Analysis Report.
    Contains the 8 categorized risk vectors, risk summary, and structured mitigation plan.
    """
    overall_risk_level: RiskLevel = Field(
        default=RiskLevel.MEDIUM,
        description="Holistic project failure risk tier: 'Low', 'Medium', or 'High'",
        example="Medium"
    )
    risk_summary: str = Field(
        ...,
        min_length=20,
        description="Executive summary synthesizing the primary failure hazards across the 8 categories",
        example="The project has strong algorithmic potential but faces moderate failure risk from hardware resource limits on edge hardware and a tight timeline for custom dataset curation."
    )
    risk_mitigation_plan: List[str] = Field(
        ...,
        description="Prioritized, phased checklist of preventive actions to safeguard project delivery",
        example=[
            "Phase 1: Benchmark baseline inference latency on local test rig before field drone deployment",
            "Phase 2: Use transfer learning from pre-trained weights to minimize dataset annotation needs",
            "Phase 3: Implement weekly sprint retrospectives and strict Git branching to ensure team coordination"
        ]
    )
    risks: List[RiskItem] = Field(
        ...,
        description="Detailed failure risk breakdowns covering all 8 specified categories"
    )

    class Config:
        use_enum_values = True
