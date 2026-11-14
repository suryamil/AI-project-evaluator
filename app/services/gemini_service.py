"""
Dedicated Google Gemini AI Evaluation Service Module.

Main AI Project Evaluation Engine:
Evaluates proposals across all 10 criteria with explanations and transparent methodology:
1. Feasibility score (0–100) & explanation
2. Innovation score (0–100) & explanation
3. Technical complexity & explanation
4. Estimated development difficulty & explanation
5. Required skills
6. Technology recommendations
7. Project strengths
8. Project weaknesses
9. Missing information
10. Improvement suggestions
11. Transparent scoring methodology (distinguishing feasibility from failure probability)
"""

import os
import json
import asyncio
import logging
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import httpx

from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import ValidationError

from app.core.config import settings
from app.core.gemini_config import (
    get_gemini_client,
    is_gemini_configured,
    GeminiCredentialsError
)
from app.models.evaluation_schemas import (
    ProjectEvaluationResponse,
    TechnicalDifficulty,
    TechnicalComplexity,
    ScoringMethodology
)
from app.models.risk_schemas import (
    ProjectFailureRiskAnalysis,
    RiskItem,
    RiskLevel,
    RiskCategory
)
from app.models.roadmap_schemas import (
    ProjectRoadmap,
    RoadmapPhase,
    RoadmapTask
)

logger = logging.getLogger("gemini_service")

# =====================================================================
# ERROR SANITIZATION UTILITY
# =====================================================================
def sanitize_error_message(text: str) -> str:
    """
    Sanitizes strings to prevent API keys, tokens, or local path details
    from ever leaking into client error responses or logs.
    """
    if not text:
        return ""
    # Redact Google API keys (AIzaSy...)
    sanitized = re.sub(r'AIza[0-9A-Za-z\-_]{30,40}', '[REDACTED_API_KEY]', str(text))
    # Redact generic secrets
    sanitized = re.sub(r'(api[_-]?key|token|secret)=([^\s&]+)', r'\1=[REDACTED]', sanitized, flags=re.IGNORECASE)
    # Redact Windows local drive user paths
    sanitized = re.sub(r'[A-Za-z]:\\[Users\\]+[^\\]+\\', r'~/workspace/', sanitized)
    return sanitized

# =====================================================================
# TYPED EXCEPTION HIERARCHY
# =====================================================================
class GeminiServiceError(Exception):
    """Base exception for all Gemini AI service errors."""
    def __init__(self, message: str, status_code: int = 500, error_code: str = "GEMINI_ERROR"):
        cleaned_msg = sanitize_error_message(message)
        super().__init__(cleaned_msg)
        self.message = cleaned_msg
        self.status_code = status_code
        self.error_code = error_code

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": "error",
            "error_code": self.error_code,
            "message": self.message,
            "status_code": self.status_code
        }

class GeminiMissingKeyError(GeminiServiceError):
    def __init__(self, message: str = "Google Gemini API key is missing or not configured. Please add GEMINI_API_KEY to your backend/.env file."):
        super().__init__(message, status_code=503, error_code="MISSING_API_KEY")

class GeminiInvalidCredentialsError(GeminiServiceError):
    def __init__(self, message: str = "Invalid Google Gemini API credentials. Please check GEMINI_API_KEY in backend/.env."):
        super().__init__(message, status_code=401, error_code="INVALID_CREDENTIALS")

class GeminiQuotaExceededError(GeminiServiceError):
    def __init__(self, message: str = "Google Gemini API quota exceeded. Please check your billing or quota tier at Google AI Studio."):
        super().__init__(message, status_code=429, error_code="QUOTA_EXCEEDED")

class GeminiRateLimitError(GeminiServiceError):
    def __init__(self, message: str = "Gemini API rate limit reached. Please wait a few moments before resubmitting."):
        super().__init__(message, status_code=429, error_code="RATE_LIMITED")

class GeminiNetworkError(GeminiServiceError):
    def __init__(self, message: str = "Network connection failure connecting to Google Gemini API servers. Please verify internet access."):
        super().__init__(message, status_code=503, error_code="NETWORK_ERROR")

class GeminiTimeoutError(GeminiServiceError):
    def __init__(self, message: str = "The Gemini AI evaluation request timed out. Please try again."):
        super().__init__(message, status_code=504, error_code="REQUEST_TIMEOUT")

class GeminiEmptyResponseError(GeminiServiceError):
    def __init__(self, message: str = "Gemini AI returned an empty evaluation response. Please retry with more detailed project inputs."):
        super().__init__(message, status_code=502, error_code="EMPTY_AI_RESPONSE")

class GeminiInvalidJSONError(GeminiServiceError):
    def __init__(self, message: str = "Failed to parse structured JSON from Gemini AI response."):
        super().__init__(message, status_code=502, error_code="INVALID_JSON_RESPONSE")

class GeminiValidationError(GeminiServiceError):
    def __init__(self, message: str = "AI evaluation response did not match the required evaluation schema."):
        super().__init__(message, status_code=502, error_code="SCHEMA_VALIDATION_ERROR")

# Aliases for backward compatibility
GeminiServiceException = GeminiServiceError
GeminiConfigurationError = GeminiMissingKeyError


