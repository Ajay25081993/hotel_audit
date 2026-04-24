#!/usr/bin/env python3
"""Add hotel_group_id column to properties table."""
import psycopg2

def main():
    conn = psycopg2.connect(
        host="localhost",
        database="hotel_audit",
        user="hotelaudit",
        password="password123"
    )
    cur = conn.cursor()
    cur.execute("""
        ALTER TABLE properties
        ADD COLUMN IF NOT EXISTS hotel_group_id INTEGER REFERENCES hotel_groups(id);
    """)
    conn.commit()
    print("[OK] Added hotel_group_id column to properties table")
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()

