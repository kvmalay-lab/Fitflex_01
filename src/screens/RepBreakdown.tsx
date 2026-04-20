import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';

function scoreColor(score: number): string {
  if (score >= 76) return '#22c55e';
  if (score >= 51) return '#eab308';
  return '#ef4444';
}

export default function RepBreakdown() {
  const navigate = useNavigate();
  const { repHistory, currentExercise } = useSelector((s: RootState) => s.workout);
  const [expandedRep, setExpandedRep] = useState<number | null>(null);

  const chartData = repHistory.map(r => ({ rep: r.rep_number, score: r.form_score }));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <NavBar title="Rep Breakdown" onBack={() => navigate('/dashboard')} backLabel="Dashboard" />

      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {repHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-lg font-semibold">No reps recorded yet</p>
            <p className="text-sm mt-1">Start a workout to see your breakdown</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {chartData.length > 1 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Form Score per Rep</p>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="rep" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
                             cursor={{ fill: '#ffffff08' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.rep} fill={scoreColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {[...repHistory].reverse().map(rep => (
                <div key={rep.rep_number}
                     className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-slate-700 transition-all"
                     onClick={() => setExpandedRep(expandedRep === rep.rep_number ? null : rep.rep_number)}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
                        {rep.rep_number}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Rep {rep.rep_number}</p>
                        {rep.peak_angle > 0 && <p className="text-slate-500 text-xs">Peak: {rep.peak_angle.toFixed(1)}°</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: scoreColor(rep.form_score) }}>
                        {rep.form_score}
                      </span>
                      <span className="text-slate-600 text-xs">{expandedRep === rep.rep_number ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {expandedRep === rep.rep_number && rep.errors.length > 0 && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3 flex flex-col gap-2">
                      {rep.errors.map(e => (
                        <div key={e.type} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{e.message}</span>
                          <span className="text-red-400 font-bold">-{e.penalty}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {expandedRep === rep.rep_number && rep.errors.length === 0 && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3">
                      <p className="text-emerald-400 text-xs font-semibold">Perfect form!</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
