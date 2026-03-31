# 🎓 MASTER BUILD PROMPT
## Real-Time Multilingual Lecture Assistant
### Full-Stack · RBAC · AI-Powered · Replit-Ready

---

## 🧭 WHAT YOU ARE BUILDING

A production-grade, full-stack web application for **real-time multilingual lectures** with:
- Role-Based Access Control (Teacher / Student)
- Separate authenticated login flows per role
- Room code session system
- Live attendance tracking
- AI Meeting Notes & Smart Chapter generation
- Action item extraction
- Backend pipeline: FFmpeg → Whisper → IndicTrans → XTTS/Coqui
- Real-time WebSocket communication
- Fully responsive, accessible UI

---

## 🗂️ PROJECT STRUCTURE

Build this exact folder/file structure:

```
lecture-assistant/
├── frontend/                        # React + Vite + Tailwind
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Role, user, token, roomCode
│   │   │   └── SocketContext.jsx     # WebSocket provider
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layouts/
│   │   │   ├── TeacherLayout.jsx
│   │   │   └── StudentLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── TeacherLogin.jsx
│   │   │   │   └── StudentLogin.jsx
│   │   │   ├── teacher/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── StartLecture.jsx
│   │   │   │   ├── LiveControl.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   └── PostSummary.jsx
│   │   │   └── student/
│   │   │       ├── JoinSession.jsx
│   │   │       ├── LiveLecture.jsx
│   │   │       ├── Notes.jsx
│   │   │       ├── Quiz.jsx
│   │   │       └── Progress.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Role-aware navbar
│   │   │   ├── DashboardCard.jsx
│   │   │   ├── TranscriptPanel.jsx
│   │   │   ├── TranslationPanel.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   ├── QuizCard.jsx
│   │   │   ├── AttendanceTracker.jsx
│   │   │   ├── SmartChapters.jsx
│   │   │   ├── ActionItems.jsx
│   │   │   └── ConfusionAlert.jsx
│   │   └── utils/
│   │       ├── api.js
│   │       └── socket.js
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                          # Node.js + Express + Python services
│   ├── server.js                     # Main Express + Socket.IO server
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   ├── transcription.js
│   │   ├── translation.js
│   │   ├── summary.js
│   │   └── quiz.js
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   └── rbac.js                   # Role guard middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── Attendance.js
│   ├── services/
│   │   ├── whisperService.js         # Calls Python Whisper service
│   │   ├── translationService.js     # Calls IndicTrans Python service
│   │   ├── ttsService.js             # Calls XTTS/Coqui Python service
│   │   └── summaryService.js         # AI summary + chapter extraction
│   ├── python/
│   │   ├── whisper_server.py         # FastAPI — Whisper STT
│   │   ├── translation_server.py     # FastAPI — IndicTrans
│   │   └── tts_server.py             # FastAPI — XTTS / Coqui TTS
│   └── package.json
│
├── .env
├── .replit
└── replit.nix
```

---

## 🔐 AUTHENTICATION SYSTEM

### Two Separate Login Pages

**Teacher Login** — `/auth/teacher-login`
```jsx
// TeacherLogin.jsx
// Fields: email, password
// On success: store { role: "teacher", token, userId } in localStorage + AuthContext
// Redirect to /teacher/dashboard
// Include: "Create Teacher Account" link
```

**Student Login** — `/auth/student-login`
```jsx
// StudentLogin.jsx
// Fields: name, room code (6-digit), optional password
// On success: store { role: "student", token, name, roomCode } in localStorage + AuthContext
// Redirect to /student/lecture
// Include: "Don't have a room code? Ask your teacher" note
```

