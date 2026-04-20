import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutPayload, FormError, RepData, SessionSummary } from '../types/workout';

interface WorkoutState {
  currentExercise: string;
  repCount: number;
  formScore: number;
  errors: FormError[];
  repHistory: RepData[];
  sessionStatus: string;
  angles: Record<string, number>;
  isConnected: boolean;
  sessionSummary: SessionSummary | null;
  holdDuration: number;
  durationSeconds: number;
  currentRepStage: string;
  sessionId: string | null;
}

const initialState: WorkoutState = {
  currentExercise: 'bicep_curl',
  repCount: 0,
  formScore: 100,
  errors: [],
  repHistory: [],
  sessionStatus: 'IDLE',
  angles: {},
  isConnected: false,
  sessionSummary: null,
  holdDuration: 0,
  durationSeconds: 0,
  currentRepStage: 'ready',
  sessionId: null,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    updateWorkout(state, action: PayloadAction<WorkoutPayload>) {
      const p = action.payload;
      state.currentExercise = p.exercise || state.currentExercise;
      state.repCount = p.rep_count ?? state.repCount;
      state.formScore = p.form_score ?? state.formScore;
      state.errors = p.form_errors ?? [];
      state.repHistory = p.rep_history ?? state.repHistory;
      state.sessionStatus = p.session_status ?? state.sessionStatus;
      state.angles = p.angles ?? {};
      state.holdDuration = p.hold_duration ?? 0;
      state.durationSeconds = p.duration_seconds ?? 0;
      state.currentRepStage = p.current_rep_stage ?? 'ready';
      state.sessionId = p.session_id;
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    setSessionSummary(state, action: PayloadAction<SessionSummary>) {
      state.sessionSummary = action.payload;
      state.sessionStatus = 'ENDED';
    },
    resetSession(state) {
      state.repCount = 0;
      state.formScore = 100;
      state.errors = [];
      state.repHistory = [];
      state.sessionStatus = 'IDLE';
      state.sessionSummary = null;
      state.holdDuration = 0;
      state.durationSeconds = 0;
      state.currentRepStage = 'ready';
      state.sessionId = null;
    },
    setExercise(state, action: PayloadAction<string>) {
      state.currentExercise = action.payload;
    },
  },
});

export const { updateWorkout, setConnected, setSessionSummary, resetSession, setExercise } = workoutSlice.actions;
export default workoutSlice.reducer;
