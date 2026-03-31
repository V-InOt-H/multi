import { API_CONFIG } from '../config/apiConfig';

export interface Summary {
  id: string;
  text: string;
  keyPoints: string[];
  keywords: string[];
  formulas: string[];
  timestamp: number;
  wordCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

/**
 * Summary Service
 * Handles AI-powered text summarization and content extraction
 */
class SummaryService {
  /**
   * Generate summary from transcript segments
   */
  async generateSummary(transcripts: string[]): Promise<Summary> {
    // Mock summary generation
    const fullText = transcripts.join(' ');
    
    return {
      id: `summary-${Date.now()}`,
      text: this.mockSummarize(fullText),
      keyPoints: this.extractKeyPoints(transcripts),
      keywords: this.extractKeywords(fullText),
      formulas: this.extractFormulas(fullText),
      timestamp: Date.now(),
      wordCount: fullText.split(' ').length,
    };
  }

  /**
   * Mock summarization
   */
  private mockSummarize(text: string): string {
    return `This lecture covers the fundamentals of Machine Learning, focusing on supervised learning algorithms such as linear regression and neural networks. The session explores the mathematical foundations, including gradient descent optimization and backpropagation techniques. Key concepts discussed include model training, feature engineering, and the practical applications of deep learning in modern AI systems.`;
  }

  /**
   * Extract key points
   */
  private extractKeyPoints(transcripts: string[]): string[] {
    return [
      'Introduction to Machine Learning fundamentals',
      'Supervised learning algorithms and linear regression',
      'Neural networks as the foundation of deep learning',
      'Gradient descent optimization technique',
      'Backpropagation and mathematical principles',
      'Practical applications in modern AI systems',
    ];
  }

  /**
   * Extract keywords
   */
  private extractKeywords(text: string): string[] {
    const commonKeywords = [
      'Machine Learning',
      'Neural Networks',
      'Supervised Learning',
      'Linear Regression',
      'Gradient Descent',
      'Backpropagation',
      'Deep Learning',
      'Optimization',
      'Algorithm',
      'Training',
    ];

    return commonKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Extract mathematical formulas
   */
  private extractFormulas(text: string): string[] {
    // Mock formula extraction
    return [
      'y = mx + b',
      'J(θ) = 1/2m Σ(hθ(x) - y)²',
      '∂J/∂θ = (1/m) Σ(hθ(x) - y) · x',
      'θ := θ - α · ∇J(θ)',
    ];
  }

  /**
   * Generate quiz questions from content
   */
  async generateQuiz(transcripts: string[]): Promise<QuizQuestion[]> {
    return [
      {
        id: 'q1',
        question: 'What is the primary purpose of gradient descent in machine learning?',
        options: [
          'Data preprocessing',
          'Model optimization',
          'Feature selection',
          'Data visualization',
        ],
        correctAnswer: 1,
        explanation: 'Gradient descent is an optimization algorithm used to minimize the cost function by iteratively adjusting model parameters.',
        topic: 'Optimization',
      },
      {
        id: 'q2',
        question: 'Which type of learning uses labeled data for training?',
        options: [
          'Unsupervised learning',
          'Reinforcement learning',
          'Supervised learning',
          'Transfer learning',
        ],
        correctAnswer: 2,
        explanation: 'Supervised learning uses labeled training data where each example has a known output.',
        topic: 'Machine Learning Types',
      },
      {
        id: 'q3',
        question: 'What is the basic unit of a neural network?',
        options: [
          'Layer',
          'Neuron/Perceptron',
          'Weight',
          'Activation function',
        ],
        correctAnswer: 1,
        explanation: 'Neurons (or perceptrons) are the basic computational units in neural networks.',
        topic: 'Neural Networks',
      },
    ];
  }

  /**
   * Real API call to LLM (stub)
   */
  async summarizeWithLLM(text: string): Promise<string> {
    if (!API_CONFIG.llmKey) {
      throw new Error('LLM API key not configured');
    }

    // In production, call real LLM API
    const response = await fetch(API_CONFIG.llmEndpoint, {
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
            content: 'You are a helpful assistant that summarizes lecture transcripts.',
          },
          {
            role: 'user',
            content: `Please summarize the following lecture transcript:\n\n${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Generate detailed analytics
   */
  async generateAnalytics(transcripts: string[]): Promise<{
    topicsDiscussed: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration: number;
    engagementScore: number;
  }> {
    return {
      topicsDiscussed: ['Machine Learning', 'Neural Networks', 'Optimization'],
      difficultyLevel: 'intermediate',
      estimatedDuration: 45, // minutes
      engagementScore: 0.78,
    };
  }
}

export const summaryService = new SummaryService();
