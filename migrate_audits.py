import os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/python_backend')
from sqlalchemy import create_engine, text
from app.core.config import settings
engine = create_engine(settings.DATABASE_URL)
with engine.connect() as conn:
    conn.execute(text('ALTER TABLE audits ADD COLUMN IF NOT EXISTS hotel_group_id INTEGER REFERENCES hotel_groups(id)'))
    conn.execute(text('ALTER TABLE audits ADD COLUMN IF NOT EXISTS sop TEXT'))
    conn.execute(text('ALTER TABLE audits ADD COLUMN IF NOT EXISTS sop_files TEXT'))
    conn.execute(text('ALTER TABLE audits ADD COLUMN IF NOT EXISTS priority VARCHAR DEFAULT \'medium\''))
    conn.execute(text('ALTER TABLE audits ADD COLUMN IF NOT EXISTS notes TEXT'))
    conn.execute(text('ALTER TABLE audits ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP'))
    conn.commit()
    print('Migration complete: added columns to audits table')
