import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend root directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "AI Project Evaluator & Failure Predictor")
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ai_project_evaluator_db")
    
    # JWT Authentication settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ai_evaluator_jwt_super_secret_key_change_in_production_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Google Gemini AI settings - dynamically read environment variables so edits to .env take effect immediately
    @property
    def GEMINI_API_KEY(self) -> str:
        load_dotenv(dotenv_path=env_path, override=True)
        return os.getenv("GEMINI_API_KEY", "")

    @property
    def GEMINI_MODEL(self) -> str:
        return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    @property
    def GEMINI_TIMEOUT_SECONDS(self) -> float:
        try:
            return float(os.getenv("GEMINI_TIMEOUT_SECONDS", "30.0"))
        except (ValueError, TypeError):
            return 30.0

    # CORS: Allowed origins for frontend communication
    @property
    def CORS_ORIGINS(self) -> list:
        raw_origins = os.getenv("CORS_ORIGINS", "")
        if raw_origins:
            return [o.strip() for o in raw_origins.split(",") if o.strip()]
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "*"
        ]

settings = Settings()
