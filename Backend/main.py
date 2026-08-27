import demand_prediction
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select, func
import models
import schemas
from database import engine, SessionLocal
from auth import hash_password, verify_password, create_access_token
import smartplate_waste_module as waste_module
from data_adapter import build_dataframe
import demand_prediction

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "SmartPlate AI backend is running!"}

@app.post("/menu", response_model=schemas.MenuItemOut)
def create_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    new_item = models.MenuItem(name=item.name, category=item.category, unit=item.unit)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/menu", response_model=list[schemas.MenuItemOut])
def list_menu_items(db: Session = Depends(get_db)):
    return db.execute(select(models.MenuItem)).scalars().all()

@app.post("/sessions", response_model=schemas.MealSessionOut)
def create_session(session: schemas.MealSessionCreate, db: Session = Depends(get_db)):
    new_session = models.MealSession(date=session.date, meal_type=session.meal_type)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@app.get("/sessions", response_model=list[schemas.MealSessionOut])
def list_sessions(db: Session = Depends(get_db)):
    return db.execute(select(models.MealSession)).scalars().all()

@app.post("/prep", response_model=schemas.PrepRecordOut)
def create_prep_record(record: schemas.PrepRecordCreate, db: Session = Depends(get_db)):
    new_record = models.PrepRecord(
        session_id=record.session_id,
        item_id=record.item_id,
        quantity_prepared=record.quantity_prepared
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@app.get("/prep", response_model=list[schemas.PrepRecordOut])
def list_prep_records(db: Session = Depends(get_db)):
    return db.execute(select(models.PrepRecord)).scalars().all()

@app.post("/consumption", response_model=schemas.ConsumptionRecordOut)
def create_consumption_record(record: schemas.ConsumptionRecordCreate, db: Session = Depends(get_db)):
    new_record = models.ConsumptionRecord(
        session_id=record.session_id,
        item_id=record.item_id,
        quantity_consumed=record.quantity_consumed,
        quantity_wasted=record.quantity_wasted
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@app.get("/consumption", response_model=list[schemas.ConsumptionRecordOut])
def list_consumption_records(db: Session = Depends(get_db)):
    return db.execute(select(models.ConsumptionRecord)).scalars().all()

@app.post("/predictions/{session_id}/{item_id}", response_model=schemas.PredictionOut)
def generate_prediction(session_id: int, item_id: int, db: Session = Depends(get_db)):
    predicted_qty = 18.5  # PLACEHOLDER until Person 1's model is wired in

    new_prediction = models.Prediction(
        session_id=session_id,
        item_id=item_id,
        predicted_quantity=predicted_qty,
        model_version="placeholder-v0"
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)
    return new_prediction

@app.get("/predictions", response_model=list[schemas.PredictionOut])
def list_predictions(db: Session = Depends(get_db)):
    return db.execute(select(models.Prediction)).scalars().all()

@app.get("/analytics/weekly-demand", response_model=list[schemas.WeeklyDemandPoint])
def weekly_demand(db: Session = Depends(get_db)):
    actual_rows = db.execute(
        select(
            models.MealSession.date,
            func.sum(models.PrepRecord.quantity_prepared).label("actual")
        )
        .join(models.PrepRecord, models.PrepRecord.session_id == models.MealSession.id)
        .group_by(models.MealSession.date)
    ).all()

    predicted_rows = db.execute(
        select(
            models.MealSession.date,
            func.sum(models.Prediction.predicted_quantity).label("predicted")
        )
        .join(models.Prediction, models.Prediction.session_id == models.MealSession.id)
        .group_by(models.MealSession.date)
    ).all()

    actual_map = {row.date: float(row.actual) for row in actual_rows}
    predicted_map = {row.date: float(row.predicted) for row in predicted_rows}

    all_dates = sorted(set(actual_map.keys()) | set(predicted_map.keys()))

    result = []
    for d in all_dates:
        result.append(schemas.WeeklyDemandPoint(
            date=d,
            day_label=d.strftime("%a"),
            actual_plates=actual_map.get(d, 0),
            predicted_plates=predicted_map.get(d, 0)
        ))
    return result

@app.get("/analytics/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    df = build_dataframe(db)
    if df.empty:
        return {
            "totalPreparedKg": 0,
            "totalWastedKg": 0,
            "wastePercentage": 0,
            "costSavedINR": 0,
            "efficiencyStatus": "No Data"
        }
    return waste_module.compute_summary(df)

@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    df = build_dataframe(db)
    if df.empty:
        return []
    return waste_module.generate_alerts(df)

@app.get("/menu-planner", response_model=list[schemas.MenuPlannerItem])
def get_menu_planner(db: Session = Depends(get_db)):
    items = db.execute(select(models.MenuItem)).scalars().all()
    result = []
    for item in items:
        consumption_rows = db.execute(
            select(models.ConsumptionRecord).where(models.ConsumptionRecord.item_id == item.id)
        ).scalars().all()

        total_wasted = sum(float(r.quantity_wasted) for r in consumption_rows)
        total_consumed = sum(float(r.quantity_consumed) for r in consumption_rows)
        total = total_wasted + total_consumed

        variance = -round(item.base_plate_count * (total_wasted / total) * 0.5) if total > 0 else 0

        result.append(schemas.MenuPlannerItem(
            id=item.id,
            name=item.name,
            meal_type=item.category,
            base_plate_count=item.base_plate_count,
            ai_variance_factor=variance,
            target_production=item.base_plate_count + variance
        ))
    return result

@app.put("/menu-planner/{item_id}", response_model=schemas.MenuPlannerItem)
def update_menu_planner(item_id: int, update: schemas.MenuPlannerUpdate, db: Session = Depends(get_db)):
    item = db.get(models.MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.base_plate_count = update.base_plate_count
    db.commit()
    db.refresh(item)

    consumption_rows = db.execute(
        select(models.ConsumptionRecord).where(models.ConsumptionRecord.item_id == item.id)
    ).scalars().all()
    total_wasted = sum(float(r.quantity_wasted) for r in consumption_rows)
    total_consumed = sum(float(r.quantity_consumed) for r in consumption_rows)
    total = total_wasted + total_consumed
    variance = -round(item.base_plate_count * (total_wasted / total) * 0.5) if total > 0 else 0

    return schemas.MenuPlannerItem(
        id=item.id,
        name=item.name,
        meal_type=item.category,
        base_plate_count=item.base_plate_count,
        ai_variance_factor=variance,
        target_production=item.base_plate_count + variance
    )

@app.post("/auth/signup", response_model=schemas.TokenOut)
def signup(user: schemas.UserSignup, db: Session = Depends(get_db)):
    existing = db.execute(select(models.User).where(models.User.email == user.email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email})
    return schemas.TokenOut(access_token=token, user=new_user)

@app.post("/auth/login", response_model=schemas.TokenOut)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.execute(select(models.User).where(models.User.email == credentials.email)).scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return schemas.TokenOut(access_token=token, user=user)

@app.get("/predictions/forecast")
def get_demand_forecast(db: Session = Depends(get_db)):
    df = build_dataframe(db)
    if df.empty or len(df) < 10:
        return {"modelPerformance": {"maeKg": 0}, "mockWeeklyForecast": []}

    daily, day_encoder, meal_encoder = demand_prediction.build_features(df)
    model, mae, features = demand_prediction.train_model(daily)
    forecast = demand_prediction.generate_forecast(daily, model, day_encoder, meal_encoder, features)

    return {
        "modelPerformance": {"maeKg": round(mae, 2)},
        "mockWeeklyForecast": forecast
    }

@app.get("/analytics/insights")
def get_analytics_insights(db: Session = Depends(get_db)):
    df = build_dataframe(db)
    if df.empty:
        return {
            "wasteVarianceReduction": 0,
            "attendanceMatch": 0,
            "peakMarginWindow": "N/A"
        }

    df['date_parsed'] = pd.to_datetime(df['date'])
    daily_waste = df.groupby('date_parsed').apply(
        lambda g: g['wasted_kg'].sum() / g['prepared_kg'].sum() * 100 if g['prepared_kg'].sum() > 0 else 0
    ).sort_index()

    half = len(daily_waste) // 2
    if half > 0:
        recent_avg = daily_waste.iloc[half:].mean()
        earlier_avg = daily_waste.iloc[:half].mean()
        variance_reduction = round(((earlier_avg - recent_avg) / earlier_avg) * 100, 1) if earlier_avg > 0 else 0
    else:
        variance_reduction = 0

    try:
        daily, day_encoder, meal_encoder = demand_prediction.build_features(df)
        model, mae, features = demand_prediction.train_model(daily)
        avg_actual = daily['consumed_kg'].mean()
        attendance_match = round(max(0, 100 - (mae / avg_actual * 100)), 1) if avg_actual > 0 else 0
    except Exception:
        attendance_match = 0

    grouped = df.groupby(['day', 'meal']).apply(
        lambda g: g['wasted_kg'].sum() / g['prepared_kg'].sum() * 100 if g['prepared_kg'].sum() > 0 else 0
    )
    if len(grouped) > 0:
        peak_day, peak_meal = grouped.idxmax()
        peak_window = f"{peak_day} {peak_meal}"
    else:
        peak_window = "N/A"

    return {
        "wasteVarianceReduction": variance_reduction,
        "attendanceMatch": attendance_match,
        "peakMarginWindow": peak_window
    }

