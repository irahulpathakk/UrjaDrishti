"""
Dataset generator for realistic Delhi power grid demand.
Simulates 2023-2026 hourly Delhi load data with temperature correlation,
seasonal swings (winter vs peak summer heatwave), diurnal cycles, and holidays.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_delhi_demand_dataset(start_date="2023-01-01", end_date="2026-08-31") -> pd.DataFrame:
    """Generates synthetic but highly realistic hourly Delhi power demand data."""
    dates = pd.date_range(start=start_date, end=end_date, freq="h")
    n = len(dates)
    
    # 1. Base calendar features
    hours = dates.hour.values
    days_of_week = dates.dayofweek.values
    day_of_year = dates.dayofyear.values
    is_weekend = (days_of_week >= 5).astype(int)
    
    # Major Indian holidays in Delhi (approximate dates)
    holidays = {
        (1, 26), (8, 15), (10, 2), (3, 25), (10, 24), (11, 12), (12, 25), (1, 1)
    }
    is_holiday = np.array([1 if (d.month, d.day) in holidays else 0 for d in dates])
    
    # 2. Realistic Delhi Temperature Simulation
    # Delhi annual temperature cycle: coldest in Jan (~8-20°C), hottest in May/June (~28-44°C), monsoon in Jul/Aug (~27-36°C)
    seasonal_temp_base = 26.0 - 14.0 * np.cos(2 * np.pi * (day_of_year - 15) / 365.25)
    # Diurnal temperature cycle: lowest at 05:00, highest at 15:00
    diurnal_temp = 6.5 * np.sin(2 * np.pi * (hours - 9) / 24)
    # Random weather fluctuation
    np.random.seed(42)
    temp_noise = np.random.normal(0, 1.8, n)
    temps = np.clip(seasonal_temp_base + diurnal_temp + temp_noise, 5.0, 48.0)
    
    # 3. Relative Humidity simulation
    # High in monsoon (Jul-Aug ~75-85%), low in May-Jun dry heat (~30-45%), high in Jan fog (~85%)
    seasonal_humidity = 60.0 + 20.0 * np.sin(2 * np.pi * (day_of_year - 120) / 365.25)
    diurnal_humidity = -12.0 * np.sin(2 * np.pi * (hours - 9) / 24)
    humidity = np.clip(seasonal_humidity + diurnal_humidity + np.random.normal(0, 5, n), 20.0, 95.0)
    
    # 4. Cooling / Heating demand (AC load is massive in Delhi above 28°C)
    cooling_effect = np.maximum(0, temps - 25.0) ** 1.35 * 95.0
    heating_effect = np.maximum(0, 15.0 - temps) ** 1.2 * 60.0
    
    # 5. Base Diurnal Shape for Delhi (MW)
    # Night trough (03:00-05:00) ~4,200 MW base
    # Morning ramp (08:00-11:00) +1,200 MW
    # Afternoon peak (15:00-16:00) +1,500 MW
    # Evening lighting & domestic peak (18:30-22:30) +1,800 MW
    diurnal_curve = np.array([
        -300, -500, -700, -900, -1000, -800, -300, 200, 600, 900,
        1100, 1300, 1400, 1500, 1650, 1750, 1600, 1450, 1800, 1950,
        1850, 1600, 1200, 400
    ])
    diurnal_load = np.array([diurnal_curve[h] for h in hours])
    
    # 6. Overall Base Load Growth (Delhi annual peak growing ~5-7% year on year)
    year_fraction = (dates.year - 2023) + (dates.dayofyear / 365.25)
    growth_trend = year_fraction * 280.0
    
    # 7. Weekend & Holiday reduction (offices/industries closed ~ -400 MW)
    weekend_effect = -350.0 * is_weekend - 550.0 * is_holiday
    
    # 8. Combine into total demand
    base_demand = 4400.0 + growth_trend + diurnal_load + cooling_effect + heating_effect + weekend_effect
    noise = np.random.normal(0, 75.0, n)
    actual_demand = np.clip(base_demand + noise, 3100.0, 8656.0)  # capped at Delhi record
    
    df = pd.DataFrame({
        "timestamp": dates,
        "hour": hours,
        "day_of_week": days_of_week,
        "day_of_year": day_of_year,
        "is_weekend": is_weekend,
        "is_holiday": is_holiday,
        "temperature": np.round(temps, 1),
        "humidity": np.round(humidity, 1),
        "demand_mw": np.round(actual_demand, 1)
    })
    
    # Lag features
    df["lag_1h"] = df["demand_mw"].shift(1).bfill()
    df["lag_24h"] = df["demand_mw"].shift(24).bfill()
    df["rolling_mean_24h"] = df["demand_mw"].rolling(24, min_periods=1).mean()
    
    return df

if __name__ == "__main__":
    df = generate_delhi_demand_dataset("2024-01-01", "2024-01-07")
    print(df.head())
    print(f"Shape: {df.shape}, Peak: {df['demand_mw'].max()} MW, Min: {df['demand_mw'].min()} MW")
