from fastapi import APIRouter
from app.core.config import settings
from app.core.database import check_database_status
import datetime

router = APIRouter()

@router.get("/health", summary="Health check endpoint")
async def health_check():
    """
    Checks backend service status and database connectivity.
    Used by the frontend to confirm system health.
    """
    db_status = await check_database_status()
    
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "database": db_status
    }
