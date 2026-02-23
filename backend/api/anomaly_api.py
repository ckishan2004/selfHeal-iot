# from fastapi import APIRouter, UploadFile, File
# import pandas as pd
# from services.anomaly_detector import detect_anomalies

# router = APIRouter()

# @router.post("/upload-csv")
# async def upload_csv(file: UploadFile = File(...)):
#     # CSV read
#     df = pd.read_csv(file.file)

#     # Anomaly detection
#     result_df = detect_anomalies(df)

#     # Response to frontend
#     return {
#         "rows": len(result_df),
#         "anomalies": int(result_df["anomaly"].sum()),
#         "data": result_df.to_dict(orient="records")
#     }


from fastapi import APIRouter
from services.anomaly_detector import AnomalyDetector
import pandas as pd

router = APIRouter()
detector = AnomalyDetector()

@router.post("/detect-anomaly")
def detect_anomaly(payload: dict):
    df = pd.DataFrame(payload["data"])

    detector.train(df)
    scores, anomalies = detector.predict(df)

    return {
        "anomaly_scores": scores.tolist(),
        "anomalies": anomalies.tolist()
    }
