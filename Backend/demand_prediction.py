"""
SmartPlate AI — Demand Prediction Module
Person 1's part of the project.

Uses the shared dataset from shared_data.py so it stays in sync with the
waste analysis module.

How to run (from the smartplate-backend/ folder, not from inside
demand_module/):
    python demand_module/demand_prediction.py

Output:
    - Model performance (MAE) printed to the terminal
    - demand_module/forecast.json
"""

import sys
import os
import json
import random
import pandas as pd
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import LabelEncoder

# allow importing shared_data.py from the parent folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared_data import load_data


# ---------------------------------------------------------------------------
# FEATURE ENGINEERING
# ---------------------------------------------------------------------------

def build_features(df):
    # collapse item-level rows into a daily/meal-level total, since demand
    # prediction cares about total kg per meal, not per individual item
    daily = df.groupby(["date", "day", "meal", "is_weekend", "is_exam_period"],
                        as_index=False)["consumed_kg"].sum()
    daily = daily.sort_values(["meal", "date"]).reset_index(drop=True)

    day_encoder = LabelEncoder()
    meal_encoder = LabelEncoder()
    daily["day_encoded"] = day_encoder.fit_transform(daily["day"])
    daily["meal_encoded"] = meal_encoder.fit_transform(daily["meal"])
    daily["is_weekend"] = daily["is_weekend"].astype(int)
    daily["is_exam_period"] = daily["is_exam_period"].astype(int)

    daily["prev_day_consumed"] = daily.groupby("meal")["consumed_kg"].shift(1)
    daily["prev_day_consumed"] = daily["prev_day_consumed"].fillna(daily["consumed_kg"].mean())

    return daily, day_encoder, meal_encoder


# ---------------------------------------------------------------------------
# TRAIN MODEL -- Random Forest Regressor
# ---------------------------------------------------------------------------

def train_model(daily):
    features = ["day_encoded", "meal_encoded", "is_weekend",
                "is_exam_period", "prev_day_consumed"]
    X = daily[features]
    y = daily["consumed_kg"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)

    return model, mae, features


# ---------------------------------------------------------------------------
# FORECAST -- predict the next 7 days, matching `mockWeeklyForecast`
# ---------------------------------------------------------------------------

def generate_forecast(daily, model, day_encoder, meal_encoder, features, days_ahead=7):
    last_date = pd.to_datetime(daily["date"]).max()
    forecast = []

    last_known = daily.sort_values("date").groupby("meal")["consumed_kg"].last().to_dict()

    for i in range(1, days_ahead + 1):
        future_date = last_date + timedelta(days=i)
        day_name = future_date.strftime("%A")
        is_weekend = int(day_name in ["Saturday", "Sunday"])

        meal = "Lunch"  # keep the forecast focused on the main meal
        row = pd.DataFrame([{
            "day_encoded": day_encoder.transform([day_name])[0],
            "meal_encoded": meal_encoder.transform([meal])[0],
            "is_weekend": is_weekend,
            "is_exam_period": 0,
            "prev_day_consumed": last_known.get(meal, 200),
        }])[features]

        predicted = model.predict(row)[0]
        actual = predicted * random.uniform(0.92, 1.08)  # simulated actual, for demo

        forecast.append({
            "day": future_date.strftime("%a"),
            "predicted": round(predicted),
            "actual": round(actual),
        })

        last_known[meal] = actual

    return forecast


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("1) Loading shared data...")
    df = load_data(days=120)

    print("2) Building features...")
    daily, day_encoder, meal_encoder = build_features(df)

    print("3) Training Random Forest model...")
    model, mae, features = train_model(daily)
    print(f"   Model trained. Mean Absolute Error: {mae:.2f} kg")

    print("4) Generating 7-day forecast...")
    forecast = generate_forecast(daily, model, day_encoder, meal_encoder, features)

    output = {
        "modelPerformance": {"maeKg": round(mae, 2)},
        "mockWeeklyForecast": forecast,
    }

    print("\n--- 7-DAY FORECAST (Lunch) ---")
    print(json.dumps(forecast, indent=2))

    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "forecast.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n{out_path} created.")
