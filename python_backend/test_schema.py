import sys
sys.path.insert(0, r'c:\Users\user\Desktop\hoho\python_backend')

from app.schemas.schemas import AuditItemCreate
import inspect

print("AuditItemCreate fields:")
for name, field in AuditItemCreate.model_fields.items():
    print(f"  {name}: annotation={field.annotation}, default={field.default}, is_required={field.is_required()}")

# Try parsing without audit_id
try:
    item = AuditItemCreate(category="Test", item="Test Item")
    print(f"\nSuccess! Created item: {item.model_dump()}")
except Exception as e:
    print(f"\nFailed: {e}")