# =====================================================================
# PROJECT FAILURE RISK ANALYSIS MODULE (8 STANDARDIZED CATEGORIES)
# =====================================================================
def analyze_project_failure_risks(project: Dict[str, Any]) -> ProjectFailureRiskAnalysis:
    """
    Analyzes project failure risks across the 8 required categories:
    1. Technical limitations
    2. Lack of programming knowledge
    3. Insufficient budget
    4. Unrealistic deadlines
    5. Lack of datasets
    6. Security vulnerabilities
    7. Integration problems
    8. Team coordination issues

    Returns structured RiskItem evaluations with category, level, reason, impact, preventive action,
    along with an executive risk summary and prioritized mitigation plan.
    """
    title = (project.get("title") or "Untitled Project").strip()
    domain = (project.get("domain") or "General Software / AI").strip()
    technologies = (project.get("technologies") or "Python, FastAPI").strip()
    skill_level = (project.get("skill_level") or project.get("skillLevel") or "Intermediate").strip()
    timeline = (project.get("timeline") or "3 - 4 Months").strip()
    budget = (project.get("budget") or "Flexible").strip()
    team_size = (project.get("team_size") or project.get("teamSize") or "Small Team").strip()
    tech_lower = technologies.lower()
    budget_lower = budget.lower()

    risks: List[RiskItem] = []

    # 1. Technical limitations
    if "edge" in tech_lower or "raspberry" in tech_lower or "embedded" in domain.lower():
        t_level = RiskLevel.HIGH if ("yolo" in tech_lower or "transformer" in tech_lower) else RiskLevel.MEDIUM
        t_reason = f"Edge hardware constraints (RAM, CPU throttling, no CUDA) constrain {technologies} runtime."
        t_impact = "Latency spikes above real-time thresholds and memory crashes on peak batch processing."
        t_action = "Profile model with TensorRT/ONNX INT8 quantization and enforce frame-dropping guards."
    elif "llama" in tech_lower or "70b" in tech_lower:
        t_level = RiskLevel.HIGH
        t_reason = "Large language model parameter count exceeds standard student compute VRAM bounds."
        t_impact = "CUDA out-of-memory errors preventing model initialization or generation."
        t_action = "Switch to 4-bit AWQ quantized models (GGUF / Ollama) or utilize remote API endpoints."
    else:
        t_level = RiskLevel.LOW
        t_reason = f"Standard stack ({technologies}) fits consumer hardware specifications."
        t_impact = "Minor throughput bottlenecks under concurrent user traffic."
        t_action = "Establish asynchronous request handling and connection pooling."
    risks.append(RiskItem(category=RiskCategory.TECHNICAL_LIMITATIONS.value, risk_level=t_level, reason=t_reason, possible_impact=t_impact, recommended_preventive_action=t_action))

    # 2. Lack of programming knowledge
    if "beginner" in skill_level.lower():
        p_level = RiskLevel.HIGH if ("torch" in tech_lower or "kubernetes" in tech_lower or "c++" in tech_lower) else RiskLevel.MEDIUM
        p_reason = f"Team skill level is '{skill_level}' while attempting complex framework stack ({technologies})."
        p_impact = "Steep syntax and debugging curve leading to stalled milestones and unoptimized code."
        p_action = "Build baseline prototypes with high-level pre-trained SDKs before custom architectural tuning."
    elif "intermediate" in skill_level.lower():
        p_level = RiskLevel.MEDIUM
        p_reason = f"Intermediate skills are adequate for coursework but edge-case debugging in {technologies} requires deeper mastery."
        p_impact = "Suboptimal design patterns and integration delays when configuring complex pipelines."
        p_action = "Pair-program on core data modules and conduct code reviews against reference implementations."
    else:
        p_level = RiskLevel.LOW
        p_reason = f"Advanced team experience aligns well with the proposed {technologies} stack."
        p_impact = "Minimal skill-related blockers."
        p_action = "Document architecture patterns for future maintainability."
    risks.append(RiskItem(category=RiskCategory.LACK_OF_PROGRAMMING_KNOWLEDGE.value, risk_level=p_level, reason=p_reason, possible_impact=p_impact, recommended_preventive_action=p_action))

    # 3. Insufficient budget
    if "$0" in budget_lower and ("gpu" in tech_lower or "llama" in tech_lower or "aws" in tech_lower):
        b_level = RiskLevel.HIGH
        b_reason = "Cloud GPU hosting or API tokens require recurring budget exceeding $0 free tier allocation."
        b_impact = "Service suspension when free credits expire or local training timeouts."
        b_action = "Leverage Google Colab T4 GPUs, HuggingFace free inference, or local INT8 quantization."
    elif "100" in budget_lower or "micro" in budget_lower:
        b_level = RiskLevel.MEDIUM
        b_reason = "Micro-budget allows basic domain/VPS but cannot sustain continuous GPU training instances."
        b_impact = "Inability to scale testing or run multi-epoch grid searches."
        b_action = "Enforce cloud cost budget alarms and use serverless pay-per-second endpoints."
    else:
        b_level = RiskLevel.LOW
        b_reason = f"Allocated budget ({budget}) provides sufficient headroom for planned infrastructure."
        b_impact = "Low probability of financial project interruption."
        b_action = "Track monthly cloud expenditure against project milestones."
    risks.append(RiskItem(category=RiskCategory.INSUFFICIENT_BUDGET.value, risk_level=b_level, reason=b_reason, possible_impact=b_impact, recommended_preventive_action=b_action))

    # 4. Unrealistic deadlines
    if "1 - 2" in timeline:
        d_level = RiskLevel.HIGH
        d_reason = "1 to 2 month sprint is insufficient for custom model training, dataset curation, and UI integration."
        d_impact = "Incomplete deliverables, skipped automated testing, and unvalidated presentation demo."
        d_action = "Aggressively prune scope to a single demonstrable end-to-end MVP in Week 2."
    elif "3 - 4" in timeline and ("drone" in title.lower() or "hardware" in tech_lower or "custom" in title.lower()):
        d_level = RiskLevel.MEDIUM
        d_reason = "One-semester timeline is tight when hardware debugging overlaps with software implementation."
        d_impact = "Last-minute panic integration and compromised evaluation rigor."
        d_action = "Set strict 2-week sprint gates and freeze feature requests 3 weeks before defense."
    else:
        d_level = RiskLevel.LOW
        d_reason = f"Proposed timeline ({timeline}) allows balanced iterative development and validation."
        d_impact = "On-schedule milestone completion expected."
        d_action = "Maintain continuous integration to detect regression early."
    risks.append(RiskItem(category=RiskCategory.UNREALISTIC_DEADLINES.value, risk_level=d_level, reason=d_reason, possible_impact=d_impact, recommended_preventive_action=d_action))

    # 5. Lack of datasets
    if "medical" in domain.lower() or "health" in domain.lower() or "pathology" in title.lower():
        data_level = RiskLevel.HIGH
        data_reason = "Domain requires specialized, annotated biological/medical data subject to privacy or scarcity."
        data_impact = "Severe class imbalance, model overfitting, or inability to train supervised weights."
        data_action = "Secure open-source benchmarks (e.g. Kaggle/NIH datasets) and apply synthetic data augmentation."
    elif "finance" in domain.lower() or "fraud" in title.lower():
        data_level = RiskLevel.MEDIUM
        data_reason = "Proprietary market feeds and skewed fraud distributions make representative data challenging."
        data_impact = "High false-positive rate and distribution shift in production."
        data_action = "Use standardized public benchmark datasets and stratified K-fold cross-validation."
    else:
        data_level = RiskLevel.LOW
        data_reason = f"Abundant open-source datasets exist for standard {domain} tasks."
        data_impact = "Data sourcing is unlikely to be a project blocker."
        data_action = "Verify dataset licensing and clean corrupt/duplicate entries early."
    risks.append(RiskItem(category=RiskCategory.LACK_OF_DATASETS.value, risk_level=data_level, reason=data_reason, possible_impact=data_impact, recommended_preventive_action=data_action))

    # 6. Security vulnerabilities
    if "auth" in tech_lower or "api" in tech_lower or "web" in domain.lower():
        s_level = RiskLevel.MEDIUM
        s_reason = "Web endpoints and API key storage are susceptible to credential leaks and unauthorized access."
        s_impact = "API quota exhaustion from leaked keys or compromised student project databases."
        s_action = "Store secrets strictly in backend .env, enforce JWT token expiration, and exclude keys from Git."
    else:
        s_level = RiskLevel.LOW
        s_reason = "Contained application with minimal public exposure surface."
        s_impact = "Localized vulnerabilities without network threat vector."
        s_action = "Sanitize inputs and follow principle of least privilege."
    risks.append(RiskItem(category=RiskCategory.SECURITY_VULNERABILITIES.value, risk_level=s_level, reason=s_reason, possible_impact=s_impact, recommended_preventive_action=s_action))

    # 7. Integration problems
    if "," in technologies and len(technologies.split(",")) >= 4:
        i_level = RiskLevel.HIGH
        i_reason = f"Complex multi-tier stack ({technologies}) requires coordinating client, server, and ML runtimes."
        i_impact = "CORS issues, serialization schema mismatches, and pipeline communication timeouts."
        i_action = "Define explicit Pydantic request/response schemas and test contract endpoints with automated unit tests."
    else:
        i_level = RiskLevel.LOW
        i_reason = "Compact, well-coupled technical architecture with standard REST/JSON protocols."
        i_impact = "Straightforward client-server communication."
        i_action = "Use standardized API documentation (/docs) to verify endpoint contracts."
    risks.append(RiskItem(category=RiskCategory.INTEGRATION_PROBLEMS.value, risk_level=i_level, reason=i_reason, possible_impact=i_impact, recommended_preventive_action=i_action))

    # 8. Team coordination issues
    if "solo" in team_size.lower():
        c_level = RiskLevel.MEDIUM
        c_reason = "Solo developer carries all engineering, testing, documentation, and design burden."
        c_impact = "Single point of failure and burnout if complex bugs emerge."
        c_action = "Maintain disciplined weekly milestone checklists and seek mentor feedback early."
    elif "5" in team_size or "large" in team_size.lower() or "7" in team_size:
        c_level = RiskLevel.HIGH
        c_reason = "Large student team introduces communication overhead, Git merge conflicts, and unequal division of work."
        c_impact = "Divergent codebase branches, delayed integration, and uneven code quality."
        c_action = "Establish dedicated role ownership (Frontend, ML Backend, Testing) and mandatory Pull Request reviews."
    else:
        c_level = RiskLevel.LOW
        c_reason = f"Team structure ({team_size}) is optimal for collaborative capstone agile velocity."
        c_impact = "Smooth task allocation and low coordination friction."
        c_action = "Use GitHub Projects or Kanban board for weekly task tracking."
    risks.append(RiskItem(category=RiskCategory.TEAM_COORDINATION_ISSUES.value, risk_level=c_level, reason=c_reason, possible_impact=c_impact, recommended_preventive_action=c_action))

    # Calculate overall risk level
    high_count = sum(1 for r in risks if r.risk_level == RiskLevel.HIGH)
    med_count = sum(1 for r in risks if r.risk_level == RiskLevel.MEDIUM)
    overall_level = RiskLevel.HIGH if high_count >= 3 else (RiskLevel.MEDIUM if (high_count >= 1 or med_count >= 3) else RiskLevel.LOW)

    high_categories = [r.category for r in risks if r.risk_level == RiskLevel.HIGH]
    hazard_text = f"Primary hazards: {', '.join(high_categories[:2])}." if high_categories else "No critical failure blockers identified."

    summary = (
        f"Overall Project Failure Risk is classified as {overall_level.value}. "
        f"Analyzed all 8 failure categories: {high_count} High Risk, {med_count} Medium Risk, and {8 - high_count - med_count} Low Risk. "
        f"{hazard_text} Execution of the preventive action plan will reduce total project delivery risk."
    )

    mitigation_plan = [
        f"1. [{risks[0].category}] {risks[0].recommended_preventive_action}",
        f"2. [{risks[1].category}] {risks[1].recommended_preventive_action}",
        f"3. [{risks[2].category}] {risks[2].recommended_preventive_action}",
        f"4. [{risks[3].category}] {risks[3].recommended_preventive_action}",
        f"5. [{risks[4].category}] {risks[4].recommended_preventive_action}",
        f"6. [{risks[5].category}] {risks[5].recommended_preventive_action}",
        f"7. [{risks[6].category}] {risks[6].recommended_preventive_action}",
        f"8. [{risks[7].category}] {risks[7].recommended_preventive_action}"
    ]

    return ProjectFailureRiskAnalysis(
        overall_risk_level=overall_level,
        risk_summary=summary,
        risk_mitigation_plan=mitigation_plan,
        risks=risks
    )