**AuthContext.jsx** — must include:
```jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lecture_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem("lecture_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("lecture_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**ProtectedRoute.jsx**
```jsx
export function ProtectedRoute({ allowedRole, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (user.role !== allowedRole) return <Navigate to="/unauthorized" />;
  return children;
}
```

---

## 🧭 ROUTING STRUCTURE

**App.jsx** — full route tree:
```jsx
<Routes>
  {/* Public */}
  <Route path="/" element={<LandingRoleSelect />} />
  <Route path="/auth/teacher-login" element={<TeacherLogin />} />
  <Route path="/auth/student-login" element={<StudentLogin />} />
  <Route path="/unauthorized" element={<Unauthorized />} />

  {/* Teacher routes — protected */}
  <Route path="/teacher" element={
    <ProtectedRoute allowedRole="teacher">
      <TeacherLayout />
    </ProtectedRoute>
  }>
    <Route path="dashboard"  element={<Dashboard />} />
    <Route path="start"      element={<StartLecture />} />
    <Route path="live"       element={<LiveControl />} />
    <Route path="analytics"  element={<Analytics />} />
    <Route path="summary"    element={<PostSummary />} />
  </Route>

  {/* Student routes — protected */}
  <Route path="/student" element={
    <ProtectedRoute allowedRole="student">
      <StudentLayout />
    </ProtectedRoute>
  }>
    <Route path="join"      element={<JoinSession />} />
    <Route path="lecture"   element={<LiveLecture />} />
    <Route path="notes"     element={<Notes />} />
    <Route path="quiz"      element={<Quiz />} />
    <Route path="progress"  element={<Progress />} />
  </Route>
</Routes>
```

---

## 🧑‍🏫 TEACHER PAGES — FULL SPEC

### 1. Landing / Role Select — `/`
- Two large cards: "I'm a Teacher" → `/auth/teacher-login`, "I'm a Student" → `/auth/student-login`
- Clean, minimal hero layout

### 2. Teacher Dashboard — `/teacher/dashboard`
Build this as a card grid:
```
┌─────────────────────────────────────────────────────┐
│  Active Students: 32    Engagement: 87%   Confused: 4│
├──────────────────────┬──────────────────────────────┤
│  Live Session Panel  │   Confusion Alert Feed        │
│  Room Code: XK9P2M   │   ● Student: "lost at step 3" │
│  [Start Lecture]     │   ● 3 students confused       │
├──────────────────────┴──────────────────────────────┤
│  Recent Sessions (table: date, topic, students, score)│
└─────────────────────────────────────────────────────┘
```

### 3. Start Lecture — `/teacher/start`
- Form fields:
  - Lecture title (text input)
  - Topic / Subject (dropdown)
  - Source language (dropdown: English, Hindi, Tamil, Telugu, Bengali, Kannada, etc.)
  - Target translation language (multi-select)
  - Enable auto-summary (toggle)
  - Enable live quiz (toggle)
- On submit: POST `/api/sessions/create` → returns `{ roomCode: "XK9P2M", sessionId }`
- Display generated room code in large bold type with copy button
- "Share Room Code" button (copies to clipboard)
- "Go to Live Control" button

### 4. Live Lecture Control Panel — `/teacher/live`
Four-panel layout:
```
┌──────────────────┬───────────────────────┐
│  TRANSCRIPT FEED  │  TRANSLATION PANEL    │
│  (live scroll)    │  (target language)    │
├──────────────────┼───────────────────────┤
│  ATTENDANCE       │  CONTROLS             │
│  Live list of     │  [▶ Start / ■ Stop]  │
│  joined students  │  [Generate Summary]   │
│  with join time   │  [Push Quiz]          │
│                   │  [Trigger Translation]│
└──────────────────┴───────────────────────┘
```
- Attendance tracker shows: name, join time, last-active time, confusion count
- Each row has a "Remove" button
- Show total count in header
- Socket events to listen: `transcript_update`, `student_joined`, `student_confused`, `student_left`

### 5. Analytics — `/teacher/analytics`
- Line chart: engagement over lecture duration (use Recharts)
- Bar chart: confusion events by timestamp
- Pie chart: language distribution of students
- Table: per-student stats (name, attendance %, quiz score, confusion count)

### 6. Post-Lecture Summary — `/teacher/summary`
- Smart Chapters list (auto-generated): timestamp + chapter title + 2-line description
- Key Action Items: extracted tasks with assigned student/owner
- Full transcript (collapsible)
- Download buttons: PDF summary, TXT transcript, JSON data
- "Send to Students" button (pushes summary to student Notes page)

---

## 👨‍🎓 STUDENT PAGES — FULL SPEC

### 1. Join Session — `/student/join`
- Input: Room Code (6-char, auto-uppercase)
- Input: Display Name
- On submit: POST `/api/sessions/join` → verify room code, return session info
- If invalid: show error "Room not found or lecture not started"

### 2. Live Lecture — `/student/lecture`
Three-column layout:
```
┌──────────────────┬──────────────────┬─────────────────┐
│  LIVE TRANSCRIPT  │  TRANSLATION     │  INTERACTION    │
│  (auto-scroll)    │  (target lang)   │  [😕 Confused]  │
│  keywords bold    │  with TTS button │  [? Ask Q]      │
│                   │                  │  [🔊 Playback]  │
└──────────────────┴──────────────────┴─────────────────┘
```
- "I'm Confused" button: emits socket event `student_confused` with timestamp
- "Ask Question" opens a text modal → sends to teacher's confusion feed
- Voice playback button triggers XTTS audio for last translated chunk
- Keywords auto-highlighted in yellow when they appear in transcript

### 3. Student Notes — `/student/notes`
- AI-generated summary (pushed by teacher after lecture)
- Smart Chapters list: click chapter → scroll to transcript position
- Key points as bullet list
- Download as PDF button
- Editable personal notes section (saved to localStorage)

### 4. Student Quiz — `/student/quiz`
- Cards appear when teacher pushes quiz
- MCQ format with 4 options
- Timer per question (configurable by teacher)
- Score shown at end
- Socket event: `quiz_pushed` → triggers quiz modal

### 5. Student Progress — `/student/progress`
- Attendance calendar (heatmap: present/absent per lecture)
- Quiz scores bar chart (Recharts)
- Engagement score (based on "confused" events and questions)
- Download progress report button

---

## 🖥️ NAVIGATION SYSTEM

**Navbar.jsx** — role-aware:
```jsx
const teacherLinks = [
  { label: "Overview",     path: "/teacher/dashboard" },
  { label: "Live Lecture", path: "/teacher/live"      },
  { label: "Analytics",    path: "/teacher/analytics" },
  { label: "Summary",      path: "/teacher/summary"   },
];

const studentLinks = [
  { label: "Lecture",  path: "/student/lecture"  },
  { label: "Notes",    path: "/student/notes"    },
  { label: "Quiz",     path: "/student/quiz"     },
  { label: "Progress", path: "/student/progress" },
];

// NEVER render teacher links to students and vice versa
const links = role === "teacher" ? teacherLinks : studentLinks;
```

---

## 🎨 DESIGN SYSTEM

**Color Palette** (use ONLY these):
```js
// tailwind.config.js
colors: {
  primary:   { DEFAULT: "#4F46E5", light: "#818CF8", dark: "#3730A3" },
  accent:    { DEFAULT: "#06B6D4", light: "#67E8F9"                  },
  success:   "#10B981",
  warning:   "#F59E0B",
  danger:    "#EF4444",
  surface:   { DEFAULT: "#FFFFFF", secondary: "#F8FAFC", dark: "#1E293B" },
  text:      { primary: "#0F172A", secondary: "#475569", muted: "#94A3B8" },
}
```

**Design Rules:**
- `8px` spacing system (use Tailwind: `p-2`, `p-4`, `p-8`, `gap-4`)
- Cards: `rounded-xl shadow-sm border border-slate-200`
- All text must be `min-text-base` for multilingual readability
- Font: `Inter` (Google Fonts) for Latin, system-ui fallback for Indic scripts
- Buttons: `rounded-lg px-4 py-2 font-medium transition-all`
- Active nav item: `border-b-2 border-primary text-primary`

---

## ⚙️ BACKEND — EXPRESS + SOCKET.IO

**server.js** — main entry point:
```js
const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");
const cors   = require("cors");
const jwt    = require("jsonwebtoken");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/sessions",      require("./routes/sessions"));
app.use("/api/transcription", require("./routes/transcription"));
app.use("/api/translation",   require("./routes/translation"));
app.use("/api/summary",       require("./routes/summary"));
app.use("/api/quiz",          require("./routes/quiz"));

// Socket.IO events
io.on("connection", (socket) => {
  socket.on("join_room",       ({ roomCode, name, role }) => {
    socket.join(roomCode);
    if (role === "student") {
      io.to(roomCode).emit("student_joined", { name, socketId: socket.id, time: Date.now() });
    }
  });

  socket.on("transcript_chunk",  (data) => io.to(data.roomCode).emit("transcript_update",  data));
  socket.on("student_confused",  (data) => io.to(data.roomCode).emit("confusion_alert",    data));
  socket.on("push_quiz",         (data) => io.to(data.roomCode).emit("quiz_pushed",         data));
  socket.on("push_summary",      (data) => io.to(data.roomCode).emit("summary_ready",       data));
  socket.on("disconnect", () => {
    // emit student_left to relevant room
  });
});

server.listen(5000, () => console.log("Backend running on :5000"));
```

**Session model** (MongoDB / SQLite):
```js
// Session schema:
{
  sessionId:    String,   // UUID
  roomCode:     String,   // 6-char alphanumeric, unique
  teacherId:    String,
  title:        String,
  topic:        String,
  sourceLang:   String,
  targetLangs:  [String],
  startTime:    Date,
  endTime:      Date,
  isActive:     Boolean,
  transcript:   [{ text, timestamp, speakerId }],
  summary:      String,
  chapters:     [{ title, startTime, summary }],
  actionItems:  [{ text, assignedTo, timestamp }],
  attendance:   [{ studentId, name, joinTime, leaveTime }]
}
```

**Room Code generation** (`routes/sessions.js`):
```js
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

router.post("/create", authMiddleware, rbac("teacher"), async (req, res) => {
  const { title, topic, sourceLang, targetLangs } = req.body;
  const roomCode = generateRoomCode();
  // Save to DB, return roomCode + sessionId
  res.json({ roomCode, sessionId });
});

router.post("/join", async (req, res) => {
  const { roomCode, name } = req.body;
  const session = await Session.findOne({ roomCode, isActive: true });
  if (!session) return res.status(404).json({ error: "Room not found or inactive" });
  // Add student to attendance list, return session info
  res.json({ sessionId: session.sessionId, title: session.title });
});
```

---

## 🐍 PYTHON AI SERVICES — FastAPI

### Service 1: Whisper STT — `python/whisper_server.py`
```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import whisper
import ffmpeg
import tempfile, os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

model = whisper.load_model("medium")  # Use "large-v3" for better Indian language accuracy

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = "auto"):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # FFmpeg: convert to 16kHz mono WAV (Whisper requirement)
    converted_path = tmp_path.replace(".wav", "_converted.wav")
    (
        ffmpeg.input(tmp_path)
        .output(converted_path, ar=16000, ac=1, format="wav")
        .overwrite_output()
        .run(quiet=True)
    )

    result = model.transcribe(
        converted_path,
        language=None if language == "auto" else language,
        task="transcribe",
        fp16=False,
        word_timestamps=True
    )

    os.unlink(tmp_path)
    os.unlink(converted_path)

    return {
        "text": result["text"],
        "language": result["language"],
        "segments": result["segments"],  # includes timestamps
        "words": [w for seg in result["segments"] for w in seg.get("words", [])]
    }

