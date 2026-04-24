# Fix Missing Audit Item Analysis Endpoints

## Problem
Frontend calls `POST /api/audit-items/19/analyze` → 404 Not Found because Python backend (port 8000) doesn't have this endpoint. The endpoint only exists in the Express server (port 5000), but Vite proxies `/api` to port 8000.

## Missing Endpoints in Python Backend
- `POST /api/audit-items/{item_id}/analyze`
- `POST /api/audits/{audit_id}/analyze`
- `POST /api/audits/{audit_id}/sync-scores`

## Implementation Steps
- [x] 1. Search and analyze codebase
- [x] 2. Read relevant files
- [x] 3. Add schemas in `python_backend/app/schemas/schemas.py`
- [x] 4. Enhance `python_backend/app/services/gemini_service.py`
- [x] 5. Add endpoints to `python_backend/app/api/endpoints/audits.py`
- [x] 6. Create `python_backend/app/api/endpoints/audit_items.py`
- [x] 7. Register router in `python_backend/app/api/main.py`
- [x] 8. Test endpoints

