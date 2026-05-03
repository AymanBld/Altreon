import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"

def send_report(description, source_name, source_type="Wazuh SIEM"):
    payload = {
        "source_type": source_type,
        "source_name": source_name,
        "device_ip": "10.0.0.55",
        "description": description,
        "base_severity": "Medium"
    }
    print(f"-> Sending Report: {description[:50]}...")
    response = requests.post(f"{BASE_URL}/report", json=payload)
    return response.json()

def get_report_details(incident_id):
    print(f"-> Fetching Details for INC-{incident_id}...")
    response = requests.get(f"{BASE_URL}/incident/{incident_id}")
    return response.json()

if __name__ == "__main__":
    print("=== CyberBase Final Correlation & Dual-Log Test ===")
    
    # 1. Report A (The Context)
    res1 = send_report(
        "CRITICAL: Multiple failed password attempts for user 'billing_admin' from IP 185.22.4.10",
        "Wazuh-Auth-Monitor"
    )
    id1 = res1['incident_id']
    print(f"Report A saved as INC-{id1}")
    
    time.sleep(2)
    
    # 2. Report B (The Related Trigger)
    res2 = send_report(
        "SUCCESS: User 'billing_admin' logged in from IP 185.22.4.10 and accessed high-value database 'Invoices_2024'",
        "Wazuh-DB-Audit"
    )
    id2 = res2['incident_id']
    print(f"Report B saved as INC-{id2}")
    
    print("Waiting for AI processing (10 seconds)...")
    time.sleep(10)
    
    # 3. Verify Report B's AI Analysis
    details = get_report_details(id2)
    ai_summary = details.get('ai_summary', '')
    
    print("\n" + "="*60)
    print("VERIFICATION RESULT")
    print("="*60)
    if ai_summary and "CORRELATION" in ai_summary:
        print("SUCCESS: AI Summary contains the Correlation reasoning!")
        print(f"AI Report: {ai_summary}")
        
        if f"Related Incidents:" in ai_summary:
            print(f"SUCCESS: Related reports are correctly linked in the text!")
        else:
            print("WARNING: 'Related Incidents' keyword not found in summary.")
    else:
        print("FAILED: No correlation found in AI Summary.")
        print(f"Current Summary: {ai_summary}")
    print("="*60)
    
    print("\nPRO TIP: Now open your Mobile App or Web Admin and check INC-" + str(id2) + ".")
    print("It will automatically show the logs for INC-" + str(id1) + " right on the screen!")
