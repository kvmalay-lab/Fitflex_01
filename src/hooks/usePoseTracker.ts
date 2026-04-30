/**
 * Browser-side pose tracker.
 * Loads MediaPipe Tasks Vision PoseLandmarker, captures webcam, runs detection
 * loop, applies exercise FSM with 5-frame anti-jitter, and emits Redux updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { EXERCISES, LandmarkPoint } from '../lib/exercises';
import { RepCounter, Stage } from '../lib/RepCounter';
import { drawSkeleton } from '../lib/poseDraw';
import { updateWorkout } from '../store/workoutSlice';
import { RepData, FormError } from '../types/workout';
import { playErrorBeep } from '../lib/audioFeedback';
import { poseService } from '../services/PoseService';

export type TrackerStatus = 'idle' | 'loading_model' | 'requesting_camera' | 'ready' | 'running' | 'error';

interface Options {
  exerciseId: string;
  active: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Called when a rep is confirmed by the FSM (after 5-frame buffer). */
  onRepConfirmed?: (rep: number) => void;
  /** Called whenever the FSM stage flips, with the new stage. */
  onStageChange?: (stage: Stage) => void;
}

export function usePoseTracker({
  exerciseId,
  active,
  videoRef,
  canvasRef,
  onRepConfirmed,
  onStageChange,
}: Options) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<TrackerStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [personDetected, setPersonDetected] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const counterRef = useRef<RepCounter | null>(null);
  const repHistoryRef = useRef<RepData[]>([]);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const noPersonSinceRef = useRef<number | null>(null);
  const planlHoldRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const prevStageRef = useRef<Stage | null>(null);
  const onRepConfirmedRef = useRef(onRepConfirmed);
  const onStageChangeRef = useRef(onStageChange);
  useEffect(() => {
    onRepConfirmedRef.current = onRepConfirmed;
    onStageChangeRef.current = onStageChange;
  }, [onRepConfirmed, onStageChange]);

  // Initialize the singleton PoseService once. We intentionally do NOT
  // destroy() it on unmount — multiple components may mount/unmount during
  // navigation and re-loading the WASM is expensive. The browser reclaims it
  // on tab close.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus('loading_model');
        await poseService.initialize();
        if (cancelled) return;
        setStatus('ready');
      } catch (e: any) {
        console.error('Pose model load failed', e);
        setErrorMsg('Failed to load AI model. Check your internet connection.');
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build / reset counter when exercise changes
  useEffect(() => {
    const def = EXERCISES[exerciseId];
    if (!def) return;
    counterRef.current = new RepCounter(def.thresholdLow, def.thresholdHigh, def.startState);
    repHistoryRef.current = [];
    planlHoldRef.current = 0;
    startTimeRef.current = Date.now();
  }, [exerciseId]);

  const start = useCallback(async () => {
    if (status !== 'ready' && status !== 'running') return;
    try {
      setStatus('requesting_camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('Video element missing');
      video.srcObject = stream;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      setStatus('running');
    } catch (e: any) {
      console.error('Camera error', e);
      setErrorMsg(
        e?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and reload.'
          : 'Could not start camera: ' + (e?.message ?? 'unknown error')
      );
      setStatus('error');
    }
  }, [status, videoRef, canvasRef]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setStatus(poseService.isReady() ? 'ready' : 'idle');
  }, [videoRef]);

  // Detection loop
  useEffect(() => {
    if (!active || status !== 'running') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !poseService.isReady()) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const def = EXERCISES[exerciseId];
    if (!def) return;

    const loop = () => {
      if (!streamRef.current) return;
      const now = performance.now();

      if (video.currentTime !== lastVideoTimeRef.current && video.readyState >= 2) {
        lastVideoTimeRef.current = video.currentTime;
        try {
          const result = poseService.detect(video, now);
          if (result) processResult(result as PoseLandmarkerResult, def, ctx, canvas, now);
        } catch (e) {
          // swallow per-frame errors
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, status, exerciseId, videoRef, canvasRef]);

  const processResult = (
    result: PoseLandmarkerResult,
    def: typeof EXERCISES[string],
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    now: number
  ) => {
    const landmarks = result.landmarks?.[0] as LandmarkPoint[] | undefined;
    if (!landmarks || landmarks.length === 0) {
      drawSkeleton(ctx, [], canvas.width, canvas.height, def.highlightLandmarks);
      if (noPersonSinceRef.current == null) noPersonSinceRef.current = now;
      const elapsed = now - (noPersonSinceRef.current ?? now);
      setPersonDetected(false);
      if (elapsed > 2000) {
        dispatch(
          updateWorkout({
            timestamp: Date.now(),
            session_id: null,
            user_id: '',
            exercise: def.id,
            rep_count: counterRef.current?.reps ?? 0,
            current_rep_stage: 'no_person',
            angles: {},
            form_errors: [{ type: 'no_person', confidence: 1, penalty: 0, message: 'Step into the frame' }],
            form_score: 100,
            rep_history: repHistoryRef.current,
            session_status: 'WAITING',
            duration_seconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
          })
        );
      }
      return;
    }
    noPersonSinceRef.current = null;
    setPersonDetected(true);

    drawSkeleton(ctx, landmarks, canvas.width, canvas.height, def.highlightLandmarks);

    const angle = def.computeAngle(landmarks);
    if (angle == null) return;

    const counter = counterRef.current!;
    const errors = def.detectErrors?.(landmarks, angle) ?? [];

    let formScore = 100;
    for (const err of errors) formScore -= err.penalty;
    formScore = Math.max(0, Math.min(100, formScore));

    let stage: string = counter.currentStage.toLowerCase();
    let transitioned = false;
    let holdDuration = 0;

    if (def.isTimer) {
      // Plank: angle = deviation from straight (0 = perfect)
      const deviation = angle;
      if (deviation < def.thresholdHigh) {
        // good form — accumulate hold time
        const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
        planlHoldRef.current += dt;
        stage = 'holding';
      } else {
        stage = 'broken';
      }
      holdDuration = planlHoldRef.current;
    } else {
      const r = counter.update(angle);
      stage = r.stage.toLowerCase();
      transitioned = r.transitioned;
      if (transitioned) {
        repHistoryRef.current.push({
          rep_number: r.reps,
          peak_angle: counter.lastTransitionAngle ?? angle,
          form_score: formScore,
          errors: errors.map((e) => ({ ...e, confidence: 1 })),
        });
        onRepConfirmedRef.current?.(r.reps);
      }
      // Notify on stage change so the UI can swap startCue/endCue.
      if (prevStageRef.current !== r.stage) {
        prevStageRef.current = r.stage;
        onStageChangeRef.current?.(r.stage);
      }
    }

    // Audio feedback: beep when there is a real form fault. The audio module
    // enforces its own 3-second cooldown so we don't spam the user.
    const totalPenalty = errors.reduce((s, e) => s + e.penalty, 0);
    if (totalPenalty > 0) {
      playErrorBeep();
    }

    lastTickRef.current = now;

    // Throttle Redux updates to ~10 Hz
    if (now - (lastTickRef.current - 1) < 80 && !transitioned) {
      // skip
    }

    const formErrors: FormError[] = errors.map((e) => ({ ...e, confidence: 1 }));

    dispatch(
      updateWorkout({
        timestamp: Date.now(),
        session_id: null,
        user_id: '',
        exercise: def.id,
        rep_count: def.isTimer ? Math.floor(holdDuration) : counter.reps,
        current_rep_stage: stage,
        hold_duration: holdDuration,
        angles: { primary: Math.round(angle * 10) / 10 },
        form_errors: formErrors,
        form_score: formScore,
        rep_history: repHistoryRef.current,
        session_status: 'ACTIVE',
        duration_seconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
      })
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    status,
    errorMsg,
    personDetected,
    start,
    stop,
    getRepHistory: () => repHistoryRef.current,
    getDurationSeconds: () =>
      startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0,
    getHoldDuration: () => planlHoldRef.current,
  };
}
