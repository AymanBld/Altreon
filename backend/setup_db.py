import asyncio
from app.database import init_db, create_admin
from app.main import hash_password
import uuid

async def setup():
    print("Initializing database...")
    await init_db()
    
    # Create default admin
    admin_id = "dev-admin-id"
    username = "admin"
    password = "password123"
    
    print(f"Creating default admin: {username}")
    try:
        await create_admin(admin_id, username, hash_password(password), "admin@cyberbase.local")
        print("Admin created successfully!")
    except Exception as e:
        print(f"Admin creation skipped (likely already exists): {e}")

if __name__ == "__main__":
    asyncio.run(setup())
