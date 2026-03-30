from fastapi import APIRouter, Depends
from utils.auth_utils import get_current_user

router = APIRouter()


@router.get("/sensor-status")
def sensor_status(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Sensor API working",
        "user": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"]
        },
        "status": "ok"
    }