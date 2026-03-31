const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { sessions, attendances } = require("../store");
const { authMiddleware } = require("../middleware/auth");
const { rbac } = require("../middleware/rbac");

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Create session (teacher only)
router.post("/create", authMiddleware, rbac("teacher"), (req, res) => {
  const { title, topic, sourceLang, targetLangs, autoSummary, liveQuiz } = req.body;
  let roomCode;
  do { roomCode = generateRoomCode(); } while ([...sessions.values()].some(s => s.roomCode === roomCode && s.isActive));
  const sessionId = uuidv4();
  const session = {
    sessionId, roomCode,
    teacherId: req.user.id,
    teacherName: req.user.name,
    title: title || "Untitled Lecture",
    topic: topic || "General",
    sourceLang: sourceLang || "English",
    targetLangs: targetLangs || [],
    startTime: new Date().toISOString(),
    endTime: null,
    isActive: true,
    autoSummary: !!autoSummary,
    liveQuiz: !!liveQuiz,
    transcript: [],
    summary: null,
    chapters: [],
    actionItems: [],
    attendance: [],
  };
  sessions.set(sessionId, session);
  res.json({ roomCode, sessionId, session });
});

// Join session (student)
router.post("/join", (req, res) => {
  const { roomCode, name } = req.body;
  const session = [...sessions.values()].find(s => s.roomCode === roomCode && s.isActive);
  if (!session) return res.status(404).json({ error: "Room not found or lecture not started" });
  res.json({ sessionId: session.sessionId, title: session.title, topic: session.topic, sourceLang: session.sourceLang, targetLangs: session.targetLangs });
});

// Get session by ID
router.get("/:sessionId", authMiddleware, (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
});

// End session
router.post("/:sessionId/end", authMiddleware, rbac("teacher"), (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  session.isActive = false;
  session.endTime = new Date().toISOString();
  res.json({ success: true, session });
});

// List teacher's sessions
router.get("/", authMiddleware, (req, res) => {
  const teacherSessions = [...sessions.values()]
    .filter(s => s.teacherId === req.user.id)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  res.json(teacherSessions);
});

module.exports = router;
