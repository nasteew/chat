import type { ClientWsMessage } from '@/types/clientWsMessage';
import { useAuthStore } from '../store/authStore';
import type { ServerWsMessage } from '@/types/serverWsMessage';
import { useConnectionStore } from '@/store/connectionStore';

export type WsMessage = ClientWsMessage | ServerWsMessage;

type MessageHandler = (msg: WsMessage) => void;

const HTTP_API_URL = import.meta.env.VITE_API_URL as string;

const MAX_QUEUE_SIZE = 100;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

function resolveWebSocketUrl(): string {
  const explicit = import.meta.env.VITE_WS_URL as string | undefined;
  if (explicit) return explicit;

  const base = HTTP_API_URL.replace(/\/$/, '');
  if (base.startsWith('https://')) {
    return base.replace(/^https:\/\//, 'wss://');
  }
  if (base.startsWith('http://')) {
    return base.replace(/^http:\/\//, 'ws://');
  }
  if (base.startsWith('ws://') || base.startsWith('wss://')) {
    return base;
  }

  return `ws://${base}`;
}

const WS_URL = resolveWebSocketUrl();

let socket: WebSocket | null = null;
let isConnecting = false;
let shouldReconnect = true;
let isSocketAuthed = false;
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const handlers = new Set<MessageHandler>();

const queue: WsMessage[] = [];

function setConnectionStatus(
  status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
) {
  useConnectionStore.getState().setStatus(status);
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (!shouldReconnect || !useAuthStore.getState().accessToken) {
    setConnectionStatus('disconnected');
    return;
  }

  clearReconnectTimer();
  const delay = Math.min(
    RECONNECT_BASE_MS * 2 ** reconnectAttempt,
    RECONNECT_MAX_MS
  );
  reconnectAttempt += 1;
  setConnectionStatus('reconnecting');

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    socketService.connect();
  }, delay);
}

function dispatchMessage(msg: WsMessage) {
  if (msg.type === 'AUTH_SUCCESS') {
    isSocketAuthed = true;
    reconnectAttempt = 0;
    setConnectionStatus('connected');
    flushQueue();
  }

  if (msg.type === 'AUTH_FAILURE') {
    isSocketAuthed = false;
    shouldReconnect = false;
    clearReconnectTimer();
    queue.length = 0;
    setConnectionStatus('disconnected');
  }

  handlers.forEach((h) => h(msg));
}

function flushQueue() {
  if (!socket || socket.readyState !== WebSocket.OPEN || !isSocketAuthed) {
    return;
  }

  while (queue.length) {
    const msg = queue.shift();
    if (msg) {
      socket.send(JSON.stringify(msg));
    }
  }
}

function enqueueMessage(data: WsMessage) {
  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift();
  }
  queue.push(data);
}

function sendAuth() {
  const token = useAuthStore.getState().accessToken;
  if (!token || socket?.readyState !== WebSocket.OPEN) return;

  isSocketAuthed = false;
  socket.send(
    JSON.stringify({
      type: 'AUTH',
      payload: { token },
    })
  );
}

export const socketService = {
  connect() {
    const token = useAuthStore.getState().accessToken;

    if (!token) return;

    if (socket?.readyState === WebSocket.OPEN) {
      sendAuth();
      return;
    }

    if (isConnecting) return;

    shouldReconnect = true;
    isConnecting = true;
    isSocketAuthed = false;
    setConnectionStatus('connecting');

    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      isConnecting = false;
      sendAuth();
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        dispatchMessage(msg);
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    socket.onclose = () => {
      socket = null;
      isConnecting = false;
      isSocketAuthed = false;

      if (shouldReconnect && useAuthStore.getState().accessToken) {
        scheduleReconnect();
      } else {
        setConnectionStatus('disconnected');
      }
    };

    socket.onerror = () => {
      socket?.close();
    };
  },

  reauthenticate() {
    if (socket?.readyState === WebSocket.OPEN) {
      sendAuth();
      return;
    }

    if (!isConnecting) {
      this.connect();
    }
  },

  send(data: WsMessage) {
    if (data.type === 'AUTH') {
      sendAuth();
      return;
    }

    if (socket?.readyState === WebSocket.OPEN && isSocketAuthed) {
      socket.send(JSON.stringify(data));
    } else {
      enqueueMessage(data);
      if (socket?.readyState !== WebSocket.OPEN && !isConnecting) {
        this.connect();
      }
    }
  },

  subscribe(handler: MessageHandler) {
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
    };
  },

  getSocket() {
    return socket;
  },

  isConnected() {
    return socket?.readyState === WebSocket.OPEN && isSocketAuthed;
  },

  disconnect() {
    shouldReconnect = false;
    isSocketAuthed = false;
    reconnectAttempt = 0;
    clearReconnectTimer();
    queue.length = 0;
    socket?.close();
    socket = null;
    isConnecting = false;
    setConnectionStatus('disconnected');
  },
};
