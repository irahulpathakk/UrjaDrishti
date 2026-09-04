"""
Grid operational service for Delhi power system:
- Zonal loads & telemetry (North, South, East, West, Central)
- 33kV/11kV Distribution Feeders with utilization & recommendations
- Operational Alerts workflow (Acknowledge, Resolve)
- Historical telemetry generator for 7d, 30d, 90d, 1y
"""
from datetime import datetime, timedelta
import numpy as np
from typing import Dict, Any, List, Optional
from config import DELHI_ZONES, GRID_CAPACITY_MW

# Active Delhi Feeders repository
FEEDERS_DATA: List[Dict[str, Any]] = [
    {
        "id": "FD-204",
        "name": "FD-204 Sarita Vihar - Okhla Ph II",
        "area": "South Delhi",
        "discom": "BSES Rajdhani (BRPL)",
        "substation": "66/11kV Okhla Industrial Substation",
        "current_load_mw": 82.0,
        "forecast_peak_mw": 91.0,
        "capacity_mw": 100.0,
        "utilization_pct": 91.0,
        "trend": "up",
        "status": "WATCH",
        "power_factor": 0.96,
        "voltage_kv": 11.2,
        "historical_peak_mw": 94.5,
        "capacity_margin_mw": 9.0,
        "recommendation": "Consider load balancing between adjacent feeders (FD-202 & FD-206) between 18:00–20:00 to avert thermal overload."
    },
    {
        "id": "FD-102",
        "name": "FD-102 Rohini Sector 16 Express",
        "area": "North Delhi",
        "discom": "Tata Power DDL (TPDDL)",
        "substation": "66/11kV Rohini Grid Substation",
        "current_load_mw": 64.5,
        "forecast_peak_mw": 71.0,
        "capacity_mw": 85.0,
        "utilization_pct": 75.9,
        "trend": "stable",
        "status": "NORMAL",
        "power_factor": 0.98,
        "voltage_kv": 11.1,
        "historical_peak_mw": 76.2,
        "capacity_margin_mw": 14.0,
        "recommendation": "Operational reserve within standard limits (16.5%). Normal scheduling recommended."
    },
    {
        "id": "FD-308",
        "name": "FD-308 Laxmi Nagar Commercial",
        "area": "East Delhi",
        "discom": "BSES Yamuna (BYPL)",
        "substation": "33/11kV Patparganj Commercial Grid",
        "current_load_mw": 74.8,
        "forecast_peak_mw": 83.5,
        "capacity_mw": 88.0,
        "utilization_pct": 94.9,
        "trend": "up",
        "status": "HIGH",
        "power_factor": 0.94,
        "voltage_kv": 10.8,
        "historical_peak_mw": 86.8,
        "capacity_margin_mw": 4.5,
        "recommendation": "High risk of conductor temperature breach. Request BYPL control to activate automated bus transfer at 18:15."
    },
    {
        "id": "FD-412",
        "name": "FD-412 Janakpuri C-Block Mixed",
        "area": "West Delhi",
        "discom": "BSES Rajdhani (BRPL)",
        "substation": "66/11kV Janakpuri District Center",
        "current_load_mw": 58.2,
        "forecast_peak_mw": 65.0,
        "capacity_mw": 75.0,
        "utilization_pct": 77.6,
        "trend": "up",
        "status": "NORMAL",
        "power_factor": 0.97,
        "voltage_kv": 11.0,
        "historical_peak_mw": 70.4,
        "capacity_margin_mw": 10.0,
        "recommendation": "Load parameters nominal. Continuous SCADA telemetry active."
    },
    {
        "id": "FD-501",
        "name": "FD-501 Connaught Place Inner Circle",
        "area": "Central Delhi",
        "discom": "NDMC Power Dept",
        "substation": "33/11kV Connaught Place Underground",
        "current_load_mw": 38.4,
        "forecast_peak_mw": 42.0,
        "capacity_mw": 50.0,
        "utilization_pct": 84.0,
        "trend": "down",
        "status": "NORMAL",
        "power_factor": 0.99,
        "voltage_kv": 11.3,
        "historical_peak_mw": 46.1,
        "capacity_margin_mw": 8.0,
        "recommendation": "Commercial air-conditioning load dropping off post-business hours (18:00). Maintain standard N-1 contingency."
    },
    {
        "id": "FD-215",
        "name": "FD-215 Vasant Kunj Sector C",
        "area": "South Delhi",
        "discom": "BSES Rajdhani (BRPL)",
        "substation": "66/11kV Mehrauli-Vasant Kunj Grid",
        "current_load_mw": 71.3,
        "forecast_peak_mw": 86.2,
        "capacity_mw": 90.0,
        "utilization_pct": 95.8,
        "trend": "up",
        "status": "CRITICAL",
        "power_factor": 0.93,
        "voltage_kv": 10.7,
        "historical_peak_mw": 88.0,
        "capacity_margin_mw": 3.8,
        "recommendation": "Critical evening domestic AC surge. Stage-1 demand response notification issued to institutional consumers."
    },
    {
        "id": "FD-119",
        "name": "FD-119 Narela Industrial Phase 1",
        "area": "North Delhi",
        "discom": "Tata Power DDL (TPDDL)",
        "substation": "66/11kV Narela Industrial Zone",
        "current_load_mw": 68.0,
        "forecast_peak_mw": 74.0,
        "capacity_mw": 92.0,
        "utilization_pct": 80.4,
        "trend": "stable",
        "status": "NORMAL",
        "power_factor": 0.95,
        "voltage_kv": 11.1,
        "historical_peak_mw": 84.2,
        "capacity_margin_mw": 18.0,
        "recommendation": "Industrial load steady. Ample capacity buffer available."
    },
    {
        "id": "FD-322",
        "name": "FD-322 Mayur Vihar Phase 1",
        "area": "East Delhi",
        "discom": "BSES Yamuna (BYPL)",
        "substation": "66/11kV Trilokpuri Grid",
        "current_load_mw": 61.2,
        "forecast_peak_mw": 69.8,
        "capacity_mw": 75.0,
        "utilization_pct": 93.1,
        "trend": "up",
        "status": "HIGH",
        "power_factor": 0.95,
        "voltage_kv": 10.9,
        "historical_peak_mw": 72.5,
        "capacity_margin_mw": 5.2,
        "recommendation": "Inspect transformer winding temperature on TR-2. Prepare for manual bus section tie if load exceeds 72 MW."
    },
    {
        "id": "FD-425",
        "name": "FD-425 Dwarka Sector 10 Express",
        "area": "West Delhi",
        "discom": "BSES Rajdhani (BRPL)",
        "substation": "66/11kV Dwarka Sub-City Grid",
        "current_load_mw": 78.4,
        "forecast_peak_mw": 84.2,
        "capacity_mw": 95.0,
        "utilization_pct": 88.6,
        "trend": "up",
        "status": "WATCH",
        "power_factor": 0.97,
        "voltage_kv": 11.0,
        "historical_peak_mw": 89.1,
        "capacity_margin_mw": 10.8,
        "recommendation": "Residential AC ramp observed. Monitor feeder head telemetry every 15 minutes."
    },
    {
        "id": "FD-504",
        "name": "FD-504 Chanakyapuri Diplomatic Enclave",
        "area": "Central Delhi",
        "discom": "NDMC Power Dept",
        "substation": "33/11kV Vinay Marg Substation",
        "current_load_mw": 32.1,
        "forecast_peak_mw": 36.0,
        "capacity_mw": 48.0,
        "utilization_pct": 75.0,
        "trend": "stable",
        "status": "NORMAL",
        "power_factor": 0.99,
        "voltage_kv": 11.3,
        "historical_peak_mw": 39.4,
        "capacity_margin_mw": 12.0,
        "recommendation": "Vital VIP circuit. Operating well within N-2 security margin."
    }
]

