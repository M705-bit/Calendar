import sqlite3
from fastapi import HTTPException
from typing import Optional

DB_PATH = "birthday_database.db"

#cria tabela dos amigos 
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS friend (
            name TEXT PRIMARY KEY,
            birthday TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

