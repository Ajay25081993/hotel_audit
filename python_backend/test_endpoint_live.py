import urllib.request
import json
import sys

try:
    req = urllib.request.Request(
        'http://localhost:8000/api/audit-items/23/analyze',
        data=json.dumps({'auditId':4,'checklistDetails':{'description':'','weight':1,'maxScore':5}}).encode(),
        headers={'Content-Type':'application/json'},
        method='POST'
    )
    resp = urllib.request.urlopen(req)
    print(f"STATUS: {resp.status}")
    body = resp.read().decode()
    print(f"BODY: {body}")
    print(f"LENGTH: {len(body)}")
except Exception as e:
    print(f"ERROR: {e}")