# Active Delhi Grid Alerts
ALERTS_DATA: List[Dict[str, Any]] = [
    {
        "id": "ALT-1082",
        "title": "HIGH DEMAND FORECAST",
        "severity": "HIGH",
        "area": "Delhi (Grid-Wide)",
        "timestamp": "2026-09-04 17:45:00 IST",
        "description": "Forecast peak expected to reach 8,214 MW at 18:30. Capacity margin: 286 MW.",
        "status": "Open",
        "recommended_action": "Notify Northern Regional Load Despatch Centre (NRLDC) for emergency short-term open access (STOA) spinning reserve allocation.",
        "acknowledged_by": None,
        "acknowledged_at": None
    },
    {
        "id": "ALT-1083",
        "title": "WEATHER-DRIVEN LOAD RISK",
        "severity": "HIGH",
        "area": "NCT of Delhi",
        "timestamp": "2026-09-04 16:30:00 IST",
        "description": "Temperature expected above 41°C during peak period. Cooling degree load adds +3.8% demand surge.",
        "status": "Open",
        "recommended_action": "Pre-cool gas turbine units at Pragati-III (Bawana CCGT) to operate at maximum heat rate efficiency.",
        "acknowledged_by": None,
        "acknowledged_at": None
    },
    {
        "id": "ALT-1084",
        "title": "FEEDER OVERLOAD RISK",
        "severity": "CRITICAL",
        "area": "South Delhi",
        "timestamp": "2026-09-04 18:10:00 IST",
        "description": "FD-204 & FD-215 projected to exceed 90% utilization (projected 95.8% on FD-215).",
        "status": "Open",
        "recommended_action": "Initiate automated bus sectionalizing between Sarita Vihar and Okhla Ph II grids.",
        "acknowledged_by": None,
        "acknowledged_at": None
    },
    {
        "id": "ALT-1081",
        "title": "SUBSTATION 220kV BUS VOLTAGE DIP",
        "severity": "WATCH",
        "area": "East Delhi",
        "timestamp": "2026-09-04 15:20:00 IST",
        "description": "Patparganj 220kV bus voltage dropped to 212.4 kV due to heavy inductive reactive power drawn by air conditioning.",
        "status": "Acknowledged",
        "recommended_action": "Switch in 2 x 50 MVAR capacitor banks at Ghazipur 220kV substation.",
        "acknowledged_by": "Operator SLDC-04",
        "acknowledged_at": "2026-09-04 15:28:10 IST"
    },
    {
        "id": "ALT-1079",
        "title": "N-1 CONTINGENCY CRITERIA WATCH",
        "severity": "WATCH",
        "area": "North Delhi",
        "timestamp": "2026-09-04 14:05:00 IST",
        "description": "400kV Bawana-Mandoli line loading at 78% of thermal MVA rating.",
        "status": "Resolved",
        "recommended_action": "Telemetry checked; thermal cameras show conductor temperature normal at 68°C.",
        "acknowledged_by": "Shift In-Charge SLDC",
        "acknowledged_at": "2026-09-04 14:22:00 IST"
    }
]


