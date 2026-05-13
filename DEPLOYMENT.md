# Deployment Guide

## Environment Architecture

This project uses **separate** env files for frontend and backend:

- **Backend**: `root .env` + Vercel env vars
- **Frontend**: `frontend/.env.development` (dev) / `frontend/.env.production` (build) + Vercel env vars

## Backend config (root `.env`)

```env
APP_ENV=local
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/admin_panel
JWT_SECRET=supersecretkey123
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
ENABLE_SEED=true
```

## Frontend config

### Development (`frontend/.env.development`)

```env
VITE_APP_ENV=development
VITE_API_BASE_URL=/api/v1
```

The `/api/v1` in dev uses **Vite's proxy** (`vite.config.ts`), forwarding to `http://localhost:5000`. No CORS issues.

### Production (`frontend/.env.production`)

```env
VITE_APP_ENV=production
# VITE_API_BASE_URL must be set in Vercel/CI
```

In production, `VITE_API_BASE_URL` must point to the live backend.

## Local development

1. Start backend:
   ```powershell
   cd backend
   npm run dev
   ```

2. Start frontend (separate terminal):
   ```powershell
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:5173` — frontend proxies `/api/*` to the backend.

## Vercel setup

Deploy as two Vercel projects from the same repo:

### Frontend project
- Root directory: `frontend`
- Build command: default Vite build
- Output directory: `dist`

### Backend project
- Root directory: `backend`
- Vercel entry: `api/index.js`
- Config file: `backend/vercel.json`

## Environment variables in Vercel

### Frontend needs:
- `VITE_APP_ENV` — `production`
- `VITE_API_BASE_URL` — `https://your-backend.vercel.app/api/v1`

### Backend needs:
- `APP_ENV`, `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`
- `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`
- `ALLOWED_ORIGINS` — set to your frontend Vercel URL
- `ENABLE_SEED`

## Seeding

For local:
```powershell
cd backend
npm run seed
```

For live:
1. Put live DB values in root `.env`
2. Run `npm run seed` from `backend`
3. Set `ENABLE_SEED=false` for normal production runtime
