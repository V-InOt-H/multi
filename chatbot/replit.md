# EduSense — Real-Time Multilingual Lecture Assistant

A production-grade full-stack web application for real-time multilingual lectures with RBAC, AI-powered transcription, live translation, smart summaries, and quizzes.

## Architecture

```
Frontend (React + Vite + TS) → port 5000
Backend (Node.js + Express + Socket.IO) → port 3001
Python AI Services (FastAPI) → ports 8001/8002/8003

Vite proxies /api/* and /socket.io/* → backend:3001
```

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7 (BrowserRouter)
- Socket.IO client
- Recharts (analytics charts)
- Sonner (toast notifications)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- Socket.IO (WebSocket)
- JWT authentication (jsonwebtoken + bcryptjs)
- In-memory data store (no external DB required)
- Multer (audio file upload)
- Axios (HTTP client for AI services)

**AI Services (Python FastAPI):**
- `backend/python/whisper_server.py` → port 8001 (Whisper STT)
- `backend/python/translation_server.py` → port 8002 (IndicTrans2)
- `backend/python/tts_server.py` → port 8003 (XTTS/Coqui)

## Project Structure

```
/                          # Root = Frontend
├── src/
│   ├── App.tsx            # Route tree (BrowserRouter + all routes)
│   ├── main.tsx           # Entry point
│   ├── context/
│   │   ├── AuthContext.tsx    # User, role, token, roomCode
│   │   └── SocketContext.tsx  # Socket.IO provider
│   ├── routes/
│   │   └── ProtectedRoute.tsx # RBAC route guard
│   ├── layouts/
│   │   ├── TeacherLayout.tsx  # Teacher navbar + outlet
│   │   └── StudentLayout.tsx  # Student navbar + outlet
│   ├── pages/
│   │   ├── Landing.tsx        # Role selector home
│   │   ├── Unauthorized.tsx
│   │   ├── auth/
│   │   │   ├── TeacherLogin.tsx   # Email+password (demo: teacher@demo.com/demo1234)
│   │   │   └── StudentLogin.tsx   # Name + room code
│   │   ├── teacher/
│   │   │   ├── Dashboard.tsx      # Stats, active session, recent sessions
│   │   │   ├── StartLecture.tsx   # Create session → generate room code
│   │   │   ├── LiveControl.tsx    # Record audio, transcript, attendance, controls
│   │   │   ├── Analytics.tsx      # Recharts: engagement, confusion, language dist
│   │   │   └── PostSummary.tsx    # AI summary, smart chapters, action items
│   │   └── student/
│   │       ├── JoinSession.tsx    # Enter room code
│   │       ├── LiveLecture.tsx    # Live transcript, translation, "I'm confused"
│   │       ├── Notes.tsx          # AI summary + personal notes
│   │       ├── Quiz.tsx           # MCQ quiz from teacher push
│   │       └── Progress.tsx       # Attendance heatmap, quiz scores chart
│   └── utils/
│       ├── api.ts                 # All API calls (fetch-based)
│       └── socket.ts              # Socket.IO singleton
├── vite.config.ts         # Dev server port 5000, proxy /api + /socket.io → :3001
├── start.sh               # Starts backend + frontend

backend/
├── server.js              # Express + Socket.IO (port 3001)
├── store.js               # In-memory users/sessions/attendance/quizzes
├── routes/
│   ├── auth.js            # POST /api/auth/teacher/login|register, student/login
│   ├── sessions.js        # POST /api/sessions/create|join, GET list
│   ├── transcription.js   # POST /api/transcription/chunk (audio upload)
│   ├── translation.js     # POST /api/translation/translate
│   ├── summary.js         # POST /api/summary/generate, GET /:sessionId
│   └── quiz.js            # POST /api/quiz/generate, GET /:quizId
├── middleware/
│   ├── auth.js            # JWT verify middleware
│   └── rbac.js            # Role-based access control
├── services/
│   ├── whisperService.js      # OpenAI Whisper API → local Whisper → fallback
│   ├── translationService.js  # Google Translate → LibreTranslate → IndicTrans → fallback
│   ├── ttsService.js          # Local XTTS → browser TTS fallback
│   └── summaryService.js      # OpenAI GPT → extractive fallback
└── python/
    ├── whisper_server.py      # FastAPI Whisper STT (port 8001)
    ├── translation_server.py  # FastAPI IndicTrans2 (port 8002)
    └── tts_server.py          # FastAPI XTTS v2 (port 8003)
```

## Authentication

- **Teacher demo**: `teacher@demo.com` / `demo1234`
- Teachers can register new accounts
- Students join with name + room code (no password)
- JWT tokens stored in localStorage

## Routes

| Path | Role | Description |
|------|------|-------------|
| / | public | Landing role selector |
| /auth/teacher-login | public | Teacher login/register |
| /auth/student-login | public | Student join |
| /teacher/dashboard | teacher | Overview + recent sessions |
| /teacher/start | teacher | Create lecture + generate room code |
| /teacher/live | teacher | Live recording + attendance control |
| /teacher/analytics | teacher | Charts and per-student stats |
| /teacher/summary | teacher | AI summary + download |
| /student/lecture | student | Live transcript + translation + confused button |
| /student/notes | student | AI notes + personal notes |
| /student/quiz | student | MCQ quiz pushed by teacher |
| /student/progress | student | Attendance + quiz score history |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| join_room | client→server | Join a room by code |
| transcript_chunk | teacher→server | Send audio transcript |
| transcript_update | server→students | Broadcast transcript |
| student_confused | student→server | Confusion signal |
| confusion_alert | server→teacher | Confusion notification |
| push_quiz | teacher→server | Push quiz to students |
| quiz_pushed | server→students | Receive quiz |
| push_summary | teacher→server | Push summary |
| summary_ready | server→students | Summary notification |

## AI Service Cascade

Each AI service tries in order, falling back gracefully:

1. **Transcription**: OpenAI Whisper API → Local Whisper (port 8001) → mock message
2. **Translation**: Google Translate API → LibreTranslate (free) → IndicTrans2 (port 8002) → mock
3. **TTS**: Local XTTS (port 8003) → Browser Web Speech API fallback
4. **Summary/Quiz**: OpenAI GPT-4o-mini → Extractive text summary fallback

## Running Python Services

```bash
# Install dependencies
pip install fastapi uvicorn openai-whisper ffmpeg-python python-multipart
pip install transformers torch sentencepiece
pip install TTS

# Run each service
cd backend/python
uvicorn whisper_server:app --host localhost --port 8001
uvicorn translation_server:app --host localhost --port 8002
uvicorn tts_server:app --host localhost --port 8003
```

## Environment Variables

Set these to enable AI features:
- `OPENAI_API_KEY` — enables OpenAI Whisper API + GPT summaries/quizzes
- `GOOGLE_TRANSLATE_API_KEY` — enables Google Cloud Translation

Backend uses defaults if not set:
- `BACKEND_PORT` (default: 3001)
- `JWT_SECRET` (default: built-in key — change in production!)

## Development

```bash
# Start both frontend + backend
bash start.sh

# Or separately:
cd backend && node server.js   # backend on :3001
pnpm run dev                   # frontend on :5000
```

## Deployment

Static deployment via `pnpm run build` → serves `dist/`
Note: Backend must be deployed separately for full functionality.
