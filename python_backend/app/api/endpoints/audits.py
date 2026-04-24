from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import Audit, AuditItem, Property, User
from app.schemas.schemas import (
    AuditResponse, AuditCreate, AuditUpdate,
    AuditItemResponse, AuditItemCreate, AuditItemUpdate,
    AuditAnalyzeResponse, SyncScoresResponse
)
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.get("/", response_model=List[AuditResponse])
async def get_audits(
    auditor_id: Optional[int] = Query(None),
    reviewer_id: Optional[int] = Query(None),
    property_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Audit)

        if auditor_id:
            query = query.filter(Audit.auditor_id == auditor_id)
        if reviewer_id:
            query = query.filter(Audit.reviewer_id == reviewer_id)
        if property_id:
            query = query.filter(Audit.property_id == property_id)
        if status:
            query = query.filter(Audit.status == status)

        audits = query.all()
        return audits
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching audits: {str(e)}")

@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).options(
        joinedload(Audit.property),
        joinedload(Audit.auditor),
        joinedload(Audit.reviewer),
        joinedload(Audit.audit_items)
    ).filter(Audit.id == audit_id).first()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit

@router.post("/", response_model=AuditResponse)
async def create_audit(audit: AuditCreate, db: Session = Depends(get_db)):
    # Validate that property exists
    property = db.query(Property).filter(Property.id == audit.property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail=f"Property with id {audit.property_id} not found")
    
    # Validate that auditor exists (if provided)
    if audit.auditor_id:
        auditor = db.query(User).filter(User.id == audit.auditor_id).first()
        if not auditor:
            raise HTTPException(status_code=404, detail=f"Auditor with id {audit.auditor_id} not found")
    
    # Validate that reviewer exists (if provided)
    if audit.reviewer_id:
        reviewer = db.query(User).filter(User.id == audit.reviewer_id).first()
        if not reviewer:
            raise HTTPException(status_code=404, detail=f"Reviewer with id {audit.reviewer_id} not found")
    
    # Validate that hotel group exists (if provided)
    if audit.hotel_group_id:
        from app.models.models import HotelGroup
        hotel_group = db.query(HotelGroup).filter(HotelGroup.id == audit.hotel_group_id).first()
        if not hotel_group:
            raise HTTPException(status_code=404, detail=f"Hotel group with id {audit.hotel_group_id} not found")
    
    try:
        db_audit = Audit(**audit.model_dump(by_alias=False))
        db.add(db_audit)
        db.commit()
        db.refresh(db_audit)
        return db_audit
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating audit: {str(e)}")

