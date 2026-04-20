import cv2
import mediapipe as mp
import numpy as np
import threading
import time

class FitFlexEngine:
    def __init__(self, exercise_type="bicep_curl"):
        self.exercise_type = exercise_type
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.cap = cv2.VideoCapture(0)
        self.lock = threading.Lock()
        self.running = True
        self.current_frame = None

        # Stats
        self.rep_count = 0
        self.current_angle = 0
        self.form_status = "VALID"
        self.feedback = "Ready to start"
        self._state = "EXTENDED"

        # Threading for frame read
        self.thread = threading.Thread(target=self._update_loop, daemon=True)
        self.thread.start()

    def _calculate_angle(self, a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        if angle > 180.0:
            angle = 360 - angle
        return angle

    def _update_loop(self):
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(0.01)
                continue

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(frame_rgb)

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                # Generic detection - expanding on Bicep Curl as requested
                if self.exercise_type == "bicep_curl":
                    self._process_bicep_curl(landmarks)
                
                self.mp_pose.draw_landmarks(frame, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS)
            else:
                self.form_status = "LOW_CONFIDENCE"
                self.feedback = "Move closer to camera"

            with self.lock:
                self.current_frame = frame
                
            time.sleep(0.03) # Cap to ~30 FPS

    def _process_bicep_curl(self, landmarks):
        shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].y]

        angle = self._calculate_angle(shoulder, elbow, wrist)
        self.current_angle = angle

        # State machine
        if angle > 160:
            self._state = "EXTENDED"
        if angle < 30 and self._state == "EXTENDED":
            self._state = "FLEXED"
            self.rep_count += 1
            self.form_status = "VALID"
            self.feedback = "Good push!"

        # Form check (e.g. elbow drift)
        hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y]
        elbow_drift = abs(elbow[0] - shoulder[0])
        if elbow_drift > 0.15:
            self.form_status = "WARNING"
            self.feedback = "Keep elbows locked to your side"

    def get_frame(self):
        with self.lock:
            if self.current_frame is not None:
                ret, buffer = cv2.imencode('.jpg', self.current_frame)
                return buffer.tobytes()
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
        self.cap.release()
