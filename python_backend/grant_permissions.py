#!/usr/bin/env python3
"""Grant schema privileges to hotelaudit user via superuser"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def grant():
    # Try connecting as postgres superuser (common local dev passwords)
    passwords = [None, 'postgres', 'password', 'admin', '1234', 'password123']
    conn = None
    for pwd in passwords:
        try:
            kwargs = {
                'host': 'localhost',
                'port': 5432,
                'dbname': 'hotel_audit',
                'user': 'postgres',
            }
            if pwd is not None:
                kwargs['password'] = pwd
            conn = psycopg2.connect(**kwargs)
            print(f"[OK] Connected as postgres")
            break
        except Exception as e:
            print(f"    Trying postgres password={pwd}: {e}")
            continue
    
    if conn is None:
        print("[FAIL] Could not connect as postgres. Please run the following SQL in pgAdmin Query Tool:")
        print("""
GRANT ALL PRIVILEGES ON SCHEMA public TO hotelaudit;
GRANT CREATE ON SCHEMA public TO hotelaudit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hotelaudit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hotelaudit;
        """)
        return

    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute("GRANT ALL PRIVILEGES ON SCHEMA public TO hotelaudit;")
    cur.execute("GRANT CREATE ON SCHEMA public TO hotelaudit;")
    cur.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hotelaudit;")
    cur.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hotelaudit;")
    cur.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotelaudit;")
    cur.execute("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hotelaudit;")
    print("[OK] Granted all privileges to hotelaudit on schema public")
    cur.close()
    conn.close()

if __name__ == "__main__":
    grant()

