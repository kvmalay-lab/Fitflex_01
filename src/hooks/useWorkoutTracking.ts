import { useState, useEffect } from 'react';

export interface WorkoutStats {
  rep_count: number;
  current_angle: number;
  form_status: 'VALID' | 'WARNING' | 'INVALID' | 'LOW_CONFIDENCE';
  feedback: string;
  timestamp: string;
}

export function useWorkoutTracking(exerciseType: string) {
  const [stats, setStats] = useState<WorkoutStats>({
    rep_count: 0,
    current_angle: 0,
    form_status: 'VALID',
    feedback: 'Connecting...',
    timestamp: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    // We simulate the backend connection here so the UI works smoothly
    // even if the user hasn't booted up the Python server yet.
    setIsLoading(true);

    const initSimulation = () => {
      if (!isMounted) return;
      setIsLoading(false);
      setSessionId("sim_session_123");

      // Mock WebSocket stream behavior (30fps)
      let angle = 0;
      let angleDir = 1;
      let reps = 0;

      const interval = setInterval(() => {
         angle += 15 * angleDir;
         if (angle >= 180) { angleDir = -1; angle = 180; }
         if (angle <= 0) { angleDir = 1; angle = 0; reps++; }

         let status: 'VALID' | 'WARNING' | 'INVALID' = 'VALID';
         let feedback = "Good form. Keep it up!";
         
         if (angle > 150 && Math.random() > 0.8) {
           status = 'WARNING';
           feedback = "Keep elbows locked at your side!";
         }
         
         if (!isMounted) return;
         setStats({
           rep_count: reps,
           current_angle: angle,
           form_status: status,
           feedback: feedback,
           timestamp: new Date().toISOString()
         });
      }, 500);

      ws = { close: () => clearInterval(interval) } as any;
    };

    // Attempt real connection, fallback to mock if no backend is running
    fetch(`${BACKEND_URL}/api/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'test_user', exercise_type: exerciseType })
    })
    .then(res => res.json())
    .then(data => {
       if (!isMounted) return;
       setSessionId(data.session_id);
       setIsLoading(false);

       // Setup websocket
       const wsUrl = BACKEND_URL.replace('http', 'ws');
       ws = new WebSocket(`${wsUrl}/ws/session/${data.session_id}`);
       ws.onmessage = (event) => {
         const newStats = JSON.parse(event.data);
         setStats(newStats);
       };
       ws.onerror = () => {
         console.warn('Real WS Failed, falling back to mock stream...');
         initSimulation();
       };
    })
    .catch(err => {
       console.warn('Backend not detected, running simulated tracker...', err);
       initSimulation();
    });

    return () => {
      isMounted = false;
      if (ws) ws.close();
      if (sessionId) {
        fetch(`${BACKEND_URL}/api/session/${sessionId}/stop`, { method: 'POST' }).catch(() => {});
      }
    };
  }, [exerciseType]);

  return { 
    stats, 
    isLoading, 
    error,
    frameUrl: sessionId && !sessionId.startsWith('sim_') ? `${BACKEND_URL}/api/session/${sessionId}/frame` : 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop'
  };
}
