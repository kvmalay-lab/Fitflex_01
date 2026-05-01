import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { EXERCISES } from '../lib/exercises';

interface SessionSummaryState {
  exercise: string;
  exerciseName: string;
  total_reps: number;
  avg_form_score: number;
  duration_seconds: number;
  saved: boolean;
  errorMsg?: string;
}

interface LocationState {
  summary?: SessionSummaryState | null;
  skipped?: boolean;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function formScoreColor(score: number) {
  if (score > 80) return { ring: 'ring-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (score >= 50) return { ring: 'ring-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10' };
  return { ring: 'ring-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
}

function formScoreLabel(score: number) {
  if (score > 80) return 'Great form!';
  if (score >= 50) return 'Needs work';
  return 'Poor form';
}

function PostSessionModal({
  summary,
  onClose,
}: {
  summary: SessionSummaryState;
  onClose: () => void;
}) {
  const colors = formScoreColor(summary.avg_form_score);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🏋️</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Session Complete</h2>
          <p className="text-slate-400 text-sm">{summary.exerciseName}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-white tabular-nums">{summary.total_reps}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Reps</p>
          </div>

          <div className={`${colors.bg} rounded-2xl p-4 text-center ring-1 ${colors.ring}/40`}>
            <p className={`text-3xl font-black tabular-nums ${colors.text}`}>
              {summary.avg_form_score}
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Form</p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-white tabular-nums">
              {formatDuration(summary.duration_seconds)}
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Time</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-6 ${
            summary.saved
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-yellow-500/10 border border-yellow-500/20'
          }`}
        >
          <span className="text-lg">{summary.saved ? '✅' : '⚠️'}</span>
          <p className={`text-sm font-semibold ${summary.saved ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {summary.saved
              ? `Saved — ${formScoreLabel(summary.avg_form_score)}`
              : summary.errorMsg
              ? `Save failed: ${summary.errorMsg}`
              : 'Could not save session — check your connection'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const { history, loading, error, refresh } = useWorkoutHistory();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as LocationState | null;
  const [modalSummary, setModalSummary] = useState<SessionSummaryState | null>(
    locationState?.summary ?? null
  );

  // Clear the router state so a back-navigation doesn't re-show the modal.
  useEffect(() => {
    if (locationState?.summary || locationState?.skipped) {
      navigate('/history', { replace: true, state: {} });
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {modalSummary && (
        <PostSessionModal
          summary={modalSummary}
          onClose={() => setModalSummary(null)}
        />
      )}

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
            <p className="mb-2">No history yet.</p>
            <p className="text-sm">Complete a workout to see it here.</p>
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
                {history.map((session) => {
                  const colors = formScoreColor(session.accuracy);
                  return (
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
                          className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} ring-1 ${colors.ring}/30`}
                        >
                          {session.accuracy}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
