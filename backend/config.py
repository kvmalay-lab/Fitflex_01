"""
FitFlex Configuration — All thresholds, constants, and settings.
"""

import os

CAMERA_ID = 0
CAMERA_FPS = 30
CAMERA_WIDTH = 1280
CAMERA_HEIGHT = 720
MEDIAPIPE_MIN_DETECTION_CONFIDENCE = 0.5
MEDIAPIPE_MIN_TRACKING_CONFIDENCE = 0.5
MEDIAPIPE_MODEL_COMPLEXITY = 1

ONE_EURO_FREQ = 30
ONE_EURO_MINCUTOFF = 1.0
ONE_EURO_BETA = 0.0
ONE_EURO_DCUTOFF = 1.0

EXERCISE_DETECTION_FRAMES = 5
EXERCISE_MOTION_THRESHOLD = 40

FORM_SCORE_BASE = 100
FORM_SCORE_MIN = 0
FORM_SCORE_MAX = 100

SESSION_PRESENCE_TIMEOUT_SECONDS = 30
SESSION_MIN_REPS_TO_SAVE = 1
SESSION_DATA_DIR = "data/sessions"

WEBSOCKET_UPDATE_INTERVAL_MS = 100
WEBSOCKET_HOST = "0.0.0.0"
WEBSOCKET_PORT = 8000

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "data", "sessions.db")

JWT_SECRET = os.environ.get("JWT_SECRET", "fitflex-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

BICEP_CURL = {
    "elbow_angle_top": 160,
    "elbow_angle_bottom": 90,
    "elbow_angle_incomplete": 120,
    "shoulder_angle_max": 120,
    "elbow_flare_threshold": 15,
    "torso_rotation_threshold": 10,
    "errors": {
        "lean_back": {"threshold": 120, "penalty": 5, "message": "Keep your back straight"},
        "elbow_flare": {"threshold": 15, "penalty": 3, "message": "Keep elbows close to body"},
        "incomplete_range": {"threshold": 120, "penalty": 2, "message": "Go lower for full range"},
        "swinging": {"threshold": 10, "penalty": 4, "message": "Control the movement, no swinging"},
    }
}

LAT_PULLDOWN = {
    "elbow_angle_top": 140,
    "elbow_angle_bottom": 100,
    "elbow_angle_incomplete": 80,
    "torso_lean_forward_threshold": 20,
    "elbow_spread_threshold": 45,
    "errors": {
        "elbows_too_high": {"threshold": 110, "penalty": 5, "message": "Pull elbows down further"},
        "forward_lean": {"threshold": 20, "penalty": 4, "message": "Keep torso upright"},
        "incomplete_pull": {"threshold": 80, "penalty": 3, "message": "Pull down more"},
        "wide_elbows": {"threshold": 45, "penalty": 3, "message": "Bring elbows closer together"},
    }
}

SQUAT = {
    "knee_angle_bottom": 90,
    "knee_angle_top": 170,
    "knee_angle_incomplete": 110,
    "knee_cave_threshold": 15,
    "torso_lean_threshold": 25,
    "forward_knee_threshold": 15,
    "errors": {
        "knees_cave": {"threshold": 15, "penalty": 5, "message": "Keep knees aligned over toes"},
        "incomplete_depth": {"threshold": 110, "penalty": 4, "message": "Squat deeper"},
        "forward_lean": {"threshold": 25, "penalty": 4, "message": "Keep chest upright"},
        "forward_knee": {"threshold": 15, "penalty": 3, "message": "Knees shouldn't go past toes"},
    }
}

SHOULDER_PRESS = {
    "elbow_angle_top": 160,
    "elbow_angle_bottom": 90,
    "elbow_angle_incomplete": 110,
    "elbow_flare_threshold": 20,
    "torso_lean_threshold": 15,
    "errors": {
        "incomplete_lockout": {"threshold": 110, "penalty": 4, "message": "Lock out arms fully"},
        "elbow_flare": {"threshold": 20, "penalty": 3, "message": "Keep elbows under wrists"},
        "torso_lean": {"threshold": 15, "penalty": 3, "message": "Keep torso straight"},
        "asymmetrical": {"threshold": 10, "penalty": 2, "message": "Press evenly with both arms"},
    }
}

DEADLIFT = {
    "knee_angle_bottom": 80,
    "knee_angle_top": 170,
    "back_angle_bottom": 45,
    "back_angle_top": 5,
    "back_rounding_threshold": 55,
    "knee_drift_threshold": 10,
    "errors": {
        "back_rounding": {"threshold": 55, "penalty": 5, "message": "Keep back straight"},
        "incomplete_lockout": {"threshold": 170, "penalty": 4, "message": "Lock out hips fully"},
        "knee_drift": {"threshold": 10, "penalty": 3, "message": "Keep knees stable"},
        "bar_drift": {"threshold": 15, "penalty": 2, "message": "Keep bar close to body"},
    }
}

PLANK = {
    "hip_sag_threshold": 20,
    "shoulder_angle_threshold": 10,
    "head_drop_threshold": 15,
    "hold_duration_min": 10,
    "errors": {
        "hip_sag": {"threshold": 20, "penalty": 5, "message": "Keep hips level"},
        "shoulder_rotation": {"threshold": 10, "penalty": 3, "message": "Keep shoulders square"},
        "head_drop": {"threshold": 15, "penalty": 3, "message": "Keep head neutral"},
    }
}

EXERCISES = {
    "bicep_curl": {"name": "Bicep Curl", "config": BICEP_CURL},
    "lat_pulldown": {"name": "Lat Pulldown", "config": LAT_PULLDOWN},
    "squat": {"name": "Squat", "config": SQUAT},
    "shoulder_press": {"name": "Shoulder Press", "config": SHOULDER_PRESS},
    "deadlift": {"name": "Deadlift", "config": DEADLIFT},
    "plank": {"name": "Plank", "config": PLANK},
}
