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
    const totalReps = repsHistory.length;
    const avgForm =
      repsHistory.length > 0
        ? repsHistory.reduce((sum, r) => sum + r.form_score, 0) / repsHistory.length
        : 100;

    if (totalReps === 0) {
      // Nothing to save — go home.
      navigate('/');
      return;
    }

    const result = await dispatch(
      saveSession({
        exercise: selectedExercise,
        total_reps: totalReps,
        avg_form_score: avgForm,
        duration_seconds: tracker.getDurationSeconds(),
        rep_history: repsHistory,
      })
    );

    if (saveSession.fulfilled.match(result)) {
      navigate('/history');
    } else {
      // Stay on the page so the user can retry; saveError is shown in the HUD.
      console.error('Failed to save session:', result.payload);
    }
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

      {/* Top: Video Feed (max-w-4xl centered) */}
      <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-900/50 rounded-3xl border border-slate-800 p-4 mb-6 relative overflow-hidden">
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
          {!sessionActive ? (
            <div className="text-slate-500 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin mb-4" />
              <p>{statusText}</p>
            </div>
          ) : (
            <>
              {/* The "onloadedmetadata" and standard styling ensures object-cover and alignment */}
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
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                  repFlash ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute inset-0 ring-4 ring-emerald-400 rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.6)_inset]" />
                <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-4 py-2 rounded-xl font-black uppercase tracking-wider text-sm">
                  Rep Confirmed
                </div>
              </div>

              {/* Fading Coach Cue Overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                  coachCue ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div
                  className={`px-8 py-4 rounded-3xl backdrop-blur-md border ${
                    cueType === 'error'
                      ? 'bg-red-500/30 border-red-500/50 text-red-200'
                      : 'bg-black/50 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  <p className="text-4xl font-black uppercase tracking-wider">{coachCue}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom: Huge HUD Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 h-48">
        {/* Card 1: Reps */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
          <div className="absolute top-4 left-6">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
              Total Reps
            </p>
          </div>
          <p className="text-9xl font-black text-white tabular-nums tracking-tighter mt-4">
            {displayReps}
          </p>
        </div>

        {/* Card 2: AI Coach */}
        <div
          className={`border rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-colors duration-300 shadow-xl ${
            cueType === 'error'
              ? 'bg-red-950/50 border-red-900 text-red-400'
              : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'
          }`}
        >
          <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-60">Coach Cue</p>
          <p className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            {coachCue || 'Good Form'}
          </p>
        </div>

        {/* Card 3: Angles */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
          <div className="absolute top-4 left-6">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Joint Angle</p>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <p className="text-7xl font-black text-white tabular-nums">
              {angles?.primary ? Math.round(angles.primary) : '--'}
            </p>
            <span className="text-4xl text-slate-500 font-bold">°</span>
          </div>
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
