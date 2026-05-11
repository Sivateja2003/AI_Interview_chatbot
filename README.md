# 🎤 InterviewAI — RAG-Powered Interview Preparation Assistant

An AI-powered interview preparation platform that generates context-aware interview questions from your resume and job description, evaluates your answers with detailed scoring, and adapts difficulty in real-time.

## ✨ Features

- **📄 Document Upload** — Upload resume (PDF/DOCX) and job description (PDF/TXT)
- **🧠 RAG Pipeline** — Semantic chunking + FAISS vector search for context retrieval
- **🎯 Context-Aware Questions** — AI generates role-specific questions from YOUR documents
- **📊 Answer Evaluation** — Detailed scoring (correctness, depth, clarity) with feedback
- **🔄 Adaptive Difficulty** — Auto-adjusts beginner → intermediate → advanced
- **💬 Chat History** — Session-based memory for coherent follow-ups
- **⏱️ Interview Mode** — Optional timed responses for real interview simulation
- **📈 Weak Area Tracking** — Tracks and visualizes your improvement areas
- **🔍 Source Highlighting** — See which document sections informed each question
- **🔐 Firebase Auth** — Secure multi-user isolation with email + Google login

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | FastAPI (Python) |
| Auth | Firebase Authentication |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | OpenAI `gpt-4o-mini` |
| Vector DB | FAISS (per-user indices) |
| Doc Parsing | PyPDF2, python-docx |
| Database | SQLite (sessions, history) |
| Deployment | Docker, Vercel (FE), Render (BE) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- OpenAI API key
- Firebase project (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env    # Edit with your API keys
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local    # Edit with Firebase config
npm run dev
```

### Docker
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edit both env files
docker-compose up --build
```

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment settings
│   │   ├── dependencies.py      # Firebase JWT auth
│   │   ├── models/              # Pydantic schemas + DB
│   │   ├── routers/             # API endpoints
│   │   ├── services/            # RAG pipeline + LLM
│   │   └── prompts/             # LLM prompt templates
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # Reusable UI components
│   │   ├── lib/                 # Firebase, API, auth context
│   │   └── hooks/               # Custom React hooks
│   └── package.json
├── docker-compose.yml
├── DEPLOYMENT.md
├── FIREBASE_SETUP.md
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload resume or JD |
| `POST` | `/api/generate-question` | Generate interview question |
| `POST` | `/api/evaluate-answer` | Evaluate user's answer |
| `POST` | `/api/adjust-difficulty` | Manually adjust difficulty |
| `GET` | `/api/history` | Get session history |
| `GET` | `/api/weak-areas` | Get weak area analysis |
| `GET` | `/api/documents` | List uploaded documents |
| `GET` | `/health` | Health check |

## 🎮 Demo Flow

1. **Sign up** with email or Google
2. **Upload** your resume (PDF) and target job description
3. **Start interview** — AI generates a context-aware question
4. **Type your answer** and submit
5. **Get evaluation** — score, feedback, and improvement tips
6. **Continue** — difficulty adapts based on your performance
7. **Track progress** — view weak areas and session history

## 📄 License

MIT
