# FitFlex — AI Gym Coaching Platform

A full-stack AI gym coaching PWA with real-time pose tracking, form analysis, and session history.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Redux Toolkit (port 5000)
- **Pose Detection**: BROWSER-SIDE via `@mediapipe/tasks-vision` (PoseLandmarker)
  — uses `getUserMedia()` + GPU-accelerated WASM. Encapsulated in `src/services/PoseService.ts`.
- **Backend**: Python FastAPI on port 8000 (auth + session storage)
- **Auth**: JWT tokens, PIN-based login (4-6 digit gym PINs)
- **Database**: **Replit Postgres** via SQLAlchemy (`DATABASE_URL`); JSONB for `rep_history`.
- **Session save**: After workout, frontend dispatches the `saveSession` Redux thunk which
  POSTs to `/api/sessions` (JWT-scoped). This is the single source of truth — no
  localStorage / dual-write.

## Workflows

- **Start application** — Vite dev server on port 5000 (webview)
- **Backend API** — FastAPI/uvicorn on port 8000 (console)

The Vite dev server proxies `/api` and `/ws` to the backend on port 8000.

## Active Exercises

Three exercises are surfaced today (others remain in code but filtered out via
`ACTIVE_EXERCISE_IDS` in `src/lib/exercises.ts`):

- **Squat** — knee angle, threshold 95° / 160°.
- **Bicep Curl** — elbow angle, threshold 35° / 160°.
- **Lat Pulldown** — elbow angle, threshold 60° / 160°, plus wrist-depth +
  contraction-window check that emits "Incomplete Range of Motion" (penalty 5).

## Feedback

- **Audio**: WebAudio beep on form fault (3 s cooldown) — `src/lib/audioFeedback.ts`.
- **Visual**: Rep-confirmed flash, dynamic start/end coach cue, live form-score bar
  (green > 80, yellow 50–80, red < 50), and a dedicated depth indicator while
  Lat Pulldown is active.

## Routes

- `/` — Dashboard (last 7 days from Postgres)
- `/workout` — Live session (camera + tracker)
- `/history` — Past sessions (loading / empty / error states)

## Key Files

### Backend (backend/)
- `main.py` — FastAPI app, JWT auth, REST API. Endpoints:
  `POST /api/auth/login`, `POST /api/sessions`, `GET /api/sessions`,
  legacy `WS /ws/{user_id}` and `POST /api/session/start|stop` (no longer persists).
- `config.py` — Constants (JWT TTL, etc.).
- `database.py` — SQLAlchemy on Replit Postgres. `users`, `sessions(rep_history JSONB)`.
- `session_manager.py` — Legacy server-side simulator (kept for the WS dev path).
- `one_euro_filter.py` — Signal smoothing.

### Frontend (src/)
- `App.tsx` — Router with auth guard.
- `lib/api.ts` — Axios client. Reads `VITE_API_URL`; injects JWT bearer.
- `lib/exercises.ts` — Exercise definitions, thresholds, `detectErrors`.
- `lib/RepCounter.ts` — FSM with 5-frame anti-jitter buffer.
- `lib/audioFeedback.ts` — WebAudio beep + cooldown.
- `services/PoseService.ts` — MediaPipe lifecycle (initialize/detect/destroy).
- `hooks/usePoseTracker.ts` — Camera + detection loop, dispatches Redux updates.
- `hooks/useWorkoutHistory.ts` — Fetches from `/api/sessions`.
- `store/workoutSlice.ts` — Redux state + `saveSession` thunk.
- `pages/Dashboard.tsx` / `WorkoutSession.tsx` / `History.tsx`.

## Demo Users (pre-seeded)

| Name | PIN |
|------|-----|
| Alex | 1234 |
| Jordan | 5678 |
| Demo User | 0000 |

## Environment Variables

- `JWT_SECRET` — Secret for JWT signing (defaults to dev value).
- `DATABASE_URL` — Replit Postgres connection string (already provisioned).
- `VITE_API_URL` — Optional. Frontend API base; empty/unset = same-origin (uses Vite proxy).
- `FITFLEX_EXTRA_ORIGINS` — Optional. Comma-separated extra CORS origins for the backend.
