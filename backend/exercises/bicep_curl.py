"""
Bicep Curl — FSM rep counting and form validation.

Logic adapted from production FitFlex Python trainer:
- Independent left/right arm counters
- 5-frame confirmation prevents jitter at threshold boundaries
- Up threshold (arm extended): >165°
- Down threshold (arm curled):  <65°
- One-Euro filter for sub-frame smoothing on top of confirmation gating
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from .base import Exercise, ExerciseState
from one_euro_filter import OneEuroFilter
import config


CONFIRM_FRAMES = 5
ANGLE_UP = 165
ANGLE_DOWN = 65


class BicepCurl(Exercise):
    def __init__(self):
        super().__init__("bicep_curl", config.BICEP_CURL)
        self.left_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                         beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)
        self.right_filter = OneEuroFilter(freq=config.ONE_EURO_FREQ, mincutoff=config.ONE_EURO_MINCUTOFF,
                                          beta=config.ONE_EURO_BETA, dcutoff=config.ONE_EURO_DCUTOFF)

        self.right_counter = 0
        self.left_counter = 0
        self.stage_r = None
        self.stage_l = None
        self.up_frames_r = 0
        self.down_frames_r = 0
        self.up_frames_l = 0
        self.down_frames_l = 0

    def process_frame(self, frame_data: dict, image_width: int = 1, image_height: int = 1):
        left_angle = self.left_filter.filter(frame_data.get("left_elbow", 160.0))
        right_angle = self.right_filter.filter(frame_data.get("right_elbow", 160.0))

        rep_completed_this_frame = False
        completing_arm = None
        completing_angle = None

        # ---- Right arm FSM ----
        if right_angle > ANGLE_UP:
            self.up_frames_r += 1
            self.down_frames_r = 0
            if self.up_frames_r >= CONFIRM_FRAMES:
                self.stage_r = "up"
        elif right_angle < ANGLE_DOWN:
            self.down_frames_r += 1
            self.up_frames_r = 0
            if self.down_frames_r >= CONFIRM_FRAMES and self.stage_r == "up":
                self.stage_r = "down"
                self.right_counter += 1
                rep_completed_this_frame = True
                completing_arm = "right"
                completing_angle = right_angle

        # ---- Left arm FSM ----
        if left_angle > ANGLE_UP:
            self.up_frames_l += 1
            self.down_frames_l = 0
            if self.up_frames_l >= CONFIRM_FRAMES:
                self.stage_l = "up"
        elif left_angle < ANGLE_DOWN:
            self.down_frames_l += 1
            self.up_frames_l = 0
            if self.down_frames_l >= CONFIRM_FRAMES and self.stage_l == "up":
                self.stage_l = "down"
                self.left_counter += 1
                if not rep_completed_this_frame:
                    rep_completed_this_frame = True
                    completing_arm = "left"
                    completing_angle = left_angle

        total_reps = self.right_counter + self.left_counter
        self.rep_count = total_reps

        # State for UI: prefer the stage of whichever arm is most recently active
        if self.stage_r == "down" or self.stage_l == "down":
            self.state = ExerciseState.READY
        elif self.stage_r == "up" or self.stage_l == "up":
            self.state = ExerciseState.CURLING

        # Form scoring per completed rep
        if rep_completed_this_frame:
            errors = self._detect_errors(frame_data)
            form_score = self._calculate_form_score(errors)
            self.current_rep_data = {
                "rep_number": total_reps,
                "arm": completing_arm,
                "peak_angle": round(completing_angle, 1),
                "form_score": form_score,
                "errors": errors,
            }
            self.rep_history.append(self.current_rep_data.copy())

        live_errors = self._detect_errors(frame_data)
        live_score = self._calculate_form_score(live_errors)

        return {
            "rep_count": total_reps,
            "right_reps": self.right_counter,
            "left_reps": self.left_counter,
            "state": self.state.value,
            "stage_right": self.stage_r,
            "stage_left": self.stage_l,
            "current_rep": self.current_rep_data,
            "form_score": live_score,
            "errors": live_errors,
            "angles": {
                "left_elbow": round(left_angle, 1),
                "right_elbow": round(right_angle, 1),
            },
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
