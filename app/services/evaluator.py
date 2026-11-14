"""
AI Project Evaluator & Failure Prediction Engine.
Performs empirical heuristic analysis across 5 key architectural vectors:
1. Memory / VRAM capacity
2. Real-time inference latency
3. Dataset volume & data leakage
4. Team capability vs. tech stack complexity
5. Budget & compute sustainability
"""

import re
from typing import Dict, List, Any

def analyze_project_feasibility(project_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates a project proposal and returns feasibility scores, failure vectors,
    radar metrics, and actionable engineering recommendations.
    """
    domain = str(project_data.get("domain", "")).lower()
    tech = str(project_data.get("technologies", "")).lower()
    skill = str(project_data.get("skill_level", "")).lower()
    timeline = str(project_data.get("timeline", "")).lower()
    budget = str(project_data.get("budget", "")).lower()
    team_size = str(project_data.get("team_size", "")).lower()
    
    # Base radar metrics (out of 100)
    memory_score = 75
    latency_score = 75
    data_score = 80
    cost_score = 80
    team_score = 75

    identified_risks: List[str] = []
    recommendations: List[str] = []
    vram_required = "4.0 GB (FP16)"
    cloud_estimate = "$0 (Local Dev / Free Tier)"

    # 1. Skill Level Evaluation
    if "beginner" in skill:
        team_score -= 25
        identified_risks.append("Steep learning curve: Deep learning / distributed architecture requires advanced debugging experience.")
        recommendations.append("Start with pre-trained models from HuggingFace pipelines or PyTorch Vision before training from scratch.")
    elif "intermediate" in skill:
        team_score += 5
    elif "advanced" in skill or "expert" in skill:
        team_score += 18

    # 2. Technology & Model Architecture Memory Check
    if any(k in tech for k in ["llama", "gpt", "mistral", "qwen", "transformer", "llm"]):
        memory_score -= 30
        vram_required = "16.5 GB (FP16 Base)"
        cloud_estimate = "$60 - $120 / month (Cloud GPU)"
        identified_risks.append("Transformer / LLM weights exceed consumer GPU VRAM, risking CUDA Out-Of-Memory errors during inference.")
        recommendations.append("Implement 4-bit AWQ or GGUF quantization (reduces VRAM footprint by ~70% to ~5GB).")
        recommendations.append("Use vLLM or Ollama with paged attention for high-throughput local serving.")
    elif any(k in tech for k in ["yolo", "cv", "vision", "resnet", "diffusion", "cnn"]):
        memory_score -= 10
        vram_required = "3.8 GB (FP16)"
        if "raspberry" in tech or "iot" in domain or "edge" in tech:
            latency_score -= 35
            vram_required = "1.8 GB (Edge Quantized)"
            identified_risks.append("Edge CPU inference latency (>2,500ms) will drop frames below real-time operational thresholds.")
            recommendations.append("Export model weights to ONNX / TensorRT with INT8 quantization for sub-60ms edge inference.")

    # 3. Budget vs. Cloud Compute
    if "$0" in budget or "free" in budget:
        cost_score -= 10
        if "llama" in tech or "diffusion" in tech or "large" in tech:
            cost_score -= 30
            identified_risks.append("Zero budget allocation is insufficient for GPU hosting of generative AI models without free student credits.")
            recommendations.append("Utilize Google Colab T4 (free tier) or Kaggle GPU 30hr/week quotas for development.")
    elif "3,000" in budget or "institutional" in budget:
        cost_score = 95
        cloud_estimate = "$250+ / month (Enterprise Cloud)"

    # 4. Development Timeline & Team Size
    if "1 - 2" in timeline:
        data_score -= 20
        latency_score -= 15
        identified_risks.append("1-2 month timeline leaves insufficient time for dataset cleansing, stratified splitting, and hyperparameter tuning.")
        recommendations.append("Scope the MVP to inference on an existing benchmark dataset before attempting custom real-world data collection.")
    elif "5 - 8" in timeline or "9 - 12" in timeline:
        data_score += 10

    if "solo" in team_size:
        team_score -= 10
        identified_risks.append("Solo developer workload across frontend, backend API, ML pipeline, and data annotation introduces high burnout risk.")
        recommendations.append("Adopt serverless databases (e.g. Supabase / MongoDB Atlas) to minimize backend maintenance.")
    elif "3" in team_size or "4" in team_size:
        team_score += 8

    # Bound individual radar scores between 20 and 98
    radar = {
        "memory_feasibility": max(20, min(98, memory_score)),
        "latency_feasibility": max(20, min(98, latency_score)),
        "data_integrity": max(20, min(98, data_score)),
        "cost_viability": max(20, min(98, cost_score)),
        "team_capability": max(20, min(98, team_score))
    }

    # Overall Feasibility Score (Weighted average)
    overall_score = int(
        (radar["memory_feasibility"] * 0.25) +
        (radar["latency_feasibility"] * 0.20) +
        (radar["data_integrity"] * 0.20) +
        (radar["cost_viability"] * 0.15) +
        (radar["team_capability"] * 0.20)
    )

    # Classify Risk Level
    if overall_score >= 75:
        risk_level = "Low Risk"
        risk_color = "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    elif overall_score >= 50:
        risk_level = "Moderate Risk"
        risk_color = "text-amber-500 bg-amber-500/10 border-amber-500/30"
    else:
        risk_level = "High Risk"
        risk_color = "text-rose-500 bg-rose-500/10 border-rose-500/30"

    primary_risk = identified_risks[0] if identified_risks else "Minor throughput degradation under peak concurrency; monitor memory ceilings."

    # Default fallback recommendations if none generated
    if len(recommendations) < 2:
        recommendations.append("Implement automated unit testing for ML pipeline preprocessing steps.")
        recommendations.append("Set up cross-validation splits stratified by category to prevent data leakage.")

    return {
        "feasibility_score": overall_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "primary_risk": primary_risk,
        "identified_risks": identified_risks,
        "recommendations": recommendations,
        "radar_scores": radar,
        "vram_required": vram_required,
        "cloud_estimate": cloud_estimate
    }
