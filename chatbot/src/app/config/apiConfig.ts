/**
 * API Configuration
 * Centralized configuration for all external API integrations
 */

export const API_CONFIG = {
  // Speech-to-Text
  sttKey: import.meta.env.VITE_STT_API_KEY || '',
  sttEndpoint: 'https://speech.googleapis.com/v1/speech:recognize',
  
  // Translation
  translateKey: import.meta.env.VITE_TRANSLATE_API_KEY || '',
  translateEndpoint: 'https://translation.googleapis.com/language/translate/v2',
  
  // LLM for Summarization
  llmKey: import.meta.env.VITE_LLM_API_KEY || '',
  llmEndpoint: 'https://api.openai.com/v1/chat/completions',
  
  // Text-to-Speech
  ttsKey: import.meta.env.VITE_TTS_API_KEY || '',
  ttsEndpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
  
  // Backend
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
  
  // Feature Flags
  features: {
    realTime: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
    quiz: import.meta.env.VITE_ENABLE_QUIZ === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  
  // Supported Languages
  languages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ],
};

// Validation helper
export const validateApiConfig = (): { isValid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  if (!API_CONFIG.sttKey) missing.push('STT_API_KEY');
  if (!API_CONFIG.translateKey) missing.push('TRANSLATE_API_KEY');
  if (!API_CONFIG.llmKey) missing.push('LLM_API_KEY');
  
  return {
    isValid: missing.length === 0,
    missing,
  };
};
