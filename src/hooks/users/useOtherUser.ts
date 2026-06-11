// hooks/chat/useOtherUser.ts
import { useEffect, useRef } from 'react';
import { chatApi } from '@/api/chatApi';
import { userApi } from '@/api/userApi';
import { useChatStore } from '@/store/chatStore';

export function useOtherUser(chatId: string, me?: string) {
  const setOtherUser = useChatStore((s) => s.setOtherUser);

  const meRef = useRef(me);
  useEffect(() => {
    meRef.current = me;
  }, [me]);

  useEffect(() => {
    if (!chatId || !meRef.current) return;

    let cancelled = false;

    async function load() {
      try {
        // 1. Получаем чат
        const chat = await chatApi.getChatById(chatId);
        if (cancelled) return;

        // 2. Находим ID собеседника
        const otherId =
          chat.participants.find((p: string) => p !== meRef.current) ??
          chat.participants[0];

        if (!otherId) {
          setOtherUser(null);
          return;
        }

        // 3. Загружаем пользователя
        const user = await userApi.getUserById(otherId);
        if (cancelled) return;

        // 4. Сохраняем в Zustand
        setOtherUser(user);
      } catch (e) {
        console.error(e);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [chatId, setOtherUser]);
}
