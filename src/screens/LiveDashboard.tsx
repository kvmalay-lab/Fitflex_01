import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { User } from '../types/workout';
import NavBar from '../components/NavBar';
import FormGauge from '../components/FormGauge';
import RepCounter from '../components/RepCounter';
import ErrorAlert from '../components/ErrorAlert';
import ExerciseLabel from '../components/ExerciseLabel';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetSession, setExercise } from '../store/workoutSlice';

const EXERCISE_OPTIONS = [
  { id: 'bicep_curl', name: 'Bicep Curl' },
  { id: 'lat_pulldown', name: 'Lat Pulldown' },
  { id: 'squat', name: 'Squat' },
  { id: 'shoulder_press', name: 'Shoulder Press' },
  { id: 'deadlift', name: 'Deadlift' },
  { id: 'plank', name: 'Plank' },
];

interface Props { user: User; onLogout: () => void; }

export default function LiveDashboard({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { send } = useWebSocket(user.user_id, user.token);
  const { repCount, formScore, errors, repHistory, sessionStatus, currentExercise, isConnected, holdDuration, currentRepStage, sessionSummary } = useSelector((s: RootState) => s.workout);

  const [selectedExercise, setSelectedExercise] = useState(currentExercise || 'bicep_curl');
  const [sessionActive, setSessionActive] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (sessionSummary && sessionActive) {
      setSessionActive(false);
      navigate('/summary');
    }
  }, [sessionSummary]);

  const startSession = async () => {
    setStarting(true);
    try {
      await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ exercise_type: selectedExercise }),
      });
      dispatch(resetSession());
      dispatch(setExercise(selectedExercise));
      setSessionActive(true);
    } catch {
    } finally {
      setStarting(false);
    }
  };

  const stopSession = () => {
    send({ action: 'stop' });
    setSessionActive(false);
  };

  const isPlank = selectedExercise === 'plank';
  const recentErrors = errors.filter(e => e.penalty > 0).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <NavBar title="FitFlex" userName={user.name} onLogout={onLogout} />

      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {!sessionActive ? (
          <div className="flex flex-col gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-4">Choose Exercise</h2>
              <div className="grid grid-cols-2 gap-2">
                {EXERCISE_OPTIONS.map(ex => (
                  <button key={ex.id} onClick={() => setSelectedExercise(ex.id)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all duration-200
                      ${selectedExercise === ex.id
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-slate-500 text-xs">{isConnected ? 'Connected to server' : 'Connecting...'}</span>
            </div>

            <button onClick={startSession} disabled={starting || !isConnected}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-emerald-500 hover:bg-emerald-400
                disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]
                shadow-lg shadow-emerald-500/25">
              {starting ? 'Starting...' : 'Start Workout'}
            </button>

            {repHistory.length > 0 && (
              <button onClick={() => navigate('/rep-breakdown')} className="w-full py-3 rounded-xl text-slate-300 text-sm font-semibold bg-slate-800 hover:bg-slate-700 transition-all">
                View Last Session Breakdown →
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <ExerciseLabel exercise={selectedExercise} status={sessionStatus} />
              <span className="text-slate-500 text-xs">{Math.floor((repHistory.length > 0 ? 1 : 0))}s</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
              <RepCounter count={repCount} stage={currentRepStage} formScore={formScore}
                isPlank={isPlank} holdDuration={holdDuration} />
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
                    {repHistory.slice(-5).reverse().map(r => (
                      <div key={r.rep_number} className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">Rep {r.rep_number}</span>
                        <span className={`text-xs font-bold ${r.form_score >= 76 ? 'text-emerald-400' : r.form_score >= 51 ? 'text-yellow-400' : 'text-red-400'}`}>
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
                {recentErrors.map((e, i) => <ErrorAlert key={e.type} error={e} index={i} />)}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => navigate('/rep-breakdown')}
                className="flex-1 py-3 rounded-xl text-slate-300 text-sm font-semibold bg-slate-800 hover:bg-slate-700 transition-all">
                Breakdown
              </button>
              <button onClick={stopSession}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold bg-red-500/80 hover:bg-red-500 transition-all">
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
