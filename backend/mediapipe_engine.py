import numpy as np
import threading
import time

# Note: OpenCV and MediaPipe require a display and physical camera device.
# In the Replit cloud environment neither is available, so the engine runs
# in a software-simulation mode. The frontend will fall back to its built-in
# simulated tracker automatically when no real session is active.

class FitFlexEngine:
    def __init__(self, exercise_type="bicep_curl"):
        self.exercise_type = exercise_type
        self.running = True
        self.lock = threading.Lock()
        self.current_frame = None

        self.rep_count = 0
        self.current_angle = 0.0
        self.form_status = "VALID"
        self.feedback = "Ready to start"
        self._state = "EXTENDED"
        self._angle_dir = 1

        self.thread = threading.Thread(target=self._update_loop, daemon=True)
        self.thread.start()

    def _update_loop(self):
        while self.running:
            self.current_angle += 15 * self._angle_dir
            if self.current_angle >= 180:
                self._angle_dir = -1
                self.current_angle = 180
            if self.current_angle <= 0:
                self._angle_dir = 1
                self.current_angle = 0
                self.rep_count += 1
                self.form_status = "VALID"
                self.feedback = "Good rep!"

            time.sleep(0.03)

    def get_frame(self):
        return None

    def get_stats(self):
        return {
            "rep_count": self.rep_count,
            "current_angle": self.current_angle,
            "form_status": self.form_status,
            "feedback": self.feedback,
            "timestamp": time.time()
        }

    def stop(self):
        self.running = False
