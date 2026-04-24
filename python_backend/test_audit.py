from app.core.database import SessionLocal
from app.models.models import Audit
from app.schemas.schemas import AuditResponse
from typing import List
import json

db = SessionLocal()
try:
    audits = db.query(Audit).all()
    print(f"Found {len(audits)} audits")
    for audit in audits:
        print(f"  Audit {audit.id}: Property {audit.property_id}, Status {audit.status}")
        # Try to convert to schema
        try:
            response_data = AuditResponse.model_validate(audit, from_attributes=True)
            print(f"    Successfully converted to AuditResponse")
        except Exception as e:
            print(f"    Error converting to AuditResponse: {e}")
finally:
    db.close()
