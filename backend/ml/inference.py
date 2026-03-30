from pathlib import Path
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "isolation_forest.joblib"
SCALER_PATH = BASE_DIR / "models" / "scaler.joblib"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

REQUIRED_COLUMNS = ["temperature", "humidity", "gas"]


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [c.strip().lower() for c in df.columns]
    df = df.rename(columns={
        "temp": "temperature",
        "gas_level": "gas"
    })
    return df


def ensure_required_columns(df: pd.DataFrame) -> pd.DataFrame:
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            df[col] = 0
    return df


def process_df(df: pd.DataFrame) -> pd.DataFrame:
    df = normalize_columns(df)
    df = ensure_required_columns(df)

    X = df[REQUIRED_COLUMNS].apply(pd.to_numeric, errors="coerce").fillna(0)
    X_scaled = scaler.transform(X)

    pred = model.predict(X_scaled)
    score = -model.decision_function(X_scaled)

    df["anomaly"] = (pred == -1)
    df["anomaly_score"] = score.round(4)

    if "timestamp" not in df.columns:
        if "time" in df.columns:
            df["timestamp"] = df["time"].astype(str)
        else:
            df["timestamp"] = df.index.astype(str)

    return df
