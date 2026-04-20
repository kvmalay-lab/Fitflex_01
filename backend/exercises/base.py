"""
Abstract base class for exercise FSM.
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List


class ExerciseState(Enum):
    READY = "ready"
    ACTIVE = "active"
    BOTTOM = "bottom"
    TOP = "top"
    HOLD = "hold"
    CURLING = "curling"
    PULLING = "pulling"
    SQUATTING = "squatting"
    PRESSING = "pressing"
    HINGING = "hinging"


class Exercise(ABC):
    def __init__(self, name: str, config: Dict):
        self.name = name
        self.config = config
        self.state = ExerciseState.READY
        self.rep_count = 0
        self.current_rep_data = {
            "rep_number": 0,
            "peak_angle": 0,
            "form_score": 100,
            "errors": [],
        }
        self.rep_history: List[Dict] = []

    @abstractmethod
    def process_frame(self, landmarks, image_width: int, image_height: int) -> Dict:
        pass

    @abstractmethod
    def detect_exercise(self, landmarks) -> bool:
        pass

    def reset(self):
        self.state = ExerciseState.READY
        self.rep_count = 0
        self.current_rep_data = {
            "rep_number": 0,
            "peak_angle": 0,
            "form_score": 100,
            "errors": [],
        }
        self.rep_history = []

    def _calculate_form_score(self, errors: list) -> int:
        import config as cfg
        score = cfg.FORM_SCORE_BASE
        for error in errors:
            score -= error.get("penalty", 0)
        return max(cfg.FORM_SCORE_MIN, min(cfg.FORM_SCORE_MAX, score))

    def get_summary(self) -> Dict:
        avg_form_score = (
            sum(r["form_score"] for r in self.rep_history) / len(self.rep_history)
            if self.rep_history else 0
        )
        return {
            "exercise": self.name,
            "total_reps": self.rep_count,
            "avg_form_score": round(avg_form_score, 1),
            "reps": self.rep_history,
        }
