"""
MongoDB Database Connection & Collection Manager using Motor (AsyncIO).
Manages connection lifecycle and provides accessors for:
1. users
2. projects
3. evaluations
4. risk_reports
5. chat_history
"""

import logging
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from app.core.config import settings

logger = logging.getLogger("evaluator_database")

class DatabaseManager:
    """
    Manages asynchronous MongoDB connection via Motor.
    Includes automatic fallback to in-memory mongomock if local mongod is not yet running.
    """
    _client: Optional[AsyncIOMotorClient] = None
    _db: Optional[AsyncIOMotorDatabase] = None
    _is_mock: bool = False
    _is_connected: bool = False

    async def connect(self):
        """Initializes connection to MongoDB or in-memory fallback."""
        if self._client is not None:
            return

        try:
            # 1. Attempt connection to configured MongoDB URL (timeout 1500ms)
            client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=1500,
                connectTimeoutMS=1500
            )
            # Ping database to confirm live connectivity
            await client.admin.command('ping')
            self._client = client
            self._db = client[settings.DATABASE_NAME]
            self._is_connected = True
            self._is_mock = False
            logger.info(f"Connected to live MongoDB server at {settings.MONGODB_URL} (Database: {settings.DATABASE_NAME})")
        except Exception as e:
            # 2. Seamless fallback to in-memory motor engine (mongomock_motor)
            logger.warning(
                f"Live MongoDB not reachable ({str(e)}). "
                f"Activating high-performance in-memory MongoMotor engine so all 5 collections and queries work immediately!"
            )
            try:
                from mongomock_motor import AsyncMongoMockClient
                self._client = AsyncMongoMockClient()
                self._db = self._client[settings.DATABASE_NAME]
                self._is_connected = True
                self._is_mock = True
            except Exception as mock_err:
                logger.error(f"Failed to initialize mock mongo: {mock_err}")
                self._is_connected = False

        if self._db is not None:
            await self._create_indexes()

    async def _create_indexes(self):
        """Creates unique and lookup indexes across all 5 collections."""
        try:
            # 1. Users collection: unique email index
            await self.users.create_index("email", unique=True)
            # 2. Projects collection: user_id index for isolated private data queries
            await self.projects.create_index("user_id")
            await self.projects.create_index("id", unique=True)
            # 3. Evaluations collection: project_id & user_id index
            await self.evaluations.create_index("project_id")
            await self.evaluations.create_index("user_id")
            # 4. RiskReports collection: project_id & user_id index
            await self.risk_reports.create_index("project_id")
            await self.risk_reports.create_index("user_id")
            # 5. ChatHistory collection: project_id & user_id index
            await self.chat_history.create_index("project_id")
            await self.chat_history.create_index("user_id")
            # 6. Roadmaps collection: project_id & user_id index
            await self.roadmaps.create_index("project_id")
            await self.roadmaps.create_index("user_id")
            logger.info("MongoDB indexes verified across all collections.")
        except Exception as e:
            logger.warning(f"Index creation note: {e}")

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            raise RuntimeError("Database not initialized. Ensure connect() was called during startup.")
        return self._db

    # 5 Dedicated Collection Accessors
    @property
    def users(self) -> AsyncIOMotorCollection:
        return self.db["users"]

    @property
    def projects(self) -> AsyncIOMotorCollection:
        return self.db["projects"]

    @property
    def evaluations(self) -> AsyncIOMotorCollection:
        return self.db["evaluations"]

    @property
    def risk_reports(self) -> AsyncIOMotorCollection:
        return self.db["risk_reports"]

    @property
    def chat_history(self) -> AsyncIOMotorCollection:
        return self.db["chat_history"]

    @property
    def roadmaps(self) -> AsyncIOMotorCollection:
        return self.db["roadmaps"]

    def close(self):
        """Closes the MongoDB client connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            self._is_connected = False
            logger.info("MongoDB connection closed.")

    async def get_status(self) -> Dict[str, Any]:
        """Returns live connection and collections telemetry."""
        is_live = False
        if not self._is_mock and self._client:
            try:
                await self._client.admin.command('ping')
                is_live = True
            except Exception:
                is_live = False

        # Count documents in all collections
        counts = {}
        if self._db is not None:
            for col_name in ["users", "projects", "evaluations", "risk_reports", "chat_history", "roadmaps"]:
                try:
                    counts[col_name] = await self.db[col_name].count_documents({})
                except Exception:
                    counts[col_name] = 0

        return {
            "configured": True,
            "connected": self._is_connected,
            "engine": "Live MongoDB Cluster" if (is_live and not self._is_mock) else "In-Memory MongoMotor Engine (Full CRUD active)",
            "database_name": settings.DATABASE_NAME,
            "url": settings.MONGODB_URL,
            "collections": {
                "users": {"name": "users", "documents_count": counts.get("users", 0)},
                "projects": {"name": "projects", "documents_count": counts.get("projects", 0)},
                "evaluations": {"name": "evaluations", "documents_count": counts.get("evaluations", 0)},
                "risk_reports": {"name": "risk_reports", "documents_count": counts.get("risk_reports", 0)},
                "chat_history": {"name": "chat_history", "documents_count": counts.get("chat_history", 0)},
                "roadmaps": {"name": "roadmaps", "documents_count": counts.get("roadmaps", 0)}
            }
        }

db_manager = DatabaseManager()

async def check_database_status() -> Dict[str, Any]:
    """Helper used by health check endpoint."""
    return await db_manager.get_status()
