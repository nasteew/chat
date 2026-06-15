import { useEffect, useRef, useCallback } from 'react';
import { messagesApi, type ApiMessage } from '@/api/messagesApi';
import { useChatStore } from '@/store/chatStore';
import { socketService } from '@/api/socket';
import { useAuthStore } from '@/store/authStore';
import type { MessageStatus } from '@/types/message';

export function useMessages(chatId: string) {
  const { user } = useAuthStore();

  const messages = useChatStore((s) => s.messages);
  const setMessages = useChatStore((s) => s.setMessages);
  const setLastRead = useChatStore((s) => s.setLastRead);
  const addMessage = useChatStore((s) => s.addMessage);
  const clearChat = useChatStore((s) => s.clearChat);

  const userIdRef = useRef<string | undefined>(user?.id);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // Очистка чата при смене
  useEffect(() => {
    clearChat();
  }, [chatId]);

  // Загрузка сообщений
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    messagesApi
      .getMessages(chatId, signal)
      .then((result) => {
        if (signal.aborted) return;

        const mapped = result.messages.map((m: ApiMessage) => {
          const isMine = m.sender_id === userIdRef.current;

          const status: MessageStatus | undefined = isMine
            ? m.is_read
              ? 'read'
              : 'sent'
            : undefined;

          return {
            id: m.id,
            chatId: m.chat_id,
            userId: m.sender_id,
            content: m.content,
            created_at: m.created_at,
            isEdited: Boolean(m.is_edited),
            isDeleted: Boolean(m.is_deleted),
            isRead: m.is_read,
            status,
          };
        });

        setMessages(mapped);

        if (result.lastReadMessageId) {
          setLastRead(result.lastReadMessageId);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // ← игнорируем
        console.error(err);
      });

    return () => controller.abort();
  }, [chatId, setMessages, setLastRead]);

  // CHAT_OPEN отправляется из ChatPage при смене чата

  // Отправка сообщения
  const send = useCallback(
    (content: string) => {
      const uid = userIdRef.current;
      if (!uid) return;

      const tempId = crypto.randomUUID();

      addMessage({
        id: tempId,
        clientId: tempId,
        chatId,
        userId: uid,
        content,
        created_at: new Date().toISOString(),
        status: 'pending',
      });

      socketService.send({
        type: 'MSG_SEND',
        payload: {
          chat_id: chatId,
          content,
          temp_id: tempId,
        },
      });
    },
    [chatId, addMessage]
  );

  return { messages, send };
}
