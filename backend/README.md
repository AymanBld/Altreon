---
tags: [readme, documentation, hackathon, mvp, postman-tested]
source: ALTREON Project
---

> [!SUMMARY] Executive Summary
> **ALTREON** is a Rapid Cyber Triage & SOAR MVP platform designed specifically for SMEs. It acts as a bridge between panicked employees and overwhelmed IT admins by correlating human-reported fears with actual machine-generated alerts. ALTREON identifies critical cyber threats instantly while ensuring full compliance with **Algeria's Law 18-07** (Data Privacy & Immutable Audit Trails). All endpoints have been fully verified and tested using the Postman MCP integration.

## 1. Tech Stack
> [!NOTE] Architecture Choices
> The stack was pivoted for maximum speed and simplicity to accommodate hackathon constraints while retaining enterprise-grade logic.

- **Backend Framework:** Python, FastAPI
- **Database:** SQLite & SQLAlchemy (Strict Immutable Configuration)
- **AI Integration:** Google GenAI (Gemini 3 Flash Preview)
- **Communications:** Twilio SDK (SMS Smart Escalation)

## 2. System Architecture & Workflow

Based on the latest workflow design, the system follows a 4-step pipeline:

### 2.1 Input & Intake (`POST /report`)
The system must ingest two types of incident reports:
* **User Reports** (manual reports from employees via chat/form).
* **Auto Reports** (system-generated from EDR, Firewalls, Antivirus, SOC tools).

### 2.2 AI Processing & Matching (`POST /ai/process`)
> [!TIP] The Rule Engine & Smart Escalation
> The AI queries the Logs Database to compare new incidents with historical data (e.g., matching the same `device_ip` within the last 24 hours). 

* If a match is found, the AI retrieves previous logs and generates a consolidated **Report Summary + Logs**. 
* Correlated attacks are immediately escalated to **CRITICAL** severity, triggering a Twilio SMS blast to the IT Admin.
* The system automatically pushes the AI’s summary to three destinations: the Logs Database (stored immutably), the Admin Dashboard, and the Cybersecurity Team.

### 2.3 Data Distribution & Final Actions (`POST /route`)
The Cybersecurity Team reviews the AI's processing and performs two final tasks:
* **Action Routing:** Distributes specific tasks and notifications to the original reporter and all affected employees (e.g., "Reset Passwords", "Isolate Machine").
* **Final Report:** Generates a verified, final human-readable report sent directly to the Admin.

### 2.4 The Immutable Audit Trail (Law 18-07 Compliance)
> [!IMPORTANT] Compliance Enforcement
> To strictly adhere to Algeria's Law 18-07, all logs are stored in `compliance_logs.db`. There are **NO `PUT`, `PATCH`, or `DELETE` API endpoints** built into the backend. Once a log is recorded, it serves as a permanent, tamper-proof forensic artifact.

## 3. API Endpoints

### 3.1 Employee AI Chat (`POST /employee/chat`)
Acts as an interactive AI agent. The employee chats with the AI, which replies with questions and 3 multiple-choice options until it gathers enough data.
**Request Payload:**
```json
{
  "message": "My computer just locked up and showed a red screen.",
  "history": []
}
```

### 3.2 Automated Webhook (`POST /webhook/auto`)
Direct ingestion endpoint for third-party security tools (Firewalls, EDR, Antivirus). 

### 3.3 Incident Intake (`POST /report`)
Receives finalized reports. For employees, this is submitted after the AI Chat concludes, including the `conversation_log`.
**Request Payload:**
```json
{
  "source_type": "user",
  "source_name": "employee_name",
  "device_ip": "192.168.1.100",
  "description": "Screen locked up.",
  "base_severity": "Pending",
  "conversation_log": [{"role": "user", "content": "My computer locked up"}]
}
```

### 3.4 AI Processing (`POST /ai/process`)
Triggers the AI engine. The AI consumes the `conversation_log` and searches `compliance_logs.db` for matching historical incidents (by IP) to perform advanced correlation and generate a Report Summary.
**Request Payload:** `{"incident_id": 12}`

