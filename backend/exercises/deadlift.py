"""
Deadlift — FSM rep counting and form validation.
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from .base import Exercise, ExerciseState
from one_euro_filter import OneEuroFilter
import config


class Deadlift(Exercise):
    def __init__(self):
        super().__init__("deadlift", config.DEADLIFT)
        self.knee_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                         beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.back_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                         beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.hysteresis_top = 165
        self.hysteresis_bottom = 85

    def process_frame(self, frame_data: dict, image_width: int = 1, image_height: int = 1):
        knee_angle = self.knee_filter.filter(frame_data.get("left_knee", 170.0))
        back_angle = self.back_filter.filter(frame_data.get("back_angle", 5.0))

        if self.state == ExerciseState.READY:
            if knee_angle < self.hysteresis_bottom:
                self.state = ExerciseState.HINGING
                self.current_rep_data = {"rep_number": self.rep_count + 1, "peak_angle": knee_angle, "form_score": 100, "errors": []}
        elif self.state == ExerciseState.HINGING:
            self.current_rep_data["peak_angle"] = min(self.current_rep_data["peak_angle"], knee_angle)
            if knee_angle > self.hysteresis_top:
                errors = self._detect_errors(frame_data)
                form_score = self._calculate_form_score(errors)
                self.current_rep_data.update({"rep_number": self.rep_count + 1, "form_score": form_score, "errors": errors})
                self.rep_history.append(self.current_rep_data.copy())
                self.rep_count += 1
                self.state = ExerciseState.READY

        errors = self._detect_errors(frame_data)
        form_score = self._calculate_form_score(errors)
        return {
            "rep_count": self.rep_count,
            "state": self.state.value,
            "current_rep": self.current_rep_data,
            "form_score": form_score,
            "errors": errors,
            "angles": {"left_knee": round(knee_angle, 1), "back_angle": round(back_angle, 1)},
        }

    def _detect_errors(self, frame_data: dict) -> list:
        errors = []
        back = frame_data.get("back_angle", 0)
        if back > self.config["errors"]["back_rounding"]["threshold"]:
            errors.append({"type": "back_rounding", "confidence": 0.90,
                           "penalty": self.config["errors"]["back_rounding"]["penalty"],
                           "message": self.config["errors"]["back_rounding"]["message"]})
        return errors

    def detect_exercise(self, frame_data: dict) -> bool:
        knee = frame_data.get("left_knee", 170)
        return 70 < knee < 170
