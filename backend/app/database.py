"""
ALTREON — Database Layer
Async SQLite database for incidents, audit logs, and auto-drafts.
"""

import aiosqlite
import json
from pathlib import Path

import os

# DB_DIR = "/opt/render/project/src/data"
BASE_DIR = Path(__file__).resolve().parent
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)
# DATABASE_URL = f"sqlite:///{DB_DIR}/sql_app.db"
# DB_PATH = Path(__file__).parent.parent / "altreon.db"
DB_PATH = BASE_DIR / "your_database_name.db"
DATABASE_URL = str(DB_PATH)



async def init_db():
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS incidents (
                incident_id TEXT PRIMARY KEY,
                type TEXT DEFAULT 'other',
                severity TEXT DEFAULT 'low',
                timeline TEXT DEFAULT '[]',
                affected_assets TEXT DEFAULT '[]',
                indicators TEXT DEFAULT '[]',
                user_summary TEXT DEFAULT '',
                ai_analysis TEXT DEFAULT '',
                recommended_actions TEXT DEFAULT '[]',
                confidence_score REAL DEFAULT 0.0,
                report_mode TEXT DEFAULT 'anonymous',
                status TEXT DEFAULT 'open',
                raw_message TEXT DEFAULT '',
                parsed_report TEXT DEFAULT '{}',
                follow_up_questions TEXT DEFAULT '[]',
                follow_up_answers TEXT DEFAULT '[]',
                classification TEXT DEFAULT '{}',
                risk_score TEXT DEFAULT '{}',
                soc_fusion TEXT DEFAULT '{}',
                routing_decision TEXT DEFAULT '{}',
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS audit_logs (
                event_id TEXT PRIMARY KEY,
                timestamp TEXT,
                actor TEXT DEFAULT 'system',
                action TEXT,
                incident_id TEXT,
                data TEXT DEFAULT '{}',
                FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
            );

            CREATE TABLE IF NOT EXISTS auto_drafts (
                draft_id TEXT PRIMARY KEY,
                source_alerts TEXT DEFAULT '[]',
                generated_summary TEXT DEFAULT '',
                suggested_severity TEXT DEFAULT 'medium',
                requires_human_review INTEGER DEFAULT 1,
                created_at TEXT,
                reviewed INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS system_alerts (
                alert_id TEXT PRIMARY KEY,
                source TEXT DEFAULT 'other',
                alert_type TEXT,
                description TEXT,
                timestamp TEXT,
                device_id TEXT,
                severity TEXT,
                raw_data TEXT DEFAULT '{}',
                matched_incident_id TEXT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS admins (
                admin_id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT,
                fcm_device_token TEXT,
                created_at TEXT,
                updated_at TEXT
            );
        """)
        await db.commit()


# ─── Incident CRUD ──────────────────────────────────────────────

async def save_incident(incident: dict) -> str:
    """Insert or update an incident record."""
    from datetime import datetime
    incident["updated_at"] = datetime.utcnow().isoformat()
    
    # Serialize all non-primitive types to JSON strings for SQLite
    for key, val in incident.items():
        if isinstance(val, (list, dict)):
            incident[key] = json.dumps(val)

    async with aiosqlite.connect(DB_PATH) as db:
        columns = ", ".join(incident.keys())
        placeholders = ", ".join(["?" for _ in incident])
        updates = ", ".join([f"{k} = excluded.{k}" for k in incident.keys()])

        await db.execute(
            f"""INSERT INTO incidents ({columns}) VALUES ({placeholders})
                ON CONFLICT(incident_id) DO UPDATE SET {updates}""",
            list(incident.values())
        )
        await db.commit()
    return incident["incident_id"]


async def get_incident(incident_id: str) -> dict | None:
    """Retrieve a single incident by ID."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM incidents WHERE incident_id = ?", (incident_id,)
        )
        row = await cursor.fetchone()
        if not row:
            return None
        
        result = dict(row)
        # Deserialize JSON fields
        for field in ["timeline", "affected_assets", "indicators",
                       "recommended_actions", "follow_up_questions",
                       "follow_up_answers"]:
            if result.get(field):
                try:
                    result[field] = json.loads(result[field])
                except (json.JSONDecodeError, TypeError):
                    pass

        for field in ["parsed_report", "classification", "risk_score",
                       "soc_fusion", "routing_decision"]:
            if result.get(field):
                try:
                    result[field] = json.loads(result[field])
                except (json.JSONDecodeError, TypeError):
                    pass
        return result


async def list_incidents(
    status: str | None = None,
    severity: str | None = None,
    limit: int = 50
) -> list[dict]:
    """List incidents with optional filters."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM incidents WHERE 1=1"
        params = []
        if status:
            query += " AND status = ?"
            params.append(status)
        if severity:
            query += " AND severity = ?"
            params.append(severity)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_recent_incidents(limit: int = 10, exclude_id: str = None) -> list[dict]:
    """Get the most recent incidents for correlation analysis."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT incident_id, user_summary, type, severity, created_at FROM incidents"
        params = []
        if exclude_id:
            query += " WHERE incident_id != ?"
            params.append(exclude_id)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


# ─── Audit Log ───────────────────────────────────────────────────

async def save_audit_log(log: dict):
    """Append an immutable audit event."""
    if "data" in log and isinstance(log["data"], dict):
        log["data"] = json.dumps(log["data"])

    async with aiosqlite.connect(DB_PATH) as db:
        columns = ", ".join(log.keys())
        placeholders = ", ".join(["?" for _ in log])
        await db.execute(
            f"INSERT INTO audit_logs ({columns}) VALUES ({placeholders})",
            list(log.values())
        )
        await db.commit()


async def get_audit_trail(incident_id: str) -> list[dict]:
    """Get full audit trail for an incident."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM audit_logs WHERE incident_id = ? ORDER BY timestamp ASC",
            (incident_id,)
        )
        rows = await cursor.fetchall()
        results = []
        for r in rows:
            d = dict(r)
            if d.get("data"):
                try:
                    d["data"] = json.loads(d["data"])
                except (json.JSONDecodeError, TypeError):
                    pass
            results.append(d)
        return results


# ─── Auto Drafts (Silence Detection) ────────────────────────────

async def save_auto_draft(draft: dict):
    """Save an AI-generated draft from silence detection."""
    if "source_alerts" in draft and isinstance(draft["source_alerts"], list):
        draft["source_alerts"] = json.dumps(draft["source_alerts"])

    async with aiosqlite.connect(DB_PATH) as db:
        columns = ", ".join(draft.keys())
        placeholders = ", ".join(["?" for _ in draft])
        await db.execute(
            f"INSERT INTO auto_drafts ({columns}) VALUES ({placeholders})",
            list(draft.values())
        )
        await db.commit()


async def list_auto_drafts(reviewed: bool = False) -> list[dict]:
    """List auto-generated draft reports."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM auto_drafts WHERE reviewed = ? ORDER BY created_at DESC",
            (int(reviewed),)
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


# ─── Admin CRUD ─────────────────────────────────────────────────

async def create_admin(admin_id: str, username: str, password_hash: str, email: str = None) -> str:
    """Create a new admin user."""
    from datetime import datetime
    now = datetime.utcnow().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        try:
            await db.execute(
                """INSERT INTO admins (admin_id, username, password_hash, email, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (admin_id, username, password_hash, email, now, now)
            )
            await db.commit()
            return admin_id
        except Exception:
            raise


async def get_admin_by_username(username: str) -> dict | None:
    """Retrieve admin by username."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM admins WHERE username = ?", (username,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None


async def get_admin_by_id(admin_id: str) -> dict | None:
    """Retrieve admin by ID."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM admins WHERE admin_id = ?", (admin_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None


async def update_admin_fcm_token(admin_id: str, fcm_token: str) -> bool:
    """Update admin's FCM device token."""
    from datetime import datetime
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE admins SET fcm_device_token = ?, updated_at = ? WHERE admin_id = ?",
            (fcm_token, datetime.utcnow().isoformat(), admin_id)
        )
        await db.commit()
    return True


async def get_all_admin_fcm_tokens() -> list[str]:
    """Get all active FCM tokens for push notifications."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT fcm_device_token FROM admins WHERE fcm_device_token IS NOT NULL"
        )
        rows = await cursor.fetchall()
        return [row["fcm_device_token"] for row in rows]
