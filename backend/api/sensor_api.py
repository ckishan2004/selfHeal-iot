from fastapi import APIRouter, UploadFile, File
import pandas as pd

router = APIRouter()

@router.post("upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    print("CSV Uploaded:", file.filename)
    print(df.head())

    return {
        "message": "CSV uploaded successfully",
        "rows": len(df),
        "columns": df.columns.tolist(),
        "preview": df.head(5).to_dict()
    }
