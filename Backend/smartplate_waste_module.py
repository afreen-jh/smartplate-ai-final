
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
import json
import random

# ---------------------------------------------------------------------------
# STEP 1: DATA -- synthetic (fake) data for now. Once real data is available,
# replace this function; the rest of the code will work unchanged as long as
# the DataFrame has these columns: date, meal, item, prepared_kg, consumed_kg
# ---------------------------------------------------------------------------

def generate_synthetic_data(days=60, seed=42):
    random.seed(seed)
    np.random.seed(seed)

    meals = ["Breakfast", "Lunch", "Dinner"]
    items = ["Rice", "Dal", "Roti", "Sabzi", "Curd"]

    rows = []
    start_date = datetime.today() - timedelta(days=days)

    for d in range(days):
        current_date = start_date + timedelta(days=d)
        day_name = current_date.strftime("%A")
        is_weekend = day_name in ["Saturday", "Sunday"]
        is_exam_period = 20 <= d <= 27  # a simulated "exam week"

        for meal in meals:
            # base demand -- fewer people show up on weekends and during exams
            base = {"Breakfast": 150, "Lunch": 220, "Dinner": 180}[meal]
            if is_weekend:
                base *= 0.75
            if is_exam_period:
                base *= 0.65

            for item in items:
                prepared = base * random.uniform(0.8, 1.1) / len(items)

                # normal waste is 5-12%, but occasionally (5% chance) a big spike
                if random.random() < 0.05:
                    waste_pct = random.uniform(0.30, 0.45)  # anomaly day
                else:
                    waste_pct = random.uniform(0.05, 0.12)

                wasted = prepared * waste_pct
                consumed = prepared - wasted

                rows.append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "day": day_name,
                    "meal": meal,
                    "item": item,
                    "prepared_kg": round(prepared, 2),
                    "consumed_kg": round(consumed, 2),
                    "wasted_kg": round(wasted, 2),
                    "waste_pct": round(waste_pct * 100, 2),
                    "is_weekend": is_weekend,
                    "is_exam_period": is_exam_period,
                })

    return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# STEP 2: WASTE SUMMARY -- matches `mockSummary` shape in mockData.js
# ---------------------------------------------------------------------------

def compute_summary(df, cost_per_kg=45):
    total_prepared = df["prepared_kg"].sum()
    total_wasted = df["wasted_kg"].sum()
    waste_pct = (total_wasted / total_prepared) * 100

    # if waste is below the historical average, we show it as money saved
    historical_avg_waste_pct = 15  # assumed baseline, adjust as needed
    saved_kg = max(0, (historical_avg_waste_pct - waste_pct) / 100 * total_prepared)
    cost_saved = round(saved_kg * cost_per_kg)

    efficiency_status = (
        "High Efficiency" if waste_pct < 10
        else "Moderate Efficiency" if waste_pct < 18
        else "Needs Improvement"
    )

    return {
        "totalPreparedKg": round(total_prepared),
        "totalWastedKg": round(total_wasted),
        "wastePercentage": round(waste_pct, 1),
        "costSavedINR": cost_saved,
        "efficiencyStatus": efficiency_status,
    }


# ---------------------------------------------------------------------------
# STEP 3: ANOMALY DETECTION -- Isolation Forest
# ---------------------------------------------------------------------------

def detect_anomalies(df, contamination=0.05):
    # aggregate at the day level so we can catch per-day anomalies
    daily = df.groupby(["date", "meal"], as_index=False).agg(
        prepared_kg=("prepared_kg", "sum"),
        wasted_kg=("wasted_kg", "sum"),
        waste_pct=("waste_pct", "mean"),
    )

    features = daily[["prepared_kg", "wasted_kg", "waste_pct"]]
    model = IsolationForest(contamination=contamination, random_state=42)
    daily["anomaly_flag"] = model.fit_predict(features)  # -1 = anomaly

    anomalies = daily[daily["anomaly_flag"] == -1].copy()
    anomalies = anomalies.sort_values("waste_pct", ascending=False)
    return anomalies


# ---------------------------------------------------------------------------
# STEP 4: RECOMMENDATIONS -- simple rule-based logic on top of history
# ---------------------------------------------------------------------------

