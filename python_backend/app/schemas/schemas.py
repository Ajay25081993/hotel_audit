from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    auditor = "auditor"
    reviewer = "reviewer"
    corporate = "corporate"
    hotelgm = "hotelgm"

class ComplianceZone(str, Enum):
    green = "green"
    amber = "amber"
    red = "red"

class AuditStatus(str, Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    submitted = "submitted"
    reviewed = "reviewed"
    approved = "approved"
    completed = "completed"

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

# User schemas
class UserBase(BaseModel):
    username: str
    name: str
    email: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

# Property schemas
class PropertyBase(BaseModel):
    name: str
    location: str
    region: str
    image: Optional[str] = None
    last_audit_score: Optional[int] = None
    next_audit_date: Optional[datetime] = None
    status: Optional[str] = "green"

class PropertyCreate(PropertyBase):
    pass

class PropertyResponse(PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hotel_group_id: Optional[int] = None
    created_at: datetime


# Audit schemas
class AuditBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    property_id: int = Field(alias="propertyId")
    auditor_id: Optional[int] = Field(default=None, alias="auditorId")
    reviewer_id: Optional[int] = Field(default=None, alias="reviewerId")
    status: AuditStatus = AuditStatus.scheduled

class AuditCreate(AuditBase):
    hotel_group_id: Optional[int] = Field(default=None, alias="hotelGroupId")
    sop: Optional[str] = None
    sop_files: Optional[str] = Field(default=None, alias="sopFiles")
    priority: Optional[str] = "medium"
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = Field(default=None, alias="scheduledDate")

class AuditUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Optional[AuditStatus] = None
    reviewer_id: Optional[int] = Field(default=None, alias="reviewerId")
    overall_score: Optional[int] = None
    cleanliness_score: Optional[int] = None
    branding_score: Optional[int] = None
    operational_score: Optional[int] = None
    compliance_zone: Optional[ComplianceZone] = None
    findings: Optional[Any] = None
    action_plan: Optional[Any] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = Field(default=None, alias="scheduledDate")

class AuditResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: int
    property_id: int = Field(alias="propertyId")
    auditor_id: Optional[int] = Field(default=None, alias="auditorId")
    reviewer_id: Optional[int] = Field(default=None, alias="reviewerId")
    hotel_group_id: Optional[int] = Field(default=None, alias="hotelGroupId")
    sop: Optional[str] = None
    sop_files: Optional[str] = Field(default=None, alias="sopFiles")
    status: AuditStatus = AuditStatus.scheduled
    priority: Optional[str] = "medium"
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = Field(default=None, alias="scheduledDate")
    overall_score: Optional[int] = None
    cleanliness_score: Optional[int] = None
    branding_score: Optional[int] = None
    operational_score: Optional[int] = None
    compliance_zone: Optional[ComplianceZone] = None
    findings: Optional[Any] = None
    action_plan: Optional[Any] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

# Audit Item schemas
class AuditItemBase(BaseModel):
    audit_id: int
    category: str
    item: str
    score: Optional[int] = None
    comments: Optional[str] = None
    ai_analysis: Optional[str] = None
    photos: Optional[Any] = None
    status: Optional[str] = "pending"

class AuditItemCreate(AuditItemBase):
    audit_id: Optional[int] = None

class AuditItemUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    score: Optional[int] = None
    comments: Optional[str] = None
    ai_analysis: Optional[str] = None
    photos: Optional[Any] = None
    status: Optional[str] = None
    audit_id: Optional[int] = Field(default=None, alias="auditId")

class AuditItemResponse(AuditItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

# AI Integration schemas
class PhotoAnalysisRequest(BaseModel):
    image_base64: str
    context: str
    audit_item_id: Optional[int] = None

class PhotoAnalysisResponse(BaseModel):
    compliance_status: str
    confidence_score: float
    observations: List[str]
    suggestions: List[str]
    ai_score: Optional[float] = None

class ReportGenerationRequest(BaseModel):
    audit_id: int

class ReportGenerationResponse(BaseModel):
    summary: str
    key_findings: List[str]
    recommendations: List[str]
    compliance_overview: Dict[str, Any]
    ai_insights: Dict[str, Any]

class ScoreSuggestionRequest(BaseModel):
    audit_item_id: int
    observations: str

class ScoreSuggestionResponse(BaseModel):
    suggested_score: float
    confidence: float
    reasoning: str
    compliance_zone: ComplianceZone

# Audit Item Analysis schemas
class ChecklistDetails(BaseModel):
    description: Optional[str] = ""
    weight: Optional[int] = 1
    maxScore: Optional[int] = 5

class AuditItemAnalyzeRequest(BaseModel):
    auditId: int
    checklistDetails: Optional[ChecklistDetails] = None

class AuditItemAnalyzeResponse(BaseModel):
    itemId: int
    score: int
    aiAnalysis: str

class AuditAnalyzeResponse(BaseModel):
    audit: Optional[AuditResponse] = None
    calculatedFromItems: bool = True
    aiInsights: Optional[Any] = None
    aiInsightsError: Optional[str] = None

class SyncScoresResponse(BaseModel):
    success: bool
    scores: Optional[dict] = None
    audit: Optional[AuditResponse] = None
