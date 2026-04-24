import urllib.request
import json

try:
    req = urllib.request.Request(
        'http://localhost:8000/api/auth/login',
        data=json.dumps({
            "username": "admin",
            "password": "password"
        }).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    resp = urllib.request.urlopen(req)
    print(f"STATUS: {resp.status}")
    print(f"BODY: {resp.read().decode()[:500]}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code}")
    print(f"BODY: {e.read().decode()[:500]}")
except Exception as e:
    print(f"ERROR: {e}")

