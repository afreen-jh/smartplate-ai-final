import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import select
import models

def build_dataframe(db: Session) -> pd.DataFrame:
    rows = db.execute(
        select(
            models.MealSession.date,
            models.MealSession.meal_type,
            models.MenuItem.name,
            models.PrepRecord.quantity_prepared,
            models.ConsumptionRecord.quantity_consumed,
            models.ConsumptionRecord.quantity_wasted,
        )
        .select_from(models.ConsumptionRecord)
        .join(models.PrepRecord, (models.PrepRecord.session_id == models.ConsumptionRecord.session_id) &
                                  (models.PrepRecord.item_id == models.ConsumptionRecord.item_id))
        .join(models.MenuItem, models.MenuItem.id == models.ConsumptionRecord.item_id)
        .join(models.MealSession, models.MealSession.id == models.ConsumptionRecord.session_id)
    ).all()

    data = []
    for r in rows:
        prepared = float(r.quantity_prepared)
        consumed = float(r.quantity_consumed)
        wasted = float(r.quantity_wasted)
        waste_pct = (wasted / prepared * 100) if prepared else 0
        day_name = r.date.strftime("%A")
        meal_raw = r.meal_type.value if hasattr(r.meal_type, "value") else str(r.meal_type)

        data.append({
            "date": r.date.strftime("%Y-%m-%d"),
            "day": day_name,
            "meal": meal_raw.capitalize(),
            "item": r.name,
            "prepared_kg": prepared,
            "consumed_kg": consumed,
            "wasted_kg": wasted,
            "waste_pct": waste_pct,
            "is_weekend": day_name in ["Saturday", "Sunday"],
            "is_exam_period": False,
        })
    return pd.DataFrame(data)