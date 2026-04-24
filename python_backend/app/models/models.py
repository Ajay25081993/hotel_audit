from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin, auditor, reviewer, corporate, hotelgm
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    audits_assigned = relationship("Audit", foreign_keys="[Audit.auditor_id]", back_populates="auditor")
    audits_reviewed = relationship("Audit", foreign_keys="[Audit.reviewer_id]", back_populates="reviewer")

class HotelGroup(Base):
    __tablename__ = "hotel_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    sop_files = Column(String)  # JSON string of SOP file metadata
    created_at = Column(DateTime, default=datetime.utcnow)

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    region = Column(String, nullable=False)
    image = Column(String)
    last_audit_score = Column(Integer)
    next_audit_date = Column(DateTime)
    status = Column(String, default="green")  # green, amber, red
    hotel_group_id = Column(Integer, ForeignKey("hotel_groups.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    audits = relationship("Audit", back_populates="property")

class Audit(Base):
    __tablename__ = "audits"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    auditor_id = Column(Integer, ForeignKey("users.id"))
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    hotel_group_id = Column(Integer, ForeignKey("hotel_groups.id"))
    sop = Column(Text)
    sop_files = Column(Text)  # JSON string
    status = Column(String, default="scheduled")  # scheduled, in_progress, submitted, reviewed, completed
    priority = Column(String, default="medium")  # low, medium, high
    notes = Column(Text)
    scheduled_date = Column(DateTime)
    overall_score = Column(Integer)
    cleanliness_score = Column(Integer)
    branding_score = Column(Integer)
    operational_score = Column(Integer)
    compliance_zone = Column(String)  # green, amber, red
    findings = Column(JSON)
    action_plan = Column(JSON)
    submitted_at = Column(DateTime)
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    property = relationship("Property", back_populates="audits")
    auditor = relationship("User", foreign_keys=[auditor_id], back_populates="audits_assigned")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="audits_reviewed")
    audit_items = relationship("AuditItem", back_populates="audit")

class AuditItem(Base):
    __tablename__ = "audit_items"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=False)
    category = Column(String, nullable=False)
    item = Column(String, nullable=False)
    score = Column(Integer)
    comments = Column(Text)
    ai_analysis = Column(Text)
    photos = Column(JSON)
    status = Column(String, default="pending")

    # Relationships
    audit = relationship("Audit", back_populates="audit_items")
