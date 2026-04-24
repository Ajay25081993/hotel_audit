#!/usr/bin/env python3
"""
Database initialization script
Creates tables and seeds initial data
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, User, Property, Audit, HotelGroup
from app.core.security import get_password_hash
from app.core.config import settings
from datetime import datetime, timedelta
import sys

def create_tables():
    """Create all database tables"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created successfully")
    return engine

def seed_initial_data(engine):
    """Seed initial data for testing"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create or update sample users (passwords match frontend demo credentials)
        users_data = [
            {
                "username": "admin",
                "password": get_password_hash("password"),
                "role": "admin",
                "name": "System Administrator",
                "email": "admin@hotel-audit.com"
            },
            {
                "username": "auditor",
                "password": get_password_hash("password"),
                "role": "auditor",
                "name": "Sarah Johnson",
                "email": "sarah.johnson@hotel-audit.com"
            },
            {
                "username": "reviewer",
                "password": get_password_hash("password"),
                "role": "reviewer",
                "name": "Lisa Thompson",
                "email": "lisa.thompson@hotel-audit.com"
            },
            {
                "username": "corporate",
                "password": get_password_hash("password"),
                "role": "corporate",
                "name": "Raj Patel",
                "email": "raj.patel@hotel-audit.com"
            },
            {
                "username": "hotelgm",
                "password": get_password_hash("password"),
                "role": "hotelgm",
                "name": "Priya Sharma",
                "email": "priya.sharma@tajpalace.com"
            },
            {
                "username": "auditor2",
                "password": get_password_hash("password"),
                "role": "auditor",
                "name": "Michael Chen",
                "email": "michael.chen@hotel-audit.com"
            },
            {
                "username": "reviewer2",
                "password": get_password_hash("password"),
                "role": "reviewer",
                "name": "Emma Wilson",
                "email": "emma.wilson@hotel-audit.com"
            },
            {
                "username": "auditor3",
                "password": get_password_hash("password"),
                "role": "auditor",
                "name": "Deepak Kumar",
                "email": "deepak.kumar@hotel-audit.com"
            }
        ]
        
        for user_data in users_data:
            existing = db.query(User).filter(User.username == user_data["username"]).first()
            if existing:
                existing.password = user_data["password"]
                existing.role = user_data["role"]
                existing.name = user_data["name"]
                existing.email = user_data["email"]
            else:
                user = User(**user_data)
                db.add(user)
        
        db.commit()
        print("[OK] Sample users created/updated")
        
        # Create sample hotel groups
        hotel_groups_data = [
            {
                "name": "Taj Hotels",
                "description": "Luxury hotel chain across India",
            },
            {
                "name": "Oberoi Group",
                "description": "Premium hospitality group",
            }
        ]
        
        hotel_groups = []
        for group_data in hotel_groups_data:
            existing = db.query(HotelGroup).filter(HotelGroup.name == group_data["name"]).first()
            if existing:
                hotel_groups.append(existing)
            else:
                group = HotelGroup(**group_data)
                db.add(group)
                db.flush()
                hotel_groups.append(group)
        
        db.commit()
        print("[OK] Sample hotel groups created")
        
        # Create sample properties
        properties_data = [
            {
                "name": "Taj Palace, New Delhi",
                "location": "New Delhi",
                "region": "North India",
                "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                "last_audit_score": 85,
                "next_audit_date": datetime.now() + timedelta(days=30),
                "status": "green",
                "hotel_group_id": hotel_groups[0].id
            },
            {
                "name": "Taj Gateway, Mumbai",
                "location": "Mumbai",
                "region": "West India",
                "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                "last_audit_score": 78,
                "next_audit_date": datetime.now() + timedelta(days=15),
                "status": "amber",
                "hotel_group_id": hotel_groups[0].id
            },
            {
                "name": "Taj Coromandel, Chennai",
                "location": "Chennai",
                "region": "South India",
                "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                "last_audit_score": 92,
                "next_audit_date": datetime.now() + timedelta(days=45),
                "status": "green",
                "hotel_group_id": hotel_groups[0].id
            },
            {
                "name": "Taj Bengal, Kolkata",
                "location": "Kolkata",
                "region": "East India",
                "image": "https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                "last_audit_score": 88,
                "next_audit_date": datetime.now() + timedelta(days=20),
                "status": "green",
                "hotel_group_id": hotel_groups[0].id
            }
        ]
        
        for prop_data in properties_data:
            existing = db.query(Property).filter(Property.name == prop_data["name"]).first()
            if existing:
                existing.location = prop_data["location"]
                existing.region = prop_data["region"]
                existing.image = prop_data["image"]
                existing.last_audit_score = prop_data["last_audit_score"]
                existing.next_audit_date = prop_data["next_audit_date"]
                existing.status = prop_data["status"]
                existing.hotel_group_id = prop_data["hotel_group_id"]
            else:
                property = Property(**prop_data)
                db.add(property)
        
        db.commit()
        print("[OK] Sample properties created/updated")
        
        # Create a sample audit
        audit = Audit(
            property_id=1,  # Taj Palace
            auditor_id=2,   # Sarah Johnson
            reviewer_id=4,  # Lisa Thompson
            status="in_progress",
            overall_score=85,
            cleanliness_score=90,
            branding_score=82,
            operational_score=83,
            compliance_zone="green"
        )
        db.add(audit)
        db.commit()
        
        print("[OK] Sample audit created")
        print("\n[DONE] Database initialization completed successfully!")
        print("\nSample login credentials:")
        print("Admin: admin / password")
        print("Auditor: auditor / password")
        print("Reviewer: reviewer / password")
        print("Corporate: corporate / password")
        print("Hotel GM: hotelgm / password")
        
    except Exception as e:
        print(f"[ERROR] Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    try:
        print("[START] Initializing database...")
        engine = create_tables()
        seed_initial_data(engine)
        
    except Exception as e:
        print(f"[ERROR] Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
