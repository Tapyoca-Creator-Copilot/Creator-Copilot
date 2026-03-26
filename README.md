# Creator Copilot

Creator Copilot is a React + Vite app with Supabase authentication plus a small AI chat service.

## Project Structure

- `frontend/` — React UI (auth, routes, dashboard features). This is what users load in the browser.
- `backend/` — Flask API used by the dashboard for projects/expenses. Also contains Supabase SQL.
- `ai-server/` — Node HTTP server that powers the in-app assistant (`POST /api/chat`).

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A Supabase project (URL + keys)
- A Google Generative AI (Gemini) API key (for the assistant)

## Ports & URLs (what they mean)

- **Port**: local development uses ports so multiple services can run on your machine at once (frontend, backend, ai-server).
- **URL**: in production (Railway), services run on different domains. The frontend must call the backend/ai-server by URL.

## Frontend (`frontend/`)

### What it is

The browser app (React + Vite). Handles login, renders the dashboard, and hosts the assistant UI.

### What it needs

Install:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
# Supabase (required)
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=

# Backend API base URL
# Why: the frontend needs to know where to send projects/expenses API calls.
# Local default (if unset): http://localhost:5001
VITE_API_URL=

# AI server base URL (required in production)
# Why: Vite's dev proxy only works in local dev; on Railway the frontend must call the AI service by its public URL.
# Example (Railway): https://<your-ai-service>.up.railway.app
VITE_AI_SERVER_URL=
```

You can also use `VITE_SUPABASE_ANON_KEY` instead of `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.

Run locally:

```bash
cd frontend
npm run dev
```

Vite will print the local URL (commonly `http://localhost:5173`).

## Backend (`backend/`)

### What it is

Flask API for dashboard features (projects/expenses). Uses Supabase for data.

### What it needs

Create `backend/.env`:

```env
# Supabase (required)
SUPABASE_URL=
SUPABASE_SECRET_KEY=

# Flask
# Why: lets you run locally without hardcoding a port.
PORT=5001

# CORS
# Why: browsers block cross-origin API calls unless the backend explicitly allows the frontend origin.
# Local example: http://localhost:5173
FRONTEND_URL=
```

Install/run locally:

```bash
cd backend/

# If `python` isn't available on your Linux system, use `python3` instead.
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

PORT=5001 python app.py
```

Supabase SQL setup (run in Supabase SQL Editor):

- `backend/supabase/projects.sql`
- `backend/supabase/expenses.sql`

## AI Server (`ai-server/`)

### What it is

A small Node server that exposes:

- `POST /api/chat` — streaming chat endpoint used by the assistant UI
- `GET /health` — health endpoint (useful for Railway checks)

### What it needs

Install:

```bash
cd ai-server
npm install
```

Create `ai-server/.env`:

```env
# Gemini key (required)
GOOGLE_GENERATIVE_AI_API_KEY=

# Server port (optional)
# Why: local dev runs on a dedicated port so it doesn't conflict with frontend/backend.
PORT=8787

# Gemini model (optional)
GEMINI_MODEL=gemini-3-flash-preview

# CORS allowlist origin (recommended in production)
# Why: browsers send an OPTIONS preflight and will block the request unless this origin is allowed.
# Example (Railway): https://<your-frontend-service>.up.railway.app
FRONTEND_URL=
```

Run locally:

```bash
cd ai-server
npm run dev
```

By default it listens on `http://localhost:8787`.

Local dev note:

- In dev, the frontend can proxy `/api/*` to the ai-server via `frontend/vite.config.js`.
- In production (Railway), set `VITE_AI_SERVER_URL` so the frontend calls the ai-server directly.

## Useful Commands

```bash
cd frontend
npm run lint
npm run build
npm run preview
```

## Troubleshooting

- If auth fails, verify the Supabase values in `frontend/.env`.
- If chat fails in production, verify `VITE_AI_SERVER_URL` (frontend) and `FRONTEND_URL` (ai-server) are set correctly.
- If a port is already in use locally, stop the existing process or change the service `PORT`.