### 3.5 Action Routing (`POST /route`)
Used by the Cybersec team to assign tasks and finalize the admin report.
**Request Payload:**
```json
{
  "incident_id": 12,
  "action_tasks": ["Isolate machine from network", "Reset credentials"],
  "affected_users": ["john.doe@company.com"],
  "final_admin_report": "The attack has been contained."
}
```

### 3.6 Retrieval Endpoints (`GET`)
Role-based retrieval of incident data:
- `GET /incident/{id}`: Retrieve full, immutable details of a specific incident.
- `GET /reports/employee/{source_name}`: Retrieve all incidents reported by a specific employee.
- `GET /reports/cybersec/pending`: Retrieve incidents processed by AI but awaiting Cybersec human routing.
- `GET /reports/admin/all`: Retrieve the master list of all incidents for the admin dashboard.

## 4. Testing the Endpoints (Full Postman Guide)
> [!SUCCESS] Postman MCP Verified
> The `ALTREON MVP Pivot Tests` collection was successfully run via the Postman MCP integration, validating all 5 endpoints in sequence.

We highly recommend testing with **Postman** for your presentation. The collection is pre-configured with **dynamic variables** that automatically extract the newly created `incident_id` from step 1 & 2 and pass it to steps 3, 4, and 5. This guarantees you are always processing a fresh incident and hitting the live AI API.

### Step 1: Configure Your Environment
Ensure your `.env` is configured properly in the `backend` folder (see Section 5 below for the required variables).

### Step 2: Start the Server
Open your terminal, navigate to the `backend` directory, activate the virtual environment, and start the FastAPI server:

```bash
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload
```
The server will start running on `http://127.0.0.1:8000`.

### Step 3: Run the Postman Collection
Open Postman and locate the **"ALTREON MVP Pivot Tests"** collection. Run the requests in this exact order to see the full workflow:

1. **`1. Submit User Report`** (`POST /report`)
   - **What it does:** Simulates an employee reporting an issue (e.g., "Screen locked up").
   - **Postman Magic:** Automatically saves the returned `incident_id` into a collection variable.

2. **`2. Submit Auto Report (EDR)`** (`POST /report`)
   - **What it does:** Simulates a security software (like an EDR) sending an automated alert for the exact same IP address.
   - **Postman Magic:** Saves *this* `incident_id` into a variable (`auto_incident_id`).

3. **`3. Trigger AI Processing`** (`POST /ai/process`)
   - **What it does:** Sends the `auto_incident_id` to the AI engine (Groq/Google). The AI correlates this report with the user's report (since the IPs match within 24hrs), escalates the severity to `CRITICAL`, and generates a detailed summary.

4. **`4. Cybersec Action Routing`** (`POST /route`)
   - **What it does:** The Cybersec team assigns action tasks (e.g., "Isolate machine") and creates a final admin report.

5. **`5. Fetch Final Incident`** (`GET /incident/{id}`)
   - **What it does:** Retrieves the complete, immutable incident record including the AI correlation and the final action routes.

> [!TIP] Fast Testing
> You can also click the three dots `...` next to the collection name in Postman and select **"Run collection"** to execute all 5 steps automatically in under 10 seconds!

## 5. Environment Configuration
> [!WARNING] Secrets Management
> Ensure the `.env` file is excluded from your source control to protect your API keys.

Create a `.env` file in your `backend` directory:
```env
# AI Provider Setup
ACTIVE_AI_PROVIDER="groq" # Switch between "groq" and "google"

GROQ_API_KEY="your_groq_api_key"
GROQ_MODEL="llama-3.3-70b-versatile"

GEMINI_API_KEY="your_google_ai_studio_api_key"

# Twilio SMS Setup
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_FROM_NUMBER="+1234567890"
ADMIN_PHONE_NUMBER="+0987654321"
```
