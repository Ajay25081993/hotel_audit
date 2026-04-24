import json
import urllib.request
import urllib.error

# Test the API
payload = {
    "propertyId": 2,
    "auditorId": 6,
    "reviewerId": 8,
    "hotelGroupId": 1,
    "sop": "",
    "sopFiles": '[{"name":"Taj_Hotel_SOPs.docx"}]',
    "status": "scheduled",
    "priority": "medium",
    "notes": "",
    "scheduledDate": "2026-04-24T13:49:00.000Z"
}

try:
    print("Making POST request...")
    req = urllib.request.Request(
        "http://localhost:8000/api/audits/",
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Response: {response.read().decode()}")
except urllib.error.HTTPError as e:
    print(f"Status: {e.code}")
    print(f"Response: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
