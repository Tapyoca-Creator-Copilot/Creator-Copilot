# Creator Copilot

Creator Copilot is a React + Vite app with Supabase authentication and project management.

## Project Structure

- `frontend/` — React application (routes, UI, auth, features)
- `backend/` — backend assets (Supabase SQL schema/policies)
- `ai-server/` — local Node server that powers the Tapy AI assistant (`/api/chat`)

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase project (for auth + database)
- Google Generative AI API key (for the local AI assistant)

## 1) Frontend Setup

From repo root:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

You can also use `VITE_SUPABASE_ANON_KEY` instead of `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.

## 2) Backend (Supabase) Setup

Create `backend/.env`:

```env
# Supabase
SUPABASE_URL=
SUPABASE_SECRET_KEY=

#Flask
PORT=5000

#CORS
FRONTEND_URL=https://creator-copilot-frontend.up.railway.app/
```

Open your Supabase SQL Editor and run:

- `backend/supabase/projects.sql`
- `backend/supabase/expenses.sql`

This creates the `projects` table with indexes and RLS policies.

## 3) Run the App

### Backend (API)

The dashboard uses a local Flask API for projects/expenses. Run the backend first.

Start the backend:

```bash
cd backend/

# If `python` isn't available on your Linux system, use `python3` instead.
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run locally on port 5001
PORT=5001 python app.py
```

Note: when running locally, you may want `FRONTEND_URL=http://localhost:5173` in `backend/.env`.

### AI Server (Tapy Assistant)

The in-app assistant calls `POST /api/chat`.

Install dependencies:

```bash
cd ai-server
npm install
```

Create `ai-server/.env`:

```env
# Required
GOOGLE_GENERATIVE_AI_API_KEY=

# Optional
PORT=8787
GEMINI_MODEL=gemini-3-flash-preview
```

Start the AI server:

```bash
cd ai-server
npm run dev
```

By default it listens on `http://localhost:8787`.

Note: in dev, the frontend proxies `/api/*` to `http://localhost:8787` via `frontend/vite.config.js`. If you change `PORT`, update the proxy target as well.

### Frontend (Vite)

```bash
cd frontend
npm run dev
```

Vite will print the local URL (usually `http://localhost:5173`).

## Useful Commands

```bash
cd frontend
npm run lint
npm run build
npm run preview
```

## Troubleshooting

- If auth/project calls fail, verify Supabase env values in `frontend/.env`.
- If a port is already in use, Vite automatically chooses another port.
- If dependencies are missing, run `cd frontend && npm install` again.
