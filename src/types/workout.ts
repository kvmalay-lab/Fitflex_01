export interface FormError {
  type: string;
  confidence: number;
  penalty: number;
  message: string;
}

export interface RepData {
  rep_number: number;
  peak_angle: number;
  form_score: number;
  errors: FormError[];
  hold_duration?: number;
}

export interface WorkoutPayload {
  timestamp: number;
  session_id: string | null;
  user_id: string;
  exercise: string;
  rep_count: number;
  current_rep_stage: string;
  hold_duration?: number;
  angles: Record<string, number>;
  form_errors: FormError[];
  form_score: number;
  rep_history: RepData[];
  session_status: string;
  duration_seconds: number;
}

export interface TopError {
  type: string;
  count: number;
  frequency: number;
}

export interface SessionSummary {
  type: 'session_summary';
  session_id: string;
  user_id: string;
  exercise: string;
  total_reps: number;
  avg_form_score: number;
  best_rep: RepData | null;
  worst_rep: RepData | null;
  top_errors: TopError[];
  duration_seconds: number;
  timestamp: number;
  rep_history: RepData[];
}

export interface User {
  user_id: string;
  name: string;
  token: string;
}

export interface Exercise {
  id: string;
  name: string;
}
