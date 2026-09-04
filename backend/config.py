"""
UrjaDrishti - Grid and System Configuration
Realistic operational parameters for Delhi SLDC and DISCOMs (BRPL, BYPL, TPDDL, NDMC)
"""

# Overall Delhi Power System Parameters
GRID_CAPACITY_MW = 8500.0  # Delhi Transmission / Import + State Gen Capacity
SAFE_OPERATING_LIMIT_MW = 8100.0  # 95.3% threshold
CRITICAL_THRESHOLD_MW = 8300.0    # 97.6% threshold
BASE_FREQUENCY_HZ = 50.00
FREQUENCY_TOLERANCE_HZ = 0.05

# Delhi Geographic Coordinates for Open-Meteo
DELHI_LATITUDE = 28.6139
DELHI_LONGITUDE = 77.2090
DELHI_TIMEZONE = "Asia/Kolkata"

# Delhi Operational Zones / DISCOM Jurisdiction
DELHI_ZONES = {
    "Delhi": {
        "name": "NCT of Delhi (Total Grid)",
        "capacity_mw": 8500.0,
        "base_load_mw": 4200.0,
        "operator": "Delhi SLDC / Transco",
        "color": "#1e293b",
    },
    "North": {
        "name": "North Delhi (TPDDL)",
        "capacity_mw": 2100.0,
        "base_load_mw": 1100.0,
        "operator": "Tata Power DDL",
        "color": "#0284c7",
    },
    "South": {
        "name": "South Delhi (BRPL)",
        "capacity_mw": 2600.0,
        "base_load_mw": 1350.0,
        "operator": "BSES Rajdhani Power Ltd",
        "color": "#059669",
    },
    "East": {
        "name": "East Delhi (BYPL)",
        "capacity_mw": 1750.0,
        "base_load_mw": 850.0,
        "operator": "BSES Yamuna Power Ltd",
        "color": "#d97706",
    },
    "West": {
        "name": "West Delhi (BRPL)",
        "capacity_mw": 1600.0,
        "base_load_mw": 800.0,
        "operator": "BSES Rajdhani Power Ltd",
        "color": "#7c3aed",
    },
    "Central": {
        "name": "Central and New Delhi (NDMC / MES)",
        "capacity_mw": 450.0,
        "base_load_mw": 200.0,
        "operator": "NDMC / MES Electricity Dept",
        "color": "#dc2626",
    }
}
