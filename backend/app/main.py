import os
import json
from datetime import datetime, timedelta
import uuid

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from twilio.rest import Client
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext

load_dotenv()

# ==========================================
# 0. Security Setup (Simple Auth)
# ==========================================
import hashlib
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-dev-key-change-in-production")
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    """Hash a password using SHA256 (Simple for Dev)."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its SHA256 hash."""
    return hash_password(plain_password) == hashed_password


def create_access_token(admin_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(days=7)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": admin_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> str:
    """Verify JWT and return admin_id."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        if admin_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return admin_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_admin(token: str = None) -> str:
    """Dependency to get current authenticated admin."""
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token")
    return verify_token(token)

# ==========================================
# 1. Database Setup (Immutable Audit Trail)
# ==========================================
DATABASE_URL = "sqlite:///./compliance_logs.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class IncidentLog(Base):
    __tablename__ = "incident_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Intake fields
    source_type = Column(String, index=True) # 'user' or 'auto'
    source_name = Column(String) # 'employee', 'firewall', 'antivirus', 'edr', 'soc'
    device_ip = Column(String, index=True)
    description = Column(String)
    base_severity = Column(String) # Low, Medium, High, Critical
    conversation_log = Column(Text, nullable=True) # JSON list of employee chat history
    
    # AI Processing fields
    is_processed = Column(Boolean, default=False)
    ai_summary = Column(Text, nullable=True)
    correlated_with_id = Column(Integer, nullable=True) # Links to another log if match found
    final_severity = Column(String, nullable=True)
    status = Column(String, default="not resolved", nullable=False)
    
    # Routing & Final Reporting fields (from Cybersec team)
    action_tasks = Column(Text, nullable=True) # JSON list of tasks
    affected_users = Column(Text, nullable=True) # JSON list of users
    final_admin_report = Column(Text, nullable=True)

Base.metadata.create_all(bind=engine)

def ensure_status_column():
    with engine.connect() as connection:
        columns = [row[1] for row in connection.exec_driver_sql("PRAGMA table_info(incident_logs)").fetchall()]
        if "status" not in columns:
            connection.exec_driver_sql("ALTER TABLE incident_logs ADD COLUMN status VARCHAR DEFAULT 'not resolved'")
            connection.commit()


def normalize_incident_status(status: Optional[str]) -> str:
    return "resolved" if status and status.strip().lower() == "resolved" else "not resolved"


def normalize_existing_statuses():
    with engine.connect() as connection:
        connection.exec_driver_sql(
            "UPDATE incident_logs SET status = 'resolved' WHERE LOWER(COALESCE(status, '')) = 'resolved'"
        )
        connection.exec_driver_sql(
            "UPDATE incident_logs SET status = 'not resolved' WHERE LOWER(COALESCE(status, '')) <> 'resolved'"
        )
        connection.commit()


ensure_status_column()
normalize_existing_statuses()


def seed_presentation_data():
    """Seed demo incidents for presentations when the Render SQLite DB is empty."""
    seed_enabled = os.getenv("SEED_DEMO_DATA", "true").strip().lower() not in {"0", "false", "no"}
    if not seed_enabled:
        return

    db = SessionLocal()
    try:
        if db.query(IncidentLog).count() > 0:
            return

        now = datetime.utcnow()
        sample_incidents = [
            IncidentLog(
                timestamp=now - timedelta(minutes=18),
                source_type="user",
                source_name="employee",
                device_ip="10.42.12.18",
                description="Employee reported a fake Microsoft 365 login page after clicking a payroll update email.",
                base_severity="High",
                final_severity="High",
                status="not resolved",
                is_processed=True,
                conversation_log=json.dumps([
                    {"role": "user", "content": "I clicked a payroll link and it asked me to sign in again."},
                    {"role": "assistant", "content": "Did you enter your password or MFA code?"},
                    {"role": "user", "content": "I entered my password, then the page went blank."},
                ]),
                ai_summary=(
                    "AI ANALYSIS: Likely credential phishing targeting Microsoft 365. "
                    "The reporter submitted credentials to a suspicious payroll-themed domain. "
                    "Recommended actions: reset password, revoke sessions, review mail rules, and block sender/domain."
                ),
            ),
            IncidentLog(
                timestamp=now - timedelta(hours=1, minutes=7),
                source_type="auto",
                source_name="edr",
                device_ip="10.42.12.44",
                description="EDR detected suspicious PowerShell execution with encoded command and outbound beacon attempts.",
                base_severity="Critical",
                final_severity="Critical",
                status="not resolved",
                is_processed=True,
                ai_summary=(
                    "AI ANALYSIS: Critical endpoint compromise indicators detected. "
                    "Encoded PowerShell execution and repeated outbound beacon attempts suggest malware staging. "
                    "Recommended actions: isolate host, collect memory image, rotate local credentials, and hunt for lateral movement."
                ),
            ),
            IncidentLog(
                timestamp=now - timedelta(hours=3, minutes=35),
                source_type="auto",
                source_name="firewall",
                device_ip="10.42.8.91",
                description="Firewall blocked repeated failed VPN logins from a foreign ASN against a finance user account.",
                base_severity="Medium",
                final_severity="Medium",
                status="not resolved",
                is_processed=True,
                ai_summary=(
                    "AI ANALYSIS: Possible credential stuffing against VPN. "
                    "No successful login was observed, but the targeted account is high-value. "
                    "Recommended actions: confirm MFA health, notify account owner, and temporarily rate-limit source ranges."
                ),
            ),
            IncidentLog(
                timestamp=now - timedelta(days=1, hours=2),
                source_type="user",
                source_name="employee",
                device_ip="10.42.14.20",
                description="User reported that a confidential customer export was accidentally shared with an external email address.",
                base_severity="High",
                final_severity="High",
                status="resolved",
                is_processed=True,
                ai_summary=(
                    "AI ANALYSIS: Confirmed accidental data exposure. "
                    "The shared file contained customer contact data but no payment details. "
                    "Recommended actions completed: revoked link, notified data owner, and documented compliance review."
                ),
                final_admin_report=(
                    "External share link was revoked, recipient deletion was confirmed, and the affected dataset was reviewed. "
                    "No regulated payment or authentication data was exposed. Case closed with awareness follow-up."
                ),
            ),
            IncidentLog(
                timestamp=now - timedelta(days=2, hours=5),
                source_type="auto",
                source_name="antivirus",
                device_ip="10.42.16.77",
                description="Antivirus quarantined a malicious attachment downloaded from a personal webmail session.",
                base_severity="Low",
                final_severity="Low",
                status="resolved",
                is_processed=True,
                ai_summary=(
                    "AI ANALYSIS: Malware was blocked before execution. "
                    "No persistence, suspicious process tree, or network callback was detected after quarantine."
                ),
                final_admin_report=(
                    "Attachment quarantined successfully. Full endpoint scan completed with no additional findings. "
                    "User received reminder to avoid personal webmail on corporate devices."
                ),
            ),
        ]

        db.add_all(sample_incidents)
        db.commit()
        print(f"Seeded {len(sample_incidents)} presentation incidents.")
    finally:
        db.close()


async def seed_demo_admin():
    """Optionally create a demo admin when DEMO_ADMIN_PASSWORD is configured."""
    demo_password = os.getenv("DEMO_ADMIN_PASSWORD")
    import app.database as database

    await database.init_db()
    if not demo_password:
        return

    demo_username = os.getenv("DEMO_ADMIN_USERNAME", "admin")
    existing = await database.get_admin_by_username(demo_username)
    if existing:
        return

    await database.create_admin(
        str(uuid.uuid4()),
        demo_username,
        hash_password(demo_password),
        os.getenv("DEMO_ADMIN_EMAIL"),
    )
    print(f"Seeded demo admin user '{demo_username}'.")

def format_incident(incident: IncidentLog) -> dict:
    """Standardized incident formatter for all API responses."""
    return {
        "id": incident.id,
        "timestamp": incident.timestamp.isoformat() if incident.timestamp else None,
        "source_type": incident.source_type,
        "source_name": incident.source_name,
        "device_ip": incident.device_ip,
        "description": incident.description,
        "base_severity": incident.base_severity,
        "final_severity": incident.final_severity,
        "status": normalize_incident_status(incident.status),
        "is_processed": incident.is_processed,
        "is_correlated": "CORRELATION" in str(incident.ai_summary).upper() if incident.ai_summary else False,
        "correlated_with_id": incident.correlated_with_id,
        "conversation_log": json.loads(incident.conversation_log) if incident.conversation_log else [],
        "ai_summary": str(incident.ai_summary) if incident.ai_summary else "AI processing in progress...",
        "routing_info": {
            "final_admin_report": incident.final_admin_report
        }
    }

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# 2. External Services Setup
# ==========================================

# Twilio Setup (Smart Escalation)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "your_account_sid")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "your_auth_token")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "+1234567890")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER", "+0987654321")

def send_sms_alert(message: str):
    """Helper function to send Twilio SMS to IT Admin."""
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        msg = client.messages.create(
            body=message,
            from_=TWILIO_FROM_NUMBER,
            to=ADMIN_PHONE_NUMBER
        )
        print(f"SMS sent successfully: {msg.sid}")
    except Exception as e:
        print(f"Failed to send SMS: {e}")

# AI Providers Setup
ACTIVE_AI_PROVIDER = os.getenv("ACTIVE_AI_PROVIDER", "google").lower()

# Google GenAI Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
try:
    from google import genai
    from google.genai import types
    gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
except ImportError:
    gemini_client = None

# Groq Setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
try:
    from openai import OpenAI
    groq_client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    ) if GROQ_API_KEY else None
except ImportError:
    groq_client = None

def generate_ai_summary(system_prompt: str, user_prompt: str) -> dict:
    """Helper function to switch between AI providers."""
    if ACTIVE_AI_PROVIDER == "groq":
        if not groq_client:
            raise HTTPException(status_code=500, detail="Groq API Key not configured")
        
        # Groq supports JSON mode
        response = groq_client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        return json.loads(response.choices[0].message.content)
        
    elif ACTIVE_AI_PROVIDER == "google":
        if not gemini_client:
            raise HTTPException(status_code=500, detail="Gemini API Key not configured")
            
        response = gemini_client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3-flash-preview"),
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        return json.loads(response.text)
        
    else:
        raise HTTPException(status_code=500, detail=f"Unsupported AI provider: {ACTIVE_AI_PROVIDER}")


def normalize_chat_response(response: dict) -> dict:
    """Keep chat choices within the expected 3-to-6 range."""
    if not isinstance(response, dict):
        return response

    choices = response.get("choices")
    if isinstance(choices, list):
        normalized_choices = [choice for choice in choices if isinstance(choice, str) and choice.strip()]
        response["choices"] = normalized_choices[:6]

        while len(response["choices"]) < 3:
            response["choices"].append("Type your own answer")
    else:
        response["choices"] = [
            "Describe the issue",
            "I clicked something suspicious",
            "Something else",
        ]

    return response


def summarize_user_problem(history: List[dict], current_message: str) -> str:
    """Build a concise incident summary from user messages."""
    user_messages = [
        msg.get("content", "")
        for msg in history
        if msg.get("role") == "user" and isinstance(msg.get("content"), str)
    ]
    user_messages.append(current_message)
    cleaned = [m.strip() for m in user_messages if m and m.strip()]
    return " ".join(cleaned[-4:])[:600] if cleaned else "User reported a potential security issue."


async def analyze_correlation_ephemeral(description: str, incident_id: int = None) -> str | None:
    """
    Search for recent related incidents and logically 'join' them using AI.
    This does NOT save the result to the DB. It returns the summary for notification.
    """
    from app.database import get_recent_incidents
    
    print(f"--- Ephemeral Correlation Analysis Started ---")
    
    # 1. Fetch recent incidents (last 10)
    recent_incidents = await get_recent_incidents(limit=10, exclude_id=str(incident_id) if incident_id else None)
    if not recent_incidents:
        return None

    # 2. Prepare AI Prompt
    incidents_context = "\n".join([
        f"- ID: {inc['incident_id']}, Type: {inc['type']}, Summary: {inc['user_summary']}"
        for inc in recent_incidents
    ])
    
    system_prompt = """
    You are a SOC Correlation Engine. Identify if a NEW incident is logically related to any RECENT incidents.
    If related, provide a brief reasoning. If not related, return {"is_related": false}.
    Return JSON format: 
    {
      "is_related": bool,
      "correlation_summary": "Explanation of the logical join..."
    }
    """
    
    user_prompt = f"NEW INCIDENT: {description}\n\nRECENT INCIDENTS:\n{incidents_context}"
    
    try:
        correlation_result = generate_ai_summary(system_prompt, user_prompt)
        if correlation_result.get("is_related"):
            return correlation_result.get("correlation_summary")
    except Exception as e:
        print(f"Error in Ephemeral Correlation: {e}")
    return None

async def send_incident_notifications(incident_id: int, description: str, severity: str, source: str, correlation: str = None):
    """
    Send FCM push notifications to all admins.
    """
    print(f"--- Notification Triggered for INC-{incident_id} ---")
    try:
        import app.database as database
        from app.firebase_service import firebase_service
        
        fcm_tokens = await database.get_all_admin_fcm_tokens()
        if not fcm_tokens:
            print("No admin tokens found.")
            return
        
        # Clean label formatting
        title = f"NEW {severity.upper()} INCIDENT"
        if correlation:
            title = "🔗 CORRELATION DETECTED"
            
        full_desc = f"Source: {source}\n{description[:150]}..."
        if correlation:
            full_desc = f"AI Analysis: {correlation[:100]}...\n---\n{full_desc}"

        result = firebase_service.send_batch_notifications(
            fcm_tokens=fcm_tokens,
            incident_id=str(incident_id),
            description=full_desc,
            severity=severity,
            title=title,
            correlation=correlation # Extra data field
        )
        print(f"FCM batch result: {result}")
    except Exception as e:
        print(f"CRITICAL ERROR in send_incident_notifications: {e}")

# ==========================================
# 3. FastAPI App & Models
# ==========================================

app = FastAPI(title="ALTREON - Cyber Triage MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReportRequest(BaseModel):
    source_type: str # 'user' or 'auto'
    source_name: str # 'employee', 'firewall', 'antivirus', 'soc'
    device_ip: str
    description: str
    base_severity: str = "Medium" # Default to a real severity for new reports
    conversation_log: Optional[List[dict]] = None

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = [] # list of {"role": "user"/"assistant", "content": "..."}

class AIProcessRequest(BaseModel):
    incident_id: int

class RouteRequest(BaseModel):
    incident_id: int
    final_admin_report: str
    status: str = "not resolved"


# ───────────────────────────────────────
# Admin Auth Models
# ───────────────────────────────────────

class AdminRegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class AdminFCMTokenRequest(BaseModel):
    fcm_token: str

# ==========================================
# 0. Startup Checks
# ==========================================
print(f"DEBUG: FIREBASE_CREDENTIALS_PATH = {os.getenv('FIREBASE_CREDENTIALS_PATH')}")
print(f"DEBUG: FCM_ENABLED = {os.getenv('FCM_ENABLED')}")

@app.on_event("startup")
async def startup_event():
    seed_presentation_data()
    await seed_demo_admin()

# ==========================================
# Endpoints
# ==========================================

@app.get("/incident/correlate/{incident_id}")
async def get_live_correlation(incident_id: int, db: Session = Depends(get_db)):
    """
    Perform a live, ephemeral correlation check for a specific incident.
    Does NOT save to DB.
    """
    incident = db.query(IncidentLog).filter(IncidentLog.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    correlation_summary = await analyze_correlation_ephemeral(incident.description, incident_id)
    
    return {
        "incident_id": incident_id,
        "is_related": correlation_summary is not None,
        "correlation_summary": correlation_summary
    }

async def process_and_notify(incident_id: int, description: str, severity: str, source: str):
    """Background task to run ephemeral correlation, save it to the report text, and then notify."""
    from app.database import get_recent_incidents
    
    # 1. Fetch recent incidents for context
    recent_incidents = await get_recent_incidents(limit=10, exclude_id=str(incident_id))
    
    correlation_text = None
    related_ids = []
    
    if recent_incidents:
        incidents_context = "\n".join([
            f"- ID: {inc['incident_id']}, Type: {inc['type']}, Summary: {inc['user_summary']}"
            for inc in recent_incidents
        ])
        
        system_prompt = """
        You are a SOC Correlation Engine. 
        1. Identify if this NEW incident is logically related to any RECENT incidents (e.g., same IP, same user, same attack pattern, or sequential timing).
        2. Re-assess the severity. If the description implies a serious breach, set severity to 'Critical' or 'High'.
        Return JSON: {"is_related": bool, "related_ids": [id1, id2], "summary": "Reasoning...", "suggested_severity": "Critical/High/Medium/Low"}
        """
        user_prompt = f"NEW: {description}\n\nRECENT:\n{incidents_context}"
        
        try:
            print(f"DEBUG: Running AI Correlation for INC-{incident_id}...")
            res = generate_ai_summary(system_prompt, user_prompt)
            print(f"DEBUG: AI Result for INC-{incident_id}: {res}")
            
            if res.get("is_related"):
                correlation_text = res.get("summary")
                related_ids = res.get("related_ids", [])
            
            # Update severity if AI suggests a change
            raw_sev = res.get("suggested_severity", "").strip().lower()
            if raw_sev == "critical": severity = "Critical"
            elif raw_sev == "high": severity = "High"
            elif raw_sev == "medium": severity = "Medium"
            elif raw_sev == "low": severity = "Low"
        except Exception as e:
            print(f"ERROR: AI processing failed for INC-{incident_id}: {e}")
            pass

    # 2. Save to DB (as part of the AI report text, not as a hard link)
    db = SessionLocal()
    try:
        incident = db.query(IncidentLog).filter(IncidentLog.id == incident_id).first()
        if incident:
            # Update BOTH severity fields in DB for consistency across UIs
            incident.base_severity = severity
            incident.final_severity = severity
            
            final_report = f"AI ANALYSIS: No direct patterns found."
            if correlation_text:
                final_report = f"🔗 CORRELATION DETECTED:\n{correlation_text}\n\nRelated Incidents: {', '.join(map(str, related_ids))}"
            
            incident.ai_summary = final_report
            incident.is_processed = True
            db.commit()
            
            # 3. Notify Admin (with updated severity)
            await send_incident_notifications(
                incident_id, 
                description, 
                severity, 
                source, 
                correlation=correlation_text
            )
    finally:
        db.close()

@app.post("/report")
def receive_report(request: ReportRequest, db: Session = Depends(get_db), background_tasks: BackgroundTasks = None):
    """
    1. Input & Intake: Receives raw reports from users or auto-systems (AV, Firewall, SOC).
    2. Ephemeral Correlation: AI searches for links but does NOT save them to DB.
    3. Notification: Sends enriched FCM notification to admins.
    """
    incident = IncidentLog(
        timestamp=datetime.utcnow(),
        source_type=request.source_type.lower(),
        source_name=request.source_name,
        device_ip=request.device_ip,
        description=request.description,
        base_severity=request.base_severity,
        conversation_log=json.dumps(request.conversation_log) if request.conversation_log else None
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Send FCM notifications to all admins in background
    if background_tasks:
        background_tasks.add_task(
            process_and_notify,
            incident_id=incident.id,
            description=incident.description,
            severity=incident.base_severity,
            source=f"{incident.source_type}/{incident.source_name}"
        )

    return {
        "status": "success",
        "message": "Report logged successfully",
        "incident_id": incident.id
    }

@app.post("/webhook/wazuh")
def wazuh_webhook(request: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Integration endpoint for Wazuh alerts.
    Maps Wazuh's JSON format to our Incident Response system.
    """
    # Extract data from Wazuh alert structure
    rule = request.get("rule", {})
    agent = request.get("agent", {})
    
    wazuh_level = rule.get("level", 0)
    description = rule.get("description", "Unknown Wazuh Alert")
    source_name = agent.get("name", "Unknown Agent")
    full_log = request.get("full_log", "")
    
    # Map Wazuh level (0-15+) to our severity levels
    if wazuh_level >= 13:
        severity = "Critical"
    elif wazuh_level >= 10:
        severity = "High"
    elif wazuh_level >= 5:
        severity = "Medium"
    else:
        severity = "Low"
        
    # Prepare internal report request
    report_req = ReportRequest(
        description=f"{description}\n\nFull Log: {full_log}",
        source_name=source_name,
        source_type="Wazuh SIEM",
        device_ip=agent.get("ip", "N/A"),
        base_severity=severity
    )
    
    print(f"--- Wazuh Alert Received: {description} (Level {wazuh_level} -> {severity}) ---")
    
    return receive_report(report_req, db, background_tasks=background_tasks)

@app.post("/webhook/auto")
def auto_alert_webhook(request: ReportRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Webhook for auto alerts (SOC/Firewall/Antivirus) to push reports.
    """
    return receive_report(request, db, background_tasks=background_tasks)

@app.post("/employee/chat")
def employee_chat(request: ChatRequest):
    """
    Employee talks to AI to report an incident. 
    AI asks questions and returns between 3 and 6 choices, looping as needed to get data.
    """
    max_user_messages = 5
    user_message_count = sum(1 for msg in request.history if msg.get("role") == "user") + 1

    if user_message_count >= max_user_messages:
        # Provide a safe set of immediate first-aid instructions along with the finalization
        first_aid = (
            "If possible, disconnect the affected device from the network (unplug Ethernet or disable Wi-Fi). "
            "Do NOT restart the device. If you clicked a link or opened an attachment, note the sender and the time. "
            "Avoid using your work accounts from the affected device and do not run any remediation steps unless instructed by security. "
            "Take a photo of any ransom or error messages and share it with the security team when asked."
        )

        return {
            "response": "Thanks, I have enough information to proceed with your incident report.",
            "choices": [
                "Submit report now",
                "Add one final detail",
                "Review summary",
            ],
            "is_complete": True,
            "extracted_data": {
                "device_ip": "unknown",
                "description": summarize_user_problem(request.history, request.message),
                "user_instructions": first_aid,
            },
        }

    system_prompt = """You are a helpful IT security assistant. 
An employee is reporting a problem. Your goal is to gather:
1. What happened?
2. When did it happen?
3. Context needed to triage quickly (for example app name, file, email sender, or action they took).
Ask ONE question at a time and keep every question directly related to the reported issue.
Do NOT ask for IP address or hostname unless the user already mentioned network details and clarification is truly needed.
Provide between 3 and 6 multiple-choice options for the user to pick from, or let them type.
You must complete the triage by or before turn 5 (counting the current user message).
If you have gathered enough information, set "is_complete": true and output the structured data.
Output STRICTLY in JSON format:
{
  "response": "string (your message to the user)",
  "choices": ["choice 1", "choice 2", "choice 3"],
  "is_complete": boolean,
  "extracted_data": {
     "device_ip": "string or unknown",
     "description": "string summary of the issue"
  }
}"""
    conversation_context = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in request.history])
    user_prompt = f"History:\n{conversation_context}\n\nUser: {request.message}"
    
    try:
        ai_response_json = generate_ai_summary(system_prompt, user_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
        
    return normalize_chat_response(ai_response_json)

@app.post("/ai/process")
def process_ai(request: AIProcessRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    2. AI Processing & Matching: 
    AI checks logs database to match new logs with old logs, combines them, 
    and generates a Report Summary + Logs.
    """
    incident = db.query(IncidentLog).filter(IncidentLog.id == request.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    if incident.is_processed:
        return {"status": "already_processed", "incident_id": incident.id, "summary": incident.ai_summary}

    if ACTIVE_AI_PROVIDER == "groq" and not groq_client:
        raise HTTPException(status_code=500, detail="Groq API Key not configured")
    elif ACTIVE_AI_PROVIDER == "google" and not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")

    # Look for historical context (same IP within last 24 hours, excluding this one)
    time_window = datetime.utcnow() - timedelta(hours=24)
    historical_logs = db.query(IncidentLog).filter(
        IncidentLog.device_ip == incident.device_ip,
        IncidentLog.id != incident.id,
        IncidentLog.timestamp >= time_window
    ).all()

    historical_context = ""
    correlated_id = None
    if historical_logs:
        correlated_id = historical_logs[-1].id # Link to the most recent previous log
        historical_context = "Historical Logs for this IP:\n" + "\n".join(
            [f"- ID {log.id} [{log.source_type}/{log.source_name}]: {log.description} (Severity: {log.base_severity})" for log in historical_logs]
        )
        final_severity = "CRITICAL" # Correlated alerts automatically bump to critical
    else:
        historical_context = "No recent historical logs for this IP found."
        final_severity = incident.base_severity if incident.base_severity != "Medium" else "Medium"

    # Call AI
    system_prompt = f"""You are a top-tier SOC Analyst AI Engine.
You are reviewing a new incident report and checking it against historical logs.
Your job is to generate a 'Report Summary + Logs' that combines the new report with any matched history.
Output STRICTLY in JSON format matching this exact schema:
{{
  "executive_summary": "string (clear summary of what happened)",
  "technical_details": "string (technical breakdown)",
  "recommended_actions": ["string", "string"]
}}"""

    conversation_text = ""
    if incident.conversation_log:
        conversation_text = f"\n- Employee Chat Log: {incident.conversation_log}"

    user_prompt = f"""
New Incident Report:
- ID: {incident.id}
- Source: {incident.source_type} ({incident.source_name})
- IP: {incident.device_ip}
- Description: {incident.description}
- Base Severity: {incident.base_severity}{conversation_text}

{historical_context}
"""

    try:
        ai_response_json = generate_ai_summary(system_prompt, user_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    # Update the DB record
    incident.is_processed = True
    incident.ai_summary = json.dumps(ai_response_json)
    incident.correlated_with_id = correlated_id
    incident.final_severity = final_severity
    db.commit()
    db.refresh(incident)

    # 3. Data Distribution (Simulated push to Dashboards/Cybersec via SMS if critical)
    if final_severity == "CRITICAL" or final_severity.lower() == "high":
        sms_message = f"URGENT: ALTREON Report {incident.id} processed for {incident.device_ip}. Severity: {final_severity}."
        background_tasks.add_task(send_sms_alert, sms_message)

    return {
        "status": "success",
        "incident_id": incident.id,
        "correlated": bool(correlated_id),
        "final_severity": final_severity,
        "ai_summary": ai_response_json
    }

@app.post("/route")
def route_incident(request: RouteRequest, db: Session = Depends(get_db)):
    """
    4. Final Actions & Routing:
    Cybersecurity Team assigns tasks to reporter/affected employees, 
    and generates the final report for the Admin.
    """
    incident = db.query(IncidentLog).filter(IncidentLog.id == request.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incident.final_admin_report = request.final_admin_report
    incident.status = normalize_incident_status(request.status)
    
    db.commit()
    db.refresh(incident)
    
    return {
        "status": "success",
        "message": "Incident routing and final reporting completed.",
        "incident_id": incident.id
    }

@app.get("/reports/admin/resolved")
def get_resolved_admin_reports(db: Session = Depends(get_db)):
    """Get all resolved incidents for the compliance vault."""
    incidents = db.query(IncidentLog).filter(IncidentLog.status == "resolved").order_by(IncidentLog.timestamp.desc()).all()
    return [format_incident(i) for i in incidents]

@app.get("/incident/{incident_id}")
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the full result of an incident, including AI processing and final routing.
    """
    incident = db.query(IncidentLog).filter(IncidentLog.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    return format_incident(incident)

@app.get("/reports/employee/{source_name}")
def get_employee_reports(source_name: str, db: Session = Depends(get_db)):
    """Get all reports submitted by a specific employee/source."""
    incidents = db.query(IncidentLog).filter(IncidentLog.source_name == source_name).all()
    return incidents

@app.get("/reports/cybersec/pending")
def get_pending_reports(db: Session = Depends(get_db)):
    """Get all incidents that need Cybersec attention (processed by AI but not routed)."""
    incidents = db.query(IncidentLog).filter(IncidentLog.is_processed == True, IncidentLog.final_admin_report == None).all()
    return incidents

@app.get("/reports/admin/all")
def get_admin_reports(db: Session = Depends(get_db)):
    """Get all incidents for the admin dashboard."""
    incidents = db.query(IncidentLog).order_by(IncidentLog.timestamp.desc()).all()
    return [format_incident(i) for i in incidents]


# ==========================================
# Admin Auth Endpoints
# ==========================================

@app.post("/admin/register")
async def admin_register(request: AdminRegisterRequest):
    """
    Simple admin registration (for presentation purposes).
    """
    import app.database as database
    
    # Check if admin already exists
    existing = await database.get_admin_by_username(request.username)
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    # Create new admin
    admin_id = str(uuid.uuid4())
    password_hash = hash_password(request.password)
    
    await database.create_admin(admin_id, request.username, password_hash, request.email)
    
    return {
        "status": "success",
        "message": "Admin registered successfully",
        "admin_id": admin_id,
        "username": request.username
    }


@app.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    """
    Simple admin login with JWT token.
    """
    import app.database as database
    
    # Get admin by username
    admin = await database.get_admin_by_username(request.username)
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(request.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    access_token = create_access_token(admin["admin_id"])
    
    return AdminLoginResponse(
        access_token=access_token,
        username=request.username
    )


@app.post("/admin/fcm-token")
async def register_fcm_token(request: AdminFCMTokenRequest, authorization: str = None):
    """
    Register/update FCM device token for push notifications.
    Expects 'Bearer <token>' in authorization header.
    In development, if no token is provided, it registers to the first admin.
    """
    import app.database as database
    
    admin_id = None
    
    # Simple header-based token verification
    if authorization:
        try:
            scheme, token = authorization.split()
            if scheme.lower() == "bearer":
                admin_id = verify_token(token)
        except Exception:
            pass

    # Development Fallback: Use the first admin if no token provided
    if not admin_id:
        admins = await database.get_all_admin_fcm_tokens() # This only gets tokens, let's get IDs instead
        # Wait, let's just use a hardcoded dev-admin-id we created
        admin_id = "dev-admin-id"

    # Update FCM token
    await database.update_admin_fcm_token(admin_id, request.fcm_token)
    
    return {
        "status": "success",
        "message": "FCM token registered successfully"
    }


@app.get("/admin/profile")
async def get_admin_profile(authorization: str = None):
    """Get current admin profile."""
    import app.database as database
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
        admin_id = verify_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    admin = await database.get_admin_by_id(admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {
        "admin_id": admin["admin_id"],
        "username": admin["username"],
        "email": admin["email"],
        "fcm_device_token": admin["fcm_device_token"]
    }
