import sqlite3
import os

db_path = os.path.join('app', 'database.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT id, base_severity, ai_summary FROM incident_logs ORDER BY id DESC LIMIT 5")
rows = cursor.fetchall()
for row in rows:
    print(f"ID: {row[0]} | SEV: {row[1]}")
    # print(f"AI: {row[2][:50]}...")
conn.close()
