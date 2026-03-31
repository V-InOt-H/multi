const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth");
const ttsService = require("../services/ttsService");

router.post("/synthesize", authMiddleware, async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });
    const result = await ttsService.synthesize(text, language || "english");
    res.json(result);
  } catch (err) {
    console.error("TTS error:", err.message);
    res.status(500).json({ error: "TTS synthesis failed", details: err.message });
  }
});

module.exports = router;
