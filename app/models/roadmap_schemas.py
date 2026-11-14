"""
Pydantic Schemas for Development Roadmap Module.

Includes:
- RoadmapTask (individual actionable task with completion tracking)
- RoadmapPhase (logical sequence phase with recommended tools and tasks)
- ProjectRoadmap (full structured personalized implementation plan)
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class RoadmapTask(BaseModel):
    id: str = Field(..., description="Unique task identifier, e.g. task_1_1", example="task_1_1")
    title: str = Field(..., description="Actionable task title", example="Set up Python virtual environment and dependencies")
    description: str = Field(..., description="Detailed task requirements and implementation steps", example="Configure poetry or pip-tools, install PyTorch, FastAPI, and opencv-python.")
    category: str = Field(
        default="coding",
        description="Category: 'architecture', 'dataset', 'coding', 'testing', 'deployment', 'documentation'",
        example="architecture"
    )
    estimated_hours: str = Field(default="4-6 hrs", description="Estimated effort", example="4-6 hrs")
    completed: bool = Field(default=False, description="Completion status tracked by user")
    completed_at: Optional[str] = Field(default=None, description="ISO timestamp when marked completed")

class RoadmapPhase(BaseModel):
    phase_number: int = Field(..., ge=1, le=10, description="Sequential phase order", example=1)
    phase_name: str = Field(..., description="Phase title", example="Foundation & Data Pipeline Setup")
    timeline: str = Field(..., description="Target timeline", example="Weeks 1 - 2")
    description: str = Field(..., description="Phase objectives and deliverables", example="Establish development environment, source and clean datasets, and draft initial API contracts.")
    recommended_tools: List[str] = Field(default_factory=list, description="Recommended libraries, frameworks and tools for this phase", example=["Python 3.11", "Git", "PyTorch", "Docker"])
    tasks: List[RoadmapTask] = Field(default_factory=list, description="List of tasks in this phase")

class ProjectRoadmap(BaseModel):
    id: str = Field(..., description="Unique roadmap identifier (rdm_...)", example="rdm_1731578400000")
    project_id: str = Field(..., description="Associated Project ID", example="proj_101")
    user_id: str = Field(default="usr_demo", description="Owner user ID", example="usr_demo")
    title: str = Field(..., description="Project title", example="Autonomous Drone Pest Identifier")
    overall_duration: str = Field(default="12 Weeks", description="Estimated total roadmap duration", example="12 Weeks")
    methodology: str = Field(default="Agile Sprint Iterations", description="Recommended development methodology", example="Agile Sprint Iterations")
    phases: List[RoadmapPhase] = Field(..., description="Sequential development phases from foundation to deployment")
    total_tasks: int = Field(default=0, description="Total tasks across all phases")
    completed_tasks: int = Field(default=0, description="Number of checked off tasks")
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Overall completion progress percentage")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ToggleTaskRequest(BaseModel):
    completed: Optional[bool] = Field(None, description="Explicit completion state. If omitted, flips current state.")

class CreateCustomTaskRequest(BaseModel):
    phase_number: int = Field(..., ge=1, description="Target phase to append custom task to")
    title: str = Field(..., min_length=3, max_length=200, description="Task title")
    description: str = Field(default="", description="Task description")
    category: str = Field(default="coding", description="Category")
    estimated_hours: str = Field(default="3-5 hrs", description="Estimated hours")
