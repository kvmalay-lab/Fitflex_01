"""
Session lifecycle manager — handles exercise detection, rep counting, and session tracking.
Runs in simulation mode when no camera is available.
"""

import uuid
import time
import math
import random
from typing import Optional, Dict
from exercises import EXERCISE_CLASSES
import config


class SimulatedPoseEngine:
    """
    Generates realistic simulated pose/angle data for all exercises.
    Used when no physical camera + MediaPipe is available.
    """
    def __init__(self, exercise_type: str):
        self.exercise_type = exercise_type
        self.t = 0.0
        self.cycle = 0
        self.noise_seed = random.random() * 100

    def get_frame_data(self) -> dict:
        self.t += 0.1
        phase = (math.sin(self.t * 0.5) + 1) / 2  # 0 to 1, smooth

        ex = self.exercise_type
        torso_lean = max(0, random.gauss(5, 3))
        elbow_flare = max(0, random.gauss(8, 4))
        knee_cave = max(0, random.gauss(5, 3))

        if ex == "bicep_curl":
            angle = 160 - phase * 130
            return {"left_elbow": angle, "right_elbow": angle + random.gauss(0, 2),
                    "torso_lean": torso_lean, "elbow_flare": elbow_flare}
        elif ex == "lat_pulldown":
            angle = 140 - phase * 50
            return {"left_elbow": angle, "right_elbow": angle + random.gauss(0, 2),
                    "torso_lean": torso_lean}
        elif ex == "squat":
            angle = 170 - phase * 85
            return {"left_knee": angle, "right_knee": angle + random.gauss(0, 2),
                    "torso_lean": torso_lean, "knee_cave": knee_cave}
        elif ex == "shoulder_press":
            angle = 90 + phase * 75
            return {"left_elbow": angle, "right_elbow": angle + random.gauss(0, 3),
                    "torso_lean": torso_lean}
        elif ex == "deadlift":
            knee = 170 - phase * 95
            back = phase * 45
            return {"left_knee": knee, "right_knee": knee + random.gauss(0, 2),
                    "back_angle": back}
        elif ex == "plank":
            return {"in_plank_position": True, "hip_sag": max(0, random.gauss(8, 5))}
        return {}


class SessionManager:
    def __init__(self):
        self.session_id: Optional[str] = None
        self.user_id: Optional[str] = None
        self.exercise_type: str = "bicep_curl"
        self.exercise: Optional[object] = None
        self.engine: Optional[SimulatedPoseEngine] = None
        self.status: str = "IDLE"
        self.start_time: Optional[float] = None
        self.last_data: Dict = {}
        self._session_history = []

    def start_session(self, user_id: str, exercise_type: str) -> str:
        self.session_id = str(uuid.uuid4())
        self.user_id = user_id
        self.exercise_type = exercise_type
        self.status = "ACTIVE"
        self.start_time = time.time()

        ExClass = EXERCISE_CLASSES.get(exercise_type, EXERCISE_CLASSES["bicep_curl"])
        self.exercise = ExClass()
        self.engine = SimulatedPoseEngine(exercise_type)
        return self.session_id

    def stop_session(self) -> Dict:
        self.status = "ENDED"
        summary = self._build_summary()
        self._reset()
        return summary

    def tick(self) -> Dict:
        if not self.exercise or self.status != "ACTIVE":
            return self._idle_payload()

        frame_data = self.engine.get_frame_data()
        result = self.exercise.process_frame(frame_data)

        duration = int(time.time() - self.start_time) if self.start_time else 0
        payload = {
            "timestamp": int(time.time() * 1000),
            "session_id": self.session_id,
            "user_id": self.user_id,
            "exercise": self.exercise_type,
            "rep_count": result.get("rep_count", 0),
            "current_rep_stage": result.get("state", "ready"),
            "hold_duration": result.get("hold_duration", 0),
            "angles": result.get("angles", {}),
            "form_errors": result.get("errors", []),
            "form_score": result.get("form_score", 100),
            "rep_history": self.exercise.rep_history[-10:],
            "session_status": self.status,
            "duration_seconds": duration,
        }
        self.last_data = payload
        return payload

    def _idle_payload(self) -> Dict:
        return {
            "timestamp": int(time.time() * 1000),
            "session_id": None,
            "user_id": self.user_id,
            "exercise": self.exercise_type,
            "rep_count": 0,
            "current_rep_stage": "idle",
            "hold_duration": 0,
            "angles": {},
            "form_errors": [],
            "form_score": 100,
            "rep_history": [],
            "session_status": "IDLE",
            "duration_seconds": 0,
        }

    def _build_summary(self) -> Dict:
        if not self.exercise:
            return {}
        summary = self.exercise.get_summary()
        reps = summary.get("reps", [])
        duration = int(time.time() - self.start_time) if self.start_time else 0

        best_rep = max(reps, key=lambda r: r.get("form_score", 0)) if reps else None
        worst_rep = min(reps, key=lambda r: r.get("form_score", 0)) if reps else None

        error_counts: Dict[str, int] = {}
        for rep in reps:
            for err in rep.get("errors", []):
                t = err.get("type", "unknown")
                error_counts[t] = error_counts.get(t, 0) + 1
        top_errors = sorted(
            [{"type": k, "count": v, "frequency": round(v / max(len(reps), 1), 2)} for k, v in error_counts.items()],
            key=lambda x: x["count"], reverse=True
        )[:3]

        return {
            "type": "session_summary",
            "session_id": self.session_id,
            "user_id": self.user_id,
            "exercise": self.exercise_type,
            "total_reps": summary.get("total_reps", 0),
            "avg_form_score": summary.get("avg_form_score", 0),
            "best_rep": best_rep,
            "worst_rep": worst_rep,
            "top_errors": top_errors,
            "duration_seconds": duration,
            "timestamp": int(time.time() * 1000),
            "rep_history": reps,
        }

    def _reset(self):
        self.session_id = None
        self.exercise = None
        self.engine = None
        self.start_time = None
        self.status = "IDLE"
