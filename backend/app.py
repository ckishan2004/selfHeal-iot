from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.sensor_api import router as sensor_router
from api.anomaly_api import router as anomaly_router

app = FastAPI(title="Self-Healing IoT AI")

# 🔥 CORS (VERY IMPORTANT for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # React localhost allow
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIs register
app.include_router(sensor_router, prefix="/api")
app.include_router(anomaly_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "Backend Running 🚀"}