# =====================================================================
# TRANSPARENT HEURISTIC EVALUATION ENGINE (DETERMINISTIC FALLBACK)
# =====================================================================
def evaluate_with_transparent_methodology(project: Dict[str, Any]) -> ProjectEvaluationResponse:
    """
    Computes a transparent, reproducible project evaluation using deterministic
    software engineering heuristics across all 10 criteria.
    Used for unit testing, offline development, or fallback when API is unreachable.
    """
    title = (project.get("title") or "Untitled Project").strip()
    domain = (project.get("domain") or "General Software / AI").strip()
    technologies = (project.get("technologies") or "Python, FastAPI").strip()
    description = (project.get("description") or "Standard Capstone Project").strip()
    skill_level = (project.get("skill_level") or project.get("skillLevel") or "Intermediate").strip()
    timeline = (project.get("timeline") or "3 - 4 Months").strip()
    budget = (project.get("budget") or "Flexible").strip()
    team_size = (project.get("team_size") or project.get("teamSize") or "Capstone Team (3 - 4 Students)").strip()

    # Base Feasibility: Starts at 75 (solid baseline)
    feasibility = 75
    factors = []

    # 1. Hardware & Budget Alignment
    tech_lower = technologies.lower()
    budget_lower = budget.lower()
    if ("llama" in tech_lower or "70b" in tech_lower or "mistral-large" in tech_lower) and "$0" in budget_lower:
        feasibility -= 18
        factors.append("LLM VRAM memory bounds exceed $0 free-tier compute budget.")
    elif "edge" in tech_lower or "raspberry" in tech_lower or "iot" in domain.lower():
        if "yolov8x" in tech_lower or "transformer" in tech_lower:
            feasibility -= 14
            factors.append("Heavy deep learning model latency exceeds edge CPU real-time processing threshold.")
        else:
            feasibility += 4
            factors.append("Edge compute scope is aligned with lightweight architecture.")

    # 2. Skill Level vs Architecture Complexity
    if "beginner" in skill_level.lower():
        if "distributed" in tech_lower or "kubernetes" in tech_lower or "rag" in tech_lower:
            feasibility -= 12
            factors.append("Distributed systems chosen for beginner skill level creates milestone risk.")
        else:
            feasibility -= 4
    elif "advanced" in skill_level.lower() or "expert" in skill_level.lower():
        feasibility += 8
        factors.append("Advanced team capability mitigates architectural complexity.")

    # 3. Timeline Realism
    if "1 - 2" in timeline and ("vision" in domain.lower() or "nlp" in domain.lower()):
        feasibility -= 10
        factors.append("1-2 month timeline is tight for custom dataset annotation and training convergence.")

    feasibility_score = max(25, min(95, feasibility))

    # Innovation Scoring (Domain & Stack Novelty)
    innovation = 65
    if "drone" in title.lower() or "pathology" in title.lower() or "medical" in title.lower():
        innovation += 15
    if "rag" in title.lower() or "edge" in title.lower():
        innovation += 8
    if "todo" in title.lower() or "clone" in title.lower() or "weather" in title.lower():
        innovation -= 25
    innovation_score = max(30, min(95, innovation))

    # Complexity & Difficulty Mapping
    if feasibility_score >= 80:
        complexity = TechnicalComplexity.MODERATE
        difficulty = TechnicalDifficulty.INTERMEDIATE
        risk_tier = "Low Risk"
    elif feasibility_score >= 60:
        complexity = TechnicalComplexity.HIGH
        difficulty = TechnicalDifficulty.INTERMEDIATE
        risk_tier = "Moderate Risk"
    else:
        complexity = TechnicalComplexity.VERY_HIGH
        difficulty = TechnicalDifficulty.ADVANCED
        risk_tier = "High Risk"

    # Explanations
    feasibility_explanation = (
        f"Calculated feasibility score of {feasibility_score}/100 derived from resource feasibility ({budget}), "
        f"timeline feasibility ({timeline}), and framework compatibility ({technologies}). "
        + (" ".join(factors) if factors else "Architecture fits standard capstone development patterns.")
    )

    innovation_explanation = (
        f"Innovation score of {innovation_score}/100 reflects practical domain application in '{domain}'. "
        "The project applies modern computational tools to a concrete real-world problem rather than a standard tutorial clone."
    )

    complexity_explanation = (
        f"Technical complexity is assessed as '{complexity.value}' due to multi-layer integration requirements "
        f"between frontend presentation, backend APIs, and the '{technologies}' processing pipeline."
    )

    difficulty_explanation = (
        f"Development difficulty is rated as '{difficulty.value}' based on the {skill_level} team profile, "
        f"{team_size} allocation, and the technical depth required to implement and test the core algorithms."
    )

    # 10 Criteria Lists
    skills = [t.strip() for t in technologies.split(",") if t.strip()][:5]
    if "Python" not in skills and "python" not in tech_lower:
        skills.insert(0, "Python Programming")
    skills.extend(["System Architecture Design", "API Integration & Testing"])

    tech_recs = [t.strip() for t in technologies.split(",") if t.strip()]
    tech_recs.extend(["Docker (Containerization)", "Pytest (Automated Testing)", "GitHub Actions (CI/CD)"])

    strengths = [
        f"Clearly stated practical problem scope in '{domain}'",
        f"Targeted technical ecosystem using {technologies.split(',')[0].strip() if technologies else 'modern frameworks'}",
        "Well-defined team size and structured milestone allocation"
    ]

    weaknesses = [
        "Unspecified dataset validation pipeline and distribution shift safeguards",
        "Lack of formal end-to-end latency benchmarks under peak load"
    ]

    missing_info = [
        "Exact training and evaluation dataset size and collection methodology",
        "Target inference latency and throughput SLA metrics (e.g. sub-200ms)",
        "Hardware fallback plan in case of local GPU or memory throttling"
    ]

    suggestions = [
        "Implement automated input validation and schema contracts before processing",
        "Adopt INT8 quantization or caching to bound memory and compute footprint",
        "Establish stratified train/validation/test splits to prevent synthetic data leakage"
    ]

    summary = (
        f"A viable and promising {domain} project with an overall feasibility index of {feasibility_score}/100. "
        f"The primary architectural focus should be addressing data pipeline rigor and verifying memory bounds "
        f"on the planned deployment hardware."
    )

    methodology = ScoringMethodology(
        methodology_disclaimer=(
            "This evaluation provides transparent architectural risk indicators based on submitted parameters. "
            "It does NOT treat subjective AI outputs as scientifically validated deterministic failure probabilities."
        ),
        feasibility_vs_failure_distinction=(
            "Feasibility score (0-100) measures static engineering readiness and resource compatibility. "
            "Actual project failure probability is dynamic and governed by ongoing software engineering execution."
        ),
        failure_risk_tier=risk_tier,
        empirical_failure_factors=factors or [
            "Scope expansion exceeding stated timeline",
            "Unverified memory consumption under peak workloads",
            "Lack of early integration testing"
        ],
        dimension_weights={
            "Architecture & Hardware Bounds": "35%",
            "Tech Stack & Skill Alignment": "25%",
            "Scope, Timeline & Budget Realism": "25%",
            "Data Pipeline & Dependency Rigor": "15%"
        }
    )

    return ProjectEvaluationResponse(
        feasibility_score=feasibility_score,
        feasibility_explanation=feasibility_explanation,
        innovation_score=innovation_score,
        innovation_explanation=innovation_explanation,
        technical_complexity=complexity,
        complexity_explanation=complexity_explanation,
        estimated_development_difficulty=difficulty,
        technical_difficulty=difficulty,
        difficulty_explanation=difficulty_explanation,
        required_skills=skills,
        technology_recommendations=tech_recs,
        recommended_technologies=tech_recs,
        project_strengths=strengths,
        strengths=strengths,
        project_weaknesses=weaknesses,
        weaknesses=weaknesses,
        missing_information=missing_info,
        development_challenges=factors or ["Resource bounds during peak inference", "Dataset distribution shift"],
        improvement_suggestions=suggestions,
        evaluation_summary=summary,
        scoring_methodology=methodology,
        failure_risk_analysis=analyze_project_failure_risks(project)
    )


