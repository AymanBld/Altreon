"""Full end-to-end test: report → AI process → route → audit trail."""
import httpx
import json

BASE = "http://localhost:8000"

# Step 1: Submit report
print("=== STEP 1: Submit Report ===")
r = httpx.post(f"{BASE}/report", json={
    "message": "I got a suspicious email from it-support@companny.com asking me to click a link and verify my credentials. The link looked like our company portal but the URL was different. I clicked it before I realized.",
    "report_mode": "anonymous"
}, timeout=300)
print(f"Status: {r.status_code}")
data = r.json()
print(json.dumps(data, indent=2))

incident_id = data.get("incident_id")
if not incident_id:
    print("FAILED — no incident_id")
    exit(1)

# Step 2: Process with full AI pipeline
print(f"\n=== STEP 2: AI Process ({incident_id[:8]}...) ===")
r = httpx.post(f"{BASE}/ai/process/{incident_id}", timeout=600)
print(f"Status: {r.status_code}")
print(json.dumps(r.json(), indent=2))

# Step 3: Route
print(f"\n=== STEP 3: Route ===")
r = httpx.post(f"{BASE}/route/{incident_id}", timeout=30)
print(f"Status: {r.status_code}")
print(json.dumps(r.json(), indent=2))

# Step 4: Audit trail
print(f"\n=== STEP 4: Audit Trail ===")
r = httpx.get(f"{BASE}/incident/{incident_id}/audit", timeout=30)
print(f"Status: {r.status_code}")
trail = r.json()
print(f"Events: {len(trail['audit_trail'])}")
for event in trail["audit_trail"]:
    print(f"  [{event['actor']}] {event['action']}")
