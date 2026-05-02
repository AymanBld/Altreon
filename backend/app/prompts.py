"""
ALTREON — Prompt Templates
All AI prompts stored as structured data. Each prompt is modular and token-optimized.
"""

# ═══════════════════════════════════════════════════════════════════
#  SYSTEM PROMPT — defines Gemma's global behavior
# ═══════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are ALTREON AI, a cybersecurity incident triage assistant.

Your role:
- Transform raw user reports + system alerts into structured incident data
- Ask smart follow-up questions when information is missing
- Classify severity (low, medium, high, critical)
- Detect possible attack types (phishing, malware, insider, data leak, etc.)
- Extract technical indicators (IP, device, time, behavior)
- Produce a final structured JSON

Constraints:
- Be concise (low tokens)
- Never hallucinate facts
- If uncertain → ask targeted questions (max 3)
- Prefer multiple choice (QCM style) over long text
- Always output structured JSON when analysis is complete

Tone:
- Calm, non-blaming
- Encourage reporting
- No technical jargon unless needed"""


# ═══════════════════════════════════════════════════════════════════
#  PROMPT 1 — Initial Report Parser
# ═══════════════════════════════════════════════════════════════════

PROMPT_PARSE_REPORT = """Analyze this raw user report and extract structured information.

USER REPORT:
\"\"\"
{user_message}
\"\"\"

Return ONLY valid JSON with these fields:
{{
  "what_happened": "brief description",
  "when": "time/date if mentioned, else null",
  "where": "location/system if mentioned, else null",
  "device": "device info if mentioned, else null",
  "suspicion_level": "low | medium | high | unknown",
  "keywords": ["relevant", "security", "keywords"]
}}"""


# ═══════════════════════════════════════════════════════════════════
#  PROMPT 2 — Follow-Up Question Generator (Psychology-Optimized)
# ═══════════════════════════════════════════════════════════════════

PROMPT_FOLLOW_UP = """You are guiding a non-technical employee reporting a possible security issue.

PARSED REPORT:
{parsed_report}

Rules:
- No blame
- Simple language
- Use multiple choice when possible
- Ask only high-value questions that reduce uncertainty

Generate up to 3 follow-up questions.

Return ONLY valid JSON array:
[
  {{
    "question": "...",
    "type": "mcq",
    "options": ["A", "B", "C"]
  }}
]"""


# ═══════════════════════════════════════════════════════════════════
#  PROMPT 3 — SOC Signal Fusion
# ═══════════════════════════════════════════════════════════════════

PROMPT_SOC_FUSION = """Merge and correlate the user report with system alerts.

USER REPORT:
{user_report}

SYSTEM ALERTS:
{system_alerts}

Return ONLY valid JSON:
{{
  "unified_timeline": ["event1 at time1", "event2 at time2"],
  "suspicious_patterns": ["pattern1", "pattern2"],
  "contradictions": ["contradiction1"],
  "confidence_score": 0.0-1.0
}}"""


# ═══════════════════════════════════════════════════════════════════
#  PROMPT 4 — Incident Classifier
# ═══════════════════════════════════════════════════════════════════

PROMPT_CLASSIFY = """Classify this incident based on the available data.

INCIDENT DATA:
{incident_data}

Categories:
- phishing
- malware
- unauthorized_access
- data_leak
- device_loss
- insider_threat
- other

Return ONLY valid JSON:
{{
  "type": "category_name",
  "confidence": 0.0-1.0
}}"""


# ═══════════════════════════════════════════════════════════════════
#  PROMPT 5 — Risk Scoring
# ═══════════════════════════════════════════════════════════════════

PROMPT_RISK_SCORE = """Evaluate the severity of this incident.

INCIDENT DATA:
{incident_data}

Criteria:
- impact (data sensitivity, number of users affected)
- spread potential (can it propagate?)
- data sensitivity (personal data, credentials, financial)

Return ONLY valid JSON:
{{
  "severity": "low | medium | high | critical",
  "reason": "brief justification"
}}"""


# ═══════════════════════════════════════════════════════════════════
#  PROMPT 6 — Final Incident JSON Generator
# ═══════════════════════════════════════════════════════════════════

PROMPT_FINAL_REPORT = """Generate the final structured incident report.

ALL GATHERED DATA:
- Parsed report: {parsed_report}
- Classification: {classification}
- Risk score: {risk_score}
- SOC fusion (if available): {soc_fusion}
- Follow-up answers: {follow_up_answers}

Return ONLY valid JSON:
{{
  "type": "incident_type",
  "severity": "low | medium | high | critical",
  "timeline": ["event1", "event2"],
  "affected_assets": ["asset1", "asset2"],
  "indicators": ["indicator1", "indicator2"],
  "user_summary": "plain language summary for the reporter",
  "ai_analysis": "technical analysis for SOC team",
  "recommended_actions": ["action1", "action2"],
  "confidence_score": 0.0-1.0
}}"""


# ═══════════════════════════════════════════════════════════════════
#  PROMPT 7 — Action Generator (optional AI-assisted routing)
# ═══════════════════════════════════════════════════════════════════

PROMPT_ACTIONS = """Given this incident, suggest concrete response actions.

INCIDENT:
{incident_json}

Rules:
- Keep actions short and executable
- Prioritize by urgency
- Include both immediate and follow-up actions

Return ONLY valid JSON array:
["action1", "action2", "action3"]"""


# ═══════════════════════════════════════════════════════════════════
#  PROMPT — Smart Silence Detection (innovative feature)
# ═══════════════════════════════════════════════════════════════════

PROMPT_SILENCE_DETECTION = """System alerts were detected but NO user report was filed.
This may indicate a "silence problem" — the user is unaware or afraid to report.

UNMATCHED SYSTEM ALERTS:
{system_alerts}

Generate a draft incident report from these alerts alone.

Return ONLY valid JSON:
{{
  "generated_summary": "what likely happened based on system data",
  "suggested_severity": "low | medium | high | critical",
  "requires_human_review": true,
  "source_alerts": ["alert_id_1", "alert_id_2"]
}}"""
