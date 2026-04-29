import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { User } from '../types/workout';
import NavBar from '../components/NavBar';
import FormGauge from '../components/FormGauge';
import RepCounter from '../components/RepCounter';
import ErrorAlert from '../components/ErrorAlert';
import ExerciseLabel from '../components/ExerciseLabel';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetSession, setExercise, setSessionSummary } from '../store/workoutSlice';
import { EXERCISE_LIST } from '../lib/exercises';
import { usePoseTracker } from '../hooks/usePoseTracker';
import { SessionSummary, RepData, TopError } from '../types/workout';

const EXERCISE_NAMES: Record<string, string> = {
  bicep_curl: 'Bicep Curl', lat_pulldown: 'Lat Pulldown', squat: 'Squat',
  shoulder_press: 'Shoulder Press', deadlift: 'Deadlift', plank: 'Plank',
};

function fmtRelative(iso: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((Date.now() - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props { user: User; onLogout: () => void; }

function buildSummary(
  exercise: string,
  userId: string,
  reps: RepData[],
  durationSeconds: number,
  holdDuration: number
): SessionSummary {
  const total = reps.length;
  const avg = total > 0 ? Math.round(reps.reduce((s, r) => s + r.form_score, 0) / total) : 0;
  let best: RepData | null = null;
  let worst: RepData | null = null;
  for (const r of reps) {
    if (!best || r.form_score > best.form_score) best = r;
    if (!worst || r.form_score < worst.form_score) worst = r;
  }
  const errCounts: Record<string, number> = {};
  let errTotal = 0;
  for (const r of reps) {
    for (const e of r.errors) {
      errCounts[e.type] = (errCounts[e.type] || 0) + 1;
      errTotal += 1;
    }
  }
  const top_errors: TopError[] = Object.entries(errCounts)
    .map(([type, count]) => ({ type, count, frequency: errTotal ? count / errTotal : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    type: 'session_summary',
    session_id: crypto.randomUUID(),
    user_id: userId,
    exercise,
    total_reps: exercise === 'plank' ? Math.floor(holdDuration) : total,
    avg_form_score: avg,
    best_rep: best,
    worst_rep: worst,
    top_errors,
    duration_seconds: durationSeconds,
    timestamp: Date.now(),
    rep_history: reps,
  };
}

interface HistoryItem {
  session_id: string;
  exercise: string;
  total_reps: number;
  avg_form_score: number;
  duration_seconds: number;
  created_at: string | null;
}

export default function LiveDashboard({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { repCount, formScore, errors, repHistory, sessionStatus, currentExercise, holdDuration, currentRepStage } =
    useSelector((s: RootState) => s.workout);

  const [selectedExercise, setSelectedExercise] = useState(currentExercise || 'bicep_curl');
  const [sessionActive, setSessionActive] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [lastSavedReps, setLastSavedReps] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tracker = usePoseTracker({
    exerciseId: selectedExercise,
    active: sessionActive,
    videoRef,
    canvasRef,
  });

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const r = await fetch(`${apiUrl}/sessions/${user.user_id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await r.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!sessionActive) loadHistory();
  }, [sessionActive, loadHistory]);

  const startSession = async () => {
    dispatch(resetSession());
    dispatch(setExercise(selectedExercise));
    setLastSavedReps(null);
    setSessionActive(true);
    await tracker.start();
  };

  const stopSession = async () => {
    setSessionActive(false);
    const reps = tracker.getRepHistory();
    const duration = tracker.getDurationSeconds();
    const hold = tracker.getHoldDuration();
    tracker.stop();
    const summary = buildSummary(selectedExercise, user.user_id, reps, duration, hold);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await fetch(`${apiUrl}/session/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(summary),
      });
    } catch {}

    dispatch(setSessionSummary(summary));
    setLastSavedReps(summary.total_reps);
    loadHistory();
  };

  const isPlank = selectedExercise === 'plank';
  const recentErrors = errors.filter((e) => e.penalty > 0).slice(0, 4);

  const statusText = (() => {
    switch (tracker.status) {
      case 'idle':
      case 'loading_model': return 'Loading AI model…';
      case 'requesting_camera': return 'Starting camera…';
      case 'ready': return 'Ready';
      case 'running': return tracker.personDetected ? 'Tracking' : 'Step into the frame';
      case 'error': return tracker.errorMsg ?? 'Error';
    }
  })();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <NavBar title="FitFlex" userName={user.name} onLogout={onLogout} />

      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {!sessionActive ? (
          <div className="flex flex-col gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-4">Choose Exercise</h2>
              <div className="grid grid-cols-2 gap-2">
                {EXERCISE_LIST.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExercise(ex.id)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all duration-200
                      ${selectedExercise === ex.id
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  tracker.status === 'ready' || tracker.status === 'running'
                    ? 'bg-emerald-500 animate-pulse'
                    : tracker.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-slate-500 text-xs">{statusText}</span>
            </div>

            <button
              onClick={startSession}
              disabled={tracker.status === 'loading_model' || tracker.status === 'error'}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-emerald-500 hover:bg-emerald-400
                disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]
                shadow-lg shadow-emerald-500/25"
            >
              {tracker.status === 'loading_model' ? 'Loading model…' : 'Start Workout'}
            </button>

            {tracker.errorMsg && (
              <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-200 text-sm">
                {tracker.errorMsg}
              </div>
            )}

            {lastSavedReps !== null && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Saved</p>
                <p className="text-white text-sm mt-1">
                  Last workout: <span className="font-bold">{lastSavedReps} {isPlank ? 'sec' : 'reps'}</span>
                </p>
                <button
                  onClick={() => navigate('/summary')}
                  className="mt-2 text-emerald-400 text-xs font-semibold hover:underline"
                >
                  View full summary →
                </button>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold text-sm">Recent Workouts</h2>
                {history.length > 0 && (
                  <button
                    onClick={() => navigate('/progress')}
                    className="text-emerald-400 text-xs font-semibold hover:underline"
                  >
                    See all →
                  </button>
                )}
              </div>
              {historyLoading ? (
                <p className="text-slate-600 text-xs text-center py-4">Loading…</p>
              ) : history.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-4">
                  No workouts yet. Start one above to begin your history.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {history.slice(0, 5).map((h) => (
                    <div
                      key={h.session_id}
                      className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-semibold">
                          {EXERCISE_NAMES[h.exercise] || h.exercise}
                        </span>
                        <span className="text-slate-500 text-xs">{fmtRelative(h.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-white text-sm font-bold tabular-nums">
                            {h.total_reps}
                            <span className="text-slate-500 text-xs font-normal ml-1">
                              {h.exercise === 'plank' ? 'sec' : 'reps'}
                            </span>
                          </div>
                          <div className="text-slate-500 text-xs">
                            {Math.round(h.avg_form_score || 0)} form
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-slate-600 text-xs text-center">
              Allow camera access when prompted. Pose data stays in your browser.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <ExerciseLabel exercise={selectedExercise} status={sessionStatus} />
              <span className="text-slate-500 text-xs">
                {tracker.personDetected ? 'Tracking' : 'No person detected'}
              </span>
            </div>

            <div className="relative bg-black border border-slate-800 rounded-2xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
                {statusText}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
              <RepCounter
                count={repCount}
                stage={currentRepStage}
                formScore={formScore}
                isPlank={isPlank}
                holdDuration={holdDuration}
              />
            </div>

            <div className="flex gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col items-center">
                <FormGauge score={formScore} size="medium" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Last Reps</p>
                {repHistory.length === 0 ? (
                  <p className="text-slate-600 text-xs">No reps yet</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {repHistory.slice(-5).reverse().map((r) => (
                      <div key={r.rep_number} className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">Rep {r.rep_number}</span>
                        <span
                          className={`text-xs font-bold ${
                            r.form_score >= 76 ? 'text-emerald-400' : r.form_score >= 51 ? 'text-yellow-400' : 'text-red-400'
                          }`}
                        >
                          {r.form_score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {recentErrors.length > 0 && (
              <div className="flex flex-col gap-2">
                {recentErrors.map((e, i) => (
                  <ErrorAlert key={e.type} error={e} index={i} />
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/rep-breakdown')}
                className="flex-1 py-3 rounded-xl text-slate-300 text-sm font-semibold bg-slate-800 hover:bg-slate-700 transition-all"
              >
                Breakdown
              </button>
              <button
                onClick={stopSession}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold bg-red-500/80 hover:bg-red-500 transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
