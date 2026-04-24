import urllib.request
import json

try:
    req = urllib.request.Request(
        'http://localhost:8000/api/audits/4',
        data=json.dumps({
            "status": "approved",
            "reviewedAt": "2026-04-24T16:25:51.641Z"
        }).encode(),
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    resp = urllib.request.urlopen(req)
    print(f"STATUS: {resp.status}")
    print(f"BODY: {resp.read().decode()[:1000]}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code}")
    print(f"BODY: {e.read().decode()[:1000]}")
except Exception as e:
    print(f"ERROR: {e}")

