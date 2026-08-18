import { useEffect, useRef, useCallback } from 'react';
import { messagesApi, type ApiMessage } from '@/api/messagesApi';
import { useChatStore } from '@/store/chatStore';
import { socketService } from '@/api/socket';
import { useAuthStore } from '@/store/authStore';
import type { MessageStatus } from '@/types/message';

const PENDING_TIMEOUT_MS = 30_000;

export function useMessages(chatId: string) {
  const { user } = useAuthStore();

  const messages = useChatStore((s) => s.messages);
  const mergeMessages = useChatStore((s) => s.mergeMessages);
  const setLastRead = useChatStore((s) => s.setLastRead);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessageStatus = useChatStore((s) => s.updateMessageStatus);
  const clearChat = useChatStore((s) => s.clearChat);

  const userIdRef = useRef<string | undefined>(user?.id);
  const pendingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    clearChat();
  }, [chatId, clearChat]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    messagesApi
      .getMessages(chatId, signal)
      .then((result) => {
        if (signal.aborted) return;

        const activeChatId = useChatStore.getState().activeChatId;
        if (String(activeChatId) !== String(chatId)) return;

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

        mergeMessages(mapped);

        if (result.lastReadMessageId) {
          setLastRead(result.lastReadMessageId);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  }, [chatId, mergeMessages, setLastRead]);

  useEffect(() => {
    const timers = pendingTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [chatId]);

  const clearPendingTimer = useCallback((tempId: string) => {
    const timer = pendingTimersRef.current.get(tempId);
    if (timer) {
      clearTimeout(timer);
      pendingTimersRef.current.delete(tempId);
    }
  }, []);

  const schedulePendingTimeout = useCallback(
    (tempId: string) => {
      clearPendingTimer(tempId);

      const timer = setTimeout(() => {
        pendingTimersRef.current.delete(tempId);
        const msg = useChatStore
          .getState()
          .messages.find((m) => m.id === tempId || m.clientId === tempId);

        if (msg?.status === 'pending') {
          updateMessageStatus(tempId, 'failed');
        }
      }, PENDING_TIMEOUT_MS);

      pendingTimersRef.current.set(tempId, timer);
    },
    [clearPendingTimer, updateMessageStatus]
  );

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

      schedulePendingTimeout(tempId);

      socketService.send({
        type: 'MSG_SEND',
        payload: {
          chat_id: chatId,
          content,
          temp_id: tempId,
        },
      });
    },
    [chatId, addMessage, schedulePendingTimeout]
  );

  return { messages, send };
}
