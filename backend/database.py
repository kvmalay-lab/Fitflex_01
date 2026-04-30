"""
Database layer.

Uses Replit-managed PostgreSQL via DATABASE_URL when available; falls back to
the local SQLite file for offline development. The `sessions` table is the
single source of truth for completed workouts (Phase 4 of the refactor).
"""

import os
import uuid
import hashlib
import json
from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Integer,
    Float,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import declarative_base, sessionmaker

import config


def _build_engine():
    url = os.environ.get("DATABASE_URL")
    if url:
        # SQLAlchemy needs the postgresql:// scheme.
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return create_engine(url, pool_pre_ping=True), True
    os.makedirs(os.path.dirname(config.DATABASE_PATH), exist_ok=True)
    return create_engine(
        f"sqlite:///{config.DATABASE_PATH}",
        connect_args={"check_same_thread": False},
    ), False


engine, IS_POSTGRES = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JSONB on Postgres, plain JSON on SQLite — both work transparently.
JsonType = JSONB().with_variant(JSON(), "sqlite") if IS_POSTGRES else JSON()


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
    user_id = Column(String, nullable=False, index=True)
    exercise = Column(String, nullable=False)
    total_reps = Column(Integer, default=0, nullable=False)
    avg_form_score = Column(Float, default=0.0, nullable=False)
    duration_seconds = Column(Integer, default=0, nullable=False)
    rep_history = Column(JsonType, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


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
        return db.query(User).filter(User.pin_hash == _hash_pin(pin)).first()
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


def save_session(
    *,
    user_id: str,
    exercise: str,
    total_reps: int,
    avg_form_score: float,
    duration_seconds: int,
    rep_history: list,
) -> WorkoutSession:
    db = SessionLocal()
    try:
        session = WorkoutSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            exercise=exercise,
            total_reps=int(total_reps),
            avg_form_score=float(avg_form_score),
            duration_seconds=int(duration_seconds),
            rep_history=rep_history or [],
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    finally:
        db.close()


def get_user_sessions(user_id: str, limit: int = 50) -> List[dict]:
    db = SessionLocal()
    try:
        rows = (
            db.query(WorkoutSession)
            .filter(WorkoutSession.user_id == user_id)
            .order_by(WorkoutSession.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": r.id,
                "user_id": r.user_id,
                "exercise": r.exercise,
                "total_reps": r.total_reps,
                "avg_form_score": float(r.avg_form_score),
                "duration_seconds": r.duration_seconds,
                "rep_history": r.rep_history or [],
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]
    finally:
        db.close()
