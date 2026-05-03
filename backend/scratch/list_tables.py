import sqlite3
import os

db_path = os.path.join('backend', 'altreon.db')
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    rows = cursor.fetchall()
    for row in rows:
        print(f"Table: {row[0]}")
    conn.close()
