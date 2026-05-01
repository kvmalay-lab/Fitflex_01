/**
 * Shared axios client. The base URL respects VITE_API_URL when present so the
 * built bundle can target a non-default backend in production; otherwise it
 * uses an empty base URL and relies on the Vite proxy / same-origin requests.
 */

import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('fitflex_user');
    if (stored) {
      const { token } = JSON.parse(stored) as { token?: string };
      if (token) {
        // AxiosHeaders (axios 1.x) is always present on a created config;
        // cast through unknown to avoid TS strictness on the exact subtype.
        (config.headers as unknown as Record<string, string>)['Authorization'] =
          `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error('[api] Failed to attach auth header', e);
  }
  return config;
});

export interface SessionRecord {
  id: string;
  user_id: string;
  exercise: string;
  total_reps: number;
  avg_form_score: number;
  duration_seconds: number;
  rep_history: Array<{
    rep_number: number;
    peak_angle: number;
    form_score: number;
    errors: Array<{ type: string; message: string; penalty: number }>;
  }>;
  created_at: string;
}

export async function listSessions(): Promise<SessionRecord[]> {
  const { data } = await api.get<SessionRecord[]>('/api/sessions');
  return data;
}

export async function createSession(input: {
  exercise: string;
  total_reps: number;
  avg_form_score: number;
  duration_seconds: number;
  rep_history: SessionRecord['rep_history'];
}): Promise<SessionRecord> {
  const { data } = await api.post<SessionRecord>('/api/sessions', input);
  return data;
}
