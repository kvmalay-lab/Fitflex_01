import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetSession } from '../store/workoutSlice';
import NavBar from '../components/NavBar';
import FormGauge from '../components/FormGauge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EXERCISE_NAMES: Record<string, string> = {
  bicep_curl: 'Bicep Curl', lat_pulldown: 'Lat Pulldown', squat: 'Squat',
  shoulder_press: 'Shoulder Press', deadlift: 'Deadlift', plank: 'Plank',
};

function scoreColor(s: number) { return s >= 76 ? '#22c55e' : s >= 51 ? '#eab308' : '#ef4444'; }
function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function SessionSummary() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sessionSummary, repHistory, currentExercise } = useSelector((s: RootState) => s.workout);

  const summary = sessionSummary;
  if (!summary) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <NavBar title="Session Summary" onBack={() => navigate('/dashboard')} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 text-lg font-semibold">No session data yet</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl font-semibold">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reps = summary.rep_history || repHistory;
  const chartData = reps.map(r => ({ rep: r.rep_number, score: r.form_score }));

  const suggestions: string[] = [];
  summary.top_errors?.forEach(e => {
    if (e.type === 'lean_back') suggestions.push('Focus on keeping your back straight through the full range of motion.');
    if (e.type === 'elbow_flare') suggestions.push('Keep your elbows tight to your sides during curls.');
    if (e.type === 'knees_cave') suggestions.push('Push your knees outward in line with your toes during squats.');
    if (e.type === 'back_rounding') suggestions.push('Brace your core and keep your spine neutral on deadlifts.');
    if (e.type === 'forward_lean') suggestions.push('Keep your chest upright and core engaged.');
    if (e.type === 'incomplete_range') suggestions.push('Work on achieving full range of motion on each rep.');
    if (e.type === 'hip_sag') suggestions.push('Squeeze your glutes to keep your hips level during planks.');
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <NavBar title="Session Summary" />

      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4 pb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">Workout Complete</p>
          <h2 className="text-white text-2xl font-black">{EXERCISE_NAMES[summary.exercise] || summary.exercise}</h2>
          <p className="text-slate-500 text-sm mt-1">{fmtDuration(summary.duration_seconds || 0)} · {summary.total_reps} reps</p>
        </div>

        <div className="flex gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col items-center">
            <FormGauge score={Math.round(summary.avg_form_score || 0)} size="large" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-2">Avg Form</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col gap-4 justify-center">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Reps</p>
              <p className="text-white text-3xl font-black">{summary.total_reps}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Duration</p>
              <p className="text-white text-xl font-bold">{fmtDuration(summary.duration_seconds || 0)}</p>
            </div>
          </div>
        </div>

        {summary.best_rep && summary.worst_rep && (
          <div className="flex gap-3">
            <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 flex-1">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Best Rep</p>
              <p className="text-white font-black text-xl">Rep {summary.best_rep.rep_number}</p>
              <p className="text-emerald-400 text-sm font-bold">{summary.best_rep.form_score} pts</p>
            </div>
            <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-4 flex-1">
              <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Worst Rep</p>
              <p className="text-white font-black text-xl">Rep {summary.worst_rep.rep_number}</p>
              <p className="text-red-400 text-sm font-bold">{summary.worst_rep.form_score} pts</p>
            </div>
          </div>
        )}

        {summary.top_errors?.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Most Common Errors</p>
            <div className="flex flex-col gap-2">
              {summary.top_errors.map(e => (
                <div key={e.type} className="flex items-center gap-3">
                  <span className="text-slate-300 text-sm flex-1">{e.type.replace(/_/g, ' ')}</span>
                  <span className="text-slate-500 text-xs">{e.count}× ({Math.round(e.frequency * 100)}%)</span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${e.frequency * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {chartData.length > 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Form Score Trend</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="rep" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                  {chartData.map(entry => <Cell key={entry.rep} fill={scoreColor(entry.score)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">Tips for Next Time</p>
            <ul className="space-y-2">
              {suggestions.slice(0, 3).map((s, i) => (
                <li key={i} className="flex gap-2 text-slate-300 text-sm">
                  <span className="text-emerald-500 shrink-0">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/progress')}
            className="w-full py-3.5 rounded-xl font-semibold text-slate-300 text-sm bg-slate-800 hover:bg-slate-700 transition-all">
            View History
          </button>
          <button onClick={() => { dispatch(resetSession()); navigate('/dashboard'); }}
            className="w-full py-3.5 rounded-xl font-bold text-white text-base bg-emerald-500 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
            New Workout
          </button>
        </div>
      </div>
    </div>
  );
}
