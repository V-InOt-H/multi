const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth");
const axios = require("axios");

const WHISPER_LOCAL_URL = process.env.WHISPER_SERVICE_URL || "http://localhost:8001";
const TRANSLATION_LOCAL_URL = process.env.TRANSLATION_SERVICE_URL || "http://localhost:8002";
const TTS_LOCAL_URL = process.env.TTS_SERVICE_URL || "http://localhost:8003";

router.post("/process", authMiddleware, async (req, res) => {
  try {
    const { url, language } = req.body;
    if (!url) return res.status(400).json({ error: "Video URL is required" });

    // 1. Send to whisper_server to transcribe URL
    const whisperResp = await axios.post(`${WHISPER_LOCAL_URL}/transcribe_url`, { url, language: "auto" });
    const transcript = whisperResp.data.text;
    const detectedLang = whisperResp.data.language;

    // 2. Translate to target language
    const transResp = await axios.post(`${TRANSLATION_LOCAL_URL}/translate`, {
      texts: [transcript],
      src_lang: "English", // Whisper transcribes everything to english or auto
      tgt_lang: language || "Hindi"
    });
    const translation = transResp.data.translations[0];

    // 3. Synthesize to target language speech
    const ttsResp = await axios.post(`${TTS_LOCAL_URL}/synthesize`, {
      text: translation,
      language: language || "Hindi"
    }, {
      responseType: "arraybuffer"
    });
    const audioBase64 = Buffer.from(ttsResp.data).toString("base64");

    res.json({
      transcript,
      translation,
      audio: audioBase64,
      source: "link-processed",
      detectedLang
    });
  } catch (err) {
    console.error("Video processing error:", err.message);
    res.status(500).json({ 
      error: "Video processing failed", 
      details: err.response?.data || err.message 
    });
  }
});

module.exports = router;
