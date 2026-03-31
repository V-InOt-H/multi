const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth");
const { rbac } = require("../middleware/rbac");
const { sessions, quizzes } = require("../store");
const { v4: uuidv4 } = require("uuid");
const summaryService = require("../services/summaryService");

// Generate quiz from transcript
router.post("/generate", authMiddleware, rbac("teacher"), async (req, res) => {
  try {
    const { sessionId, count = 5 } = req.body;
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    const transcript = session.transcript.map(t => t.text).join(" ");
    const questions = await summaryService.generateQuiz(transcript, count);
    const quizId = uuidv4();
    quizzes.set(quizId, { quizId, sessionId, questions, createdAt: new Date().toISOString() });
    res.json({ quizId, questions });
  } catch (err) {
    res.status(500).json({ error: "Quiz generation failed", details: err.message });
  }
});

router.get("/:quizId", authMiddleware, (req, res) => {
  const quiz = quizzes.get(req.params.quizId);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  res.json(quiz);
});

module.exports = router;
