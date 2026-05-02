"""
ALTREON — AI Service
Gemma 4 31B via NVIDIA NIM API (OpenAI-compatible SDK).
Implements the full AI processing pipeline: parse → follow-up → classify → score → finalize.
"""

import json
import asyncio
import logging
from typing import Any

from openai import AsyncOpenAI

from .config import settings
from .prompts import (
    SYSTEM_PROMPT, PROMPT_PARSE_REPORT, PROMPT_FOLLOW_UP,
    PROMPT_SOC_FUSION, PROMPT_CLASSIFY, PROMPT_RISK_SCORE,
    PROMPT_FINAL_REPORT, PROMPT_ACTIONS, PROMPT_SILENCE_DETECTION,
)

logger = logging.getLogger("altreon.ai")

# ── Clients ────────────────────────────────────────────────────────
_nvidia_client = AsyncOpenAI(
    api_key=settings.nvidia_api_key,
    base_url=settings.nvidia_base_url,
)

try:
    from google import genai
    from google.genai import types
    _google_client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None
except ImportError:
    _google_client = None


# ═══════════════════════════════════════════════════════════════════
#  LOW-LEVEL INFERENCE
# ═══════════════════════════════════════════════════════════════════

async def infer(prompt: str, system: str = SYSTEM_PROMPT) -> str:
    """Call the configured AI provider. Retries on 429."""
    if settings.active_ai_provider == "google":
        return await _infer_google(prompt, system)
    else:
        return await _infer_nvidia(prompt, system)

async def _infer_google(prompt: str, system: str) -> str:
    if not _google_client:
        raise RuntimeError("Google genai client not initialized. Check GEMINI_API_KEY.")
    
    for attempt in range(4):
        try:
            response = await _google_client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    temperature=0.3,
                )
            )
            return response.text or ""
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "rate" in err_msg.lower() or "quota" in err_msg.lower():
                wait = (2 ** attempt) * 2
                logger.warning(f"Google API rate limited, retry in {wait}s (attempt {attempt+1}/4)")
                await asyncio.sleep(wait)
                continue
            logger.error(f"Google API error: {e}")
            raise
    raise RuntimeError("Google API: max retries exceeded")

