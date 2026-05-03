import requests
import json
import time

# Configuration
BACKEND_URL = "http://10.0.2.2:8000/webhook/wazuh" # Use localhost:8000 if running on same machine
# For testing from outside local machine, change to your server IP

def simulate_wazuh_alert(level, description, agent_name, log_content):
    """Simulates a JSON payload from a Wazuh manager."""
    payload = {
        "timestamp": "2026-05-02T20:45:00+0000",
        "rule": {
            "level": level,
            "description": description,
            "id": "100001",
            "firedtimes": 1
        },
        "agent": {
            "id": "007",
            "name": agent_name,
            "ip": "192.168.1.50"
        },
        "manager": {
            "name": "wazuh-master"
        },
        "full_log": log_content,
        "location": "/var/log/auth.log"
    }

    print(f"Sending Wazuh Alert: {description} (Level {level})...")
    try:
        # Note: If running locally, use 127.0.0.1:8000
        response = requests.post("http://127.0.0.1:8000/webhook/wazuh", json=payload)
        if response.status_code == 200:
            print("Successfully sent to CyberBase Backend!")
            print(f"Response: {response.json()}")
        else:
            print(f"Failed with status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    print("=== Wazuh & CyberBase Integration Prototype ===")
    
    # 1. Simulate a Brute Force Attempt (High Severity)
    simulate_wazuh_alert(
        level=12,
        description="SSHD Brute Force Attack Detected",
        agent_name="production-db-01",
        log_content="May 2 20:44:01 prod-db-01 sshd[1234]: Failed password for invalid user admin from 103.22.14.5 port 55231 ssh2"
    )
    
    time.sleep(2)
    
    # 2. Simulate a System Failure (Critical Severity)
    simulate_wazuh_alert(
        level=15,
        description="Multiple system services stopped unexpectedly",
        agent_name="core-switch-gateway",
        log_content="CRITICAL: Kernel panic - not syncing: Fatal exception in interrupt"
    )
