import requests
import time
import sqlite3
import json

BASE_URL = "http://127.0.0.1:8000"
DB_PATH = "cyberbase.db"

def send_report(description, source_name, source_type="Wazuh SIEM"):
    payload = {
        "source_type": source_type,
        "source_name": source_name,
        "device_ip": "192.168.1.100",
        "description": description,
        "base_severity": "Medium"
    }
    print(f"Sending: {description}...")
    response = requests.post(f"{BASE_URL}/report", json=payload)
    return response.json()

def test_live_correlation(incident_id):
    print(f"\nRunning Live Correlation for INC-{incident_id}...")
    response = requests.get(f"{BASE_URL}/incident/correlate/{incident_id}")
    data = response.json()
    
    if data.get("is_related"):
        print("SUCCESS: AI found an ephemeral correlation!")
        print(f"Reasoning: {data['correlation_summary']}")
    else:
        print("FAILED: No correlation found.")
    
    # Verify DB does NOT have the correlation
    print("\nVerifying DB privacy (Checking for persistent links)...")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT ai_summary FROM incident_logs WHERE id = ?", (incident_id,))
        row = c.fetchone()
        conn.close()
        
        if row and row[0] and "CORRELATION" in row[0]:
            print("ERROR: Correlation was saved to DB (Unexpected)!")
        else:
            print("DB PRIVACY VERIFIED: Incident Log remains 'RAW' as requested.")
    except Exception as e:
        print(f"Note: Could not verify DB directly. Error: {e}")

if __name__ == "__main__":
    print("=== CyberBase Ephemeral Correlation Suite ===")
    
    # 1. Context: A SSH failure
    send_report("ALERT: Multiple failed SSH attempts for root from 192.168.1.50", "Wazuh")
    
    time.sleep(1)
    
    # 2. Trigger: Successful login from same IP
    res2 = send_report("SUCCESS: root login from 192.168.1.50", "Wazuh")
    id2 = res2['incident_id']
    
    # 3. Test
    test_live_correlation(id2)
