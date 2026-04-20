"""
Plank — Time-based hold detection and form validation.
"""

import sys, os, time
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from .base import Exercise, ExerciseState
import config


class Plank(Exercise):
    def __init__(self):
        super().__init__("plank", config.PLANK)
        self.hold_start_time = None
        self.hold_duration = 0.0
        self.is_holding = False

    def process_frame(self, frame_data: dict, image_width: int = 1, image_height: int = 1):
        in_position = frame_data.get("in_plank_position", True)

        if in_position and not self.is_holding:
            self.is_holding = True
            self.hold_start_time = time.time()
            self.state = ExerciseState.HOLD
        elif in_position and self.is_holding:
            self.hold_duration = time.time() - self.hold_start_time
        elif not in_position and self.is_holding:
            self.is_holding = False
            if self.hold_duration >= self.config["hold_duration_min"]:
                self.rep_count += 1
                self.rep_history.append({
                    "rep_number": self.rep_count,
                    "peak_angle": 0,
                    "form_score": self._calculate_form_score(self._detect_errors(frame_data)),
                    "hold_duration": round(self.hold_duration, 1),
                    "errors": [],
                })
            self.hold_duration = 0.0
            self.state = ExerciseState.READY

        errors = self._detect_errors(frame_data)
        form_score = self._calculate_form_score(errors)
        return {
            "rep_count": self.rep_count,
            "hold_duration": round(self.hold_duration, 1),
            "state": self.state.value,
            "current_rep": self.current_rep_data,
            "form_score": form_score,
            "errors": errors,
            "angles": {},
        }

    def _detect_errors(self, frame_data: dict) -> list:
        errors = []
        hip_sag = frame_data.get("hip_sag", 0)
        if hip_sag > self.config["errors"]["hip_sag"]["threshold"]:
            errors.append({"type": "hip_sag", "confidence": 0.85,
                           "penalty": self.config["errors"]["hip_sag"]["penalty"],
                           "message": self.config["errors"]["hip_sag"]["message"]})
        return errors

    def detect_exercise(self, frame_data: dict) -> bool:
        return frame_data.get("in_plank_position", False)

    def get_summary(self):
        summary = super().get_summary()
        summary["hold_duration"] = round(self.hold_duration, 1)
        return summary
