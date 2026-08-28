from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=180,
    pool_size=5,
    max_overflow=10,
    connect_args={"connect_timeout": 10}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# Auto-seed database on startup for free Render tier
try:
    from sqlalchemy import inspect
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        db = SessionLocal()
        # Check if users table is empty, then run seeds
        from models import User
        if db.query(User).count() == 0:
            import subprocess
            subprocess.run(["python", "seed_data.py"])
            subprocess.run(["python", "seed_predictions.py"])
        db.close()
except Exception as e:
    print("Auto-seed notice:", e)