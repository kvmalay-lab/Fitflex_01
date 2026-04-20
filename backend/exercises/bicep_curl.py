"""
Bicep Curl — FSM rep counting and form validation.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from .base import Exercise, ExerciseState
from one_euro_filter import OneEuroFilter
import config


class BicepCurl(Exercise):
    def __init__(self):
        super().__init__("bicep_curl", config.BICEP_CURL)
        self.left_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                         beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.right_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                          beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.hysteresis_top = 170
        self.hysteresis_bottom = 85

    def process_frame(self, frame_data: dict, image_width: int = 1, image_height: int = 1):
        left_angle = self.left_filter.filter(frame_data.get("left_elbow", 160.0))
        right_angle = self.right_filter.filter(frame_data.get("right_elbow", 160.0))
        avg_angle = (left_angle + right_angle) / 2

        if self.state == ExerciseState.READY:
            if avg_angle < self.hysteresis_bottom:
                self.state = ExerciseState.CURLING
                self.current_rep_data = {"rep_number": self.rep_count + 1, "peak_angle": avg_angle,
                                          "form_score": 100, "errors": []}
        elif self.state == ExerciseState.CURLING:
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
            "angles": {"left_elbow": round(left_angle, 1), "right_elbow": round(right_angle, 1), "avg_elbow": round(avg_angle, 1)},
        }

    def _detect_errors(self, frame_data: dict) -> list:
        errors = []
        lean = frame_data.get("torso_lean", 0)
        if lean > self.config["errors"]["lean_back"]["threshold"]:
            errors.append({"type": "lean_back", "confidence": 0.85,
                           "penalty": self.config["errors"]["lean_back"]["penalty"],
                           "message": self.config["errors"]["lean_back"]["message"]})
        flare = frame_data.get("elbow_flare", 0)
        if flare > self.config["errors"]["elbow_flare"]["threshold"]:
            errors.append({"type": "elbow_flare", "confidence": 0.80,
                           "penalty": self.config["errors"]["elbow_flare"]["penalty"],
                           "message": self.config["errors"]["elbow_flare"]["message"]})
        return errors

    def detect_exercise(self, frame_data: dict) -> bool:
        avg = (frame_data.get("left_elbow", 160) + frame_data.get("right_elbow", 160)) / 2
        return 40 < avg < 170
