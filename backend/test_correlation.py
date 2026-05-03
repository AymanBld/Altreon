import requests
import time
import sqlite3
import json

BASE_URL = "http://127.0.0.1:8000"
DB_PATH = "altreon.db"

def send_report(description, source_name, source_type="Wazuh SIEM"):
    payload = {
        "source_type": source_type,
        "source_name": source_name,
        "device_ip": "192.168.1.100",
        "description": description,
        "base_severity": "Medium"
    }
    print(f"Sending: {description}...")
    response = requests.post(f"{BASE_URL}/webhook/auto", json=payload)
    return response.json()

def check_correlation(incident_id):
    print(f"\nChecking database for correlation on Incident #{incident_id}...")
    # Wait a bit for background task to finish
    for i in range(15, 0, -1):
        print(f"Waiting for AI... {i}s", end="\r")
        time.sleep(1)
    print("\nReading DB...")
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Check both tables just in case (the app uses incident_logs for the API but my save_incident might be using 'incidents')
    # Actually database.py uses 'incidents' table.
    c.execute("SELECT soc_fusion FROM incidents WHERE incident_id = ?", (str(incident_id),))
    row = c.fetchone()
    conn.close()
    
    if row and row[0]:
        try:
            fusion = json.loads(row[0])
            if fusion.get("correlated_incidents"):
                print("\n" + "="*50)
                print("🔥 AI CORRELATION SUCCESSFUL!")
                print("="*50)
                print(f"🔗 Linked to: {fusion['correlated_incidents']}")
                print(f"🧠 AI Reasoning: {fusion['correlation_notes']}")
                print("="*50)
                return True
        except Exception as e:
            print(f"Error parsing fusion: {e}")
            pass
    print("\n❌ No correlation found in DB yet.")
    return False

if __name__ == "__main__":
    print("=== CyberBase AI Correlation Test ===")
    
    # 1. Send first event (The 'Context')
    res1 = send_report(
        "CRITICAL: 10+ failed SSH login attempts for user 'admin' on server-prod-01",
        "Wazuh-Alert-Manager"
    )
    print(f"Event 1 Saved as #{res1['incident_id']}")
    
    time.sleep(2)
    
    # 2. Send second (The 'Trigger')
    res2 = send_report(
        "WARNING: Successful login for user 'admin' from new IP 103.44.12.19 on server-prod-01",
        "Wazuh-Alert-Manager"
    )
    print(f"Event 2 Saved as #{res2['incident_id']}")
    
    # 3. Verify
    check_correlation(res2['incident_id'])
