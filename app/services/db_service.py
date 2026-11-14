"""
MongoDB CRUD Service Layer.
Enforces data isolation so each student accesses only their private data.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.database import db_manager
from app.models.db_models import (
    UserDocument,
    ProjectDocument,
    EvaluationDocument,
    RiskReportDocument,
    ChatHistoryDocument,
    ChatMessage,
    RoadmapDocument
)

class MongoDBService:
    """Provides high-level asynchronous CRUD operations across all 5 MongoDB collections."""

    # -------------------------------------------------------------
    # 1. USERS COLLECTION CRUD
    # -------------------------------------------------------------
    async def create_user(self, user: UserDocument) -> Dict[str, Any]:
        """Creates a new user document in 'users' collection."""
        user_dict = user.model_dump()
        await db_manager.users.insert_one(user_dict)
        user_dict.pop("_id", None)
        return user_dict

    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Queries 'users' collection by email (case-insensitive)."""
        target = email.strip().lower()
        return await db_manager.users.find_one({"email": target}, {"_id": 0})

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Queries 'users' collection by ID."""
        return await db_manager.users.find_one({"id": user_id}, {"_id": 0})

    # -------------------------------------------------------------
    # 2. PROJECTS COLLECTION CRUD (With User Isolation)
    # -------------------------------------------------------------
    async def create_project(self, project: ProjectDocument) -> Dict[str, Any]:
        """Creates a new project document in 'projects' collection."""
        doc = project.model_dump()
        await db_manager.projects.insert_one(doc)
        doc.pop("_id", None)
        return doc

    async def get_project(self, project_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Retrieves a project by ID.
        If user_id is provided, enforces that the requester owns the project!
        """
        query: Dict[str, Any] = {"id": project_id}
        if user_id:
            query["user_id"] = user_id
        return await db_manager.projects.find_one(query, {"_id": 0})

    async def list_user_projects(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Queries all projects owned by a specific user.
        Ensures a user can NEVER see other users' private projects.
        """
        cursor = db_manager.projects.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def list_all_projects(self) -> List[Dict[str, Any]]:
        """Admin/all project listing."""
        cursor = db_manager.projects.find({}, {"_id": 0}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def delete_project(self, project_id: str, user_id: str) -> bool:
        """Deletes a project only if it belongs to user_id."""
        result = await db_manager.projects.delete_one({"id": project_id, "user_id": user_id})
        # Also clean up associated evaluations, reports, and chat
        if result.deleted_count > 0:
            await db_manager.evaluations.delete_many({"project_id": project_id, "user_id": user_id})
            await db_manager.risk_reports.delete_many({"project_id": project_id, "user_id": user_id})
            await db_manager.chat_history.delete_many({"project_id": project_id, "user_id": user_id})
            return True
        return False

    # -------------------------------------------------------------
    # 3. EVALUATIONS COLLECTION CRUD
    # -------------------------------------------------------------
    async def create_evaluation(self, evaluation: EvaluationDocument) -> Dict[str, Any]:
        """Stores AI evaluation scores in 'evaluations' collection."""
        doc = evaluation.model_dump()
        await db_manager.evaluations.insert_one(doc)
        doc.pop("_id", None)
        return doc

    async def get_evaluation_by_project(self, project_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Finds the most recent evaluation for a project with optional user privacy check."""
        query: Dict[str, Any] = {"project_id": project_id}
        if user_id:
            query["user_id"] = user_id
        return await db_manager.evaluations.find_one(query, {"_id": 0}, sort=[("evaluated_at", -1)])

    async def list_user_evaluations(self, user_id: str) -> List[Dict[str, Any]]:
        """Lists all evaluations belonging to a specific user."""
        cursor = db_manager.evaluations.find({"user_id": user_id}, {"_id": 0}).sort("evaluated_at", -1)
        return await cursor.to_list(length=100)

    # -------------------------------------------------------------
    # 4. RISK REPORTS COLLECTION CRUD
    # -------------------------------------------------------------
    async def create_risk_report(self, report: RiskReportDocument) -> Dict[str, Any]:
        """Stores detailed failure vectors in 'risk_reports' collection."""
        doc = report.model_dump()
        await db_manager.risk_reports.insert_one(doc)
        doc.pop("_id", None)
        return doc

    async def get_risk_report(self, project_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieves risk report for a project with privacy check."""
        query: Dict[str, Any] = {"project_id": project_id}
        if user_id:
            query["user_id"] = user_id
        return await db_manager.risk_reports.find_one(query, {"_id": 0}, sort=[("generated_at", -1)])

    # -------------------------------------------------------------
    # 5. CHAT HISTORY COLLECTION CRUD
    # -------------------------------------------------------------
    async def get_or_create_chat(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """Retrieves or initializes a chat session for a specific project and user."""
        chat = await db_manager.chat_history.find_one(
            {"project_id": project_id, "user_id": user_id},
            {"_id": 0}
        )
        if chat:
            return chat

        new_chat = ChatHistoryDocument(
            id=f"chat_{int(datetime.utcnow().timestamp() * 1000)}",
            project_id=project_id,
            user_id=user_id,
            messages=[
                ChatMessage(
                    role="assistant",
                    content="Hello! I am your AI Project Advisor. Ask me anything about your project's feasibility scores, memory optimization, or architectural failure vectors."
                )
            ]
        )
        doc = new_chat.model_dump()
        await db_manager.chat_history.insert_one(doc)
        doc.pop("_id", None)
        return doc

    async def add_chat_message(self, project_id: str, user_id: str, role: str, content: str) -> Dict[str, Any]:
        """Appends a new message to the chat history using MongoDB $push operator."""
        msg = ChatMessage(role=role, content=content).model_dump()
        now = datetime.utcnow().isoformat()

        # Check if chat doc exists, if not initialize
        await self.get_or_create_chat(project_id, user_id)

        await db_manager.chat_history.update_one(
            {"project_id": project_id, "user_id": user_id},
            {
                "$push": {"messages": msg},
                "$set": {"updated_at": now}
            }
        )
        return await self.get_or_create_chat(project_id, user_id)

    async def clear_chat(self, project_id: str, user_id: str) -> Dict[str, Any]:
        """Clears conversation history and reinitializes with standard greeting."""
        now = datetime.utcnow().isoformat()
        initial_message = ChatMessage(
            role="assistant",
            content="Conversation reset. How can I assist you with your project today? Ask about architectures, debugging, programming concepts, or features."
        ).model_dump()
        await db_manager.chat_history.update_one(
            {"project_id": project_id, "user_id": user_id},
            {
                "$set": {
                    "messages": [initial_message],
                    "updated_at": now
                }
            },
            upsert=True
        )
        return await self.get_or_create_chat(project_id, user_id)

    # -------------------------------------------------------------
    # 6. ROADMAPS COLLECTION CRUD
    # -------------------------------------------------------------
    async def save_roadmap(self, roadmap_doc: RoadmapDocument) -> Dict[str, Any]:
        """Upserts a project implementation roadmap in 'roadmaps' collection."""
        doc = roadmap_doc.model_dump()
        await db_manager.roadmaps.update_one(
            {"project_id": roadmap_doc.project_id, "user_id": roadmap_doc.user_id},
            {"$set": doc},
            upsert=True
        )
        doc.pop("_id", None)
        return doc

    async def get_roadmap(self, project_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieves development roadmap for a project with optional user privacy check."""
        query: Dict[str, Any] = {"project_id": project_id}
        if user_id:
            query["user_id"] = user_id
        return await db_manager.roadmaps.find_one(query, {"_id": 0})

    async def toggle_task_completion(
        self, 
        project_id: str, 
        task_id: str, 
        completed: Optional[bool] = None, 
        user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Toggles or sets the completion status of a specific task in the roadmap,
        recalculating completed_tasks and progress_percentage.
        """
        roadmap = await self.get_roadmap(project_id, user_id)
        if not roadmap:
            return None

        phases = roadmap.get("phases", [])
        total_tasks = 0
        completed_tasks = 0
        target_found = False
        now = datetime.utcnow().isoformat()

        for phase in phases:
            for task in phase.get("tasks", []):
                total_tasks += 1
                if task.get("id") == task_id:
                    target_found = True
                    new_status = not task.get("completed", False) if completed is None else completed
                    task["completed"] = new_status
                    task["completed_at"] = now if new_status else None
                if task.get("completed"):
                    completed_tasks += 1

        if not target_found:
            return None

        progress = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

        await db_manager.roadmaps.update_one(
            {"project_id": project_id, **({"user_id": user_id} if user_id else {})},
            {
                "$set": {
                    "phases": phases,
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "progress_percentage": progress,
                    "updated_at": now
                }
            }
        )
        return await self.get_roadmap(project_id, user_id)

    async def add_custom_task_to_phase(
        self,
        project_id: str,
        phase_number: int,
        task_data: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Appends a user-defined custom task into a specific roadmap phase."""
        roadmap = await self.get_roadmap(project_id, user_id)
        if not roadmap:
            return None

        phases = roadmap.get("phases", [])
        target_phase = None
        for p in phases:
            if p.get("phase_number") == phase_number:
                target_phase = p
                break

        if not target_phase:
            return None

        task_id = f"task_{phase_number}_{len(target_phase.get('tasks', [])) + 1}_{int(datetime.utcnow().timestamp() % 10000)}"
        new_task = {
            "id": task_id,
            "title": task_data.get("title"),
            "description": task_data.get("description", ""),
            "category": task_data.get("category", "coding"),
            "estimated_hours": task_data.get("estimated_hours", "3-5 hrs"),
            "completed": False,
            "completed_at": None
        }

        target_phase.setdefault("tasks", []).append(new_task)

        total_tasks = sum(len(p.get("tasks", [])) for p in phases)
        completed_tasks = sum(sum(1 for t in p.get("tasks", []) if t.get("completed")) for p in phases)
        progress = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

        now = datetime.utcnow().isoformat()
        await db_manager.roadmaps.update_one(
            {"project_id": project_id, **({"user_id": user_id} if user_id else {})},
            {
                "$set": {
                    "phases": phases,
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "progress_percentage": progress,
                    "updated_at": now
                }
            }
        )
        return await self.get_roadmap(project_id, user_id)

db_service = MongoDBService()