@router.patch("/{audit_id}", response_model=AuditResponse)
async def update_audit(audit_id: int, audit_update: AuditUpdate, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    update_data = audit_update.model_dump(exclude_unset=True, by_alias=False)
    for field, value in update_data.items():
        setattr(audit, field, value)

    db.commit()
    db.refresh(audit)
    return audit

@router.get("/{audit_id}/items", response_model=List[AuditItemResponse])
async def get_audit_items(audit_id: int, db: Session = Depends(get_db)):
    items = db.query(AuditItem).filter(AuditItem.audit_id == audit_id).all()
    return items

@router.post("/{audit_id}/items", response_model=AuditItemResponse)
async def create_audit_item(audit_id: int, item: AuditItemCreate, db: Session = Depends(get_db)):
    # Verify audit exists
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    item_data = item.dict()
    item_data["audit_id"] = audit_id
    db_item = AuditItem(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.patch("/items/{item_id}", response_model=AuditItemResponse)
async def update_audit_item(item_id: int, item_update: AuditItemUpdate, db: Session = Depends(get_db)):
    item = db.query(AuditItem).filter(AuditItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Audit item not found")

    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


# Helper function to recalculate audit scores from individual item scores
async def _recalculate_audit_scores(audit_id: int, db: Session) -> Optional[Audit]:
    audit_items = db.query(AuditItem).filter(AuditItem.audit_id == audit_id).all()
    items_with_scores = [item for item in audit_items if item.score is not None]

    if not items_with_scores:
        return None

    # Calculate average scores by category
    category_scores = {
        "cleanliness": [],
        "branding": [],
        "operational": []
    }

    for item in items_with_scores:
        score = item.score
        category = item.category or "General"
        cat_lower = category.lower()

        if (category == "Cleanliness" or
            category == "Room Experience & Amenities" or
            "clean" in cat_lower or "maintenance" in cat_lower or "hygiene" in cat_lower):
            category_scores["cleanliness"].append(score)
        elif (category == "Branding" or
              category == "Staff Interaction & Service" or
              "brand" in cat_lower or "signage" in cat_lower or "logo" in cat_lower or "uniform" in cat_lower):
            category_scores["branding"].append(score)
        else:
            category_scores["operational"].append(score)

    # Calculate category averages (convert 0-5 scale to 0-100)
    cleanliness_score = round((sum(category_scores["cleanliness"]) / len(category_scores["cleanliness"])) * 20) if category_scores["cleanliness"] else 0
    branding_score = round((sum(category_scores["branding"]) / len(category_scores["branding"])) * 20) if category_scores["branding"] else 0
    operational_score = round((sum(category_scores["operational"]) / len(category_scores["operational"])) * 20) if category_scores["operational"] else 0

    # Calculate overall score as weighted average
    overall_score = round((cleanliness_score * 0.4 + branding_score * 0.3 + operational_score * 0.3))

    # Determine compliance zone
    compliance_zone = "red"
    if overall_score >= 85:
        compliance_zone = "green"
    elif overall_score >= 70:
        compliance_zone = "amber"

    # Update the audit
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if audit:
        audit.overall_score = overall_score
        audit.cleanliness_score = cleanliness_score
        audit.branding_score = branding_score
        audit.operational_score = operational_score
        audit.compliance_zone = compliance_zone
        db.commit()
        db.refresh(audit)
    return audit


@router.post("/{audit_id}/analyze", response_model=AuditAnalyzeResponse)
async def analyze_audit(audit_id: int, db: Session = Depends(get_db)):
    """AI Analysis endpoint for entire audit - calculates from individual scores"""
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    audit_items = db.query(AuditItem).filter(AuditItem.audit_id == audit_id).all()

    # Recalculate scores from individual item scores
    updated_audit = await _recalculate_audit_scores(audit_id, db)

    # Also generate AI insights for findings and action plans if API is available
    try:
        audit_dict = {
            "property_id": audit.property_id,
            "overall_score": audit.overall_score,
            "cleanliness_score": audit.cleanliness_score,
            "branding_score": audit.branding_score,
            "operational_score": audit.operational_score,
            "compliance_zone": audit.compliance_zone,
        }
        items_dict = [
            {
                "id": item.id,
                "category": item.category,
                "item": item.item,
                "score": item.score,
                "comments": item.comments,
                "photos": item.photos,
                "status": item.status,
            }
            for item in audit_items
        ]
        insights = await gemini_service.generate_audit_insights(audit_dict, items_dict)

        # Update with AI insights while keeping calculated scores
        if audit:
            audit.findings = insights.get("findings")
            audit.action_plan = insights.get("actionPlan")
            db.commit()
            db.refresh(audit)

        return {
            "audit": updated_audit,
            "calculatedFromItems": True,
            "aiInsights": insights,
        }
    except Exception as ai_error:
        print(f"AI insights unavailable, using calculated scores only: {ai_error}")
        return {
            "audit": updated_audit,
            "calculatedFromItems": True,
            "aiInsightsError": str(ai_error),
        }


@router.post("/{audit_id}/sync-scores", response_model=SyncScoresResponse)
async def sync_audit_scores(audit_id: int, db: Session = Depends(get_db)):
    """Sync audit scores - ensures all dashboards show consistent real-time scores"""
    updated_audit = await _recalculate_audit_scores(audit_id, db)

    if not updated_audit:
        raise HTTPException(status_code=400, detail="No scored items found or audit not found")

    return {
        "success": True,
        "scores": {
            "overall": updated_audit.overall_score,
            "cleanliness": updated_audit.cleanliness_score,
            "branding": updated_audit.branding_score,
            "operational": updated_audit.operational_score,
            "complianceZone": updated_audit.compliance_zone,
        },
        "audit": updated_audit,
    }
