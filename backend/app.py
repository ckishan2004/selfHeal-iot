from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.anomaly_api import router as anomaly_router
from api.sensor_api import router as sensor_router
from api.auth_api import router as auth_router

app = FastAPI(title="Self-Healing IoT AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-frontend-name.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(anomaly_router, prefix="/api")
app.include_router(sensor_router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "Backend Running",
        "service": "Self-Healing IoT AI API"
    }