const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth");
const translationService = require("../services/translationService");

router.post("/translate", authMiddleware, async (req, res) => {
  try {
    const { texts, srcLang, tgtLang } = req.body;
    if (!texts || !tgtLang) return res.status(400).json({ error: "texts and tgtLang required" });
    const result = await translationService.translate(texts, srcLang || "eng_Latn", tgtLang);
    res.json(result);
  } catch (err) {
    console.error("Translation error:", err.message);
    res.status(500).json({ error: "Translation failed", details: err.message });
  }
});

module.exports = router;
