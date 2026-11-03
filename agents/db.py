import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agents.db")

def get_db():
    """Returns a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Marketing events table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS marketing_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            event_type TEXT NOT NULL, -- 'webinar', 'evergreen', 'campaign'
            event_date TEXT NOT NULL,  -- YYYY-MM-DD
            deadline_date TEXT NOT NULL, -- YYYY-MM-DD
            description TEXT,
            status TEXT DEFAULT 'pending', -- 'pending', 'notified'
            calendar_event_id TEXT
        )
    """)
    
    # Mindset goals table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mindset_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_text TEXT NOT NULL,
            date_added TEXT DEFAULT (date('now')),
            target_date TEXT,
            progress TEXT,
            status TEXT DEFAULT 'active' -- 'active', 'completed'
        )
    """)
    
    # Mindset logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mindset_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_date TEXT DEFAULT (date('now')),
            mood TEXT,
            notes TEXT
        )
    """)
    
    # Chat logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT NOT NULL, -- 'GrowthPartner', 'MindsetPartner'
            role TEXT NOT NULL, -- 'user', 'assistant'
            message TEXT NOT NULL,
            timestamp TEXT DEFAULT (datetime('now'))
        )
    """)
    
    conn.commit()
    conn.close()
    print("SQLite Database initialized successfully at:", DB_PATH)

if __name__ == "__main__":
    init_db()