@app.post("/transcribe-stream")
async def transcribe_stream(file: UploadFile = File(...)):
    # For chunked/streaming — accepts 5-10s audio chunks
    # Same pipeline, returns partial transcript
    pass
```

### Service 2: IndicTrans Translation — `python/translation_server.py`
```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# IndicTrans2: https://github.com/AI4Bharat/IndicTrans2
from IndicTransToolkit import IndicProcessor
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Load IndicTrans2 model (en-indic direction)
MODEL_NAME = "ai4bharat/indictrans2-en-indic-dist-200M"
tokenizer   = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model       = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME, trust_remote_code=True)
ip          = IndicProcessor(inference=True)

# Supported language codes (Flores-200 format)
LANG_MAP = {
    "hindi":   "hin_Deva",
    "tamil":   "tam_Taml",
    "telugu":  "tel_Telu",
    "bengali": "ben_Beng",
    "kannada": "kan_Knda",
    "malayalam": "mal_Mlym",
    "marathi": "mar_Deva",
    "punjabi": "pan_Guru",
    "gujarati": "guj_Gujr",
    "odia":    "ory_Orya",
}

class TranslationRequest(BaseModel):
    texts: List[str]
    src_lang: str  # e.g. "eng_Latn"
    tgt_lang: str  # e.g. "hin_Deva"

