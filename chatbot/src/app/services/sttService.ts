import { API_CONFIG } from '../config/apiConfig';

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
  language: string;
  keywords?: string[];
}

/**
 * Speech-to-Text Service
 * Handles real-time audio transcription
 */
class STTService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private isRecording: boolean = false;

  /**
   * Start real-time transcription
   * In production, this would connect to a real STT API
   */
  async startTranscription(
    onTranscript: (segment: TranscriptSegment) => void,
    language: string = 'en'
  ): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isRecording = true;

      // Mock real-time transcription for demo purposes
      this.simulateTranscription(onTranscript, language);
    } catch (error) {
      console.error('Failed to start transcription:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  /**
   * Stop transcription
   */
  stopTranscription(): void {
    this.isRecording = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  /**
   * Simulate real-time transcription for demo
   */
  private simulateTranscription(
    onTranscript: (segment: TranscriptSegment) => void,
    language: string
  ): void {
    const mockTranscripts = {
      en: [
        'Welcome to today\'s lecture on Machine Learning fundamentals.',
        'We will explore supervised learning algorithms including linear regression.',
        'Neural networks form the backbone of modern deep learning systems.',
        'The gradient descent algorithm is used for optimization.',
        'Let\'s discuss the mathematics behind backpropagation.',
      ],
      ta: [
        'இன்றைய பாடத்திற்கு வரவேற்கிறேன், இயந்திர கற்றல் அடிப்படைகளை பற்றி.',
        'மேற்பார்வையிடப்பட்ட கற்றல் வழிமுறைகளை ஆராய்வோம்.',
        'நரம்பியல் வலையமைப்புகள் நவீன ஆழ்ந்த கற்றலின் முதுகெலும்பாகும்.',
        'சாய்வு இறக்க வழிமுறை மேம்படுத்துதலுக்கு பயன்படுத்தப்படுகிறது.',
        'பின்னோக்கு பரவலின் கணிதத்தைப் பற்றி விவாதிப்போம்.',
      ],
    };

    const transcripts = mockTranscripts[language as keyof typeof mockTranscripts] || mockTranscripts.en;
    let index = 0;

    const interval = setInterval(() => {
      if (!this.isRecording || index >= transcripts.length) {
        clearInterval(interval);
        return;
      }

      const segment: TranscriptSegment = {
        id: `segment-${Date.now()}-${index}`,
        text: transcripts[index],
        timestamp: Date.now(),
        confidence: 0.85 + Math.random() * 0.15,
        isFinal: true,
        language,
        keywords: this.extractKeywords(transcripts[index]),
      };

      onTranscript(segment);
      index++;
    }, 3000 + Math.random() * 2000);
  }

  /**
   * Extract keywords from text (simplified)
   */
  private extractKeywords(text: string): string[] {
    const keywords = ['learning', 'algorithm', 'neural', 'network', 'regression', 
                     'optimization', 'gradient', 'descent', 'backpropagation',
                     'கற்றல்', 'வழிமுறை', 'நரம்பியல்', 'வலையமைப்பு'];
    
    return keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Real API call (stub)
   */
  async transcribeAudio(audioBlob: Blob, language: string): Promise<TranscriptSegment> {
    // In production, send audio to STT API
    if (!API_CONFIG.sttKey) {
      throw new Error('STT API key not configured');
    }

    // Mock response
    return {
      id: `segment-${Date.now()}`,
      text: 'Transcribed text would appear here',
      timestamp: Date.now(),
      confidence: 0.92,
      isFinal: true,
      language,
    };
  }
}

export const sttService = new STTService();
