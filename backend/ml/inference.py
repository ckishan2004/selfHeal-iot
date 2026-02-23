from pathlib import Path
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "isolation_forest.joblib"
SCALER_PATH = BASE_DIR / "models" / "scaler.joblib"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

def process_df(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [c.strip().lower() for c in df.columns]
    df = df.rename(columns={"temp":"temperature", "gas_level":"gas"})

    for c in ["temperature","humidity","gas"]:
        if c not in df.columns:
            df[c] = 0

    X = df[["temperature","humidity","gas"]].fillna(0)
    Xs = scaler.transform(X)

    pred = model.predict(Xs)
    df["anomaly"] = (pred == -1)
    df["anomaly_score"] = -model.decision_function(Xs)

    # if time missing, create index-based time
    if "time" not in df.columns:
        df["time"] = df.index.astype(str)

    return df
