import sqlite3
import os

db_path = os.path.join('backend', 'altreon.db')
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT admin_id, username FROM admins;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Username: {row[1]}")
    conn.close()