def get_delhi_live_grid() -> Dict[str, Any]:
    """Returns live telemetry across Delhi 5 DISCOM/Operational zones."""
    zones = [
        {
            "id": "South",
            "name": "South Delhi",
            "discom": "BSES Rajdhani (BRPL)",
            "demand_mw": 1982.0,
            "forecast_mw": 2045.0,
            "capacity_mw": 2108.0,
            "load_pct": 94.0,
            "status": "HIGH",
            "trend": "up",
            "reactive_mvar": 412.0,
            "power_factor": 0.96,
            "key_substations": ["Okhla 220kV", "Mehrauli 220kV", "Sarita Vihar 66kV"],
            "summary": "Dense residential and commercial load. Severe evening domestic AC surge."
        },
        {
            "id": "North",
            "name": "North Delhi",
            "discom": "Tata Power DDL (TPDDL)",
            "demand_mw": 1631.0,
            "forecast_mw": 1690.0,
            "capacity_mw": 1896.0,
            "load_pct": 86.0,
            "status": "NORMAL",
            "trend": "stable",
            "reactive_mvar": 320.0,
            "power_factor": 0.98,
            "key_substations": ["Bawana 400kV", "Rohini 220kV", "Narela 66kV"],
            "summary": "Stable distribution with industrial base load in Narela and Bawana."
        },
        {
            "id": "East",
            "name": "East Delhi",
            "discom": "BSES Yamuna (BYPL)",
            "demand_mw": 1410.0,
            "forecast_mw": 1485.0,
            "capacity_mw": 1549.0,
            "load_pct": 91.0,
            "status": "WATCH",
            "trend": "up",
            "reactive_mvar": 340.0,
            "power_factor": 0.95,
            "key_substations": ["Patparganj 220kV", "Ghazipur 220kV", "Geeta Colony 66kV"],
            "summary": "High population density and commercial clusters. Peak loading approaching warning threshold."
        },
        {
            "id": "West",
            "name": "West Delhi",
            "discom": "BSES Rajdhani (BRPL)",
            "demand_mw": 1395.0,
            "forecast_mw": 1440.0,
            "capacity_mw": 1603.0,
            "load_pct": 87.0,
            "status": "NORMAL",
            "trend": "up",
            "reactive_mvar": 295.0,
            "power_factor": 0.97,
            "key_substations": ["Najafgarh 220kV", "Janakpuri 66kV", "Dwarka 220kV"],
            "summary": "Mixed residential-suburban profile with heavy Dwarka sub-city demand."
        },
        {
            "id": "Central",
            "name": "Central Delhi",
            "discom": "NDMC & MES",
            "demand_mw": 348.0,
            "forecast_mw": 360.0,
            "capacity_mw": 446.0,
            "load_pct": 78.0,
            "status": "NORMAL",
            "trend": "down",
            "reactive_mvar": 68.0,
            "power_factor": 0.99,
            "key_substations": ["Ridge Valley 220kV", "Park Street 66kV", "Vinay Marg 33kV"],
            "summary": "VIP administrative & diplomatic zone. Commercial load declining post 17:30."
        }
    ]
    
    total_demand = sum(z["demand_mw"] for z in zones)
    
    return {
        "system_frequency_hz": 50.01,
        "frequency_status": "NORMAL (49.95 - 50.05 Hz Band)",
        "total_delhi_demand_mw": total_demand,
        "grid_capacity_mw": GRID_CAPACITY_MW,
        "net_import_mw": round(total_demand * 0.78, 1),  # ~78% imported via Northern Grid
        "internal_gen_mw": round(total_demand * 0.22, 1), # Pragati CCGT, Bawana, Waste-to-Energy, Rooftop Solar
        "system_status": "Operational",
        "zones": zones
    }


