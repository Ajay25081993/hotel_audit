from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.api.endpoints import auth, properties, audits, ai, audit_items
from app.core.database import get_db
from app.models.models import User, HotelGroup

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(audits.router, prefix="/audits", tags=["audits"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(audit_items.router, prefix="/audit-items", tags=["audit_items"])

@api_router.get("/users")
async def get_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
        for user in users
    ]

@api_router.get("/hotel-groups")
async def get_hotel_groups(db: Session = Depends(get_db)):
    groups = db.query(HotelGroup).all()
    return [
        {
            "id": g.id,
            "name": g.name,
            "description": g.description,
            "sopFiles": g.sop_files,
            "created_at": g.created_at.isoformat() if g.created_at else None,
        }
        for g in groups
    ]