async def _infer_nvidia(prompt: str, system: str) -> str:
    for attempt in range(4):
        try:
            response = await _nvidia_client.chat.completions.create(
                model=settings.nvidia_model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=1024,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            err_msg = str(e)
            # Rate limited → backoff and retry
            if "429" in err_msg or "rate" in err_msg.lower():
                wait = (2 ** attempt) * 2
                logger.warning(f"NVIDIA API rate limited, retry in {wait}s (attempt {attempt+1}/4)")
                await asyncio.sleep(wait)
                continue
            logger.error(f"NVIDIA API error: {e}")
            raise

    raise RuntimeError("NVIDIA API: max retries exceeded (rate limited)")


def _extract_json(text: str) -> Any:
    """Extract JSON from AI response (handles markdown code blocks)."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        for start_char, end_char in [("{", "}"), ("[", "]")]:
            start = text.find(start_char)
            end = text.rfind(end_char) + 1
            if start != -1 and end > start:
                try:
                    return json.loads(text[start:end])
                except json.JSONDecodeError:
                    continue
        logger.warning(f"Failed to parse JSON from AI: {text[:200]}")
        return None


# ═══════════════════════════════════════════════════════════════════
#  PIPELINE STEPS
# ═══════════════════════════════════════════════════════════════════

async def parse_report(user_message: str) -> dict:
    """Step 1 — Parse raw user message into structured data."""
    prompt = PROMPT_PARSE_REPORT.format(user_message=user_message)
    raw = await infer(prompt)
    parsed = _extract_json(raw)
    if parsed is None:
        parsed = {
            "what_happened": user_message,
            "when": None, "where": None, "device": None,
            "suspicion_level": "unknown", "keywords": []
        }
    return parsed


async def generate_follow_ups(parsed_report: dict) -> list[dict]:
    """Step 2 — Generate psychology-optimized follow-up questions."""
    prompt = PROMPT_FOLLOW_UP.format(parsed_report=json.dumps(parsed_report, indent=2))
    raw = await infer(prompt)
    questions = _extract_json(raw)
    if not isinstance(questions, list):
        questions = []
    return questions[:3]


async def fuse_soc_signals(user_report: dict, system_alerts: list[dict]) -> dict:
    """Step 3 — SOC Signal Fusion."""
    prompt = PROMPT_SOC_FUSION.format(
        user_report=json.dumps(user_report, indent=2),
        system_alerts=json.dumps(system_alerts, indent=2),
    )
    raw = await infer(prompt)
    result = _extract_json(raw)
    if result is None:
        result = {"unified_timeline": [], "suspicious_patterns": [],
                  "contradictions": [], "confidence_score": 0.0}
    return result


async def classify_incident(incident_data: dict) -> dict:
    """Step 4 — Classify incident type."""
    prompt = PROMPT_CLASSIFY.format(incident_data=json.dumps(incident_data, indent=2))
    raw = await infer(prompt)
    result = _extract_json(raw)
    if result is None:
        result = {"type": "other", "confidence": 0.0}
    return result


async def score_risk(incident_data: dict) -> dict:
    """Step 5 — Risk scoring."""
    prompt = PROMPT_RISK_SCORE.format(incident_data=json.dumps(incident_data, indent=2))
    raw = await infer(prompt)
    result = _extract_json(raw)
    if result is None:
        result = {"severity": "low", "reason": "Unable to assess"}
    return result


async def generate_final_report(
    parsed_report: dict, classification: dict, risk_score: dict,
    soc_fusion: dict | None = None, follow_up_answers: list[str] | None = None,
) -> dict:
    """Step 6 — Final structured incident JSON."""
    prompt = PROMPT_FINAL_REPORT.format(
        parsed_report=json.dumps(parsed_report, indent=2),
        classification=json.dumps(classification, indent=2),
        risk_score=json.dumps(risk_score, indent=2),
        soc_fusion=json.dumps(soc_fusion, indent=2) if soc_fusion else "N/A",
        follow_up_answers=json.dumps(follow_up_answers) if follow_up_answers else "N/A",
    )
    raw = await infer(prompt)
    result = _extract_json(raw)
    if result is None:
        result = {
            "type": classification.get("type", "other"),
            "severity": risk_score.get("severity", "low"),
            "timeline": [], "affected_assets": [], "indicators": [],
            "user_summary": parsed_report.get("what_happened", ""),
            "ai_analysis": "", "recommended_actions": [],
            "confidence_score": classification.get("confidence", 0.0),
        }
    return result


async def generate_actions(incident_json: dict) -> list[str]:
    """Step 7 — Suggest response actions."""
    prompt = PROMPT_ACTIONS.format(incident_json=json.dumps(incident_json, indent=2))
    raw = await infer(prompt)
    result = _extract_json(raw)
    if not isinstance(result, list):
        result = []
    return result


async def detect_silence(system_alerts: list[dict]) -> dict:
    """Smart Silence Detection."""
    prompt = PROMPT_SILENCE_DETECTION.format(
        system_alerts=json.dumps(system_alerts, indent=2)
    )
    raw = await infer(prompt)
    result = _extract_json(raw)
    if result is None:
        result = {"generated_summary": "Auto-generated from system alerts",
                  "suggested_severity": "medium", "requires_human_review": True,
                  "source_alerts": []}
    return result


# ═══════════════════════════════════════════════════════════════════
#  FULL PIPELINE
# ═══════════════════════════════════════════════════════════════════

async def run_full_pipeline(
    user_message: str,
    system_alerts: list[dict] | None = None,
    follow_up_answers: list[str] | None = None,
) -> dict:
    """parse → (fuse SOC) → classify → score → finalize"""
    parsed = await parse_report(user_message)

    soc_fusion = None
    if system_alerts:
        soc_fusion = await fuse_soc_signals(parsed, system_alerts)

    classify_input = {**parsed}
    if soc_fusion:
        classify_input["soc_patterns"] = soc_fusion.get("suspicious_patterns", [])
    classification = await classify_incident(classify_input)

    risk_input = {**classify_input, "type": classification.get("type", "other")}
    risk = await score_risk(risk_input)

    final = await generate_final_report(
        parsed, classification, risk, soc_fusion, follow_up_answers
    )

    return {
        "parsed_report": parsed,
        "classification": classification,
        "risk_score": risk,
        "soc_fusion": soc_fusion,
        "final_report": final,
    }
