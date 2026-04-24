import requests

url = "http://localhost:8000/api/audits/1/items"
payload = {
    "category": "Test",
    "item": "Test",
    "comments": "good"
}

r = requests.post(url, json=payload)
print("Status:", r.status_code)
print("Response:", r.text)

