from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.models import Base

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def migrate_database():
    """Run lightweight migrations for SQLite (add missing columns)."""
    if settings.DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            # Check if ai_analysis column exists in audit_items
            result = conn.execute(text("PRAGMA table_info(audit_items)"))
            columns = [row[1] for row in result]
            if "ai_analysis" not in columns:
                conn.execute(text("ALTER TABLE audit_items ADD COLUMN ai_analysis TEXT"))
                conn.commit()
                print("[MIGRATE] Added ai_analysis column to audit_items")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
