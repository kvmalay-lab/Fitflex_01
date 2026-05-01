import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { WorkoutPayload, FormError, RepData, SessionSummary } from '../types/workout';
import { createSession, SessionRecord } from '../lib/api';

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
  isSaving: boolean;
  saveError: string | null;
  lastSavedSessionId: string | null;
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
  isSaving: false,
  saveError: null,
  lastSavedSessionId: null,
};

export interface SaveSessionInput {
  exercise: string;
  total_reps: number;
  avg_form_score: number;
  duration_seconds: number;
  rep_history: RepData[];
}

/**
 * Persist a completed session to the backend (Replit Postgres). This is the
 * only write path for workout history — there is no localStorage / dual-write.
 */
export const saveSession = createAsyncThunk<SessionRecord, SaveSessionInput>(
  'workout/saveSession',
  async (input, { rejectWithValue }) => {
    try {
      const record = await createSession({
        exercise: input.exercise,
        total_reps: input.total_reps,
        avg_form_score: input.avg_form_score,
        duration_seconds: input.duration_seconds,
        rep_history: input.rep_history.map((r) => ({
          rep_number: r.rep_number,
          peak_angle: r.peak_angle,
          form_score: r.form_score,
          errors: (r.errors ?? []).map((e) => ({
            type: e.type,
            message: e.message,
            penalty: e.penalty,
          })),
        })),
      });
      return record;
    } catch (e: any) {
      // Log full axios error in the browser console for debugging.
      const status = e?.response?.status;
      const detail = e?.response?.data?.detail ?? e?.message ?? 'Unknown';
      console.error(`[saveSession] POST /api/sessions failed — HTTP ${status ?? 'N/A'}: ${detail}`, e);
      return rejectWithValue(`HTTP ${status ?? 'N/A'}: ${detail}`);
    }
  }
);

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
      state.saveError = null;
    },
    setExercise(state, action: PayloadAction<string>) {
      state.currentExercise = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveSession.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(saveSession.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSavedSessionId = action.payload.id;
        state.sessionStatus = 'SAVED';
      })
      .addCase(saveSession.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = (action.payload as string) ?? 'Failed to save session';
      });
  },
});

export const { updateWorkout, setConnected, setSessionSummary, resetSession, setExercise } =
  workoutSlice.actions;
export default workoutSlice.reducer;
