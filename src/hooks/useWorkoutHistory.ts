import { useState, useEffect, useCallback } from 'react';

export interface WorkoutHistorySession {
  id: string;
  date: string;
  exercise: string;
  reps: number;
  accuracy: number;
  confidence: number;
}

const STORAGE_KEY = 'fitflex_workout_history';

export function useWorkoutHistory() {
  const [history, setHistory] = useState<WorkoutHistorySession[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load workout history from local storage', e);
    }
  }, []);

  const getHistory = useCallback(() => {
    return history;
  }, [history]);

  const getLast7Days = useCallback(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return history.filter((session) => new Date(session.date) >= sevenDaysAgo);
  }, [history]);

  const addSession = useCallback((session: Omit<WorkoutHistorySession, 'id' | 'date'> & { date?: string }) => {
    const newSession: WorkoutHistorySession = {
      ...session,
      id: crypto.randomUUID(),
      date: session.date || new Date().toISOString(),
    };

    setHistory((prev) => {
      const updated = [newSession, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save workout history to local storage', e);
      }
      return updated;
    });

    return newSession;
  }, []);

  return {
    history,
    getHistory,
    getLast7Days,
    addSession,
  };
}
