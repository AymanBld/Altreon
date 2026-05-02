"""
ALTREON — Routing Engine
Rule-based incident routing — no AI needed (saves tokens).
"""

from .models import RoutingDecision
import logging

logger = logging.getLogger("altreon.routing")


def route_incident(
    incident_type: str, severity: str,
    confidence: float, device_compromised: bool = False,
) -> RoutingDecision:
    actions, assigned_to, escalated, reasons = [], "log_only", False, []

    # Human-in-the-loop fallback
    if confidence < 0.6:
        assigned_to, escalated = "analyst", True
        actions.append("ESCALATE: Low AI confidence — requires human review")
        reasons.append(f"AI confidence {confidence:.0%} < 60%")

    # Critical → immediate
    if severity == "critical":
        assigned_to, escalated = "analyst", True
        actions += ["ALERT: Notify SOC analyst immediately", "ALERT: Notify CISO"]
        reasons.append("Critical severity")
    elif severity == "high":
        assigned_to, escalated = "analyst", True
        actions.append("ALERT: Assign to SOC analyst")
        reasons.append("High severity")

    # Type-specific actions
    if incident_type == "phishing":
        actions += ["ACTION: Security awareness reminder", "ACTION: Password reset", "ACTION: Check email quarantine"]
        if assigned_to == "log_only": assigned_to = "auto_response"
    elif incident_type == "malware":
        actions += ["ACTION: Full antivirus scan", "ACTION: Check network for C2"]
        if severity in ("medium", "high", "critical"):
            actions.append("ACTION: Isolate device")
            assigned_to, escalated = "analyst", True
    elif incident_type == "data_leak":
        actions += ["ACTION: Identify data exposure scope", "ACTION: Check DLP logs", "ACTION: Prepare breach notification"]
        assigned_to, escalated = "analyst", True
    elif incident_type == "unauthorized_access":
        actions += ["ACTION: Disable compromised account", "ACTION: Review access logs", "ACTION: Force password reset"]
        if severity != "low": assigned_to, escalated = "analyst", True
    elif incident_type == "insider_threat":
        actions += ["ACTION: Restrict user access", "ACTION: Preserve audit logs", "ALERT: Notify HR and legal"]
        assigned_to, escalated = "analyst", True
        reasons.append("Insider threat — sensitive")

    if device_compromised:
        actions += ["URGENT: Isolate device", "ACTION: Revoke certificates"]
        assigned_to, escalated = "analyst", True

    if severity == "low" and not escalated:
        actions.append("LOG: Record for trending")
        reasons.append("Low severity — logged")
    if severity == "medium" and not escalated:
        assigned_to = "queue"
        actions.append("QUEUE: Add to analyst review queue")
        reasons.append("Medium severity — queued")

    return RoutingDecision(
        assigned_to=assigned_to, actions=actions,
        escalated=escalated, reason=" | ".join(reasons) or "Standard routing",
    )