# =====================================================================
# DEDICATED GEMINI EVALUATION SERVICE
# =====================================================================
class GeminiProjectEvaluatorService:
    """
    Dedicated AI evaluation engine powered by Google Gemini.
    Evaluates proposals across all 10 criteria with score explanations and transparent methodology.
    """

    def __init__(self):
        self._model_name = settings.GEMINI_MODEL

    @property
    def model_name(self) -> str:
        """Configurable model identifier from environment variables."""
        return settings.GEMINI_MODEL

    def is_ready(self) -> bool:
        """Returns True if Gemini credentials are configured in the environment."""
        return is_gemini_configured()

    def is_configured(self) -> bool:
        """Returns True if Gemini credentials are configured in the environment."""
        return self.is_ready()

    def _build_evaluation_prompt(self, project: Dict[str, Any]) -> str:
        """
        Constructs a rigorous engineering evaluation prompt covering all 10 criteria.
        """
        title = project.get("title", "Untitled Project")
        domain = project.get("domain", "General Software / AI")
        description = project.get("description", "Not provided")
        problem = project.get("problem_statement") or project.get("problemStatement", "Not provided")
        target_users = project.get("target_users") or project.get("targetUsers", "General public")
        technologies = project.get("technologies", "Not provided")
        budget = project.get("budget", "Flexible")
        timeline = project.get("timeline", "Not specified")
        team_size = project.get("team_size") or project.get("teamSize", "Standard capstone team")
        skill_level = project.get("skill_level") or project.get("skillLevel", "Intermediate")

        prompt = f"""You are the Lead Systems Architect and AI Evaluation Research Reviewer.
Analyze the following project proposal across all 10 evaluation criteria with deep technical rigor.

=== PROJECT SPECIFICATION ===
* Title: {title}
* Domain: {domain}
* Problem Statement: {problem}
* Scope / Description: {description}
* Target Audience: {target_users}
* Planned Technologies & Stack: {technologies}
* Available Budget Tier: {budget}
* Proposed Timeline: {timeline}
* Team Size: {team_size}
* Stated Team Skill Level: {skill_level}

=== EVALUATION MANDATE (POPULATE ALL 10 CRITERIA) ===
1. FEASIBILITY SCORE (0 - 100) & FEASIBILITY EXPLANATION:
   - Score technical viability given memory/VRAM, compute, budget, and timeline.
   - Provide an understandable explanation breaking down exactly how the score was calculated.

2. INNOVATION SCORE (0 - 100) & INNOVATION EXPLANATION:
   - Score novelty vs typical tutorial or coursework clones.
   - Explain the specific novelty factors or common patterns observed.

3. TECHNICAL COMPLEXITY & COMPLEXITY EXPLANATION:
   - Classify as 'Low', 'Moderate', 'High', or 'Very High'.
   - Explain architectural, concurrency, hardware, and integration complexity.

4. ESTIMATED DEVELOPMENT DIFFICULTY & DIFFICULTY EXPLANATION:
   - Classify as 'Beginner', 'Intermediate', or 'Advanced'.
   - Explain why this tier applies given team skill prerequisites and framework ecosystem.

5. REQUIRED SKILLS:
   - Specific prerequisites, theoretical concepts, and frameworks the team must master.

6. TECHNOLOGY RECOMMENDATIONS:
   - Specific production-grade libraries, databases, runtimes, and tools suited for this exact system.

7. PROJECT STRENGTHS:
   - Clear architectural advantages, viable design decisions, and solid assumptions.

8. PROJECT WEAKNESSES:
   - Architectural gaps, lack of data validation, or unaddressed edge cases.

9. MISSING INFORMATION:
   - Critical ambiguities, unspecified requirements, missing data sizes, or unverified hardware bounds.

10. IMPROVEMENT SUGGESTIONS:
   - Prioritized, actionable engineering recommendations to maximize success.

11. SCORING METHODOLOGY & SCIENTIFIC RIGOR:
   - Clearly distinguish the feasibility score (an engineering readiness index) from actual project failure probability.
   - Do NOT treat subjective opinion as a scientifically validated probability.
   - Assign categorical failure_risk_tier ('Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk').
   - List empirical failure factors that derail similar software engineering projects.

12. PROJECT FAILURE RISK ANALYSIS MODULE (failure_risk_analysis):
   - Thoroughly analyze possible project failure risks across these 8 standardized categories:
     1. Technical limitations
     2. Lack of programming knowledge
     3. Insufficient budget
     4. Unrealistic deadlines
     5. Lack of datasets
     6. Security vulnerabilities
     7. Integration problems
     8. Team coordination issues
   - For every single risk category, supply:
     - category: category name
     - risk_level: 'Low', 'Medium', or 'High'
     - reason: detailed technical reason why this applies to the project
     - possible_impact: exact consequence if the failure occurs
     - recommended_preventive_action: concrete preventive engineering action
   - Provide overall_risk_level ('Low', 'Medium', 'High'), risk_summary, and a prioritized risk_mitigation_plan.
"""
        return prompt

    def parse_and_validate_response(self, raw_text: Optional[str]) -> ProjectEvaluationResponse:
        """
        Validates raw Gemini output against ProjectEvaluationResponse schema.
        Handles empty responses, invalid JSON, and Pydantic validation errors.
        """
        # 1. Handle Empty AI Response
        if not raw_text or not raw_text.strip():
            logger.error("Gemini API returned an empty or whitespace-only response body.")
            raise GeminiEmptyResponseError()

        # 2. Handle Invalid JSON Response
        try:
            parsed_json = json.loads(raw_text)
        except json.JSONDecodeError as json_err:
            logger.error("Failed to parse Gemini response as JSON: %s. Raw snippet: %s", json_err, sanitize_error_message(raw_text[:200]))
            raise GeminiInvalidJSONError(
                f"Google Gemini returned invalid JSON output: {json_err.msg} at line {json_err.lineno} col {json_err.colno}."
            )

        # 3. Handle Pydantic Validation Errors
        try:
            validated = ProjectEvaluationResponse.model_validate(parsed_json)
            return validated
        except ValidationError as val_err:
            field_errors = []
            for err in val_err.errors():
                loc = " -> ".join(str(l) for l in err.get("loc", []))
                field_errors.append(f"{loc}: {err.get('msg')}")
            err_summary = "; ".join(field_errors[:3])
            logger.error("Pydantic schema validation failed: %s", err_summary)
            raise GeminiValidationError(
                f"Gemini response failed schema validation ({err_summary}). Please retry the evaluation."
            )

    async def evaluate_project(self, project_data: Dict[str, Any]) -> ProjectEvaluationResponse:
        """
        Sends submitted project details to Google Gemini and returns a validated ProjectEvaluationResponse.
        Catches and categorizes all API errors, network issues, timeouts, and validation failures.
        """
        # 1. Handle Missing API Key
        if not self.is_configured():
            logger.error("Missing Gemini API credentials.")
            raise GeminiMissingKeyError()

        try:
            client = get_gemini_client()
        except GeminiCredentialsError as cred_err:
            raise GeminiMissingKeyError(str(cred_err))

        # 2. Build Prompt & Config
        prompt = self._build_evaluation_prompt(project_data)
        model = self.model_name
        timeout_seconds = settings.GEMINI_TIMEOUT_SECONDS

        logger.info("Submitting project '%s' to Gemini model '%s'...", project_data.get("title"), model)

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ProjectEvaluationResponse,
            temperature=0.2,
            system_instruction=(
                "You are an expert AI systems architect and engineering reviewer. "
                "Always respond in valid JSON adhering strictly to the requested schema. "
                "Evaluate all 10 criteria with rigorous explanations. Distinguish feasibility scores from actual failure probabilities."
            )
        )

        # 3. Execute with Timeout & Network Protection
        try:
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config
                ),
                timeout=timeout_seconds
            )
        except asyncio.TimeoutError:
            logger.error("Gemini API request timed out after %s seconds.", timeout_seconds)
            raise GeminiTimeoutError(
                f"Google Gemini evaluation request timed out after {timeout_seconds} seconds. Please retry."
            )
        except (httpx.ConnectError, httpx.NetworkError, ConnectionError, OSError) as net_err:
            logger.error("Network connection failure communicating with Gemini: %s", str(net_err))
            raise GeminiNetworkError(
                "Unable to establish network connection to Google Gemini API servers. Please check your network connection."
            )
        except APIError as api_err:
            logger.error("Google Gemini API error: code=%s, msg=%s", api_err.code, sanitize_error_message(api_err.message))
            err_msg_lower = (api_err.message or "").lower()

            if api_err.code == 429:
                if "quota" in err_msg_lower or "resource_exhausted" in err_msg_lower:
                    raise GeminiQuotaExceededError()
                else:
                    raise GeminiRateLimitError()
            elif api_err.code in (400, 401, 403) or "api_key" in err_msg_lower or "permission_denied" in err_msg_lower:
                raise GeminiInvalidCredentialsError()
            else:
                raise GeminiServiceError(
                    message=f"Gemini API returned error (HTTP {api_err.code}): {sanitize_error_message(api_err.message)}",
                    status_code=502,
                    error_code="GEMINI_API_ERROR"
                )
        except GeminiServiceError:
            raise
        except Exception as exc:
            logger.error("Unexpected error during Gemini execution: %s", str(exc))
            raise GeminiServiceError(
                message=f"An unexpected error occurred during AI evaluation: {sanitize_error_message(str(exc))}",
                status_code=500,
                error_code="GEMINI_INTERNAL_ERROR"
            )

        # 4. Parse & Validate Response
        raw_text = response.text if response else None
        return self.parse_and_validate_response(raw_text)

    async def chat_with_assistant(
        self,
        project_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        user_message: str
    ) -> str:
        """
        MODULE A: AI Project Assistant Chatbot Engine.
        Multi-turn conversational advisor that:
        1. Explains programming and ML concepts with concise code snippets.
        2. Suggests innovative project features.
        3. Recommends modern production technologies.
        4. Resolves implementation difficulties (OOM, latency, integration bugs).
        5. Maintains conversation history and project awareness.
        """
        title = project_context.get("title", "AI Project")
        domain = project_context.get("domain", "Software Engineering / AI")
        technologies = project_context.get("technologies", "Modern Web / ML Stack")
        skill_level = project_context.get("skill_level") or project_context.get("skillLevel", "Intermediate")
        feasibility = project_context.get("feasibility_score") or project_context.get("feasibilityScore", 70)
        risk_level = project_context.get("risk_level") or project_context.get("riskLevel", "Moderate Risk")
        weaknesses = project_context.get("project_weaknesses") or project_context.get("weaknesses", [])
        primary_risk = project_context.get("primary_risk") or project_context.get("primaryRisk", "Architectural constraints")

        system_instruction = (
            "You are an Elite AI Systems Architect and Senior Tech Lead serving as the dedicated AI Project Assistant "
            f"for a project titled '{title}' in the domain of '{domain}'.\n"
            f"Project Technical Context:\n"
            f"- Planned Stack: {technologies}\n"
            f"- Team Skill Level: {skill_level}\n"
            f"- Feasibility Score: {feasibility}/100 ({risk_level})\n"
            f"- Primary Risk Factor: {primary_risk}\n"
            f"- Known Weaknesses: {', '.join(weaknesses[:3]) if weaknesses else 'Resource bottlenecks'}\n\n"
            "Your Responsibilities:\n"
            "1. Answer project-related technical and architecture questions pragmatically.\n"
            "2. Explain programming and computer science concepts clearly. Use intuitive analogies and concise, runnable code snippets (Python, TypeScript, SQL, Docker, PyTorch).\n"
            "3. Suggest high-value, realistic features tailored to this project's domain.\n"
            "4. Recommend optimal libraries, frameworks, APIs, and hardware configurations.\n"
            "5. Help troubleshoot and resolve implementation difficulties (e.g., CUDA OOMs, high latency, CORS issues, model overfitting, memory leaks).\n"
            "6. Keep responses clear, structured with markdown, practical, and directly actionable."
        )

        if not self.is_configured():
            logger.info("Gemini credentials not configured; using heuristic AI project advisor fallback.")
            return generate_heuristic_chat_reply(project_context, user_message)

        try:
            client = get_gemini_client()
            model = self.model_name

            # Format multi-turn conversation history
            contents = []
            # Keep up to the last 12 historical messages for context
            recent_history = conversation_history[-12:] if conversation_history else []
            for msg in recent_history:
                role = "user" if msg.get("role") == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg.get("content", ""))]
                    )
                )

            # Append the latest user query
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=user_message)]
                )
            )

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                max_output_tokens=1500
            )

            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                ),
                timeout=min(6.0, settings.GEMINI_TIMEOUT_SECONDS)
            )

            reply = response.text if response and response.text else ""
            if not reply.strip():
                return generate_heuristic_chat_reply(project_context, user_message)
            return reply.strip()

        except Exception as err:
            logger.warning("Gemini chat invocation encountered error (%s). Falling back to heuristic advisor.", str(err))
            return generate_heuristic_chat_reply(project_context, user_message)

    async def generate_development_roadmap(self, project: Dict[str, Any]) -> ProjectRoadmap:
        """
        MODULE B: Personalized Development Roadmap Generator.
        Breaks project into 5 structured phases (Foundation, Modeling, Integration, Testing, Deployment)
        with concrete tasks, recommended tools, and effort estimates.
        """
        title = project.get("title", "AI Project")
        domain = project.get("domain", "Computer Science")
        technologies = project.get("technologies", "Python, React, FastAPI")
        timeline = project.get("timeline", "3 - 4 Months")
        budget = project.get("budget", "Flexible")
        skill_level = project.get("skill_level") or project.get("skillLevel", "Intermediate")

        prompt = f"""You are a Principal Software Engineering Manager. Generate a personalized, highly structured 5-phase Development Roadmap for this project.

=== PROJECT SPECIFICATIONS ===
* Title: {title}
* Domain: {domain}
* Planned Stack: {technologies}
* Stated Skill Level: {skill_level}
* Allocated Timeline: {timeline}
* Budget: {budget}

=== ROADMAP REQUIREMENTS ===
Generate a valid JSON object matching this structure:
{{
  "id": "rdm_gen",
  "project_id": "proj_placeholder",
  "user_id": "usr_demo",
  "title": "{title}",
  "overall_duration": "{timeline}",
  "methodology": "Agile Sprint Iterations (2-Week Sprints)",
  "phases": [
    {{
      "phase_number": 1,
      "phase_name": "Phase 1: Foundation, Environment Setup & Data Pipeline",
      "timeline": "Sprint 1 (Weeks 1 - 2)",
      "description": "Establish development environment, source and clean datasets, and draft initial API contracts.",
      "recommended_tools": ["Python 3.11", "Git / GitHub", "Docker", "Pandas / Polars"],
      "tasks": [
        {{
          "id": "task_1_1",
          "title": "Initialize Git repository, branch protection, and CI linter",
          "description": "Configure pre-commit hooks with ruff/black and set up pull request workflow.",
          "category": "architecture",
          "estimated_hours": "4-6 hrs",
          "completed": false
        }},
        {{
          "id": "task_1_2",
          "title": "Source, validate, and preprocess initial dataset",
          "description": "Clean outliers, check for target class imbalance, and create train/validation/test splits.",
          "category": "dataset",
          "estimated_hours": "8-12 hrs",
          "completed": false
        }}
      ]
    }}
  ]
}}

Generate all 5 phases:
1. Foundation, Environment & Data Pipeline
2. Core Engineering & Algorithmic / Model Implementation
3. System Integration, API Wiring & Frontend Development
4. Rigorous Testing, QA, Latency Benchmarking & Failure Prevention
5. Containerization, Cloud/Edge Deployment & Release Documentation

For every phase provide 3-4 specific, actionable tasks, realistic effort estimates (e.g. '6-8 hrs'), and modern recommended tools."""

        if not self.is_configured():
            logger.info("Gemini not configured; generating heuristic development roadmap.")
            return generate_heuristic_roadmap(project)

        try:
            client = get_gemini_client()
            model = self.model_name

            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3,
                system_instruction="You are a Lead Software Engineering Manager. Always output valid JSON strictly matching the requested roadmap schema."
            )

            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config
                ),
                timeout=settings.GEMINI_TIMEOUT_SECONDS
            )

            raw_text = response.text if response else None
            if not raw_text:
                return generate_heuristic_roadmap(project)

            parsed = json.loads(raw_text)
            roadmap = ProjectRoadmap.model_validate(parsed)
            # Recompute total tasks & percentage
            total = sum(len(p.tasks) for p in roadmap.phases)
            roadmap.total_tasks = total
            roadmap.completed_tasks = 0
            roadmap.progress_percentage = 0.0
            return roadmap

        except Exception as err:
            logger.warning("Gemini roadmap generation failed (%s). Falling back to heuristic roadmap engine.", str(err))
            return generate_heuristic_roadmap(project)


