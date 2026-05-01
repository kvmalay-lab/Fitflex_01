import React, { useEffect } from 'react';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { EXERCISES } from '../lib/exercises';

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function History() {
  const { history, loading, error, refresh } = useWorkoutHistory();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workout History</h1>
          <p className="text-slate-400">Review your past performance and sessions.</p>
        </div>
        <button
          onClick={() => refresh()}
          className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold"
        >
          Refresh
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col">
        {loading ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-emerald-500 animate-spin mb-3" />
            <p>Loading history…</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">
            <p className="mb-2 font-semibold">Couldn't load history</p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="mb-2">No history found.</p>
            <p className="text-sm">Head over to the Workout tab to start a session.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="py-4 px-4 font-semibold">Date</th>
                  <th className="py-4 px-4 font-semibold">Exercise</th>
                  <th className="py-4 px-4 font-semibold text-right">Reps</th>
                  <th className="py-4 px-4 font-semibold text-right hidden sm:table-cell">
                    Duration
                  </th>
                  <th className="py-4 px-4 font-semibold text-right">Form Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-white">
                {history.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4 text-sm text-slate-300">
                      {new Date(session.date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {EXERCISES[session.exercise]?.name || session.exercise}
                    </td>
                    <td className="py-4 px-4 text-right font-bold tabular-nums">
                      {session.reps}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-400 tabular-nums hidden sm:table-cell">
                      {formatDuration(session.durationSeconds)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          session.accuracy > 80
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : session.accuracy >= 50
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {session.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
