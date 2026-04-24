import urllib.request
import json

try:
    req = urllib.request.Request(
        'http://localhost:8000/api/audit-items/20',
        data=json.dumps({'score': 2, 'aiAnalysis': 'Analysis completed using fallback scoring. No detailed comments provided, limiting assessment accuracy. Recommend detailed review and follow-up to ensure compliance standards are maintained.'}).encode(),
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    resp = urllib.request.urlopen(req)
    print(f"STATUS: {resp.status}")
    print(f"BODY: {resp.read().decode()[:500]}")
except Exception as e:
    print(f"ERROR: {e}")

