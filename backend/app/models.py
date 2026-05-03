"""
ALTREON — Pydantic Models (Schemas)
All request/response models and internal data structures.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


# ═══════════════════════════════════════════════════════════════════
#  REPORT MODELS
# ═══════════════════════════════════════════════════════════════════

class ReportCreate(BaseModel):
    """Raw report submitted by a user (employee)."""
    message: str = Field(..., min_length=5, description="Raw user description of the incident")
    reporter_name: Optional[str] = Field(None, description="Reporter name (None if anonymous)")
    reporter_email: Optional[str] = Field(None, description="Reporter email")
    reporter_department: Optional[str] = Field(None, description="Department / team")
    report_mode: Literal["anonymous", "identified"] = Field(
        "anonymous", description="Anonymous removes fear → encourages reporting"
    )
    device_info: Optional[str] = Field(None, description="Device / OS if known")
    attachments: Optional[list[str]] = Field(default_factory=list, description="File paths or URLs")


class FollowUpAnswer(BaseModel):
    """User's answer to an AI follow-up question."""
    incident_id: str
    question_index: int
    answer: str


# ═══════════════════════════════════════════════════════════════════
#  AI OUTPUT MODELS
# ═══════════════════════════════════════════════════════════════════

class ParsedReport(BaseModel):
    """Structured data extracted from raw user message (Prompt 1)."""
    what_happened: str = ""
    when: Optional[str] = None
    where: Optional[str] = None
    device: Optional[str] = None
    suspicion_level: Literal["low", "medium", "high", "unknown"] = "unknown"
    keywords: list[str] = Field(default_factory=list)


class FollowUpQuestion(BaseModel):
    """AI-generated follow-up question (Prompt 2)."""
    question: str
    type: Literal["mcq", "text"] = "mcq"
    options: list[str] = Field(default_factory=list)


class IncidentClassification(BaseModel):
    """Incident type classification (Prompt 4)."""
    type: Literal[
        "phishing", "malware", "unauthorized_access",
        "data_leak", "device_loss", "insider_threat", "other"
    ] = "other"
    confidence: float = Field(0.0, ge=0, le=1)


class RiskScore(BaseModel):
    """Risk / severity assessment (Prompt 5)."""
    severity: Literal["low", "medium", "high", "critical"] = "low"
    reason: str = ""


class IncidentReport(BaseModel):
    """Final structured incident JSON (Prompt 6) — the main system output."""
    incident_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "other"
    severity: str = "low"
    timeline: list[str] = Field(default_factory=list)
    affected_assets: list[str] = Field(default_factory=list)
    indicators: list[str] = Field(default_factory=list)
    user_summary: str = ""
    ai_analysis: str = ""
    recommended_actions: list[str] = Field(default_factory=list)
    confidence_score: float = Field(0.0, ge=0, le=1)
    report_mode: str = "anonymous"
    status: Literal["open", "triaged", "escalated", "resolved"] = "open"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ═══════════════════════════════════════════════════════════════════
#  SYSTEM ALERT MODEL (SOC SIGNAL FUSION)
# ═══════════════════════════════════════════════════════════════════

class SystemAlert(BaseModel):
    """External system alert (antivirus, firewall, SOAR, etc.)."""
    source: Literal["antivirus", "firewall", "soar", "ids", "edr", "other"] = "other"
    alert_type: str
    description: str
    timestamp: Optional[str] = None
    device_id: Optional[str] = None
    severity: Optional[str] = None
    raw_data: Optional[dict] = None


class SOCFusionInput(BaseModel):
    """Input for SOC Signal Fusion (Prompt 3) — merge user + system signals."""
    user_report: ParsedReport
    system_alerts: list[SystemAlert] = Field(default_factory=list)


class SOCFusionResult(BaseModel):
    """Output of SOC Signal Fusion."""
    unified_timeline: list[str] = Field(default_factory=list)
    suspicious_patterns: list[str] = Field(default_factory=list)
    contradictions: list[str] = Field(default_factory=list)
    confidence_score: float = Field(0.0, ge=0, le=1)


# ═══════════════════════════════════════════════════════════════════
#  AUDIT LOG MODEL
# ═══════════════════════════════════════════════════════════════════

class AuditLog(BaseModel):
    """Immutable event log entry — required for audit trail."""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    actor: Literal["user", "ai", "system", "admin"] = "system"
    action: str
    incident_id: Optional[str] = None
    data: Optional[dict] = None


# ═══════════════════════════════════════════════════════════════════
#  ROUTING MODELS
# ═══════════════════════════════════════════════════════════════════

class RoutingDecision(BaseModel):
    """Output of the rule-based routing engine."""
    assigned_to: str = "log_only"
    actions: list[str] = Field(default_factory=list)
    escalated: bool = False
    reason: str = ""


# ═══════════════════════════════════════════════════════════════════
#  SILENCE DETECTION (INNOVATIVE FEATURE)
# ═══════════════════════════════════════════════════════════════════

class SilenceDetectionInput(BaseModel):
    """Input for Smart Silence Detection — system alert with no matching report."""
    system_alerts: list[SystemAlert]
    existing_incident_ids: list[str] = Field(default_factory=list)


class AutoDraftReport(BaseModel):
    """AI-generated draft report from unmatched system alerts."""
    draft_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_alerts: list[str] = Field(default_factory=list)
    generated_summary: str = ""
    suggested_severity: str = "medium"
    requires_human_review: bool = True


# ═══════════════════════════════════════════════════════════════════
#  ADMIN AUTHENTICATION MODELS
# ═══════════════════════════════════════════════════════════════════

class AdminRegister(BaseModel):
    """Admin registration request."""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    email: Optional[str] = None


class AdminLogin(BaseModel):
    """Admin login request."""
    username: str
    password: str


class AdminTokenResponse(BaseModel):
    """Admin login response with token."""
    access_token: str
    token_type: str = "bearer"
    username: str


class AdminProfile(BaseModel):
    """Admin profile data."""
    admin_id: str
    username: str
    email: Optional[str] = None
    fcm_device_token: Optional[str] = None
    created_at: str
