import { API_CONFIG } from '../config/apiConfig';

export interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

/**
 * Translation Service
 * Handles real-time text translation
 */
class TranslateService {
  private translationCache: Map<string, string> = new Map();

  /**
   * Translate text to target language
   */
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<Translation> {
    const cacheKey = `${text}-${sourceLanguage}-${targetLanguage}`;
    
    // Check cache first
    if (this.translationCache.has(cacheKey)) {
      return {
        id: `trans-${Date.now()}`,
        originalText: text,
        translatedText: this.translationCache.get(cacheKey)!,
        sourceLanguage,
        targetLanguage,
        timestamp: Date.now(),
      };
    }

    // Use mock translation for demo
    const translated = await this.mockTranslate(text, sourceLanguage, targetLanguage);
    this.translationCache.set(cacheKey, translated);

    return {
      id: `trans-${Date.now()}`,
      originalText: text,
      translatedText: translated,
      sourceLanguage,
      targetLanguage,
      timestamp: Date.now(),
    };
  }

  /**
   * Mock translation for demo purposes
   */
  private async mockTranslate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock translations
    const translations: Record<string, Record<string, string>> = {
      'Welcome to today\'s lecture on Machine Learning fundamentals.': {
        ta: 'இன்றைய இயந்திர கற்றல் அடிப்படைகள் பற்றிய விரிவுரைக்கு வரவேற்கிறேன்.',
        hi: 'मशीन लर्निंग की बुनियादी बातों पर आज के व्याख्यान में आपका स्वागत है।',
        es: 'Bienvenido a la conferencia de hoy sobre los fundamentos del Aprendizaje Automático.',
      },
      'We will explore supervised learning algorithms including linear regression.': {
        ta: 'நேரியல் பின்னடைவு உள்ளிட்ட மேற்பார்வையிடப்பட்ட கற்றல் வழிமுறைகளை ஆராய்வோம்.',
        hi: 'हम रैखिक प्रतिगमन सहित पर्यवेक्षित शिक्षण एल्गोरिदम का अन्वेषण करेंगे।',
        es: 'Exploraremos algoritmos de aprendizaje supervisado, incluida la regresión lineal.',
      },
      'Neural networks form the backbone of modern deep learning systems.': {
        ta: 'நரம்பியல் வலையமைப்புகள் நவீன ஆழ்ந்த கற்றல் அமைப்புகளின் முதுகெலும்பை உருவாக்குகின்றன.',
        hi: 'तंत्रिका नेटवर्क आधुनिक गहन शिक्षण प्रणालियों की रीढ़ बनाते हैं।',
        es: 'Las redes neuronales forman la columna vertebral de los sistemas modernos de aprendizaje profundo.',
      },
    };

    const translationMap = translations[text];
    if (translationMap && translationMap[targetLanguage]) {
      return translationMap[targetLanguage];
    }

    // Fallback: indicate translation
    return `[${targetLanguage.toUpperCase()}] ${text}`;
  }

  /**
   * Real API call (stub)
   */
  async translateWithAPI(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    if (!API_CONFIG.translateKey) {
      throw new Error('Translation API key not configured');
    }

    // In production, call real translation API
    const response = await fetch(`${API_CONFIG.translateEndpoint}?key=${API_CONFIG.translateKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text',
      }),
    });

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<Translation[]> {
    return Promise.all(
      texts.map(text => this.translate(text, sourceLanguage, targetLanguage))
    );
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.translationCache.clear();
  }
}

export const translateService = new TranslateService();