@app.post("/translate")
async def translate(req: TranslationRequest):
    tgt_code = LANG_MAP.get(req.tgt_lang.lower(), req.tgt_lang)
    batch = ip.preprocess_batch(req.texts, src_lang=req.src_lang, tgt_lang=tgt_code)

    inputs = tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True
    )

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            num_beams=5,
            num_return_sequences=1,
            max_length=256
        )

    decoded = tokenizer.batch_decode(outputs, skip_special_tokens=True, clean_up_tokenization_spaces=True)
    translations = ip.postprocess_batch(decoded, lang=tgt_code)

    return { "translations": translations, "src_lang": req.src_lang, "tgt_lang": tgt_code }
```

### Service 3: XTTS / Coqui TTS — `python/tts_server.py`
```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import io

# Coqui XTTS v2
from TTS.api import TTS

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

LANGUAGE_MAP = {
    "hindi":    "hi",
    "tamil":    "ta",
    "telugu":   "te",
    "bengali":  "bn",
    "kannada":  "kn",
    "english":  "en",
    "marathi":  "mr",
    "gujarati": "gu",
}

class TTSRequest(BaseModel):
    text: str
    language: str      # e.g. "hindi"
    speaker_wav: str = None  # Optional: path to voice clone reference

@app.post("/synthesize")
async def synthesize(req: TTSRequest):
    lang_code = LANGUAGE_MAP.get(req.language.lower(), "en")
    buffer    = io.BytesIO()

    tts.tts_to_file(
        text=req.text,
        language=lang_code,
        speaker_wav=req.speaker_wav,  # voice cloning if provided
        file_path=buffer,
        format="wav"
    )

    buffer.seek(0)
    return StreamingResponse(buffer, media_type="audio/wav")

