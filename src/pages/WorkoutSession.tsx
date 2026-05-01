import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { resetSession, setExercise, saveSession } from '../store/workoutSlice';
import { usePoseTracker } from '../hooks/usePoseTracker';
import { EXERCISE_LIST, EXERCISES } from '../lib/exercises';
import { Stage } from '../lib/RepCounter';
import { unlockAudio, resetAudioCooldown } from '../lib/audioFeedback';
import { User } from '../types/workout';

interface WorkoutSessionProps {
  user: User;
}

export default function WorkoutSession({ user }: WorkoutSessionProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { repCount, currentExercise, errors, angles, formScore, isSaving, saveError } = useSelector(
    (state: RootState) => state.workout
  );

  const [selectedExercise, setSelectedExercise] = useState(currentExercise || 'bicep_curl');
  const [sessionActive, setSessionActive] = useState(false);
  const [coachCue, setCoachCue] = useState('');
  const [cueType, setCueType] = useState<'normal' | 'error'>('normal');
  const [repFlash, setRepFlash] = useState(false);
  const [stage, setStage] = useState<Stage>('UP');
  const flashTimerRef = useRef<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tracker = usePoseTracker({
    exerciseId: selectedExercise,
    active: sessionActive,
    videoRef,
    canvasRef,
    onRepConfirmed: () => {
      setRepFlash(true);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = window.setTimeout(() => setRepFlash(false), 600);
    },
    onStageChange: (s) => setStage(s),
  });

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const displayReps = repCount;

  // Handle Coach Cue logic
  useEffect(() => {
    if (!sessionActive) {
      setCoachCue('Ready to start?');
      setCueType('normal');
      return;
    }

    if (!tracker.personDetected && tracker.status === 'running') {
      setCoachCue('Step into the frame');
      setCueType('error');
      return;
    }

    const recentErrors = errors.filter((e) => e.penalty > 0);
    if (recentErrors.length > 0) {
      setCoachCue(recentErrors[0].message);
      setCueType('error');
    } else {
      const def = EXERCISES[selectedExercise];
      if (def) {
        // Dynamic cue: when the user is moving toward the UP threshold show
        // the startCue ("come up"), when moving toward the DOWN threshold
        // show the endCue ("go down/curl/pull").
        setCoachCue(stage === 'DOWN' ? def.cues.startCue : def.cues.endCue);
        setCueType('normal');
      }
    }
  }, [sessionActive, errors, selectedExercise, tracker.personDetected, tracker.status, stage]);

  const startSession = async () => {
    unlockAudio();
    resetAudioCooldown();
    dispatch(resetSession());
    dispatch(setExercise(selectedExercise));
    setSessionActive(true);
    await tracker.start();
  };

  const stopSession = async () => {
    setSessionActive(false);
    tracker.stop();

    const repsHistory = tracker.getRepHistory();
    // Fall back to Redux repCount in case the ref and the state diverged.
    const totalReps = repsHistory.length > 0 ? repsHistory.length : repCount;
    const avgForm =
      repsHistory.length > 0
        ? repsHistory.reduce((sum, r) => sum + r.form_score, 0) / repsHistory.length
        : formScore;

    const duration = tracker.getDurationSeconds();

    // Always navigate to /history after ending — whether or not a save occurs —
    // so the user can see their previous sessions.
    if (totalReps === 0 && duration < 5) {
      // Session too short / no reps detected, nothing worth saving.
      navigate('/history');
      return;
    }

    await dispatch(
      saveSession({
        exercise: selectedExercise,
        total_reps: totalReps,
        avg_form_score: avgForm,
        duration_seconds: duration,
        rep_history: repsHistory,
      })
    );

    // Navigate to history regardless of save success/failure so the user can
    // see all their prior sessions. saveError is shown in the HUD if it failed.
    navigate('/history');
  };

  const statusText = (() => {
    switch (tracker.status) {
      case 'idle':
      case 'loading_model': return 'Loading AI model...';
      case 'requesting_camera': return 'Starting camera...';
      case 'ready': return 'Ready';
      case 'running': return tracker.personDetected ? 'Tracking' : 'Waiting for person';
      case 'error': return tracker.errorMsg ?? 'Error';
    }
  })();

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workout Session</h1>
          {!sessionActive && <p className="text-slate-400">Select an exercise and click Start Workout.</p>}
        </div>

        {!sessionActive ? (
          <div className="flex items-center gap-4">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-slate-800 text-white rounded-xl px-4 py-2 border border-slate-700 outline-none focus:border-emerald-500"
            >
              {EXERCISE_LIST.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <button
              onClick={startSession}
              disabled={tracker.status === 'loading_model' || tracker.status === 'error'}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Start Workout
            </button>
          </div>
        ) : (
          <button
            onClick={stopSession}
            disabled={isSaving}
            className="bg-red-500 hover:bg-red-400 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'End Session'}
          </button>
        )}
      </div>

      {/* Form score bar (live) */}
      {sessionActive && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-widest font-bold text-slate-400">
              Form Score
            </span>
            <span className="text-sm font-bold tabular-nums text-white">{formScore}</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                formScore > 80
                  ? 'bg-emerald-500'
                  : formScore >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, formScore))}%` }}
            />
          </div>
          {selectedExercise === 'lat_pulldown' && (
            <LatPulldownDepthIndicator angle={angles?.primary} />
          )}
          {saveError && (
            <p className="mt-2 text-sm text-red-400">{saveError}</p>
          )}
        </div>
      )}

      {/* HUD Camera Feed (h-[72vh] w-full) */}
      <div className="relative w-full h-[72vh] bg-black rounded-lg overflow-hidden flex items-center justify-center mb-2">
        {!sessionActive ? (
          <div className="text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin mb-4" />
            <p>{statusText}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
              onLoadedMetadata={(e) => {
                if (canvasRef.current && videoRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                }
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Rep Confirmed Flash */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-20 ${
                repFlash ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 ring-4 ring-emerald-400 rounded-lg shadow-[0_0_60px_rgba(16,185,129,0.6)_inset]" />
              <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-4 py-2 rounded-xl font-black uppercase tracking-wider text-sm">
                Rep Confirmed
              </div>
            </div>

            {/* Fading Coach Cue Overlay */}
            <div
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300 z-20 ${
                coachCue ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className={`px-6 py-3 rounded-full backdrop-blur-sm ${
                  cueType === 'error'
                    ? 'bg-red-500/80 text-white'
                    : 'bg-black/60 text-white'
                }`}
              >
                <p className="text-lg font-medium">{coachCue}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Horizontal Metric Strip */}
      <div className="flex justify-between items-center px-6 py-2 bg-slate-900/50 rounded-lg h-[50px] shrink-0">
        <div className="flex gap-2 items-baseline">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">REPS:</span>
          <span className="text-xl font-black text-white tabular-nums">{displayReps}</span>
        </div>
        <div className="flex gap-2 items-baseline">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">CUE:</span>
          <span className={`text-sm font-bold uppercase ${cueType === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
            {coachCue || 'Good Form'}
          </span>
        </div>
        <div className="flex gap-2 items-baseline">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">ANGLE:</span>
          <span className="text-xl font-black text-white tabular-nums">
            {angles?.primary ? Math.round(angles.primary) : '--'}°
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Lat Pulldown depth indicator. Maps the live elbow angle to a horizontal bar
 * showing how close the wrist line is to the chest target zone (45–60°
 * contraction window). Green when in range, yellow when approaching, red
 * when far from depth.
 */
function LatPulldownDepthIndicator({ angle }: { angle?: number }) {
  if (angle == null) return null;
  // The bar maps angle 160 (arms up, no pull) → 0% depth, angle 45 (full pull) → 100%.
  const max = 160;
  const target = 45;
  const range = max - target;
  const depthPct = Math.max(0, Math.min(100, ((max - angle) / range) * 100));
  const inTarget = angle >= 45 && angle <= 60;
  const close = angle > 60 && angle <= 90;
  const color = inTarget ? 'bg-emerald-500' : close ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-widest font-bold text-slate-400">
          Pull Depth
        </span>
        <span className="text-xs font-bold text-slate-300">
          {inTarget ? 'In Target Zone' : close ? 'Almost There' : 'Pull Lower'}
        </span>
      </div>
      <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${color}`}
          style={{ width: `${depthPct}%` }}
        />
        {/* target zone marker: 45-60deg → 100%–~87% on bar */}
        <div
          className="absolute top-0 h-full border-l border-r border-emerald-300/70"
          style={{
            left: `${((max - 60) / range) * 100}%`,
            width: `${((60 - 45) / range) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