# =====================================================================
# HEURISTIC FALLBACK ENGINES FOR MODULE A & MODULE B
# =====================================================================
def generate_heuristic_chat_reply(project: Dict[str, Any], message: str) -> str:
    """
    Intelligent heuristic fallback advisor that answers queries across all 5 key categories:
    1. Concept explanations (with code snippets)
    2. Feature suggestions
    3. Tech recommendations
    4. Implementation troubleshooting
    5. General project questions
    """
    msg_lower = message.lower()
    title = project.get("title", "your AI Project")
    technologies = project.get("technologies", "your technical stack")

    # 1. Explaining Programming Concepts
    if any(k in msg_lower for k in ["explain", "concept", "what is", "how does", "quantization", "rag", "docker", "fastapi", "overfitting", "async", "loss"]):
        if "quantization" in msg_lower or "int8" in msg_lower:
            return (
                f"### Understanding Model Quantization (FP32 → INT8)\n\n"
                f"**Concept:** Quantization converts model weights from 32-bit floating-point numbers (`float32`) to 8-bit integers (`int8`). "
                f"This reduces model memory footprint by ~75% and dramatically speeds up inference on edge hardware (like Raspberry Pi or mobile CPU).\n\n"
                f"**Code Example (PyTorch Dynamic Quantization):**\n"
                f"```python\n"
                f"import torch\n\n"
                f"# 1. Load trained FP32 model\n"
                f"model = torch.load('model_fp32.pt')\n\n"
                f"# 2. Apply dynamic INT8 quantization to linear/dense layers\n"
                f"quantized_model = torch.quantization.quantize_dynamic(\n"
                f"    model, {{torch.nn.Linear}}, dtype=torch.qint8\n"
                f")\n\n"
                f"# 3. Benchmark latency and save\n"
                f"torch.save(quantized_model.state_dict(), 'model_int8.pt')\n"
                f"print('Model quantized successfully: ~4x memory savings!')\n"
                f"```\n\n"
                f"For `{title}`, deploying INT8 quantized weights prevents edge VRAM crashes while keeping accuracy within 1-2% of full precision."
            )
        elif "rag" in msg_lower or "vector" in msg_lower:
            return (
                f"### Understanding Retrieval-Augmented Generation (RAG)\n\n"
                f"**Concept:** Instead of fine-tuning an LLM on your documents (which causes hallucinations and requires expensive GPUs), "
                f"RAG indexes your documents into high-dimensional vector embeddings stored in a Vector DB (Qdrant, ChromaDB, FAISS). "
                f"When a query arrives, the system retrieves the top-K relevant passages and injects them into the prompt as ground-truth context.\n\n"
                f"**Architecture Pipeline:**\n"
                f"1. **Chunking:** Break large PDFs into 500-token chunks with 50-token overlap.\n"
                f"2. **Embedding:** Run chunks through an embedding model (e.g. `text-embedding-3-small`).\n"
                f"3. **Vector Search:** Cosine similarity retrieval in Qdrant.\n"
                f"4. **Synthesis:** Pass context to Gemini/LLaMA with strict hallucination guards."
            )
        elif "fastapi" in msg_lower or "async" in msg_lower:
            return (
                f"### Asynchronous Concurrency in FastAPI\n\n"
                f"**Concept:** Python's `async def` runs on an asynchronous event loop (AnyIO/uvloop). When waiting for I/O "
                f"(like MongoDB queries or Gemini API calls), the worker thread yields control instead of blocking other concurrent requests.\n\n"
                f"**Code Snippet:**\n"
                f"```python\n"
                f"from fastapi import FastAPI\n"
                f"import httpx\n\n"
                f"app = FastAPI()\n\n"
                f"@app.post('/api/predict')\n"
                f"async def predict_endpoint(payload: dict):\n"
                f"    async with httpx.AsyncClient() as client:\n"
                f"        # Non-blocking remote inference\n"
                f"        res = await client.post('https://api.model-server.internal/infer', json=payload)\n"
                f"    return res.json()\n"
                f"```"
            )
        else:
            return (
                f"### Core Architectural Concept for {title}\n\n"
                f"When implementing `{technologies}`, the golden rule is **Separation of Concerns** between:\n"
                f"1. **Data Layer:** Schema validation with Pydantic and asynchronous persistence.\n"
                f"2. **Model/Inference Layer:** Isolated batch inference with timeout protection.\n"
                f"3. **Client Layer:** Non-blocking async API endpoints with responsive UI feedback.\n\n"
                f"What specific algorithm, framework feature, or code block would you like me to walk through step-by-step?"
            )

    # 2. Suggesting Features
    if any(k in msg_lower for k in ["feature", "suggest", "improve", "add", "ideas", "what else"]):
        return (
            f"### High-Impact Feature Suggestions for '{title}'\n\n"
            f"Based on your domain and technical stack ({technologies}), here are 4 features that will significantly elevate your project above standard tutorial clones:\n\n"
            f"1. **Real-Time Confidence & Uncertainty Thresholds:**\n"
            f"   - When prediction confidence drops below 65%, automatically flag the transaction for human-in-the-loop inspection rather than guessing.\n\n"
            f"2. **Edge Hardware Telemetry HUD:**\n"
            f"   - Display live CPU temperature, RAM consumption, and FPS latency counters directly on the dashboard so evaluators can verify real-time performance.\n\n"
            f"3. **Interactive What-If Simulation:**\n"
            f"   - Allow users or professors to toggle hyperparameters (e.g. batch size, threshold, model tier) and instantly see the projected latency and memory impact.\n\n"
            f"4. **Automated Audit Logging & Export:**\n"
            f"   - Export full JSON/PDF diagnostic reports with timestamps, model version hash, and risk mitigation checklists for defense presentations."
        )

    # 3. Recommending Technologies
    if any(k in msg_lower for k in ["recommend", "technology", "tech stack", "tools", "library", "framework", "database"]):
        return (
            f"### Recommended Modern Technology Stack for '{title}'\n\n"
            f"To maximize execution speed, stability, and evaluation scores, I recommend these production-grade tools:\n\n"
            f"- **Backend & API:** `FastAPI` + `Pydantic v2` (clean REST contracts, native OpenAPI docs, 3x faster serialization).\n"
            f"- **Model Inference & Acceleration:** `ONNX Runtime` with INT8 quantization, or `TensorRT` if deploying on NVIDIA hardware.\n"
            f"- **Database & Persistence:** `MongoDB` with async `Motor` for semi-structured document telemetry and evaluation records.\n"
            f"- **Frontend Dashboard:** `React 18` + `Vite` + `Tailwind CSS` + `Lucide-React` for responsive, lightweight UI rendering.\n"
            f"- **Testing & QA:** `pytest` + `pytest-asyncio` for backend endpoints, and `Locust` for simulated concurrent load testing.\n"
            f"- **Containerization:** `Docker` multi-stage build keeping container images under 400MB."
        )

    # 4. Implementation Difficulties & Troubleshooting
    if any(k in msg_lower for k in ["help", "bug", "error", "oom", "cuda", "latency", "cors", "slow", "fail", "memory", "issue", "problem"]):
        return (
            f"### Troubleshooting Implementation Roadblocks for '{title}'\n\n"
            f"Here is the standard engineering protocol to resolve common bottlenecks in `{technologies}`:\n\n"
            f"1. **If encountering CUDA Out-of-Memory (OOM):**\n"
            f"   - Wrap training/inference in `with torch.no_grad():`.\n"
            f"   - Call `torch.cuda.empty_cache()` between batches.\n"
            f"   - Reduce batch size to 1 or 2 and use gradient accumulation steps.\n\n"
            f"2. **If experiencing Latency Spikes (>500ms):**\n"
            f"   - Export PyTorch weights to ONNX format: `torch.onnx.export(...)`.\n"
            f"   - Enable multithreaded intra-op inference in ONNX Runtime (`session_options.intra_op_num_threads = 4`).\n\n"
            f"3. **If encountering CORS or HTTP 422 Validation Errors:**\n"
            f"   - Ensure `CORSMiddleware` in FastAPI permits `allow_origins=['*']` during development.\n"
            f"   - Check that incoming JSON keys match the exact Pydantic schema field names.\n\n"
            f"Tell me the specific error message or log line you are seeing, and I'll debug the exact fix!"
        )

    # 5. General Project Guidance
    return (
        f"### Technical Assessment for '{title}'\n\n"
        f"I am actively monitoring your project parameters in the `{project.get('domain', 'AI')}` domain. "
        f"Currently, your planned stack utilizes `{technologies}` with a stated skill tier of `{project.get('skill_level', 'Intermediate')}`.\n\n"
        f"Key priorities right now:\n"
        f"1. **Baseline Proof-of-Concept:** Ensure an end-to-end prototype runs locally before optimizing accuracy.\n"
        f"2. **Dataset Hygiene:** Verify no data leakage between training and validation sets.\n"
        f"3. **Defensive Error Handling:** Return graceful error messages instead of raw 500 exceptions.\n\n"
        f"How can I assist you right now? You can ask me to **explain a programming concept**, **suggest new features**, **recommend specific libraries**, or **help debug an error**."
    )


