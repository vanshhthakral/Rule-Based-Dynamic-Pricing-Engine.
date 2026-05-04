"""
ML uses RandomForest on: hour (from lead_time), weekday, weekend flag, hotel type,
season (from arrival month in training; from API at predict), guest counts,
market_segment, lead_time. Artifact: model.pkl holds model + feature column order.
Training CSV columns: arrival_date_year/month/day_of_month, lead_time, adr, hotel,
adults, children, babies, market_segment.
"""
import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

DAYS_OF_WEEK = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]

MONTH_MAP = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12,
}

CATEGORICALS = ["day_of_week", "hotel", "market_segment", "season"]
NUMERIC = ["hour", "is_weekend", "adults", "children", "babies", "lead_time"]

VALID_HOTELS = ("Resort Hotel", "City Hotel")
VALID_SEASONS = ("peak", "normal", "off")


def _season_from_month(month_num: int) -> str:
    if month_num in (6, 7, 8, 12):
        return "peak"
    if month_num in (1, 2, 11):
        return "off"
    return "normal"


def load_and_preprocess_real_data(csv_path: str) -> pd.DataFrame:
    """
    CSV: arrival_* , lead_time, adr, hotel, adults, children, babies, market_segment.
    Target demand: LOW/MEDIUM/HIGH from ADR tertiles (same row).
    """
    df = pd.read_csv(csv_path)
    df["month_num"] = df["arrival_date_month"].map(MONTH_MAP)
    df["arrival_date"] = pd.to_datetime({
        "year": df["arrival_date_year"],
        "month": df["month_num"],
        "day": df["arrival_date_day_of_month"],
    })
    df["day_of_week"] = df["arrival_date"].dt.day_name()
    df["is_weekend"] = df["day_of_week"].isin(["Saturday", "Sunday"]).astype(int)
    df["hour"] = (df["lead_time"] + 17) % 24
    df["season"] = df["month_num"].apply(_season_from_month)
    df["children"] = df["children"].fillna(0).astype(int)
    df["babies"] = df["babies"].fillna(0).astype(int)

    low_t = df["adr"].quantile(0.33)
    high_t = df["adr"].quantile(0.66)

    def adr_to_demand(adr):
        if adr < low_t:
            return "LOW"
        if adr > high_t:
            return "HIGH"
        return "MEDIUM"

    df["demand"] = df["adr"].apply(adr_to_demand)

    out = df[
        [
            "hour", "day_of_week", "is_weekend", "hotel", "season",
            "adults", "children", "babies", "market_segment", "lead_time", "demand",
        ]
    ].dropna()
    return out


def _encode_X(df: pd.DataFrame, column_order: list | None = None) -> pd.DataFrame:
    dfc = df.copy()
    for c in CATEGORICALS:
        dfc[c] = dfc[c].astype(str)
    X = pd.get_dummies(dfc, columns=CATEGORICALS, drop_first=False)
    for c in NUMERIC:
        if c not in X.columns:
            X[c] = 0
    for c in NUMERIC:
        X[c] = pd.to_numeric(X[c], errors="coerce").fillna(0)
    if column_order is not None:
        X = X.reindex(columns=column_order, fill_value=0)
    return X


def train_and_save_model():
    csv_path = os.path.join(os.path.dirname(__file__), "hotel_bookings.csv")
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found!")
        return

    df = load_and_preprocess_real_data(csv_path)
    print(f"Dataset prepared with {len(df)} rows.")
    print("Class distribution:\n", df["demand"].value_counts())

    y = df["demand"]
    X = _encode_X(df.drop(columns=["demand"]))
    column_order = list(X.columns)

    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=80, max_depth=14, random_state=42, n_jobs=-1, class_weight="balanced_subsample",
    )
    clf.fit(X, y)

    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    joblib.dump({"model": clf, "feature_columns": column_order}, model_path)
    print(f"Saved model + feature schema to {model_path}")


def _normalize_hotel(raw) -> str:
    h = str(raw or "").strip()
    if h in VALID_HOTELS:
        return h
    if "Resort" in h:
        return "Resort Hotel"
    return "City Hotel"


def _normalize_season(raw) -> str:
    s = str(raw or "").strip().lower()
    if s in VALID_SEASONS:
        return s
    return "normal"


def predict_demand(
    day_of_week: str,
    hotel: str,
    season: str,
    adults: int,
    children: int,
    babies: int,
    market_segment: str,
    lead_time: int,
) -> str:
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"{model_path} not found. Run: python demand_model.py")

    art = joblib.load(model_path)
    clf = art["model"]
    columns = art["feature_columns"]

    lead_time = max(0, int(lead_time))
    hour = (lead_time + 17) % 24
    dow = str(day_of_week or "Monday").strip()
    if dow not in DAYS_OF_WEEK:
        dow = "Monday"
    is_weekend = 1 if dow in ("Saturday", "Sunday") else 0

    row = pd.DataFrame([{
        "hour": hour,
        "day_of_week": dow,
        "is_weekend": is_weekend,
        "hotel": _normalize_hotel(hotel),
        "season": _normalize_season(season),
        "adults": max(1, int(adults)),
        "children": max(0, int(children)),
        "babies": max(0, int(babies)),
        "market_segment": str(market_segment or "Undefined").strip() or "Undefined",
        "lead_time": lead_time,
    }])

    X = _encode_X(row, column_order=columns)
    return clf.predict(X)[0]


if __name__ == "__main__":
    train_and_save_model()
    print(
        predict_demand(
            "Saturday", "Resort Hotel", "peak", 2, 0, 0, "Online TA", 14,
        )
    )
