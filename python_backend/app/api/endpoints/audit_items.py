from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AuditItem, Audit
from app.schemas.schemas import (
    AuditItemAnalyzeRequest, AuditItemAnalyzeResponse,
    AuditItemUpdate, AuditItemResponse
)
from app.services.gemini_service import gemini_service

router = APIRouter()


def _recalculate_audit_scores(audit_id: int, db: Session):
    """Recalculate overall audit scores from individual item scores."""
    audit_items = db.query(AuditItem).filter(AuditItem.audit_id == audit_id).all()
    items_with_scores = [it for it in audit_items if it.score is not None]

    if not items_with_scores:
        return None

    from collections import defaultdict
    category_scores = defaultdict(list)

    for it in items_with_scores:
        cat = it.category or "General"
        if cat == "Cleanliness" or "clean" in cat.lower() or "maintenance" in cat.lower() or "hygiene" in cat.lower():
            category_scores["cleanliness"].append(it.score)
        elif cat == "Branding" or "brand" in cat.lower() or "signage" in cat.lower() or "logo" in cat.lower() or "uniform" in cat.lower():
            category_scores["branding"].append(it.score)
        else:
            category_scores["operational"].append(it.score)

    cleanliness_score = round(sum(category_scores["cleanliness"]) / len(category_scores["cleanliness"]) * 20) if category_scores["cleanliness"] else 0
    branding_score = round(sum(category_scores["branding"]) / len(category_scores["branding"]) * 20) if category_scores["branding"] else 0
    operational_score = round(sum(category_scores["operational"]) / len(category_scores["operational"]) * 20) if category_scores["operational"] else 0

    overall_score = round(cleanliness_score * 0.4 + branding_score * 0.3 + operational_score * 0.3)

    if overall_score >= 85:
        compliance_zone = "green"
    elif overall_score >= 70:
        compliance_zone = "amber"
    else:
        compliance_zone = "red"

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


@router.post("/{item_id}/analyze", response_model=AuditItemAnalyzeResponse)
async def analyze_audit_item(
    item_id: int,
    request: AuditItemAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """AI Analysis endpoint for individual audit item.

    Generates an AI score (0-5) and detailed analysis based on the item's
    comments, photos, and checklist details.
    """
    # Verify the audit item exists
    audit_item = db.query(AuditItem).filter(AuditItem.id == item_id).first()
    if not audit_item:
        raise HTTPException(status_code=404, detail="Audit item not found")

    # Also verify the audit exists (optional safety check)
    audit = db.query(Audit).filter(Audit.id == request.auditId).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # Build item dict for the Gemini service
    item_dict = {
        "id": audit_item.id,
        "category": audit_item.category,
        "item": audit_item.item,
        "comments": audit_item.comments,
        "photos": audit_item.photos,
        "status": audit_item.status,
        "score": audit_item.score,
    }

    checklist_details = None
    if request.checklistDetails:
        checklist_details = {
            "description": request.checklistDetails.description,
            "weight": request.checklistDetails.weight,
            "maxScore": request.checklistDetails.maxScore,
        }

    try:
        analysis = await gemini_service.analyze_individual_item(item_dict, checklist_details)

        # Persist AI analysis back to the item
        audit_item.ai_analysis = analysis["aiAnalysis"]
        db.commit()

        return {
            "itemId": item_id,
            "score": analysis["score"],
            "aiAnalysis": analysis["aiAnalysis"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze audit item: {str(e)}")


@router.patch("/{item_id}", response_model=AuditItemResponse)
async def update_audit_item_direct(
    item_id: int,
    item_update: AuditItemUpdate,
    db: Session = Depends(get_db)
):
    """Update an audit item directly (used by reviewer dashboard for score overrides).

    Accepts fields: score, comments, ai_analysis, photos, status.
    If auditId is provided in the request body, recalculates overall audit scores.
    """
    item = db.query(AuditItem).filter(AuditItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Audit item not found")

    # Handle the frontend field name "aiAnalysis" (camelCase) by mapping it
    update_data = item_update.model_dump(exclude_unset=True, by_alias=False)

    for field, value in update_data.items():
        if field == "ai_analysis" and value is not None:
            setattr(item, "ai_analysis", value)
        elif hasattr(item, field):
            setattr(item, field, value)

    db.commit()
    db.refresh(item)

    # Recalculate audit scores if audit_id was provided
    if item_update.audit_id:
        _recalculate_audit_scores(item_update.audit_id, db)

    return item

