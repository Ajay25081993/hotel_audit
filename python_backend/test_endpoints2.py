import urllib.request
try:
    req = urllib.request.Request('http://localhost:8000/api/audits/')
    r = urllib.request.urlopen(req, timeout=5)
    print('Audits Status:', r.status)
    print(r.read().decode('utf-8')[:300])
except Exception as e:
    print('Audits Error:', e)

try:
    req2 = urllib.request.Request('http://localhost:8000/api/properties/')
    r2 = urllib.request.urlopen(req2, timeout=5)
    print('Properties Status:', r2.status)
    print(r2.read().decode('utf-8')[:300])
except Exception as e2:
    print('Properties Error:', e2)

