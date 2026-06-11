import { useEffect, useRef } from 'react';
import { socketService } from '@/api/socket';
import { useOnlineStore } from '@/store/onlineStore';

export function useOnlineUsers() {
  const onlineUsers = useOnlineStore((s) => s.onlineUsers);
  const setOnline = useOnlineStore((s) => s.setOnline);
  const setOffline = useOnlineStore((s) => s.setOffline);
  const isListenerAdded = useRef(false);

  useEffect(() => {
    if (isListenerAdded.current) return;
    isListenerAdded.current = true;

    const socket = socketService.getSocket();
    if (!socket) return;

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'USER_ONLINE') {
          setOnline(data.payload.userId);
        }

        if (data.type === 'USER_OFFLINE') {
          setOffline(data.payload.userId);
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    socket.addEventListener('message', handler);

    return () => {
      socket.removeEventListener('message', handler);
      isListenerAdded.current = false;
    };
  }, [setOnline, setOffline]);

  return onlineUsers;
}
