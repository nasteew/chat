import { useRef, useEffect, useCallback } from 'react';
import { socketService } from '@/api/socket';
import { useChatStore } from '@/store/chatStore';
import type { Message } from '@/types/message';
import type { User } from '@/types/auth';

function lastMessageKey(messages: Message[]): string | null {
  const last = messages[messages.length - 1];
  if (!last) return null;
  return last.clientId ?? last.id;
}

export function useMessageScroll(
  messages: Message[],
  chatId: string,
  me: string | undefined,
  otherUser: User | null
) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const prevLastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    prevCountRef.current = 0;
    prevLastKeyRef.current = null;
  }, [chatId]);

  const markAsRead = useChatStore((s) => s.markAsRead);
  const setLastRead = useChatStore((s) => s.setLastRead);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !chatId || !me || !otherUser) return;

    const container = containerRef.current;

    const isBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      10;

    if (!isBottom) return;

    const unread = messages.filter((m) => m.userId !== me && !m.isRead);

    if (!unread.length) return;

    const lastUnread = unread[unread.length - 1];

    socketService.send({
      type: 'MESSAGES_READ',
      payload: {
        chat_id: chatId,
        last_read_message_id: lastUnread.id,
      },
    });

    unread.forEach((m) => {
      markAsRead(m.id);
    });

    setLastRead(lastUnread.id);
  }, [messages, chatId, me, otherUser, markAsRead, setLastRead]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!messagesEndRef.current) return;

    const count = messages.length;
    const lastKey = lastMessageKey(messages);
    const grew = count > prevCountRef.current;
    const newLastMessage =
      lastKey !== null && lastKey !== prevLastKeyRef.current;

    prevCountRef.current = count;
    prevLastKeyRef.current = lastKey;

    if (!grew && !newLastMessage) return;

    messagesEndRef.current.scrollIntoView({
      behavior: grew ? 'smooth' : 'auto',
    });

    handleScroll();
  }, [messages, handleScroll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleScroll();
    }, 100);

    return () => clearTimeout(timer);
  }, [handleScroll]);

  return {
    containerRef,
    messagesEndRef,
    handleScroll,
  };
}
