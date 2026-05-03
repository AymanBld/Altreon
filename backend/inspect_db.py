import sqlite3
import os

db_path = 'compliance_logs.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT id, description, base_severity, status, timestamp FROM incident_logs WHERE id=18")
row = cursor.fetchone()
if row:
    print(f"ID: {row[0]} | SEV: {row[2]} | STATUS: {row[3]} | TIME: {row[4]} | DESC: {row[1]}")
else:
    print("Incident 18 not found")
rows = cursor.fetchall()
for row in rows:
    print(f"ID: {row[0]} | SEV: {row[2]} | STATUS: {row[3]} | DESC: {row[1][:40]}...")
conn.close()
