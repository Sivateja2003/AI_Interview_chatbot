"""SQLite database for session history, interactions, and weak area tracking."""

import aiosqlite
import os
from app.config import Settings

DB_PATH: str = ""


async def init_db(settings: Settings):
    """Initialize SQLite database and create tables."""
    global DB_PATH
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    DB_PATH = settings.DATABASE_URL or os.path.join(settings.DATA_DIR, "interview.db")

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                started_at TEXT NOT NULL,
                difficulty TEXT DEFAULT 'intermediate',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                question_id TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT,
                score REAL,
                correctness REAL,
                depth REAL,
                clarity REAL,
                feedback TEXT,
                improvement TEXT,
                difficulty TEXT NOT NULL,
                topic TEXT DEFAULT '',
                sources_json TEXT DEFAULT '[]',
                timestamp TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS weak_areas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                topic TEXT NOT NULL,
                score REAL NOT NULL,
                session_id TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                doc_type TEXT NOT NULL,
                filename TEXT NOT NULL,
                summary TEXT DEFAULT '',
                file_path TEXT NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_interactions_session ON interactions(session_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_weak_areas_user ON weak_areas(user_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id)"
        )
        await db.commit()


def get_db_path() -> str:
    """Return the current database path."""
    return DB_PATH


async def get_db():
    """Get an async database connection."""
    db = await aiosqlite.connect(get_db_path())
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()
