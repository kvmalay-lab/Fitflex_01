import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { resetSession, setExercise } from '../store/workoutSlice';
import { usePoseTracker } from '../hooks/usePoseTracker';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { EXERCISE_LIST, EXERCISES } from '../lib/exercises';
import { User } from '../types/workout';

interface WorkoutSessionProps {
  user: User;
}

export default function WorkoutSession({ user }: WorkoutSessionProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addSession } = useWorkoutHistory();
  const { repCount, currentExercise, errors, angles, sessionStatus, holdDuration } = useSelector(
    (state: RootState) => state.workout
  );

  const [selectedExercise, setSelectedExercise] = useState(currentExercise || 'bicep_curl');
  const [sessionActive, setSessionActive] = useState(false);
  const [coachCue, setCoachCue] = useState('');
  const [cueType, setCueType] = useState<'normal' | 'error'>('normal');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tracker = usePoseTracker({
    exerciseId: selectedExercise,
    active: sessionActive,
    videoRef,
    canvasRef,
  });

  const isPlank = selectedExercise === 'plank';
  const displayReps = isPlank ? Math.floor(holdDuration) : repCount;

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
        setCoachCue(def.cues.startCue); // Simplified cue logic; ideally driven by rep stage
        setCueType('normal');
      }
    }
  }, [sessionActive, errors, selectedExercise, tracker.personDetected, tracker.status]);

  const startSession = async () => {
    dispatch(resetSession());
    dispatch(setExercise(selectedExercise));
    setSessionActive(true);
    await tracker.start();
  };

  const stopSession = () => {
    setSessionActive(false);
    tracker.stop();

    // Calculate accuracy (avg form score)
    const history = tracker.getRepHistory();
    const totalReps = isPlank ? Math.floor(tracker.getHoldDuration()) : history.length;
    let avgForm = 100;
    if (history.length > 0) {
      avgForm = history.reduce((sum, r) => sum + r.form_score, 0) / history.length;
    }

    // Save session
    addSession({
      exercise: selectedExercise,
      reps: totalReps,
      accuracy: Math.round(avgForm),
      confidence: 100, // Placeholder confidence
    });

    // Redirect to Dashboard
    navigate('/');
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
            className="bg-red-500 hover:bg-red-400 text-white px-6 py-2 rounded-xl font-bold transition-colors"
          >
            End Session
          </button>
        )}
      </div>

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
              Total {isPlank ? 'Seconds' : 'Reps'}
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
