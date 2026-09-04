"""
Database Seeding & Dataset Generation Script for UrjaDrishti
Generates:
1. grid_database.sqlite
2. delhi_hourly_demand_2023_2026.csv
Populates all tables: hourly_demand, feeders, substations, alerts_log
"""
import os
import sys
import json
import sqlite3
import pandas as pd
import numpy as np

# Ensure backend directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from data.database import initialize_database, get_connection
from ml.dataset import generate_delhi_demand_dataset
from services.grid_service import FEEDERS_DATA, ALERTS_DATA

DATA_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(DATA_DIR, "delhi_hourly_demand_2023_2026.csv")
FEEDERS_JSON = os.path.join(DATA_DIR, "feeders.json")
SUBSTATIONS_JSON = os.path.join(DATA_DIR, "substations.json")

def seed():
    print("Initializing SQLite schema...")
    initialize_database()
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Generate Historical Delhi Demand (Jan 2023 - Aug 2026)
    print("Generating comprehensive Delhi hourly demand dataset (Jan 2023 - Aug 2026)...")
    df = generate_delhi_demand_dataset("2023-01-01", "2026-08-31")
    
    # Calculate Zonal allocations
    df["cooling_load_mw"] = np.round(np.maximum(0, df["temperature"] - 25.0) ** 1.35 * 95.0, 1)
    df["heating_load_mw"] = np.round(np.maximum(0, 15.0 - df["temperature"]) ** 1.2 * 60.0, 1)
    df["north_zone_mw"] = np.round(df["demand_mw"] * 0.255, 1)
    df["south_zone_mw"] = np.round(df["demand_mw"] * 0.315, 1)
    df["east_zone_mw"] = np.round(df["demand_mw"] * 0.210, 1)
    df["west_zone_mw"] = np.round(df["demand_mw"] * 0.190, 1)
    df["central_zone_mw"] = np.round(df["demand_mw"] * 0.055, 1)

    # Save to CSV in data directory
    print(f"Exporting dataset to CSV: {CSV_PATH}...")
    df.to_csv(CSV_PATH, index=False)
    print(f"Exported {len(df)} hourly records to CSV.")

    # Bulk insert into SQLite
    print("Populating SQLite table: hourly_demand...")
    cursor.execute("DELETE FROM hourly_demand;")
    
    records = []
    for _, row in df.iterrows():
        records.append((
            str(row["timestamp"]),
            int(row["hour"]),
            int(row["day_of_week"]),
            int(row["day_of_year"]),
            int(row["is_weekend"]),
            int(row["is_holiday"]),
            float(row["temperature"]),
            float(row["humidity"]),
            float(row["demand_mw"]),
            float(row["cooling_load_mw"]),
            float(row["heating_load_mw"]),
            float(row["north_zone_mw"]),
            float(row["south_zone_mw"]),
            float(row["east_zone_mw"]),
            float(row["west_zone_mw"]),
            float(row["central_zone_mw"])
        ))

    cursor.executemany("""
    INSERT INTO hourly_demand (
        timestamp, hour, day_of_week, day_of_year, is_weekend, is_holiday,
        temperature_c, humidity_pct, demand_mw, cooling_load_mw, heating_load_mw,
        north_zone_mw, south_zone_mw, east_zone_mw, west_zone_mw, central_zone_mw
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, records)
    print(f"Inserted {len(records)} records into hourly_demand.")

    # 2. Populate Feeders
    print("Populating SQLite table: feeders...")
    cursor.execute("DELETE FROM feeders;")
    with open(FEEDERS_JSON, "r", encoding="utf-8") as f:
        feeders_list = json.load(f)
    
    feeder_records = [
        (
            item["id"],
            item["name"],
            item["area"],
            item["discom"],
            item["substation"],
            item["voltage_kv"],
            item["capacity_mw"],
            item["normal_power_factor"],
            item["conductor_type"],
            item["length_km"],
            item["status"]
        )
        for item in feeders_list
    ]
    cursor.executemany("""
    INSERT INTO feeders (
        id, name, area, discom, substation, voltage_kv, capacity_mw,
        normal_power_factor, conductor_type, length_km, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, feeder_records)
    print(f"Inserted {len(feeder_records)} feeders.")

    # 3. Populate Substations
    print("Populating SQLite table: substations...")
    cursor.execute("DELETE FROM substations;")
    with open(SUBSTATIONS_JSON, "r", encoding="utf-8") as f:
        subs_list = json.load(f)
    
    sub_records = [
        (
            item["id"],
            item["name"],
            item["voltage_class"],
            item["zone"],
            item["operator"],
            item["latitude"],
            item["longitude"],
            item["installed_mva"],
            item["commissioned_year"]
        )
        for item in subs_list
    ]
    cursor.executemany("""
    INSERT INTO substations (
        id, name, voltage_class, zone, operator, latitude, longitude,
        installed_mva, commissioned_year
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, sub_records)
    print(f"Inserted {len(sub_records)} substations.")

    # 4. Populate Alerts Log
    print("Populating SQLite table: alerts_log...")
    cursor.execute("DELETE FROM alerts_log;")
    alert_records = [
        (
            item["id"],
            item["title"],
            item["severity"],
            item["area"],
            item["timestamp"],
            item["description"],
            item["status"],
            item["recommended_action"],
            item.get("acknowledged_by"),
            item.get("acknowledged_at")
        )
        for item in ALERTS_DATA
    ]
    cursor.executemany("""
    INSERT INTO alerts_log (
        id, title, severity, area, timestamp, description, status,
        recommended_action, acknowledged_by, acknowledged_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, alert_records)
    print(f"Inserted {len(alert_records)} alerts.")

    conn.commit()
    conn.close()
    print("\nDATABASE SEEDING COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    seed()
