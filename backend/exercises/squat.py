"""
Squat — FSM rep counting and form validation.
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from .base import Exercise, ExerciseState
from one_euro_filter import OneEuroFilter
import config


class Squat(Exercise):
    def __init__(self):
        super().__init__("squat", config.SQUAT)
        self.left_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                         beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.right_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                          beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.hysteresis_top = 165
        self.hysteresis_bottom = 95

    def process_frame(self, frame_data: dict, image_width: int = 1, image_height: int = 1):
        left_angle = self.left_filter.filter(frame_data.get("left_knee", 170.0))
        right_angle = self.right_filter.filter(frame_data.get("right_knee", 170.0))
        avg_angle = (left_angle + right_angle) / 2

        if self.state == ExerciseState.READY:
            if avg_angle < self.hysteresis_bottom:
                self.state = ExerciseState.SQUATTING
                self.current_rep_data = {"rep_number": self.rep_count + 1, "peak_angle": avg_angle, "form_score": 100, "errors": []}
        elif self.state == ExerciseState.SQUATTING:
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
            "angles": {"left_knee": round(left_angle, 1), "right_knee": round(right_angle, 1)},
        }

    def _detect_errors(self, frame_data: dict) -> list:
        errors = []
        lean = frame_data.get("torso_lean", 0)
        if lean > self.config["errors"]["forward_lean"]["threshold"]:
            errors.append({"type": "forward_lean", "confidence": 0.80,
                           "penalty": self.config["errors"]["forward_lean"]["penalty"],
                           "message": self.config["errors"]["forward_lean"]["message"]})
        cave = frame_data.get("knee_cave", 0)
        if cave > self.config["errors"]["knees_cave"]["threshold"]:
            errors.append({"type": "knees_cave", "confidence": 0.85,
                           "penalty": self.config["errors"]["knees_cave"]["penalty"],
                           "message": self.config["errors"]["knees_cave"]["message"]})
        return errors

    def detect_exercise(self, frame_data: dict) -> bool:
        avg = (frame_data.get("left_knee", 170) + frame_data.get("right_knee", 170)) / 2
        return 70 < avg < 170
