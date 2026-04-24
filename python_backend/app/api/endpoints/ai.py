from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.core.database import get_db
from app.models.models import Audit, AuditItem
from app.schemas.schemas import (
    PhotoAnalysisRequest, PhotoAnalysisResponse,
    ReportGenerationRequest, ReportGenerationResponse,
    ScoreSuggestionRequest, ScoreSuggestionResponse
)
from app.services.gemini_service import gemini_service
from app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/analyze-photo", response_model=PhotoAnalysisResponse)
async def analyze_photo(
    request: PhotoAnalysisRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Analyze a photo using Gemini Vision AI"""
    try:
        analysis = await gemini_service.analyze_audit_photo(
            request.image_data,
            request.context
        )
        
        return PhotoAnalysisResponse(
            analysis=analysis,
            suggested_score=analysis.get("suggested_score", 3),
            confidence=0.85
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze photo: {str(e)}")

@router.post("/suggest-score", response_model=ScoreSuggestionResponse)
async def suggest_score(
    request: ScoreSuggestionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get AI-suggested score for an audit item"""
    try:
        suggestion = await gemini_service.suggest_audit_score(
            request.item_description,
            request.photos,
            request.comments
        )
        
        return ScoreSuggestionResponse(
            suggested_score=suggestion.get("suggested_score", 3),
            reasoning=suggestion.get("reasoning", "Analysis based on provided information"),
            improvement_suggestions=suggestion.get("improvement_suggestions", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to suggest score: {str(e)}")

@router.post("/generate-report/{audit_id}", response_model=ReportGenerationResponse)
async def generate_audit_report(
    audit_id: int,
    background_tasks: BackgroundTasks,
    include_action_plan: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate comprehensive audit report using Gemini AI"""
    # Get audit with all related data
    audit = db.query(Audit).options(
        joinedload(Audit.property),
        joinedload(Audit.auditor),
        joinedload(Audit.reviewer),
        joinedload(Audit.audit_items)
    ).filter(Audit.id == audit_id).first()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    # Check permissions
    if current_user.role not in ["admin", "reviewer"] and audit.auditor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Prepare audit data for AI analysis
        audit_data = {
            "property_name": audit.property.name if audit.property else "Unknown",
            "location": audit.property.location if audit.property else "Unknown",
            "audit_date": audit.created_at.isoformat() if audit.created_at else None,
            "auditor_name": audit.auditor.name if audit.auditor else "Unknown",
            "overall_score": audit.overall_score,
            "cleanliness_score": audit.cleanliness_score,
            "branding_score": audit.branding_score,
            "operational_score": audit.operational_score,
            "audit_items": [
                {
                    "category": item.category,
                    "item": item.item,
                    "score": item.score,
                    "comments": item.comments,
                    "photos_count": len(item.photos) if item.photos else 0
                }
                for item in audit.audit_items
            ]
        }
        
        # Generate AI report
        ai_report = await gemini_service.generate_audit_report(audit_data)
        
        # Generate action plan if requested
        ai_action_plan = None
        if include_action_plan and audit.audit_items:
            findings = [
                {
                    "category": item.category,
                    "issue": item.item,
                    "score": item.score,
                    "comments": item.comments
                }
                for item in audit.audit_items if item.score and item.score < 4
            ]
            
            if findings:
                ai_action_plan = await gemini_service.generate_action_plan(
                    findings, 
                    "luxury hotel"
                )
        
        # Generate insights
        ai_insights = await gemini_service.generate_compliance_insights(audit_data)
        
        # Store AI results in database
        background_tasks.add_task(
            update_audit_ai_data,
            db, audit_id, ai_report, ai_action_plan, ai_insights
        )
        
        return ReportGenerationResponse(
            report=ai_report,
            action_plan=ai_action_plan,
            insights=ai_insights
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.post("/update-item-ai/{item_id}")
async def update_audit_item_ai(
    item_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update audit item with AI analysis and suggestions"""
    item = db.query(AuditItem).filter(AuditItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Audit item not found")
    
    try:
        # Get AI score suggestion
        score_suggestion = await gemini_service.suggest_audit_score(
            item.item,
            item.photos or [],
            item.comments or ""
        )
        
        # Analyze photos if available
        ai_analysis = {}
        if item.photos:
            for i, photo in enumerate(item.photos):
                if photo:  # Assuming base64 encoded images
                    photo_analysis = await gemini_service.analyze_audit_photo(
                        photo,
                        f"{item.category}: {item.item}"
                    )
                    ai_analysis[f"photo_{i+1}"] = photo_analysis
        
        # Update item with AI data
        background_tasks.add_task(
            update_audit_item_ai_data,
            db, item_id, score_suggestion, ai_analysis
        )
        
        return {
            "message": "AI analysis queued successfully",
            "suggested_score": score_suggestion.get("suggested_score"),
            "ai_analysis": ai_analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update item AI: {str(e)}")

@router.get("/insights/{audit_id}")
async def get_audit_insights(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get AI-generated insights for an audit"""
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    if audit.ai_insights:
        return audit.ai_insights
    
    # Generate insights if not available
    try:
        audit_data = {
            "audit_id": audit.id,
            "property_name": audit.property.name if audit.property else "Unknown",
            "overall_score": audit.overall_score,
            "scores": {
                "cleanliness": audit.cleanliness_score,
                "branding": audit.branding_score,
                "operational": audit.operational_score
            },
            "compliance_zone": audit.compliance_zone,
            "findings": audit.findings
        }
        
        insights = await gemini_service.generate_compliance_insights(audit_data)
        
        # Update audit with insights
        audit.ai_insights = insights
        db.commit()
        
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

# Background task functions
def update_audit_ai_data(db: Session, audit_id: int, ai_report: dict, ai_action_plan: dict, ai_insights: dict):
    """Background task to update audit with AI-generated data"""
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if audit:
        audit.ai_report = ai_report
        if ai_action_plan:
            audit.action_plan = ai_action_plan
        audit.ai_insights = ai_insights
        db.commit()

def update_audit_item_ai_data(db: Session, item_id: int, score_suggestion: dict, ai_analysis: dict):
    """Background task to update audit item with AI data"""
    item = db.query(AuditItem).filter(AuditItem.id == item_id).first()
    if item:
        item.ai_suggested_score = score_suggestion.get("suggested_score")
        item.ai_analysis = {
            "score_suggestion": score_suggestion,
            "photo_analysis": ai_analysis
        }
        db.commit()
