import sqlite3

DB_PATH = "birthday_database.db"

conn = sqlite3.connect(DB_PATH)
#conn 
conn.row_factory = sqlite3.Row
statement = conn.execute("SELECT * FROM friend")
rows = statement.fetchall()
conn.close()
for item in rows:
    print(item) 