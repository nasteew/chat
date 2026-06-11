import { useMemo } from 'react';
import type { Message } from '@/types/message';

export function useNewMessagesDivider(
  messages: Message[],
  lastReadMessageId: string | null | undefined,
  me: string | undefined
) {
  return useMemo(() => {
    if (!messages.length || !lastReadMessageId || !me) return null;

    const index = messages.findIndex((m) => m.id === lastReadMessageId);

    if (index === -1) return null;

    const nextMessage = messages[index + 1];

    // показываем divider только если дальше есть чужие сообщения
    if (!nextMessage) return null;
    if (nextMessage.userId === me) return null;

    return nextMessage.id;
  }, [messages, lastReadMessageId, me]);
}
