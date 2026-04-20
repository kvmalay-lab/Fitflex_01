from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
from mediapipe_engine import FitFlexEngine

app = FastAPI()

allowed_origins = [
    "http://localhost:5000",
    "http://0.0.0.0:5000",
]
replit_domain = os.environ.get("REPLIT_DEV_DOMAIN")
if replit_domain:
    allowed_origins.append(f"https://{replit_domain}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

active_sessions = {}

class StartSessionRequest(BaseModel):
    user_id: str
    exercise_type: str

@app.post("/api/session/start")
async def start_session(req: StartSessionRequest):
    session_id = f"sess_{req.user_id}_{len(active_sessions)}"
    engine = FitFlexEngine(exercise_type=req.exercise_type)
    active_sessions[session_id] = engine
    return {"session_id": session_id, "status": "started"}

@app.post("/api/session/{session_id}/stop")
async def stop_session(session_id: str):
    if session_id in active_sessions:
        engine = active_sessions[session_id]
        engine.stop()
        reps = engine.rep_count
        del active_sessions[session_id]
        return {"session_id": session_id, "total_reps": reps, "status": "stopped"}
    return {"status": "not_found"}

def generate_frames(session_id):
    engine = active_sessions.get(session_id)
    while engine and engine.running:
        frame = engine.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        asyncio.run(asyncio.sleep(0.03))

@app.get("/api/session/{session_id}/frame")
async def video_feed(session_id: str):
    if session_id not in active_sessions:
        return {"error": "Session not found"}
    return StreamingResponse(generate_frames(session_id), media_type="multipart/x-mixed-replace; boundary=frame")

@app.websocket("/ws/session/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    if session_id not in active_sessions:
        await websocket.close()
        return

    engine = active_sessions[session_id]
    try:
        while engine.running:
            stats = engine.get_stats()
            await websocket.send_json(stats)
            await asyncio.sleep(0.03)
    except WebSocketDisconnect:
        pass

@app.get("/api/exercises")
async def get_exercises():
    return ["bicep_curl", "squat", "push_up"]
