# SmartPlate AI — Food Waste Intelligence System

An AI-powered platform for college canteens and hostel messes that predicts meal demand, detects food waste anomalies, and helps kitchen staff plan production more efficiently — reducing over-preparation and unnecessary waste.

# SmartPlate AI - Campus Canteen Management Ecosystem

> **Live Deployment:** [smartplate-ai-final.vercel.app](https://smartplate-ai-final.vercel.app)

[![Vercel Deployment](https://img.shields.io/badge/Status-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://smartplate-ai-final.vercel.app)

## What It Does

- Predicts demand for upcoming meals using a trained machine learning model, so kitchens prepare closer to what's actually needed
- Detects waste anomalies in real time using Isolation Forest, flagging unusual over-preparation or waste patterns
- Tracks preparation, consumption, and waste across meals and menu items
- Recommends production adjustments per dish based on historical waste data
- Provides a live dashboard for kitchen managers to monitor and act on insights

## Architecture

```
React Frontend  --->  FastAPI Backend + ML Modules  --->  PostgreSQL (Neon)
   (Dashboard)  <---        (API + Logic)            <---     (Database)
```

## Team

| Name | Role |
|---|---|
| Faisal Ali | Demand Prediction Model (Random Forest) |
| Farhan Akhtar | Waste Analysis and Anomaly Detection (Isolation Forest) |
| Afreen | Frontend Dashboard (React) |
| Sadia Fatima| Backend Development (FastAPI + PostgreSQL) and Full-Stack Integration |

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, PostgreSQL (Neon), Pydantic, JWT Authentication
**Machine Learning:** scikit-learn (Random Forest, Isolation Forest), pandas
**Frontend:** React, Vite, Tailwind CSS, Recharts

## Project Structure

```
smartplate-ai/
    backend/    - FastAPI server, database models, ML integration
    frontend/   - React dashboard
```

## Running the Backend

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` with:
```
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key
```

Run the server:
```
uvicorn main:app
```

API docs available at https://smartplate-ai-final.onrender.com/docs

## Running the Frontend

```
cd frontend
npm install
npm run dev
```

Dashboard available at http://localhost:5173

## Key API Endpoints

| Endpoint | Description |
|---|---|
| GET /analytics/summary | Overview dashboard summary stats |
| GET /analytics/insights | Analytics page trend metrics |
| GET /predictions/forecast | 7-day demand forecast (Random Forest) |
| GET /alerts | Real-time waste anomaly alerts |
| GET /menu-planner | Menu items with AI-recommended production counts |
| POST /auth/signup, POST /auth/login | User authentication |

## Individual ML Module Repositories

- Demand Prediction: https://github.com/FaisalAli2028/smartplate-ai-demand-module
- Waste Analysis: https://github.com/farhanakh786/smartplate-ai-waste-module

## Sample Results

- Demand prediction accuracy: approximately 9 kg mean absolute error on seeded test data
- Successfully detects real waste anomalies from live database records
- Full CRUD functionality, authentication, and role-based signup