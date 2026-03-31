const axios = require("axios");

const TTS_LOCAL_URL = process.env.TTS_SERVICE_URL || "http://localhost:8003";

async function synthesize(text, language) {
  try {
    const res = await axios.post(`${TTS_LOCAL_URL}/synthesize`, { text, language }, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    return { audio: Buffer.from(res.data).toString("base64"), contentType: "audio/mp3", source: "edge-tts" };
  } catch (e) {
    console.warn("EdgeTTS service unavailable:", e.message);
    return { audio: null, source: "browser-fallback", text, language };
  }
}

module.exports = { synthesize };
