const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth");
const { rbac } = require("../middleware/rbac");
const { sessions } = require("../store");
const summaryService = require("../services/summaryService");

router.post("/generate", authMiddleware, rbac("teacher"), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    const transcript = session.transcript.map(t => t.text).join(" ");
    if (!transcript.trim()) return res.status(400).json({ error: "No transcript to summarize" });
    const result = await summaryService.generateSummary(transcript, session.title, session.topic);
    session.summary = result.summary;
    session.chapters = result.chapters;
    session.actionItems = result.actionItems;
    res.json(result);
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ error: "Summary generation failed", details: err.message });
  }
});

router.get("/:sessionId", authMiddleware, (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json({ summary: session.summary, chapters: session.chapters, actionItems: session.actionItems, transcript: session.transcript });
});

module.exports = router;
