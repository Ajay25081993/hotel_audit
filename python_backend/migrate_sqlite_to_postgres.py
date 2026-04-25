#!/usr/bin/env python3
"""One-shot data migration from the legacy SQLite database into PostgreSQL.

Reads from python_backend/hotel_audit.db (override with --sqlite) and writes
into the database described by DATABASE_URL (or --postgres).

Behavior:
  * Creates the Postgres schema via SQLAlchemy models if it doesn't already exist.
  * Copies users, hotel_groups, properties, audits and audit_items in dependency order.
  * Preserves primary keys so existing foreign keys stay valid.
  * Re-syncs the SERIAL sequences after the bulk insert.
  * Skips rows whose primary key already exists in Postgres (safe to re-run).

Usage:
    python migrate_sqlite_to_postgres.py
    python migrate_sqlite_to_postgres.py --sqlite ./hotel_audit.db
    python migrate_sqlite_to_postgres.py --truncate    # wipe Postgres tables first
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys
from typing import Any, Dict, Iterable, List, Tuple

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from app.core.config import settings
from app.models.models import Base


TABLES_IN_ORDER: List[Tuple[str, List[str]]] = [
    (
        "users",
        ["id", "username", "password", "role", "name", "email", "created_at"],
    ),
    (
        "hotel_groups",
        ["id", "name", "description", "sop_files", "created_at"],
    ),
    (
        "properties",
        [
            "id", "name", "location", "region", "image", "last_audit_score",
            "next_audit_date", "status", "hotel_group_id", "created_at",
        ],
    ),
    (
        "audits",
        [
            "id", "property_id", "auditor_id", "reviewer_id", "hotel_group_id",
            "sop", "sop_files", "status", "priority", "notes", "scheduled_date",
            "overall_score", "cleanliness_score", "branding_score",
            "operational_score", "compliance_zone", "findings", "action_plan",
            "submitted_at", "reviewed_at", "created_at",
        ],
    ),
    (
        "audit_items",
        [
            "id", "audit_id", "category", "item", "score", "comments",
            "ai_analysis", "photos", "status",
        ],
    ),
]


def fetch_sqlite_rows(sqlite_path: str, table: str, columns: List[str]) -> List[Dict[str, Any]]:
    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"SQLite source not found: {sqlite_path}")
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info({table})")
    existing = {row[1] for row in cur.fetchall()}
    if not existing:
        conn.close()
        return []
    select_cols = [c for c in columns if c in existing]
    missing = [c for c in columns if c not in existing]
    cur.execute(f"SELECT {', '.join(select_cols)} FROM {table}")
    rows: List[Dict[str, Any]] = []
    for row in cur.fetchall():
        record = {col: row[col] for col in select_cols}
        for col in missing:
            record[col] = None
        rows.append(record)
    conn.close()
    return rows


SCHEMA = "hotel_audit"


def truncate_postgres(engine: Engine) -> None:
    with engine.begin() as conn:
        for table, _ in reversed(TABLES_IN_ORDER):
            conn.execute(text(f'TRUNCATE TABLE "{SCHEMA}"."{table}" RESTART IDENTITY CASCADE'))
        print("[PG] Truncated all target tables")


def insert_rows(engine: Engine, table: str, columns: List[str], rows: Iterable[Dict[str, Any]]) -> int:
    inserted = 0
    placeholders = ", ".join(f":{c}" for c in columns)
    col_list = ", ".join(f'"{c}"' for c in columns)
    stmt = text(
        f'INSERT INTO "{SCHEMA}"."{table}" ({col_list}) VALUES ({placeholders}) '
        f'ON CONFLICT (id) DO NOTHING'
    )
    with engine.begin() as conn:
        for row in rows:
            payload = {c: row.get(c) for c in columns}
            conn.execute(stmt, payload)
            inserted += 1
    return inserted


def resync_sequences(engine: Engine) -> None:
    sequenced_tables = [t for t, cols in TABLES_IN_ORDER if "id" in cols]
    with engine.begin() as conn:
        for table in sequenced_tables:
            conn.execute(
                text(
                    f"SELECT setval(pg_get_serial_sequence('\"{SCHEMA}\".\"{table}\"','id'), "
                    f'COALESCE((SELECT MAX(id) FROM "{SCHEMA}"."{table}"), 1), true)'
                )
            )
    print("[PG] Re-synced primary key sequences")


def main() -> int:
    parser = argparse.ArgumentParser(description="Migrate hotel_audit.db -> PostgreSQL")
    parser.add_argument(
        "--sqlite",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "hotel_audit.db"),
        help="Path to source SQLite database (default: python_backend/hotel_audit.db)",
    )
    parser.add_argument(
        "--postgres",
        default=settings.DATABASE_URL,
        help="Target PostgreSQL SQLAlchemy URL (default: settings.DATABASE_URL)",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Wipe target Postgres tables before copying (otherwise existing rows are preserved).",
    )
    args = parser.parse_args()

    if not args.postgres.startswith(("postgresql://", "postgresql+psycopg2://", "postgres://")):
        print(f"[ERROR] --postgres must be a PostgreSQL URL, got {args.postgres!r}", file=sys.stderr)
        return 2

    print(f"[SRC] SQLite : {args.sqlite}")
    print(f"[DST] Postgres: {args.postgres}")

    engine = create_engine(args.postgres, pool_pre_ping=True)

    print("[PG] Ensuring target schema exists...")
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        result = conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema='hotel_audit' AND table_name = 'audit_items'"
            )
        )
        if "ai_analysis" not in {r[0] for r in result}:
            conn.execute(text('ALTER TABLE "hotel_audit"."audit_items" ADD COLUMN ai_analysis TEXT'))
            print("[PG] Added missing ai_analysis column on audit_items")

    if args.truncate:
        truncate_postgres(engine)

    grand_total = 0
    for table, columns in TABLES_IN_ORDER:
        rows = fetch_sqlite_rows(args.sqlite, table, columns)
        if not rows:
            print(f"[--] {table}: no rows in source, skipping")
            continue
        n = insert_rows(engine, table, columns, rows)
        grand_total += n
        print(f"[OK] {table}: copied {n} rows")

    resync_sequences(engine)
    print(f"[DONE] Migration complete - {grand_total} rows transferred.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