@app.post("/synthesize-stream")
async def synthesize_stream(req: TTSRequest):
    # Chunked audio streaming for real-time playback
    lang_code = LANGUAGE_MAP.get(req.language.lower(), "en")

    def generate():
        for chunk in tts.tts_stream(text=req.text, language=lang_code):
            yield chunk

    return StreamingResponse(generate(), media_type="audio/wav")
```

---

## 🔌 NODE.JS → PYTHON SERVICE CONNECTORS

**services/whisperService.js**:
```js
const axios = require("axios");
const FormData = require("form-data");

const WHISPER_URL = process.env.WHISPER_SERVICE_URL || "http://localhost:8001";

async function transcribeAudio(audioBuffer, language = "auto") {
  const form = new FormData();
  form.append("file", audioBuffer, { filename: "chunk.wav", contentType: "audio/wav" });
  form.append("language", language);

  const { data } = await axios.post(`${WHISPER_URL}/transcribe`, form, {
    headers: form.getHeaders(),
    timeout: 60000
  });
  return data; // { text, language, segments, words }
}

module.exports = { transcribeAudio };
```

**services/translationService.js**:
```js
const axios = require("axios");

const TRANSLATION_URL = process.env.TRANSLATION_SERVICE_URL || "http://localhost:8002";

async function translateTexts(texts, srcLang = "eng_Latn", tgtLang = "hindi") {
  const { data } = await axios.post(`${TRANSLATION_URL}/translate`, {
    texts,
    src_lang: srcLang,
    tgt_lang: tgtLang
  });
  return data.translations;
}

