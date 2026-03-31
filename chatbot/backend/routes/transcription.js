const router = require("express").Router();
const multer = require("multer");
const { authMiddleware } = require("../middleware/auth");
const whisperService = require("../services/whisperService");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// Transcribe audio chunk
router.post("/chunk", authMiddleware, upload.single("audio"), async (req, res) => {
  try {
    const { sessionId, language } = req.body;
    if (!req.file) return res.status(400).json({ error: "No audio file provided" });
    const result = await whisperService.transcribe(req.file.buffer, req.file.mimetype, language || "auto");
    res.json(result);
  } catch (err) {
    console.error("Transcription error:", err.message);
    res.status(500).json({ error: "Transcription failed", details: err.message });
  }
});

module.exports = router;
