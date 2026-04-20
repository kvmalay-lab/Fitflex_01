"""
SQLite database using SQLAlchemy for FitFlex session storage.
"""

import os
import uuid
import hashlib
from datetime import datetime
from typing import Optional, List

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session

import config

os.makedirs(os.path.dirname(config.DATABASE_PATH), exist_ok=True)

engine = create_engine(f"sqlite:///{config.DATABASE_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pin_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    gym_id = Column(String, default="default")
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkoutSession(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    exercise = Column(String, nullable=False)
    total_reps = Column(Integer, default=0)
    avg_form_score = Column(Float, default=0.0)
    duration_seconds = Column(Integer, default=0)
    data_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)
    _seed_demo_users()


def _hash_pin(pin: str) -> str:
    return hashlib.sha256(pin.encode()).hexdigest()


def _seed_demo_users():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            demo_users = [
                User(id=str(uuid.uuid4()), pin_hash=_hash_pin("1234"), name="Alex", gym_id="gym1"),
                User(id=str(uuid.uuid4()), pin_hash=_hash_pin("5678"), name="Jordan", gym_id="gym1"),
                User(id=str(uuid.uuid4()), pin_hash=_hash_pin("0000"), name="Demo User", gym_id="demo"),
            ]
            db.add_all(demo_users)
            db.commit()
    finally:
        db.close()


def get_user_by_pin(pin: str) -> Optional[User]:
    db = SessionLocal()
    try:
        pin_hash = _hash_pin(pin)
        return db.query(User).filter(User.pin_hash == pin_hash).first()
    finally:
        db.close()


def create_user(pin: str, name: str, gym_id: str = "default") -> User:
    db = SessionLocal()
    try:
        user = User(id=str(uuid.uuid4()), pin_hash=_hash_pin(pin), name=name, gym_id=gym_id)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def save_session(session_data: dict) -> Optional[WorkoutSession]:
    import json
    db = SessionLocal()
    try:
        session = WorkoutSession(
            id=session_data.get("session_id", str(uuid.uuid4())),
            user_id=session_data.get("user_id", "unknown"),
            exercise=session_data.get("exercise", "unknown"),
            total_reps=session_data.get("total_reps", 0),
            avg_form_score=session_data.get("avg_form_score", 0.0),
            duration_seconds=session_data.get("duration_seconds", 0),
            data_json=json.dumps(session_data),
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    finally:
        db.close()


def get_user_sessions(user_id: str, limit: int = 20) -> List[dict]:
    import json
    db = SessionLocal()
    try:
        sessions = (
            db.query(WorkoutSession)
            .filter(WorkoutSession.user_id == user_id)
            .order_by(WorkoutSession.created_at.desc())
            .limit(limit)
            .all()
        )
        result = []
        for s in sessions:
            try:
                data = json.loads(s.data_json)
            except Exception:
                data = {}
            result.append({
                "session_id": s.id,
                "exercise": s.exercise,
                "total_reps": s.total_reps,
                "avg_form_score": s.avg_form_score,
                "duration_seconds": s.duration_seconds,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                **{k: v for k, v in data.items() if k not in ("session_id",)},
            })
        return result
    finally:
        db.close()


def get_session(session_id: str) -> Optional[dict]:
    import json
    db = SessionLocal()
    try:
        s = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
        if not s:
            return None
        try:
            return json.loads(s.data_json)
        except Exception:
            return {"session_id": s.id, "exercise": s.exercise}
    finally:
        db.close()
