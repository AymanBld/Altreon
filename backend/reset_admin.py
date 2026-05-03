import asyncio
from app.database import DB_PATH, create_admin, get_admin_by_username
from app.main import hash_password
import aiosqlite
from datetime import datetime

async def reset():
    print("Resetting admin password...")
    password_hash = hash_password("password123")
    now = datetime.utcnow().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        # Check if exists
        cursor = await db.execute("SELECT admin_id FROM admins WHERE username = 'admin'")
        row = await cursor.fetchone()
        
        if row:
            print("Admin found, updating password...")
            await db.execute(
                "UPDATE admins SET password_hash = ?, updated_at = ? WHERE username = 'admin'",
                (password_hash, now)
            )
        else:
            print("Admin not found, creating...")
            await db.execute(
                """INSERT INTO admins (admin_id, username, password_hash, email, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                ("dev-admin-id", "admin", password_hash, "admin@cyberbase.local", now, now)
            )
        await db.commit()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(reset())
