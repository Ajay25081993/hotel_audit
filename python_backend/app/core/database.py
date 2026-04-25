from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.models import Base

if not settings.DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg2://", "postgres://")):
    raise RuntimeError(
        f"Unsupported DATABASE_URL: {settings.DATABASE_URL!r}. "
        "This project requires a PostgreSQL connection string."
    )

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    Base.metadata.create_all(bind=engine)


def migrate_database():
    """Apply lightweight in-place schema migrations on PostgreSQL."""
    with engine.connect() as conn:
        result = conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'hotel_audit' AND table_name = 'audit_items'"
            )
        )
        columns = {row[0] for row in result}
        if "ai_analysis" not in columns:
            conn.execute(text("ALTER TABLE hotel_audit.audit_items ADD COLUMN ai_analysis TEXT"))
            conn.commit()
            print("[MIGRATE] Added ai_analysis column to audit_items")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
