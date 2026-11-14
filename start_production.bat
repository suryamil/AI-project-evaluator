@echo off
TITLE AI Project Evaluator - Production Server
echo ==============================================================================
echo Starting AI Project Evaluator in Production Mode
echo ==============================================================================

cd /d "%~dp0"

echo [1/3] Building production frontend assets...
call npm.cmd --prefix frontend run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/3] Checking Python virtual environment...
if not exist "backend\.venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found in backend\.venv
    pause
    exit /b 1
)

echo [3/3] Launching Production Server on http://127.0.0.1:8000 ...
echo Press CTRL+C to stop the server at any time.
backend\.venv\Scripts\python.exe -m uvicorn --app-dir backend app.main:app --host 0.0.0.0 --port 8000 --workers 2
