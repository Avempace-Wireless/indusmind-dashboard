# Environment Configuration Guide

## 📁 Environment Files

| File | Purpose | Used When | Priority |
|------|---------|-----------|----------|
| `.env.local` | Local development | `npm run dev` | Highest |
| `.env.production` | Production build | `npm run build` | High |
| `.env.example` | Template/reference | Never (example only) | N/A |

## 🔄 Switching Between Environments

### Local Development (Uses Local Backend)

```bash
# Backend: http://localhost:4000
# Uses .env.local automatically
npm run dev
```

Your frontend will connect to `http://localhost:4000/api`

### Production Build (Uses Railway Backend)

```bash
# Backend: https://indusmind-backend-production.up.railway.app
# Uses .env.production automatically
npm run build
npm run preview  # Test production build locally
```

Your frontend will connect to `https://indusmind-backend-production.up.railway.app/api`

### Testing Production Build Locally

```bash
# Build with production settings
npm run build

# Preview the production build
npm run preview

# Open http://localhost:4173 (default preview port)
# This uses .env.production (Railway backend URL)
```

## 🚀 Deployment

### Vercel Deployment

Vercel **ignores .env files** and uses dashboard variables instead:

1. **Go to https://vercel.com/dashboard**
2. **Select `indusmind-dashboard` project**
3. **Settings → Environment Variables**
4. **Add these variables:**

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `VITE_API_BASE_URL` | `https://indusmind-backend-production.up.railway.app/api` | Production, Preview |
   | `VITE_WS_BASE_URL` | `wss://indusmind-backend-production.up.railway.app` | Production, Preview |
   | `VITE_APP_ENV` | `production` | Production |
   | `VITE_ENABLE_MOCK_DATA` | `false` | Production |
   | `VITE_ENABLE_PWA` | `true` | Production |

5. **Deployments → Redeploy** (to apply new variables)

### Railway Deployment (Frontend)

If deploying frontend to Railway:

1. **Add variables in Railway dashboard** (same as Vercel table above)
2. Push to main branch
3. Railway auto-deploys

## 🔍 How to Verify Which Backend is Being Used

### In Browser Console

```javascript
// Open deployed site
// Press F12 → Console tab
console.log(import.meta.env.VITE_API_BASE_URL)

// Should show:
// Local: http://localhost:4000/api
// Production: https://indusmind-backend-production.up.railway.app/api
```

### In Network Tab

1. Open DevTools (F12) → Network tab
2. Interact with the app (load dashboard, fetch data)
3. Look at API requests - check the domain:
   - Local: `localhost:4000`
   - Production: `indusmind-backend-production.up.railway.app`

## 📝 Quick Reference

```bash
# Local development (local backend)
npm run dev
# ✅ Uses: .env.local → http://localhost:4000

# Production build (Railway backend)
npm run build
# ✅ Uses: .env.production → https://indusmind-backend-production.up.railway.app

# Preview production build locally
npm run preview
# ✅ Uses: .env.production → https://indusmind-backend-production.up.railway.app

# Deploy to Vercel
git push origin main
# ✅ Uses: Vercel dashboard environment variables
```

## ⚙️ Environment Variable Priority

**Vite loads environment files in this order (highest to lowest priority):**

1. `.env.[mode].local` (e.g., `.env.production.local`)
2. `.env.[mode]` (e.g., `.env.production`)
3. `.env.local`
4. `.env`

**Mode is determined by:**
- `npm run dev` → `development` mode → uses `.env.local` or `.env`
- `npm run build` → `production` mode → uses `.env.production`

**Note:** `.env.local` is ignored by git (should be in `.gitignore`) and only used for local development.

## 🛠️ Setup Steps

### First Time Setup

```bash
# 1. Make sure backend is running locally
cd ../indusmind-backend
npm run dev  # Runs on port 4000

# 2. In another terminal, run frontend
cd ../indusmind-dashboard
npm run dev  # Uses .env.local → connects to localhost:4000
```

### Production Deployment

```bash
# 1. Commit and push
git add -A
git commit -m "Update production environment"
git push origin main

# 2. Set Vercel environment variables (one-time setup)
# Go to Vercel dashboard → Settings → Environment Variables

# 3. Vercel auto-deploys on push to main
```

## 🔐 Security Note

- ✅ `.env.local` and `.env.production` are in `.gitignore`
- ✅ Never commit real credentials to Git
- ✅ Use Vercel/Railway dashboard for production secrets
- ✅ `.env.example` is the only env file that should be committed

## 📋 Checklist

**Before deploying to production:**
- [ ] Backend deployed to Railway and accessible
- [ ] `VITE_API_BASE_URL` set in Vercel dashboard
- [ ] `.env.production` uses correct Railway URL
- [ ] Test production build locally: `npm run build && npm run preview`
- [ ] Verify API calls in browser Network tab
- [ ] Health check works: `https://indusmind-backend-production.up.railway.app/health`
