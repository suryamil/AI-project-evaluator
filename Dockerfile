# ==============================================================================
# Multi-Stage Production Dockerfile for AI Project Evaluator & Failure Predictor
# Builds React Frontend with Vite & Packages with FastAPI Backend
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY frontend/ ./
ENV VITE_API_BASE_URL=""
RUN npm run build

# Stage 2: Production Python Runtime
FROM python:3.12-slim AS runner

WORKDIR /app

# Set production environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    PORT=8000 \
    HOST=0.0.0.0

# Install system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Backend Code
COPY backend/ ./backend/
COPY data/ ./data/

# Copy Built Frontend Distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose API and Web Server port
EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start Production ASGI Server
CMD ["python", "-m", "uvicorn", "--app-dir", "backend", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
