/**
 * Workout history hook — backed by the FastAPI + Replit Postgres `sessions`
 * table (single source of truth as of Phase 4). LocalStorage is no longer
 * used; sessions are scoped to the authenticated user via JWT.
 */

import { useState, useEffect, useCallback } from 'react';
import { listSessions, SessionRecord } from '../lib/api';

export interface WorkoutHistorySession {
  id: string;
  date: string;
  exercise: string;
  reps: number;
  accuracy: number;
  durationSeconds: number;
}

function toDisplay(s: SessionRecord): WorkoutHistorySession {
  return {
    id: s.id,
    date: s.created_at,
    exercise: s.exercise,
    reps: s.total_reps,
    accuracy: Math.round(s.avg_form_score),
    durationSeconds: s.duration_seconds,
  };
}

export function useWorkoutHistory() {
  const [history, setHistory] = useState<WorkoutHistorySession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listSessions();
      setHistory(rows.map(toDisplay));
    } catch (e: any) {
      console.error('Failed to load workout history', e);
      setError(e?.message ?? 'Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Expose a way to manually trigger a refresh, or auto-refresh when
  // navigating.

  const getLast7Days = useCallback(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return history.filter((s) => new Date(s.date).getTime() >= cutoff);
  }, [history]);

  return {
    history,
    loading,
    error,
    refresh,
    getLast7Days,
  };
}
