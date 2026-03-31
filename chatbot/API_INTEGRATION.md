# API Integration Guide

This document provides detailed instructions for integrating real external APIs with the EduSense application.

## Table of Contents
1. [Speech-to-Text (STT) Integration](#speech-to-text-stt-integration)
2. [Translation API Integration](#translation-api-integration)
3. [LLM for Summarization](#llm-for-summarization)
4. [WebSocket Backend](#websocket-backend)
5. [Text-to-Speech (TTS)](#text-to-speech-tts)

---

## Speech-to-Text (STT) Integration

### Recommended Services
- Google Cloud Speech-to-Text
- Azure Speech Services
- AssemblyAI
- AWS Transcribe

### Example: Google Cloud Speech-to-Text

```typescript
// In /src/app/services/sttService.ts

async transcribeAudioWithGoogle(audioBlob: Blob): Promise<TranscriptSegment> {
  const audioBytes = await this.blobToBase64(audioBlob);
  
  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${API_CONFIG.sttKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
        audio: { content: audioBytes },
      }),
    }
  );

  const data = await response.json();
  const transcript = data.results[0]?.alternatives[0]?.transcript || '';
  
  return {
    id: `segment-${Date.now()}`,
    text: transcript,
    timestamp: Date.now(),
    confidence: data.results[0]?.alternatives[0]?.confidence || 0,
    isFinal: true,
    language: 'en',
  };
}

private async blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

---

## Translation API Integration

### Recommended Services
- Google Cloud Translation API
- DeepL API
- Azure Translator
- AWS Translate

### Example: Google Cloud Translation

```typescript
// In /src/app/services/translateService.ts

async translateWithGoogleAPI(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${API_CONFIG.translateKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text',
      }),
    }
  );

  const data = await response.json();
  return data.data.translations[0].translatedText;
}
```

---

## LLM for Summarization

### Recommended Services
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- Azure OpenAI

### Example: OpenAI GPT-4

```typescript
// In /src/app/services/summaryService.ts

async summarizeWithOpenAI(transcripts: string[]): Promise<Summary> {
  const fullText = transcripts.join(' ');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.llmKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert educational assistant. Summarize the following lecture transcript and extract:
1. A comprehensive summary (2-3 paragraphs)
2. 5-8 key points
3. Important keywords
4. Any mathematical formulas mentioned

Format your response as JSON with keys: summary, keyPoints, keywords, formulas`,
        },
        {
          role: 'user',
          content: fullText,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  
  return {
    id: `summary-${Date.now()}`,
    text: content.summary,
    keyPoints: content.keyPoints,
    keywords: content.keywords,
    formulas: content.formulas,
    timestamp: Date.now(),
    wordCount: fullText.split(' ').length,
  };
}
```

---

## WebSocket Backend

### Setting Up Node.js WebSocket Server

```javascript
// backend/server.js
const WebSocket = require('ws');
const express = require('express');
const app = express();

const wss = new WebSocket.Server({ port: 5000 });

wss.on('connection', (ws, req) => {
  const sessionId = req.url.split('/').pop();
  console.log(`Client connected to session: ${sessionId}`);

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    // Broadcast to all clients in the same session
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'connection', data: { status: 'alive' } }));
    }
  }, 30000);

  ws.on('close', () => clearInterval(heartbeat));
});

console.log('WebSocket server running on ws://localhost:5000');
```

### Frontend Connection

```typescript
// In /src/app/services/websocketService.ts

// Replace mock connection with real WebSocket
connect(sessionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const wsUrl = `${API_CONFIG.wsUrl}/session/${sessionId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
      resolve();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    };
  });
}
```

---

## Text-to-Speech (TTS)

### Recommended Services
- Google Cloud Text-to-Speech
- Azure Cognitive Services Speech
- ElevenLabs
- AWS Polly

### Example: Google Cloud TTS

```typescript
// In /src/app/services/ttsService.ts

export class TTSService {
  async synthesizeSpeech(text: string, languageCode: string): Promise<Blob> {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_CONFIG.ttsKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            ssmlGender: 'NEUTRAL',
          },
          audioConfig: {
            audioEncoding: 'MP3',
          },
        }),
      }
    );

    const data = await response.json();
    const audioContent = data.audioContent;
    
    // Convert base64 to blob
    const byteCharacters = atob(audioContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'audio/mp3' });
  }

  playAudio(audioBlob: Blob): void {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  }
}

export const ttsService = new TTSService();
```

---

## Environment Setup

### Development
```env
NEXT_PUBLIC_STT_API_KEY=your_google_cloud_api_key
NEXT_PUBLIC_TRANSLATE_API_KEY=your_google_translate_key
NEXT_PUBLIC_LLM_API_KEY=your_openai_api_key
NEXT_PUBLIC_TTS_API_KEY=your_google_tts_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### Production
```env
NEXT_PUBLIC_STT_API_KEY=${STT_API_KEY}
NEXT_PUBLIC_TRANSLATE_API_KEY=${TRANSLATE_API_KEY}
NEXT_PUBLIC_LLM_API_KEY=${LLM_API_KEY}
NEXT_PUBLIC_TTS_API_KEY=${TTS_API_KEY}
NEXT_PUBLIC_API_BASE_URL=https://api.edusense.com
NEXT_PUBLIC_WS_URL=wss://api.edusense.com
```

---

## Rate Limiting & Cost Management

### Implement Rate Limiting
```typescript
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

// Usage
const sttLimiter = new RateLimiter(100, 60000); // 100 requests per minute

async function transcribe(audio: Blob) {
  if (!(await sttLimiter.checkLimit())) {
    throw new Error('Rate limit exceeded');
  }
  // Continue with transcription
}
```

---

## Error Handling

### Retry Logic
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const translation = await retryWithBackoff(() =>
  translateService.translateWithAPI(text, 'en', 'ta')
);
```

---

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use environment variables with NEXT_PUBLIC_ prefix for frontend-safe variables**
3. **Implement API key rotation**
4. **Use backend proxy for sensitive API calls**
5. **Validate and sanitize all user inputs**
6. **Implement CORS properly**
7. **Use HTTPS in production**
8. **Monitor API usage and set billing alerts**

---

## Testing

### Mock API Responses
```typescript
// For testing without real API calls
if (process.env.NODE_ENV === 'development') {
  // Use mock services
} else {
  // Use real API services
}
```

---

## Monitoring & Analytics

### Track API Usage
```typescript
class APIMonitor {
  private metrics: Map<string, number> = new Map();

  trackRequest(service: string): void {
    const count = this.metrics.get(service) || 0;
    this.metrics.set(service, count + 1);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

export const apiMonitor = new APIMonitor();
```

---

For more details, refer to the official documentation of each service provider.
