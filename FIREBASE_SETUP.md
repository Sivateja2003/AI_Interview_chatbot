# Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `interview-ai` (or your preferred name)
4. Disable Google Analytics (optional) and click **"Create Project"**

## 2. Enable Authentication

1. In the Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle "Enable" ON
   - Click "Save"
3. Enable **Google** sign-in:
   - Click "Google"
   - Toggle "Enable" ON
   - Enter a project support email
   - Click "Save"

## 3. Get Firebase Config (Frontend)

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **"Your apps"** → Click **"Web"** (</> icon)
3. Register the app with name: `interview-ai-web`
4. Copy the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "interview-ai-xxxxx.firebaseapp.com",
  projectId: "interview-ai-xxxxx",
  storageBucket: "interview-ai-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

5. Add these to your `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=interview-ai-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=interview-ai-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=interview-ai-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 4. Get Firebase Project ID (Backend)

1. From the config above, copy the `projectId`
2. Add to `backend/.env`:

```env
FIREBASE_PROJECT_ID=interview-ai-xxxxx
```

## 5. Add Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your deployment domains:
   - `localhost` (already added for development)
   - `your-app.vercel.app` (for production frontend)

## 6. Verify Setup

Test your setup by:
1. Starting the frontend: `cd frontend && npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Try creating an account with email/password
4. Try signing in with Google

Both methods should work and redirect you to the dashboard.
