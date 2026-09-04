"""
UrjaDrishti - FastAPI Entrypoint
Production-style SCADA / SLDC Grid Monitoring and Demand Forecasting API
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="UrjaDrishti - Delhi Power Demand Intelligence Platform",
    description="Operational API for Delhi SLDC and DISCOM Electricity Demand Forecasting & Grid Telemetry",
    version="2.1.0"
)

# CORS configuration for development and operations dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from Vite/React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def root():
    return {
        "system": "UrjaDrishti - Delhi Power Demand Intelligence Platform",
        "jurisdiction": "NCT of Delhi (SLDC / Transco / DISCOMs)",
        "version": "2.1.0",
        "status": "Operational",
        "api_docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "subsystems": {
            "forecasting_engine": "ONLINE",
            "weather_telemetry": "ONLINE",
            "feeder_monitoring": "ONLINE",
            "alarm_processing": "ONLINE"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
