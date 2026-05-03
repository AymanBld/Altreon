import requests
import json

url = "http://127.0.0.1:8000/reports/admin/all"
try:
    r = requests.get(url)
    data = r.json()
    if data:
        print(f"Keys in first incident: {data[0].keys()}")
        print(f"Sample ai_summary: {data[0].get('ai_summary')}")
    else:
        print("No incidents found.")
except Exception as e:
    print(f"Error: {e}")
