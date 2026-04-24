#!/usr/bin/env python3
"""
Server startup script
Handles database initialization and server startup
"""

import uvicorn
import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import create_tables, migrate_database
from init_db import main as init_db

def start_server():
    """Start the FastAPI server"""
    print("[START] Starting Hotel Audit Management API Server...")
    
    # Initialize database
    try:
        print("[DB] Setting up database...")
        create_tables()
        migrate_database()
        print("[OK] Database setup completed")
    except Exception as e:
        print(f"[ERROR] Database setup failed: {e}")
        print("[RETRY] Attempting to initialize database...")
        try:
            init_db()
        except Exception as init_error:
            print(f"[ERROR] Database initialization failed: {init_error}")
            print("[INFO] Please ensure PostgreSQL is running and accessible")
            sys.exit(1)
    
    # Start the server
    print("[START] Starting FastAPI server on http://localhost:8000")
    print("[INFO] API documentation available at http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    start_server()
