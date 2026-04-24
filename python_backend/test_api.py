import requests
try:
    # Test hotel groups
    r = requests.get('http://localhost:8000/api/hotel-groups')
    print('=== Hotel Groups ===')
    print('Status:', r.status_code)
    for g in r.json():
        print(f"  id={g['id']} name={g['name']}")

    # Test properties
    r = requests.get('http://localhost:8000/api/properties')
    print('\n=== Properties ===')
    print('Status:', r.status_code)
    for p in r.json():
        print(f"  id={p['id']} name={p['name']} hotel_group_id={p.get('hotel_group_id')}")
except Exception as e:
    print('Error:', e)


