import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateWorkout, setConnected, setSessionSummary } from '../store/workoutSlice';
import { WorkoutPayload, SessionSummary } from '../types/workout';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export function useWebSocket(userId: string, token: string) {
  const dispatch = useDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!userId || !token || !mountedRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws/${userId}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      dispatch(setConnected(true));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'session_summary') {
          dispatch(setSessionSummary(data as SessionSummary));
        } else {
          dispatch(updateWorkout(data as WorkoutPayload));
        }
      } catch {
      }
    };

    ws.onerror = () => {
      dispatch(setConnected(false));
    };

    ws.onclose = () => {
      dispatch(setConnected(false));
      if (mountedRef.current && retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        setTimeout(connect, RETRY_DELAY_MS);
      }
    };
  }, [userId, token, dispatch]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
