import os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models.models import Base

engine = create_engine(settings.DATABASE_URL)

# Drop tables that depend on audits first, then audits
with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS audit_items CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS audits CASCADE"))
    conn.commit()
    print("Dropped audit_items and audits tables")

# Recreate all tables
Base.metadata.create_all(bind=engine)
print("Recreated all tables successfully")

