const axios = require("axios");
const FormData = require("form-data");

const WHISPER_LOCAL_URL = process.env.WHISPER_SERVICE_URL || "http://localhost:8001";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function transcribe(audioBuffer, mimeType, language = "auto") {
  // Option 1: OpenAI Whisper API
  if (OPENAI_API_KEY) {
    try {
      const form = new FormData();
      form.append("file", audioBuffer, { filename: "audio.webm", contentType: mimeType || "audio/webm" });
      form.append("model", "whisper-1");
      if (language !== "auto") form.append("language", language);
      const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", form, {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${OPENAI_API_KEY}` },
        timeout: 30000,
      });
      return { text: response.data.text, language: language === "auto" ? "en" : language, source: "openai" };
    } catch (err) {
      console.warn("OpenAI Whisper failed:", err.message, "— trying local service");
    }
  }

  // Option 2: Local Python Whisper service
  try {
    const form = new FormData();
    const ext = mimeType && mimeType.includes("webm") ? ".webm" : ".wav";
    form.append("file", audioBuffer, { filename: `audio${ext}`, contentType: mimeType || "audio/wav" });
    if (language !== "auto") form.append("language", language);
    const response = await axios.post(`${WHISPER_LOCAL_URL}/transcribe`, form, {
      headers: form.getHeaders(),
      timeout: 60000,
    });
    return { ...response.data, source: "local-whisper" };
  } catch {
    // Fallback: return empty transcription with warning
    console.warn("Local Whisper unavailable. Set OPENAI_API_KEY or run backend/python/whisper_server.py");
    return { text: "[Transcription service unavailable — set OPENAI_API_KEY or run local Whisper]", language: "en", source: "fallback" };
  }
}

module.exports = { transcribe };
