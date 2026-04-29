import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { User } from '../types/workout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

const EXERCISE_NAMES: Record<string, string> = {
  bicep_curl: 'Bicep Curl', lat_pulldown: 'Lat Pulldown', squat: 'Squat',
  shoulder_press: 'Shoulder Press', deadlift: 'Deadlift', plank: 'Plank',
};

function scoreColor(s: number) { return s >= 76 ? '#22c55e' : s >= 51 ? '#eab308' : '#ef4444'; }
function fmtDate(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props { user: User; }

export default function Progress({ user }: Props) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiUrl}/sessions/${user.user_id}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json())
      .then(data => { setSessions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.exercise === filter);
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const exercises = [...new Set(sessions.map(s => s.exercise))];

  const chartData = [...filtered].reverse().map((s, i) => ({
    i: i + 1,
    score: Math.round(s.avg_form_score || 0),
    reps: s.total_reps || 0,
  }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fitflex-sessions.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <NavBar title="Progress" onBack={() => navigate('/dashboard')} backLabel="Dashboard" />

      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="text-slate-500">Loading...</div></div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <p className="text-lg font-semibold">No sessions yet</p>
            <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm">
              Start First Workout
            </button>
          </div>
        ) : (
          <>
            {chartData.length > 1 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Form Score Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <XAxis dataKey="i" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }} cursor={{ stroke: '#334155' }} />
                    <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
                <button onClick={() => { setFilter('all'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${filter === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  All
                </button>
                {exercises.map(ex => (
                  <button key={ex} onClick={() => { setFilter(ex); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${filter === ex ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {EXERCISE_NAMES[ex] || ex}
                  </button>
                ))}
              </div>
              <button onClick={exportData} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0">
                <Download size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {paginated.map(s => (
                <div key={s.session_id}
                     className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-slate-700 transition-all"
                     onClick={() => setExpanded(expanded === s.session_id ? null : s.session_id)}>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-white text-sm font-semibold">{EXERCISE_NAMES[s.exercise] || s.exercise}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{fmtDate(s.created_at)} · {s.total_reps} reps</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: scoreColor(s.avg_form_score || 0) }}>
                        {Math.round(s.avg_form_score || 0)}
                      </span>
                      <span className="text-slate-600 text-xs">{expanded === s.session_id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {expanded === s.session_id && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-slate-500 text-xs">Reps</p>
                        <p className="text-white font-bold">{s.total_reps}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Avg Form</p>
                        <p className="font-bold" style={{ color: scoreColor(s.avg_form_score || 0) }}>
                          {Math.round(s.avg_form_score || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Duration</p>
                        <p className="text-white font-bold">
                          {Math.floor((s.duration_seconds || 0) / 60)}m {(s.duration_seconds || 0) % 60}s
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filtered.length > paginated.length && (
              <button onClick={() => setPage(p => p + 1)} className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all">
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
