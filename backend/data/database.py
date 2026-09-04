"""
UrjaDrishti - SQLite Database Engine
Manages operational tables:
- hourly_demand: Historical & telemetry observations
- feeders: 33kV/11kV distribution lines
- substations: 400kV/220kV/66kV grid nodes
- alerts_log: Operational alarms and audit trail
"""
import os
import sqlite3
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "grid_database.sqlite")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    """Creates database schema for UrjaDrishti."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Hourly Demand Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hourly_demand (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT UNIQUE NOT NULL,
        hour INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        day_of_year INTEGER NOT NULL,
        is_weekend INTEGER NOT NULL,
        is_holiday INTEGER NOT NULL,
        temperature_c REAL NOT NULL,
        humidity_pct REAL NOT NULL,
        demand_mw REAL NOT NULL,
        cooling_load_mw REAL,
        heating_load_mw REAL,
        north_zone_mw REAL,
        south_zone_mw REAL,
        east_zone_mw REAL,
        west_zone_mw REAL,
        central_zone_mw REAL
    );
    """)

    # 2. Feeders Master Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feeders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        area TEXT NOT NULL,
        discom TEXT NOT NULL,
        substation TEXT NOT NULL,
        voltage_kv REAL NOT NULL,
        capacity_mw REAL NOT NULL,
        normal_power_factor REAL NOT NULL,
        conductor_type TEXT,
        length_km REAL,
        status TEXT DEFAULT 'NORMAL'
    );
    """)

    # 3. Substations Master Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS substations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        voltage_class TEXT NOT NULL,
        zone TEXT NOT NULL,
        operator TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        installed_mva REAL NOT NULL,
        commissioned_year INTEGER
    );
    """)

    # 4. Alerts and Alarms Audit Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts_log (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        severity TEXT NOT NULL,
        area TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        recommended_action TEXT,
        acknowledged_by TEXT,
        acknowledged_at TEXT
    );
    """)

    # Indices for high-speed queries
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_demand_timestamp ON hourly_demand(timestamp);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_demand_hour ON hourly_demand(hour);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_feeders_area ON feeders(area);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts_log(severity);")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    initialize_database()
    print(f"Database initialized at: {DB_PATH}")
