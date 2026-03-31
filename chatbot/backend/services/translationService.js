const axios = require("axios");

const TRANSLATION_LOCAL_URL = process.env.TRANSLATION_SERVICE_URL || "http://localhost:8002";
const GOOGLE_TRANSLATE_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

// Language code mappings
const FLORES_TO_GOOGLE = {
  "hin_Deva": "hi", "tam_Taml": "ta", "tel_Telu": "te",
  "ben_Beng": "bn", "kan_Knda": "kn", "mal_Mlym": "ml",
  "mar_Deva": "mr", "pan_Guru": "pa", "guj_Gujr": "gu",
  "ory_Orya": "or", "eng_Latn": "en",
};

const LANG_NAME_MAP = {
  "hindi": "hin_Deva", "tamil": "tam_Taml", "telugu": "tel_Telu",
  "bengali": "ben_Beng", "kannada": "kan_Knda", "malayalam": "mal_Mlym",
  "marathi": "mar_Deva", "punjabi": "pan_Guru", "gujarati": "guj_Gujr",
  "odia": "ory_Orya", "english": "eng_Latn",
};

function resolveCode(lang) {
  return LANG_NAME_MAP[lang.toLowerCase()] || lang;
}

async function translate(texts, srcLang, tgtLang) {
  const srcCode = resolveCode(srcLang);
  const tgtCode = resolveCode(tgtLang);

  // Option 1: Google Translate API
  if (GOOGLE_TRANSLATE_KEY) {
    try {
      const googleTgt = FLORES_TO_GOOGLE[tgtCode] || tgtCode;
      const googleSrc = FLORES_TO_GOOGLE[srcCode] || srcCode;
      const translations = await Promise.all(texts.map(async (text) => {
        const res = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`, {
          q: text, source: googleSrc, target: googleTgt, format: "text"
        });
        return res.data.data.translations[0].translatedText;
      }));
      return { translations, src_lang: srcCode, tgt_lang: tgtCode, source: "google" };
    } catch (err) {
      console.warn("Google Translate failed:", err.message);
    }
  }

  // Option 2: LibreTranslate (free, no key)
  try {
    const googleTgt = FLORES_TO_GOOGLE[tgtCode] || tgtCode.split("_")[0].toLowerCase();
    const googleSrc = FLORES_TO_GOOGLE[srcCode] || "en";
    const translations = await Promise.all(texts.map(async (text) => {
      const res = await axios.post("https://libretranslate.com/translate", {
        q: text, source: googleSrc, target: googleTgt, format: "text"
      }, { timeout: 10000 });
      return res.data.translatedText;
    }));
    return { translations, src_lang: srcCode, tgt_lang: tgtCode, source: "libretranslate" };
  } catch {
    // ignore
  }

  // Option 3: Local IndicTrans service
  try {
    const res = await axios.post(`${TRANSLATION_LOCAL_URL}/translate`, { texts, src_lang: srcCode, tgt_lang: tgtCode }, { timeout: 30000 });
    return { ...res.data, source: "local-indictrans" };
  } catch {
    console.warn("Translation services unavailable.");
    return { translations: texts.map(t => `[Translation unavailable: ${t}]`), src_lang: srcCode, tgt_lang: tgtCode, source: "fallback" };
  }
}

module.exports = { translate };
