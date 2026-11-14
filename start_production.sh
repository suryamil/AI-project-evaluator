#!/usr/bin/env bash
# ==============================================================================
# Linux / macOS Production Startup Script
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=============================================================================="
echo "Starting AI Project Evaluator in Production Mode"
echo "=============================================================================="

echo "[1/3] Building production frontend assets..."
cd frontend
npm ci --prefer-offline
npm run build
cd ..

echo "[2/3] Checking Python virtual environment..."
if [ ! -d "backend/.venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/.venv
    backend/.venv/bin/pip install --upgrade pip
    backend/.venv/bin/pip install -r backend/requirements.txt
fi

echo "[3/3] Launching Production Server on http://0.0.0.0:8000 ..."
export ENVIRONMENT=production
exec backend/.venv/bin/python -m uvicorn --app-dir backend app.main:app --host 0.0.0.0 --port 8000 --workers 2
