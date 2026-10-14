import { getStoredToken } from './api';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.coupleId = null;
    this.reconnectTimeout = null;
    this.pingInterval = null;
    this.reconnectDelay = 1000;
    this.channel = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('pulsepath_ws_bus');
        this.channel.onmessage = (event) => {
          const data = event.data;
          if (data && data.type) {
            this.emit(data.type, data);
            this.emit('*', data);
          }
        };
      } catch (e) {}
    }
  }

  broadcastLocal(data) {
    if (this.channel && data) {
      try {
        this.channel.postMessage(data);
      } catch (e) {}
    }
  }

  connect(coupleId) {
    if (!coupleId) return;

    // Avoid duplicate connection to the same couple
    if (this.socket && this.coupleId === coupleId && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.disconnect();
    this.coupleId = coupleId;

    const token = getStoredToken();
    if (!token) return;

    let wsUrl = '';
    const explicitWs = import.meta.env.VITE_WS_URL;
    const apiUrl = import.meta.env.VITE_API_URL;

    if (explicitWs) {
      const base = explicitWs.replace(/\/$/, '');
      wsUrl = `${base}/ws/chat/${coupleId}?token=${encodeURIComponent(token)}`;
    } else if (apiUrl) {
      const wsProtocol = apiUrl.startsWith('https:') ? 'wss:' : 'ws:';
      const cleanHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      wsUrl = `${wsProtocol}//${cleanHost}/ws/chat/${coupleId}?token=${encodeURIComponent(token)}`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}/ws/chat/${coupleId}?token=${encodeURIComponent(token)}`;
    }

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectDelay = 1000;
        this.emit('connection_status', { status: 'connected' });

        // Heartbeat
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type) {
            this.emit(data.type, data);
            this.emit('*', data);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.socket.onclose = (event) => {
        this.cleanup();
        this.emit('connection_status', { status: 'disconnected', code: event.code });

        // Auto reconnect unless unauthorized
        if (event.code !== 1008 && this.coupleId) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 5000);
            this.connect(this.coupleId);
          }, this.reconnectDelay);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('WebSocket error:', err);
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }
  }

  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    this.cleanup();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.coupleId = null;
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  sendTyping(isTyping) {
    return this.send({ type: 'typing', is_typing: Boolean(isTyping) });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(event);
      }
    };
  }

  emit(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in WebSocket event listener for ${event}:`, e);
        }
      });
    }
  }
}

export const wsService = new WebSocketService();