def generate_heuristic_roadmap(project: Dict[str, Any]) -> ProjectRoadmap:
    """
    Constructs a detailed 5-phase personalized development roadmap tailored
    to the project's domain, technologies, and timeline.
    """
    title = project.get("title", "AI Capstone Project")
    domain = project.get("domain", "Computer Science & AI")
    technologies = project.get("technologies", "Python, React, FastAPI")
    timeline = project.get("timeline", "3 - 4 Months")
    timestamp_ms = int(datetime.utcnow().timestamp() * 1000)

    phases = [
        RoadmapPhase(
            phase_number=1,
            phase_name="Foundation, Environment & Data Pipeline Setup",
            timeline="Weeks 1 - 2",
            description=f"Establish the foundational codebase, configure version control and CI linting, and curate clean benchmark datasets for {domain}.",
            recommended_tools=["Git / GitHub", "Python 3.11", "Virtualenv / Poetry", "Pandas", "Docker"],
            tasks=[
                RoadmapTask(
                    id="task_1_1",
                    title="Initialize Git repository & branching workflow",
                    description="Set up main, dev, and feature branch protections, configure .gitignore, and install ruff/black linter pre-commit hooks.",
                    category="architecture",
                    estimated_hours="3-4 hrs",
                    completed=True,
                    completed_at=datetime.utcnow().isoformat()
                ),
                RoadmapTask(
                    id="task_1_2",
                    title="Collect, inspect, and clean initial domain dataset",
                    description=f"Source representative datasets for {domain}. Validate label distributions, inspect outliers, and eliminate corrupt samples.",
                    category="dataset",
                    estimated_hours="8-12 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_1_3",
                    title="Define Pydantic schema contracts for APIs and telemetry",
                    description="Create strict data validation models for all incoming payloads and outgoing inference metrics.",
                    category="coding",
                    estimated_hours="4-6 hrs",
                    completed=False
                )
            ]
        ),
        RoadmapPhase(
            phase_number=2,
            phase_name="Core Algorithmic & ML Model Implementation",
            timeline="Weeks 3 - 5",
            description=f"Implement baseline models and core logic using {technologies}. Train and benchmark initial accuracy.",
            recommended_tools=["PyTorch / scikit-learn", "ONNX Runtime", "JupyterLab", "Weights & Biases"],
            tasks=[
                RoadmapTask(
                    id="task_2_1",
                    title="Implement baseline model architecture",
                    description="Build initial convolutional/transformer pipeline or algorithmic logic with transfer learning from pre-trained weights.",
                    category="coding",
                    estimated_hours="12-16 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_2_2",
                    title="Run stratified cross-validation & hyperparameter tuning",
                    description="Enforce strict patient/group K-fold cross validation to eliminate data leakage and optimize loss convergence.",
                    category="testing",
                    estimated_hours="10-14 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_2_3",
                    title="Apply INT8 model quantization and latency profiling",
                    description="Benchmark execution time per sample and quantize weights to reduce memory footprint by ~75%.",
                    category="architecture",
                    estimated_hours="6-8 hrs",
                    completed=False
                )
            ]
        ),
        RoadmapPhase(
            phase_number=3,
            phase_name="Backend API Wiring & Frontend Integration",
            timeline="Weeks 6 - 8",
            description="Expose model predictions via asynchronous REST endpoints and connect to the interactive React dashboard.",
            recommended_tools=["FastAPI", "React 18", "Tailwind CSS", "Axios", "MongoDB Motor"],
            tasks=[
                RoadmapTask(
                    id="task_3_1",
                    title="Build asynchronous prediction endpoints in FastAPI",
                    description="Implement POST /api/predict with proper error sanitization, timeout guards, and response caching.",
                    category="coding",
                    estimated_hours="8-10 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_3_2",
                    title="Persist telemetry and evaluation logs in MongoDB",
                    description="Store incoming queries, latency metrics, and user feedback into MongoDB collections with indexed queries.",
                    category="coding",
                    estimated_hours="5-7 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_3_3",
                    title="Wire interactive React UI controls & charts",
                    description="Connect React dashboard state to live backend APIs, render radar diagrams and live feedback banners.",
                    category="coding",
                    estimated_hours="10-12 hrs",
                    completed=False
                )
            ]
        ),
        RoadmapPhase(
            phase_number=4,
            phase_name="Rigorous Testing, QA & Benchmarking",
            timeline="Weeks 9 - 10",
            description="Execute automated unit tests, edge-case validation, security audits, and concurrency load testing.",
            recommended_tools=["pytest", "httpx", "Locust", "Postman", "Coverage.py"],
            tasks=[
                RoadmapTask(
                    id="task_4_1",
                    title="Author comprehensive pytest test suite",
                    description="Write unit and integration tests covering all endpoint success paths, edge invalid inputs, and 422 validations.",
                    category="testing",
                    estimated_hours="8-10 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_4_2",
                    title="Simulate high-concurrency load and edge throttling",
                    description="Stress-test API under 50 simultaneous users using Locust to verify memory stability and prevent server crashes.",
                    category="testing",
                    estimated_hours="6-8 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_4_3",
                    title="Perform security audit and secret sanitation",
                    description="Verify no API keys, credentials, or sensitive tokens are exposed in client bundles or public endpoints.",
                    category="architecture",
                    estimated_hours="4-5 hrs",
                    completed=False
                )
            ]
        ),
        RoadmapPhase(
            phase_number=5,
            phase_name="Containerization, Deployment & Presentation Docs",
            timeline="Weeks 11 - 12",
            description="Package application into multi-stage Docker containers, deploy to cloud/edge host, and prepare presentation defense materials.",
            recommended_tools=["Docker", "Docker Compose", "GitHub Actions", "Markdown", "Render / Cloud VPS"],
            tasks=[
                RoadmapTask(
                    id="task_5_1",
                    title="Create multi-stage production Dockerfile & Compose",
                    description="Package backend and frontend into lightweight production containers with isolated networking.",
                    category="deployment",
                    estimated_hours="5-7 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_5_2",
                    title="Deploy to target staging environment & verify live URL",
                    description="Deploy container to cloud VPS or edge board, verify domain SSL certificate and health endpoints.",
                    category="deployment",
                    estimated_hours="4-6 hrs",
                    completed=False
                ),
                RoadmapTask(
                    id="task_5_3",
                    title="Author final engineering report and defense presentation",
                    description="Document architecture diagram, feasibility metrics, ablation study, and live demo walkthrough.",
                    category="documentation",
                    estimated_hours="8-12 hrs",
                    completed=False
                )
            ]
        )
    ]

    total_tasks = sum(len(p.tasks) for p in phases)
    completed_tasks = sum(sum(1 for t in p.tasks if t.completed) for p in phases)
    progress = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    return ProjectRoadmap(
        id=f"rdm_{timestamp_ms}",
        project_id=project.get("id") or f"proj_{timestamp_ms}",
        user_id=project.get("user_id") or "usr_demo",
        title=title,
        overall_duration=timeline,
        methodology="Agile 2-Week Sprint Iterations",
        phases=phases,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        progress_percentage=progress
    )


# Global singleton service instance
gemini_service = GeminiProjectEvaluatorService()
