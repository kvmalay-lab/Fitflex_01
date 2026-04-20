# FitFlex - AI-Powered Fitness Tracker

A React + Vite fitness tracking app with a Python FastAPI backend and Firebase authentication.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (port 5000)
- **Backend**: Python FastAPI + uvicorn (port 8000)
- **Auth/DB**: Firebase (Firestore + Firebase Auth)
- **AI**: Google Gemini API

## Workflows

- **Start application** - Vite dev server on port 5000 (webview)
- **Backend API** - FastAPI/uvicorn on port 8000 (console)

The Vite dev server proxies `/api` and `/ws` requests to the backend on port 8000, so the frontend always uses relative URLs.

## Key Files

- `vite.config.ts` - Vite config with proxy rules for backend API and WebSocket
- `src/hooks/useWorkoutTracking.ts` - Workout session hook; falls back to simulation if backend is unavailable
- `backend/main.py` - FastAPI app with session management, WebSocket stats streaming, and video frame streaming
- `backend/mediapipe_engine.py` - Pose detection engine (simulated in Replit; uses MediaPipe + OpenCV when a camera is available)
- `src/lib/firebase.ts` - Firebase initialization
- `firebase-applet-config.json` - Firebase project config

## Environment Variables

- `GEMINI_API_KEY` - Required for Gemini AI features (set in Secrets)

## Notes

- OpenCV and MediaPipe require a physical camera and display. In the Replit cloud environment, the engine runs in simulation mode. The frontend automatically falls back to its built-in simulated tracker.
- Firebase config is stored in `firebase-applet-config.json` and imported directly.
