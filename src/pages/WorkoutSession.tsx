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
  const { repCount, currentExercise, errors, angles, sessionStatus, holdDuration, formScore } = useSelector(
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

            {/* Form Score Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-800 z-10">
              <div
                className="h-full bg-green-400 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, formScore))}%`, backgroundColor: formScore >= 76 ? '#4ade80' : formScore >= 51 ? '#facc15' : '#f87171' }}
              />
            </div>

            {/* Fading Coach Cue Overlay */}
            <div
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
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
