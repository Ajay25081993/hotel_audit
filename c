"""
Fix script: Update properties to link them to hotel groups
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/python_backend')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from python_backend.app.core.config import settings
from python_backend.app.models.models import Property, HotelGroup

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

# Get hotel groups
groups = db.query(HotelGroup).all()
group_map = {g.name.lower(): g.id for g in groups}
print(f"Found {len(groups)} hotel groups:")
for g in groups:
    print(f"  id={g.id} name={g.name}")

# Mapping of property names to hotel group names
property_to_group = {
    'taj': 'taj hotels',
    'marriott': 'marriott',
    'hilton': 'hilton hotels',
    'itc': 'itc hotels',
    'hyatt': 'hyatt hotels',
    'oberoi': 'oberoi hotels',
}

properties = db.query(Property).all()
print(f"\nFound {len(properties)} properties:")
updated = 0
for p in properties:
    # Determine group from property name
    prop_name_lower = p.name.lower()
    group_name = None
    for keyword, gname in property_to_group.items():
        if keyword in prop_name_lower:
            group_name = gname
            break
    
    if group_name and group_name in group_map:
        p.hotel_group_id = group_map[group_name]
        updated += 1
        print(f"  UPDATED id={p.id} name={p.name} -> hotel_group_id={p.hotel_group_id}")
    else:
        print(f"  id={p.id} name={p.name} hotel_group_id={p.hotel_group_id} (no group matched)")

db.commit()
print(f"\nCommitted: {updated} properties updated")
