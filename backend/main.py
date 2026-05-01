"""
FitFlex Backend — FastAPI server with JWT auth, SQLite, and WebSocket streaming.
"""

import asyncio
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
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

# Phase 8: allow operators to configure additional CORS origins (e.g. Vercel
# preview URLs, custom domains) via the FITFLEX_EXTRA_ORIGINS env var, comma
# separated. Empty values are ignored.
extra = os.environ.get("FITFLEX_EXTRA_ORIGINS", "")
for o in extra.split(","):
    o = o.strip()
    if o and o not in allowed_origins:
        allowed_origins.append(o)

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


class RepHistoryItem(BaseModel):
    rep_number: int
    peak_angle: float
    form_score: float
    errors: list = []


class SessionCreate(BaseModel):
    exercise: str
    total_reps: int
    avg_form_score: float
    duration_seconds: int
    rep_history: list = []


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


@app.post("/api/sessions", status_code=201)
async def create_session(payload: SessionCreate, user=Depends(get_current_user)):
    """Persist a completed workout session computed on the client.

    Single source of truth for workout history (Phase 4). The session is
    always scoped to the authenticated user — `user_id` from the JWT is the
    only one accepted, regardless of any client-supplied value.
    """
    user_id = user["sub"]
    saved = database.save_session(
        user_id=user_id,
        exercise=payload.exercise,
        total_reps=payload.total_reps,
        avg_form_score=payload.avg_form_score,
        duration_seconds=payload.duration_seconds,
        rep_history=payload.rep_history,
    )
    return {
        "id": saved.id,
        "user_id": saved.user_id,
        "exercise": saved.exercise,
        "total_reps": saved.total_reps,
        "avg_form_score": float(saved.avg_form_score),
        "duration_seconds": saved.duration_seconds,
        "rep_history": saved.rep_history or [],
        "created_at": saved.created_at.isoformat() if saved.created_at else None,
    }


@app.get("/api/sessions")
async def list_sessions(user=Depends(get_current_user), limit: int = 50):
    """Return the authenticated user's sessions (most recent first)."""
    user_id = user["sub"]
    return database.get_user_sessions(user_id, limit=limit)


@app.post("/api/session/stop")
async def stop_session(user=Depends(get_current_user)):
    """Legacy server-simulated session stop. Persistence happens via the new
    /api/sessions endpoint instead — the simulator no longer auto-saves."""
    user_id = user["sub"]
    if user_id not in active_sessions:
        return {"status": "no_active_session"}
    manager = active_sessions.pop(user_id)
    return manager.stop_session()


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
                    await websocket.send_json(summary)
            except asyncio.TimeoutError:
                pass

            await asyncio.sleep(config.WEBSOCKET_UPDATE_INTERVAL_MS / 1000)

    except WebSocketDisconnect:
        pass
    finally:
        ws_connections.get(user_id, set()).discard(websocket)


# --- Serve built frontend (production) ---
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")
if os.path.isdir(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws"):
            raise HTTPException(status_code=404)
        candidate = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
