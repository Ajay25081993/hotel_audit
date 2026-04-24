import sys
sys.path.insert(0, "c:/Users/user/Desktop/hoho/python_backend")
from main import app

print("FastAPI app import OK")
audit_routes = []
for r in app.routes:
    if hasattr(r, 'path') and 'audit' in r.path:
        audit_routes.append(r.path)

print("Audit-related routes:")
for p in sorted(set(audit_routes)):
    print(f"  {p}")

