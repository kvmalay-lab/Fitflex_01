"""
Lat Pulldown — FSM rep counting and form validation.
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from .base import Exercise, ExerciseState
from one_euro_filter import OneEuroFilter
import config


class LatPulldown(Exercise):
    def __init__(self):
        super().__init__("lat_pulldown", config.LAT_PULLDOWN)
        self.left_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                         beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.right_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                          beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.hysteresis_top = 145
        self.hysteresis_bottom = 95

    def process_frame(self, frame_data: dict, image_width: int = 1, image_height: int = 1):
        left_angle = self.left_filter.filter(frame_data.get("left_elbow", 140.0))
        right_angle = self.right_filter.filter(frame_data.get("right_elbow", 140.0))
        avg_angle = (left_angle + right_angle) / 2

        if self.state == ExerciseState.READY:
            if avg_angle < self.hysteresis_bottom:
                self.state = ExerciseState.PULLING
                self.current_rep_data = {"rep_number": self.rep_count + 1, "peak_angle": avg_angle, "form_score": 100, "errors": []}
        elif self.state == ExerciseState.PULLING:
            self.current_rep_data["peak_angle"] = min(self.current_rep_data["peak_angle"], avg_angle)
            if avg_angle > self.hysteresis_top:
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
            "angles": {"left_elbow": round(left_angle, 1), "right_elbow": round(right_angle, 1)},
        }

    def _detect_errors(self, frame_data: dict) -> list:
        errors = []
        lean = frame_data.get("torso_lean", 0)
        if lean > self.config["errors"]["forward_lean"]["threshold"]:
            errors.append({"type": "forward_lean", "confidence": 0.80,
                           "penalty": self.config["errors"]["forward_lean"]["penalty"],
                           "message": self.config["errors"]["forward_lean"]["message"]})
        return errors

    def detect_exercise(self, frame_data: dict) -> bool:
        avg = (frame_data.get("left_elbow", 140) + frame_data.get("right_elbow", 140)) / 2
        return 80 < avg < 145
