# Deployment Guide

## Backend → Render

### 1. Create a Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `interview-ai-backend`
   - **Environment**: `Docker`

### 2. Set Environment Variables

Add these to Render:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Google API Key |
| `PINECONE_API_KEY` | Your Pinecone API Key |
| `PINECONE_INDEX_NAME` | `interview-rag` |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | `/app/firebase-credentials.json` |

Make sure to mount or securely upload `firebase-credentials.json` to the container.

---

## Frontend → Vercel

### 1. Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import from your Git repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`

### 2. Set Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_API_URL` | `https://interview-ai-backend.onrender.com/api` |

### 3. Deploy
Vercel auto-detects `npm run build` and deploys the React app.
