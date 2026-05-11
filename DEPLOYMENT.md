# Deployment Guide

## Single local config file

This project now uses the root `.env` file as the main local config file for both:

- `frontend`
- `backend`

The frontend reads root env values through `frontend/vite.config.ts` using `envDir: '..'`.
The backend reads root env values through `backend/src/config/env.js`.

## Main variables

```env
APP_ENV=local
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/admin_panel
JWT_SECRET=supersecretkey123
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
ALLOWED_ORIGINS=http://localhost:5173
ENABLE_SEED=true
VITE_APP_ENV=local
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Local mode

Use the root `.env` like this:

```env
APP_ENV=local
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
ENABLE_SEED=true
VITE_APP_ENV=local
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Live mode

For live deployment, keep the same variable names but switch values:

```env
APP_ENV=live
NODE_ENV=production
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-strong-secret
ALLOWED_ORIGINS=https://your-frontend.vercel.app
ENABLE_SEED=false
VITE_APP_ENV=live
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
```

## Vercel setup

Deploy as two Vercel projects from the same repo:

1. `frontend` project
2. `backend` project

### Frontend project

- Root directory: `frontend`
- Build command: default Vite build
- Output directory: `dist`

### Backend project

- Root directory: `backend`
- Vercel entry: `api/index.js`
- Config file: `backend/vercel.json`

## Environment variables in Vercel

Add the same variables from the root `.env` into:

- frontend Vercel project settings
- backend Vercel project settings

Frontend needs:

- `VITE_APP_ENV`
- `VITE_API_BASE_URL`

Backend needs:

- `APP_ENV`
- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRATION`
- `JWT_REFRESH_EXPIRATION`
- `ALLOWED_ORIGINS`
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

This avoids reseeding on every production cold start.
