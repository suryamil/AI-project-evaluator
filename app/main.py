from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import db_manager
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.gemini import router as gemini_router
from app.routes.evaluation import router as evaluation_router
from app.services.gemini_service import GeminiServiceError
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("evaluator_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info(f"Starting {settings.PROJECT_NAME} (v{settings.VERSION}) on {settings.HOST}:{settings.PORT}...")
    await db_manager.connect()
    yield
    # Shutdown actions
    db_manager.close()
    logger.info("Database and server resources cleaned up. Server shut down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AI Project Evaluator & Failure Predictor. Evaluates model memory, latency, data leakage, and cost feasibility.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# -------------------------------------------------------------
# CORS Middleware: enables communication from React/Vite frontend
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Custom Error Handling: Clean, standardized error JSON responses
# -------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic 422 input validation errors into clean field messages."""
    error_details = []
    for err in exc.errors():
        field_loc = " -> ".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        error_details.append({
            "field": field_loc or "general",
            "issue": err.get("msg", "Invalid value"),
            "type": err.get("type", "value_error")
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Input validation failed. Please check the required fields.",
            "code": 422,
            "errors": error_details
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Standardized HTTP exception response format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "code": exc.status_code
        }
    )

@app.exception_handler(GeminiServiceError)
async def gemini_service_exception_handler(request: Request, exc: GeminiServiceError):
    """Handles Gemini AI exceptions safely without leaking stack traces or keys."""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fallback handler for unhandled exceptions."""
    logger.error(f"Unhandled server error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An internal server error occurred. Please try again later.",
            "code": 500
        }
    )

# -------------------------------------------------------------
# API Route Inclusions
# -------------------------------------------------------------
app.include_router(health_router, prefix="/api", tags=["Health Check"])
app.include_router(evaluation_router, prefix="/api", tags=["AI Project Evaluation"])
app.include_router(auth_router, prefix="/api/auth", tags=["User Authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["Project Evaluation & Submission"])
app.include_router(gemini_router, prefix="/api/ai", tags=["Google Gemini AI"])

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# -------------------------------------------------------------
# Static Frontend Serving for Production / Single-Service Deployment
# -------------------------------------------------------------
frontend_dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist_dir.exists() and (frontend_dist_dir / "index.html").exists():
    logger.info(f"Production React build detected at {frontend_dist_dir}. Enabling full-stack serving.")
    
    if (frontend_dist_dir / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist_dir / "assets")), name="frontend_assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        # Do not intercept API, docs, or OpenAPI schema
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
            raise StarletteHTTPException(status_code=404, detail="Not Found")
        
        target_file = frontend_dist_dir / full_path
        if full_path and target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(frontend_dist_dir / "index.html")
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": f"Welcome to {settings.PROJECT_NAME} API",
            "status": "online",
            "version": settings.VERSION,
            "docs": "/docs",
            "health": "/api/health",
            "endpoints": {
                "health_check": "GET /api/health",
                "user_register": "POST /api/auth/register",
                "user_login": "POST /api/auth/login",
                "project_evaluate": "POST /api/projects/evaluate",
                "project_submit": "POST /api/projects/submit",
                "project_get": "GET /api/projects/{project_id}",
                "project_list": "GET /api/projects"
            }
        }
