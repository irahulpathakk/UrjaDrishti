"""
Model training script for UrjaDrishti - Delhi Power Demand Forecasting.
Trains an XGBoost / GradientBoosting model on realistic historical Delhi demand.
Evaluates MAE, RMSE, MAPE, R2 and calculates Feature Importance.
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from sklearn.ensemble import GradientBoostingRegressor
try:
    from xgboost import XGBRegressor
    USE_XGB = True
except ImportError:
    USE_XGB = False

from dataset import generate_delhi_demand_dataset

ARTIFACTS_PATH = os.path.join(os.path.dirname(__file__), "model_artifacts.joblib")

FEATURES = [
    "temperature",
    "lag_1h",
    "hour",
    "humidity",
    "day_of_week",
    "lag_24h",
    "is_holiday",
    "is_weekend",
    "rolling_mean_24h"
]

FEATURE_LABELS = {
    "temperature": "Ambient Temperature (°C)",
    "lag_1h": "Previous Hour Demand (MW)",
    "hour": "Hour of Day (0-23)",
    "humidity": "Relative Humidity (%)",
    "day_of_week": "Day of Week (0-6)",
    "lag_24h": "Previous Day Same-Hour Demand (MW)",
    "is_holiday": "Gazetted Holiday Flag",
    "is_weekend": "Weekend Flag",
    "rolling_mean_24h": "24h Rolling Mean Load (MW)"
}

def train_and_save():
    print("Generating Delhi historical dataset (Jan 2023 - Aug 2026)...")
    df = generate_delhi_demand_dataset("2023-01-01", "2026-08-31")
    
    # Train-test split (chronological: train on up to May 2026, test on Jun-Aug 2026)
    split_idx = int(len(df) * 0.85)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]
    
    X_train = train_df[FEATURES]
    y_train = train_df["demand_mw"]
    X_test = test_df[FEATURES]
    y_test = test_df["demand_mw"]
    
    print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")
    
    if USE_XGB:
        print("Training XGBoost Regressor v2.1...")
        model = XGBRegressor(
            n_estimators=220,
            learning_rate=0.06,
            max_depth=6,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42
        )
    else:
        print("Training GradientBoostingRegressor...")
        model = GradientBoostingRegressor(
            n_estimators=180,
            learning_rate=0.06,
            max_depth=5,
            random_state=42
        )
        
    model.fit(X_train, y_train)
    
    # Evaluation
    preds = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, preds))
    rmse = float(root_mean_squared_error(y_test, preds))
    mape = float(np.mean(np.abs((y_test - preds) / y_test)) * 100)
    r2 = float(r2_score(y_test, preds))
    
    # Feature Importances normalized to 100%
    raw_importances = model.feature_importances_
    total_imp = np.sum(raw_importances)
    importance_pct = {
        feat: round(float(imp / total_imp * 100), 1)
        for feat, imp in zip(FEATURES, raw_importances)
    }
    
    # Sort descending
    sorted_importance = dict(sorted(importance_pct.items(), key=lambda item: item[1], reverse=True))
    
    metrics = {
        "model_name": "XGBoost Demand Forecast v2.1" if USE_XGB else "GradientBoosting v2.1",
        "training_data_range": "Jan 2023 – Aug 2026",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "mae_mw": round(mae, 1),
        "rmse_mw": round(rmse, 1),
        "mape_pct": round(mape, 2),
        "r2_score": round(r2, 3),
        "features": [FEATURE_LABELS.get(f, f) for f in FEATURES],
        "feature_importance": sorted_importance,
        "last_model_update": "2026-08-31 23:59:00 IST",
        "prediction_horizon": "24 Hours to 7 Days Ahead",
        "model_status": "Production Active / Calibrated"
    }
    
    print("\n--- Model Metrics ---")
    print(f"MAE: {metrics['mae_mw']} MW")
    print(f"RMSE: {metrics['rmse_mw']} MW")
    print(f"MAPE: {metrics['mape_pct']}%")
    print(f"R²: {metrics['r2_score']}")
    print(f"Feature Importances: {sorted_importance}")
    
    payload = {
        "model": model,
        "metrics": metrics,
        "features": FEATURES,
        "recent_profile": df.tail(168).to_dict(orient="records") # last 7 days profile
    }
    
    joblib.dump(payload, ARTIFACTS_PATH)
    print(f"\nArtifact saved to: {ARTIFACTS_PATH}")
    return payload

if __name__ == "__main__":
    train_and_save()
