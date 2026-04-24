#!/usr/bin/env python3
"""Apply database permissions using psycopg2"""
import psycopg2

def apply_permissions():
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="hotel_audit",
        user="hotelaudit",
        password="password123"
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    cur.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotelaudit;")
    cur.execute("GRANT ALL PRIVILEGES ON SCHEMA public TO hotelaudit;")
    cur.execute("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hotelaudit;")
    cur.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hotelaudit;")
    cur.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hotelaudit;")
    
    print("[OK] Permissions applied successfully")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    apply_permissions()

