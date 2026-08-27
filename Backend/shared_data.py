"""
SmartPlate AI — Shared Data Module

This is the SINGLE SOURCE of canteen data used by both:
  - waste_module/waste_analysis.py   (Person 2's work)
  - demand_module/demand_prediction.py (Person 1's work)

Why a shared file:
  Both modules need the same underlying canteen data (date, meal, item,
  prepared/consumed quantities). Instead of each module generating its own
  fake data separately, they both import from here — so their outputs stay
  consistent with each other.

WHEN REAL DATA IS AVAILABLE:
  Replace only the generate_synthetic_data() function below with a function
  that loads your real CSV/database data into a DataFrame with the same
  columns. Nothing in waste_module or demand_module needs to change, as
  long as the column names stay the same:
      date, day, meal, item, prepared_kg, consumed_kg, wasted_kg,
      waste_pct, is_weekend, is_exam_period
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random


def generate_synthetic_data(days=120, seed=42):
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
        is_exam_period = 40 <= d <= 47  # a simulated exam week

        for meal in meals:
            base = {"Breakfast": 150, "Lunch": 220, "Dinner": 180}[meal]
            if is_weekend:
                base *= 0.75
            if is_exam_period:
                base *= 0.65

            for item in items:
                prepared = base * random.uniform(0.8, 1.1) / len(items)

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


def load_data(days=120):
    """
    Single entry point both modules call to get the canteen dataset.
    Replace the line below with real-data loading when it's available
    (e.g. pd.read_csv("real_canteen_data.csv")) — everything downstream
    keeps working as long as the columns match.
    """
    return generate_synthetic_data(days=days)