module.exports = { translateTexts };
```

**services/ttsService.js**:
```js
const axios = require("axios");

const TTS_URL = process.env.TTS_SERVICE_URL || "http://localhost:8003";

async function synthesize(text, language = "hindi") {
  const { data } = await axios.post(`${TTS_URL}/synthesize`, { text, language }, {
    responseType: "arraybuffer"
  });
  return Buffer.from(data); // WAV audio buffer
}

module.exports = { synthesize };
```

---

## 🧠 AI MEETING NOTES & SMART CHAPTERS

**services/summaryService.js** — AI-powered post-processing:
```js
// Uses OpenAI / local Ollama / or any LLM API
// Called when teacher clicks "Generate Summary"

async function generateSmartSummary(transcript, sessionTitle) {
  const prompt = `
You are an AI lecture assistant. Given the following lecture transcript, you must:

1. SUMMARY: Write a 3-5 sentence summary of the entire lecture.

2. SMART CHAPTERS: Identify 4-7 logical chapters/sections. For each chapter:
   - Title (max 6 words)
   - Approximate start timestamp (from transcript)
   - 1-2 sentence description

3. KEY POINTS: List 5-10 bullet points of the most important facts/concepts.

4. ACTION ITEMS: Extract any tasks, assignments, or follow-ups mentioned.
   Format: { task, assignedTo (if mentioned), dueDate (if mentioned) }

5. CONFUSION POINTS: List topics where students seemed confused (based on confusion events).

Return ONLY valid JSON in this exact schema:
{
  "summary": "string",
  "chapters": [{ "title": "", "timestamp": 0, "description": "" }],
  "keyPoints": ["string"],
  "actionItems": [{ "task": "", "assignedTo": "", "dueDate": "" }],
  "confusionPoints": ["string"]
}

TRANSCRIPT:
${transcript}
  `;

  // Call your LLM (OpenAI, Ollama, Gemini, etc.)
  const response = await callLLM(prompt);
  return JSON.parse(response);
}
```

**SmartChapters.jsx** — frontend component:
```jsx
export function SmartChapters({ chapters, onChapterClick }) {
  return (
    <div className="space-y-3">
      {chapters.map((ch, i) => (
        <div
          key={i}
          onClick={() => onChapterClick(ch.timestamp)}
          className="cursor-pointer p-4 rounded-xl border border-slate-200
                     hover:border-primary hover:bg-primary/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
              {formatTime(ch.timestamp)}
            </span>
            <h4 className="font-medium text-slate-800">{ch.title}</h4>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-16">{ch.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 ATTENDANCE TRACKER

**AttendanceTracker.jsx** (live, in teacher's control panel):
```jsx
export function AttendanceTracker({ roomCode }) {
  const [students, setStudents] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    socket.on("student_joined", (s) =>
      setStudents(prev => [...prev, { ...s, status: "active" }])
    );
    socket.on("student_left",   (s) =>
      setStudents(prev => prev.map(st =>
        st.socketId === s.socketId ? { ...st, status: "left", leaveTime: Date.now() } : st
      ))
    );
    socket.on("confusion_alert", (s) =>
      setStudents(prev => prev.map(st =>
        st.socketId === s.socketId
          ? { ...st, confusionCount: (st.confusionCount || 0) + 1 }
          : st
      ))
    );
  }, [socket]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">Live Attendance</h3>
        <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
          {students.filter(s => s.status === "active").length} online
        </span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {students.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-3
                                  rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                s.status === "active" ? "bg-green-500" : "bg-slate-300"
              }`} />
              <span className="text-sm font-medium text-slate-700">{s.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {s.confusionCount > 0 && (
                <span className="text-amber-600 font-medium">
                  😕 ×{s.confusionCount}
                </span>
              )}
              <span>{formatTime(s.time)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔄 REAL-TIME AUDIO PIPELINE (Frontend)

**Frontend audio capture → backend → Whisper → Translation → Socket.IO**:
```js
// utils/audioCapture.js

let mediaRecorder;
let socket;

export function startAudioCapture(roomCode, srcLang, tgtLang, socketInstance) {
  socket = socketInstance;

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        // Convert webm chunk → send to backend
        const arrayBuffer = await event.data.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "chunk.webm");
        formData.append("roomCode",  roomCode);
        formData.append("srcLang",   srcLang);
        formData.append("tgtLang",   tgtLang);

        // Backend: FFmpeg converts → Whisper transcribes → IndicTrans translates
        // → emits transcript_update + translation_update via Socket.IO
        await fetch("/api/transcription/chunk", { method: "POST", body: formData });
      }
    };

    mediaRecorder.start(5000); // 5-second chunks
  });
}

export function stopAudioCapture() {
  if (mediaRecorder) mediaRecorder.stop();
}
```

**Backend transcription route** (`routes/transcription.js`):
```js
router.post("/chunk", upload.single("audio"), async (req, res) => {
  const { roomCode, srcLang, tgtLang } = req.body;
  const audioBuffer = req.file.buffer;

  // 1. Whisper STT
  const { text, segments } = await whisperService.transcribeAudio(audioBuffer, srcLang);

  // 2. IndicTrans translation
  const [translation] = await translationService.translateTexts([text], "eng_Latn", tgtLang);

  // 3. Broadcast via Socket.IO to room
  io.to(roomCode).emit("transcript_update",   { text, segments, timestamp: Date.now() });
  io.to(roomCode).emit("translation_update",  { translation, lang: tgtLang, timestamp: Date.now() });

  // 4. Persist to session transcript in DB
  await Session.updateOne({ roomCode }, {
    $push: { transcript: { text, timestamp: Date.now() } }
  });

  res.json({ ok: true });
});
```

---

## 🌐 REPLIT CONFIGURATION

**.replit**:
```toml
run = "bash start.sh"

[nix]
channel = "stable-23_05"

[[ports]]
localPort = 3000
externalPort = 3000

[[ports]]
localPort = 5000
externalPort = 5000

[[ports]]
localPort = 8001
externalPort = 8001

[[ports]]
localPort = 8002
externalPort = 8002

[[ports]]
localPort = 8003
externalPort = 8003
```

**replit.nix** (system dependencies):
```nix
{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.nodejs_20
    pkgs.ffmpeg
    pkgs.git
    pkgs.portaudio
    pkgs.libsndfile
    pkgs.espeak
  ];
}
```

**start.sh** (concurrent service launch):
```bash
#!/bin/bash

echo "Starting all services..."

# Python dependencies
pip install fastapi uvicorn whisper openai-whisper ffmpeg-python torch \
    transformers TTS IndicTransToolkit sacrebleu sentencepiece \
    numpy scipy soundfile --quiet &

# Install Node.js dependencies
cd backend && npm install --quiet && cd ..
cd frontend && npm install --quiet && cd ..

# Start Python AI services
uvicorn python.whisper_server:app     --host 0.0.0.0 --port 8001 &
uvicorn python.translation_server:app --host 0.0.0.0 --port 8002 &
uvicorn python.tts_server:app         --host 0.0.0.0 --port 8003 &

# Start Node.js backend
cd backend && node server.js &

# Start React frontend (Vite dev server)
cd frontend && npm run dev -- --host 0.0.0.0 --port 3000 &

wait
```

**.env**:
```env
# Backend
PORT=5000
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/lecture-assistant
# or use SQLite: DB_PATH=./database.sqlite

# AI Service URLs (all on same Replit instance)
WHISPER_SERVICE_URL=http://localhost:8001
TRANSLATION_SERVICE_URL=http://localhost:8002
TTS_SERVICE_URL=http://localhost:8003

# LLM for summaries (optional - can use Ollama locally)
OPENAI_API_KEY=sk-...
# or OLLAMA_URL=http://localhost:11434

# Frontend
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📦 PACKAGE DEPENDENCIES

**frontend/package.json**:
```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "socket.io-client": "^4",
    "recharts": "^2",
    "axios": "^1",
    "react-hot-toast": "^2",
    "jspdf": "^2",
    "html2canvas": "^1"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

**backend/package.json**:
```json
{
  "dependencies": {
    "express": "^4",
    "socket.io": "^4",
    "cors": "^2",
    "jsonwebtoken": "^9",
    "bcryptjs": "^2",
    "mongoose": "^8",
    "multer": "^1",
    "axios": "^1",
    "form-data": "^4",
    "dotenv": "^16",
    "uuid": "^9"
  }
}
```

---

## ✅ BUILD ORDER (FOLLOW THIS SEQUENCE)

Build in this exact order to avoid dependency issues:

```
Step 1: Project scaffold + Replit config (replit.nix, .replit, start.sh)
Step 2: Backend auth system (JWT, Teacher/Student login endpoints)
Step 3: Session model + room code generation
Step 4: Socket.IO server with all event handlers
Step 5: Whisper Python service (test with a WAV file)
Step 6: IndicTrans Python service (test with sample English text)
Step 7: XTTS Python service (test audio output)
Step 8: Node.js → Python service connectors + transcription route
Step 9: Frontend auth (context, login pages, protected routes)
Step 10: Teacher pages (dashboard → start → live control → analytics → summary)
Step 11: Student pages (join → live → notes → quiz → progress)
Step 12: Real-time audio pipeline (MediaRecorder → backend → Whisper → Socket)
Step 13: Attendance tracker (live socket events)
Step 14: AI summary + smart chapters (summaryService + SmartChapters component)
Step 15: Download/export features (PDF, TXT)
Step 16: Dark mode + mobile responsive adjustments
```

---

## 🚫 STRICT RULES

- NEVER render teacher UI components inside student routes
- NEVER expose `/teacher/*` routes without `role === "teacher"` check
- NEVER hardcode room codes — always generate server-side
- NEVER skip the FFmpeg conversion step before Whisper (it requires 16kHz mono WAV)
- NEVER send audio chunks > 10 seconds to Whisper (causes timeout)
- NEVER use localStorage for sensitive data like JWT — use HttpOnly cookies in production
- ALWAYS handle socket disconnection and reconnection gracefully
- ALWAYS show loading states during AI processing (Whisper + Translation can take 2-5s)

---

## 🔥 BONUS FEATURES (IMPLEMENT AFTER CORE IS WORKING)

1. **Dark Mode**: Add `darkMode: "class"` to Tailwind config, toggle button in navbar
2. **Voice Cloning**: Allow teacher to upload a reference WAV → XTTS clones their voice for TTS
3. **Offline Fallback**: If Python services are down, show graceful "AI features unavailable" banner
4. **Mobile Responsive**: Add bottom tab navigation for mobile students
5. **Accessibility**: Add `aria-live="polite"` on transcript panel for screen readers
6. **Export Formats**: Add `.docx` export using `docx` npm package for meeting notes
7. **Multi-session History**: Teacher can browse past lectures with full transcripts

---

*End of Master Build Prompt — Version 2.0*
*Built for: Real-Time Multilingual Lecture Assistant*
*Stack: React + Vite + Tailwind + Express + Socket.IO + Whisper + IndicTrans + XTTS*
