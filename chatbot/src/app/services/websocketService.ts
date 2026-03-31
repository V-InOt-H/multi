import { API_CONFIG } from '../config/apiConfig';

export interface WebSocketMessage {
  type: 'transcript' | 'translation' | 'summary' | 'alert' | 'analytics' | 'connection';
  data: any;
  timestamp: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastHeartbeat: number;
  reconnectAttempts: number;
}

/**
 * WebSocket Service
 * Manages real-time bidirectional communication
 */
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastHeartbeat: 0,
    reconnectAttempts: 0,
  };

  /**
   * Connect to WebSocket server
   */
  connect(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${API_CONFIG.wsUrl}/session/${sessionId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.connectionStatus.isConnected = true;
          this.connectionStatus.lastHeartbeat = Date.now();
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.connectionStatus.isConnected = false;
          this.stopHeartbeat();
          this.attemptReconnect(sessionId);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connectionStatus.isConnected = false;
  }

  /**
   * Send message through WebSocket
   */
  send(type: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected. Message not sent.');
      return;
    }

    const message: WebSocketMessage = {
      type: type as any,
      data,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to message type
   */
  on(messageType: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    
    this.messageHandlers.get(messageType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(messageType)?.delete(handler);
    };
  }

  /**
   * Handle incoming message
   */
  private handleMessage(rawData: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(rawData);
      
      // Update heartbeat
      if (message.type === 'connection') {
        this.connectionStatus.lastHeartbeat = Date.now();
        return;
      }

      // Notify handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => handler(message.data));
      }

      // Notify wildcard handlers
      const wildcardHandlers = this.messageHandlers.get('*');
      if (wildcardHandlers) {
        wildcardHandlers.forEach(handler => handler(message));
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(sessionId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.connectionStatus.reconnectAttempts = this.reconnectAttempts;

    console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(sessionId).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Get connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Mock real-time simulation (for demo without backend)
   */
  simulateRealTimeUpdates(handlers: {
    onTranscript?: (data: any) => void;
    onTranslation?: (data: any) => void;
    onAlert?: (data: any) => void;
    onAnalytics?: (data: any) => void;
  }): () => void {
    const intervals: NodeJS.Timeout[] = [];

    // Simulate transcript updates
    if (handlers.onTranscript) {
      const transcriptInterval = setInterval(() => {
        handlers.onTranscript?.({
          text: 'This is a simulated real-time transcript...',
          timestamp: Date.now(),
          confidence: 0.9,
        });
      }, 5000);
      intervals.push(transcriptInterval);
    }

    // Simulate analytics updates
    if (handlers.onAnalytics) {
      const analyticsInterval = setInterval(() => {
        handlers.onAnalytics?.({
          activeStudents: Math.floor(20 + Math.random() * 10),
          confusionAlerts: Math.floor(Math.random() * 5),
          engagement: 0.7 + Math.random() * 0.2,
        });
      }, 10000);
      intervals.push(analyticsInterval);
    }

    // Return cleanup function
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }
}

export const websocketService = new WebSocketService();
