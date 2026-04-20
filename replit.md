# FitFlex — AI Gym Coaching Platform

A full-stack AI gym coaching PWA with real-time pose tracking, form analysis, and session history.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Redux Toolkit (port 5000)
- **Backend**: Python FastAPI + uvicorn (port 8000)
- **Auth**: JWT tokens, PIN-based login (4-6 digit gym PINs)
- **Database**: SQLite via SQLAlchemy (backend/data/sessions.db)
- **Real-time**: WebSocket at 10Hz (100ms), streaming workout data to frontend

## Workflows

- **Start application** — Vite dev server on port 5000 (webview)
- **Backend API** — FastAPI/uvicorn on port 8000 (console)

The Vite dev server proxies `/api` and `/ws` to the backend on port 8000.

## Features

- **6 Exercises**: Bicep Curl, Lat Pulldown, Squat, Shoulder Press, Deadlift, Plank
- **FSM Rep Counting**: Per-exercise state machines with hysteresis (prevents jitter)
- **One-Euro Filter**: Angle smoothing for stable rep detection
- **Form Scoring**: Base-100 scoring with per-error deductions (0-100)
- **Real-time Coaching**: WebSocket sends live rep count, form score, and errors
- **Session History**: SQLite stores completed sessions per user
- **PWA**: Service worker + manifest for installable web app

## Key Files

### Backend (backend/)
- `main.py` — FastAPI app, JWT auth, WebSocket endpoint, REST API
- `config.py` — All exercise thresholds and constants
- `session_manager.py` — Session lifecycle + simulated pose engine
- `database.py` — SQLite ORM (users, sessions tables)
- `one_euro_filter.py` — Signal smoothing
- `exercises/` — 6 exercise FSM classes (bicep_curl, squat, etc.)

### Frontend (src/)
- `App.tsx` — Router with auth guard
- `store/workoutSlice.ts` — Redux state (rep count, form score, errors, history)
- `hooks/useWebSocket.ts` — WebSocket client with auto-reconnect
- `screens/Login.tsx` — PIN keypad login
- `screens/LiveDashboard.tsx` — Real-time workout with exercise selector
- `screens/RepBreakdown.tsx` — Per-rep analysis with bar chart
- `screens/SessionSummary.tsx` — Post-workout summary with suggestions
- `screens/Progress.tsx` — Historical sessions with trend charts
- `components/FormGauge.tsx` — Animated SVG circular gauge (0-100)
- `components/RepCounter.tsx` — Large animated rep display
- `components/ErrorAlert.tsx` — Slide-in form error cards

## Demo Users (pre-seeded)

| Name | PIN |
|------|-----|
| Alex | 1234 |
| Jordan | 5678 |
| Demo User | 0000 |

## Camera / Simulation Mode

Replit runs in a headless cloud environment without a physical camera.
The backend uses a `SimulatedPoseEngine` that generates realistic angle data per exercise.
When deployed on a gym server with a real camera + MediaPipe, swap the engine in `session_manager.py`.

## Environment Variables

- `JWT_SECRET` — Secret for JWT signing (defaults to dev value, set in Secrets for production)
