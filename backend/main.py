"""
FitFlex Backend — FastAPI server with JWT auth, SQLite, and WebSocket streaming.
"""

import asyncio
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt

import config
import database
from session_manager import SessionManager

database.init_db()

app = FastAPI(title="FitFlex API", version="2.0.0")

allowed_origins = ["http://localhost:5000", "http://0.0.0.0:5000"]
replit_domain = os.environ.get("REPLIT_DEV_DOMAIN")
if replit_domain:
    allowed_origins.append(f"https://{replit_domain}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

security = HTTPBearer()
active_sessions: Dict[str, SessionManager] = {}
ws_connections: Dict[str, Set[WebSocket]] = {}


def create_token(user_id: str, name: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=config.JWT_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": user_id, "name": name, "exp": expire},
        config.JWT_SECRET,
        algorithm=config.JWT_ALGORITHM,
    )


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload


class LoginRequest(BaseModel):
    pin: str


class StartSessionRequest(BaseModel):
    exercise_type: str


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/api/exercises")
async def list_exercises():
    return [{"id": k, "name": v["name"]} for k, v in config.EXERCISES.items()]


@app.post("/api/auth/login")
async def login(req: LoginRequest):
    if len(req.pin) < 4 or len(req.pin) > 6 or not req.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be 4-6 digits")
    user = database.get_user_by_pin(req.pin)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    token = create_token(user.id, user.name)
    return {"user_id": user.id, "name": user.name, "token": token}


@app.post("/api/session/start")
async def start_session(req: StartSessionRequest, user=Depends(get_current_user)):
    user_id = user["sub"]
    if user_id in active_sessions:
        active_sessions[user_id].stop_session()

    manager = SessionManager()
    session_id = manager.start_session(user_id, req.exercise_type)
    active_sessions[user_id] = manager
    return {"session_id": session_id, "status": "started", "exercise": req.exercise_type}


@app.post("/api/session/stop")
async def stop_session(user=Depends(get_current_user)):
    user_id = user["sub"]
    if user_id not in active_sessions:
        return {"status": "no_active_session"}
    manager = active_sessions.pop(user_id)
    summary = manager.stop_session()
    if summary.get("total_reps", 0) >= config.SESSION_MIN_REPS_TO_SAVE:
        database.save_session(summary)
    return summary


@app.get("/api/sessions/{user_id}")
async def get_sessions(user_id: str, user=Depends(get_current_user)):
    if user["sub"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return database.get_user_sessions(user_id)


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: Optional[str] = None):
    payload = verify_token(token or "")
    if not payload or payload.get("sub") != user_id:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await websocket.accept()
    ws_connections.setdefault(user_id, set()).add(websocket)

    try:
        while True:
            manager = active_sessions.get(user_id)
            if manager:
                data = manager.tick()
                await websocket.send_json(data)
            else:
                await websocket.send_json({
                    "timestamp": int(__import__("time").time() * 1000),
                    "session_status": "IDLE",
                    "rep_count": 0,
                    "form_score": 100,
                    "form_errors": [],
                    "rep_history": [],
                    "angles": {},
                })

            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                import json
                cmd = json.loads(msg)
                if cmd.get("action") == "stop" and user_id in active_sessions:
                    mgr = active_sessions.pop(user_id)
                    summary = mgr.stop_session()
                    if summary.get("total_reps", 0) >= config.SESSION_MIN_REPS_TO_SAVE:
                        database.save_session(summary)
                    await websocket.send_json(summary)
            except asyncio.TimeoutError:
                pass

            await asyncio.sleep(config.WEBSOCKET_UPDATE_INTERVAL_MS / 1000)

    except WebSocketDisconnect:
        pass
    finally:
        ws_connections.get(user_id, set()).discard(websocket)
