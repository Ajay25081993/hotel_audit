@echo off
title Hotel Audit Management System

echo ================================================
echo   Hotel Audit Management System - Starting...
echo ================================================
echo.

:: ── Python / FastAPI backend (AI + audit API) ──────────────────────────────
echo [1/2] Starting Python backend on http://localhost:8000 ...
start "Hotel Audit - Python Backend" cmd /k "cd /d "%~dp0python_backend" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 4 /nobreak >nul

:: ── Node.js / Express + React frontend ────────────────────────────────────
echo [2/2] Starting Node.js server (frontend + API) on http://localhost:5000 ...
start "Hotel Audit - Node Frontend" cmd /k "cd /d "%~dp0" && npm run dev"
:: Note: DATABASE_URL is loaded from .env via --env-file=.env in the npm dev script

echo.
echo ================================================
echo   All servers are starting in separate windows.
echo.
echo   App (React + Node API) : http://localhost:5000
echo   Python AI Backend      : http://localhost:8000
echo   Python API Docs        : http://localhost:8000/docs
echo.
echo   Login credentials:
echo     admin / password
echo     auditor / password
echo     reviewer / password
echo     corporate / password
echo     hotelgm / password
echo.
echo   Close this window or press any key to exit.
echo ================================================
echo.
pause >nul
