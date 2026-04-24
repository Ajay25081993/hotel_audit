import urllib.request
try:
    r = urllib.request.urlopen('http://localhost:8000/api/audits/')
    print('Status:', r.status)
    print(r.read().decode('utf-8')[:500])
except Exception as e:
    print('Error:', e)
try:
    r2 = urllib.request.urlopen('http://localhost:8000/api/properties/')
    print('Props Status:', r2.status)
    print(r2.read().decode('utf-8')[:500])
except Exception as e2:
    print('Props Error:', e2)