def get_feeder_by_id(feeder_id: str) -> Optional[Dict[str, Any]]:
    for f in FEEDERS_DATA:
        if f["id"].lower() == feeder_id.lower():
            # Generate 24-hr feeder curve
            hourly_curve = []
            f_peak = f["forecast_peak_mw"]
            for h in range(24):
                factor = 0.65 + 0.35 * np.sin((h - 6) / 24 * np.pi)
                val = round(f_peak * factor + np.sin(h) * 2.0, 1)
                hourly_curve.append({
                    "hour": f"{h:02d}:00",
                    "demand_mw": val,
                    "capacity_mw": f["capacity_mw"]
                })
            result = dict(f)
            result["hourly_curve"] = hourly_curve
            return result
    return None


def get_historical_telemetry(time_range: str = "30d") -> Dict[str, Any]:
    """Generates realistic Delhi power historical analytics."""
    days_map = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}
    num_days = days_map.get(time_range, 30)
    
    np.random.seed(42)
    daily_trend = []
    base_date = datetime.now() - timedelta(days=num_days)
    
    for i in range(num_days):
        d = base_date + timedelta(days=i)
        # Seasonal summer wave
        temp = 32.0 + 8.0 * np.sin(i / 15.0) + np.random.normal(0, 1.2)
        peak = 6800.0 + (temp - 30.0) * 125.0 + np.random.normal(0, 110.0)
        peak = np.clip(peak, 5400.0, 8656.0)
        avg = peak * 0.81
        
        daily_trend.append({
            "date": d.strftime("%d %b"),
            "full_date": d.strftime("%Y-%m-%d"),
            "peak_demand_mw": round(peak, 1),
            "avg_demand_mw": round(avg, 1),
            "temperature_c": round(temp, 1),
            "cooling_demand_mw": round(max(0, (temp - 25.0) * 90.0), 1)
        })
        
    # Temperature vs Demand scatter points (50 points)
    temp_scatter = []
    for t in np.linspace(22.0, 44.5, 45):
        demand = 4100.0 + max(0, t - 24.0) ** 1.35 * 95.0 + np.random.normal(0, 95.0)
        temp_scatter.append({
            "temperature_c": round(t, 1),
            "demand_mw": round(demand, 1)
        })
        
    # Peak hour distribution in Delhi (percentage of days peaking at each hour)
    peak_hours = [
        {"hour": "00:00", "pct": 4.5},
        {"hour": "02:00", "pct": 1.2},
        {"hour": "06:00", "pct": 0.8},
        {"hour": "10:00", "pct": 4.1},
        {"hour": "14:00", "pct": 8.5},
        {"hour": "15:30", "pct": 34.2}, # Delhi commercial afternoon peak
        {"hour": "18:30", "pct": 21.0}, # Delhi lighting/evening peak
        {"hour": "22:00", "pct": 18.2}, # Delhi residential night AC peak
        {"hour": "23:30", "pct": 7.5}
    ]
    
    # Year-over-year comparison (2024 vs 2025 vs 2026 Peak Demands in MW)
    yoy_data = [
        {"month": "Apr", "year_2024": 5460, "year_2025": 5820, "year_2026": 6210},
        {"month": "May", "year_2024": 7572, "year_2025": 7940, "year_2026": 8180},
        {"month": "Jun", "year_2024": 8656, "year_2025": 8420, "year_2026": 8510}, # 8656 was all-time record
        {"month": "Jul", "year_2024": 7980, "year_2025": 8110, "year_2026": 8340},
        {"month": "Aug", "year_2024": 7450, "year_2025": 7720, "year_2026": 7910},
        {"month": "Sep", "year_2024": 6890, "year_2025": 7180, "year_2026": 7420}
    ]

    return {
        "time_range": time_range,
        "highest_recorded_demand_mw": 8656.0,
        "highest_recorded_date": "19 June 2024 15:36 IST",
        "average_peak_mw": round(float(np.mean([d["peak_demand_mw"] for d in daily_trend])), 1),
        "peak_growth_pct": "+6.4% YoY",
        "average_temperature_c": round(float(np.mean([d["temperature_c"] for d in daily_trend])), 1),
        "most_frequent_peak_hour": "15:30 & 18:30 IST",
        "daily_trend": daily_trend,
        "temp_scatter": temp_scatter,
        "peak_hour_distribution": peak_hours,
        "yoy_comparison": yoy_data
    }
