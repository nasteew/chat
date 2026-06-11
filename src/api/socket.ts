import type { ClientWsMessage } from '@/types/clientWsMessage';
import { useAuthStore } from '../store/authStore';
import type { ServerWsMessage } from '@/types/serverWsMessage';

export type WsMessage = ClientWsMessage | ServerWsMessage;

type MessageHandler = (msg: WsMessage) => void;

const HTTP_API_URL = import.meta.env.VITE_API_URL as string;

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

const handlers = new Set<MessageHandler>();

const queue: WsMessage[] = [];

function dispatchMessage(msg: WsMessage) {
  if (msg.type === 'AUTH_SUCCESS') {
    isSocketAuthed = true;
    flushQueue();
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
        setTimeout(() => {
          this.connect();
        }, 3000);
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
      queue.push(data);
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
    queue.length = 0;
    socket?.close();
    socket = null;
    isConnecting = false;
  },
};