def generate_recommendations(df):
    recs = []

    # compute day-of-week average waste %, and suggest reducing prep
    # for days/meals with consistently high waste
    day_meal_avg = df.groupby(["day", "meal"], as_index=False)["waste_pct"].mean()

    for row in day_meal_avg.itertuples():
        if row.waste_pct > 15:
            reduce_by = min(20, round(row.waste_pct - 5))  # how much to cut prep by
            recs.append({
                "text": f"Reduce {row.meal} prep by {reduce_by}% on {row.day}s "
                        f"based on historical waste pattern ({round(row.waste_pct,1)}% avg waste).",
            })

    # special recommendation for exam periods
    if df["is_exam_period"].any():
        recs.append({
            "text": "Reduce overall prep by 15% during exam week — lower footfall observed.",
        })

    return recs[:5]  # cap it so we don't spam too many recommendations


# ---------------------------------------------------------------------------
# STEP 5: ALERTS -- combine anomalies + high-waste warnings + recommendations
#          into the EXACT `mockAlerts` shape the frontend expects
# ---------------------------------------------------------------------------

def generate_alerts(df):
    alerts = []
    alert_id = 1

    # --- danger: anomalies ---
    anomalies = detect_anomalies(df)
    for a in anomalies.head(3).itertuples():  # top 3 most relevant
        alerts.append({
            "id": alert_id,
            "type": "danger",
            "message": f"Anomaly: unusual waste pattern detected for {a.meal} "
                       f"on {a.date} ({round(a.waste_pct)}% wasted).",
            "time": "10:30 AM",  # a real system would use the actual timestamp
        })
        alert_id += 1

    # --- warning: item-level high waste ---
    item_waste = df.groupby(["item", "meal"], as_index=False)["waste_pct"].mean()
    worst_items = item_waste.sort_values("waste_pct", ascending=False).head(2)
    for row in worst_items.itertuples():
        alerts.append({
            "id": alert_id,
            "type": "warning",
            "message": f"High Waste Alert: {round(row.waste_pct)}% {row.item} "
                       f"wasted during {row.meal} interval.",
            "time": "02:15 PM",
        })
        alert_id += 1

    # --- success: AI recommendations ---
    for rec in generate_recommendations(df)[:2]:
        alerts.append({
            "id": alert_id,
            "type": "success",
            "message": f"AI Recommendation: {rec['text']}",
            "time": "04:00 PM",
        })
        alert_id += 1

    return alerts


# ---------------------------------------------------------------------------
# PLACEHOLDER: SIMPLE DEMAND PREDICTION -- matches `mockWeeklyForecast` shape
# Once Person 1's proper ML model is ready, this function will be replaced
# with their model's output. For now, we use a 7-day moving average as the
# "predicted" value so the full pipeline (demand -> waste -> anomaly ->
# recommendation) can run end-to-end.
# ---------------------------------------------------------------------------

def simple_moving_average_forecast(df, window=7):
    daily_total = df.groupby("date", as_index=False)["consumed_kg"].sum()
    daily_total["predicted"] = (
        daily_total["consumed_kg"].rolling(window=window, min_periods=1).mean()
    )

    forecast = []
    for row in daily_total.tail(7).itertuples():
        day_name = pd.to_datetime(row.date).strftime("%a")
        forecast.append({
            "day": day_name,
            "predicted": round(row.predicted),
            "actual": round(row.consumed_kg),
        })
    return forecast


# ---------------------------------------------------------------------------
# MAIN -- run everything and produce output.json
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("1) Generating data...")
    df = generate_synthetic_data(days=60)

    print("2) Computing waste summary...")
    summary = compute_summary(df)

    print("3) Detecting anomalies + generating alerts...")
    alerts = generate_alerts(df)

    print("4) Generating placeholder demand forecast (Person 1's job later)...")
    forecast = simple_moving_average_forecast(df)

    output = {
        "mockSummary": summary,
        "mockAlerts": alerts,
        "mockWeeklyForecast": forecast,
    }

    print("\n--- SUMMARY ---")
    print(json.dumps(summary, indent=2))

    print("\n--- ALERTS ---")
    print(json.dumps(alerts, indent=2))

    with open("output.json", "w") as f:
        json.dump(output, f, indent=2)

    print("\noutput.json created — share this exact format with Person 3 "
          "for the backend (FastAPI) endpoint.")