// MessageList/groupMessages.ts
import type { Message } from '@/types/message';

/** Стабильный ключ для React — не меняется при replace temp → server id */
export function messageStableKey(msg: Message): string {
  return msg.clientId ?? msg.id;
}

export function groupMessages(messages: Message[]) {
  const groups: { userId: string; messages: Message[] }[] = [];
  let current: { userId: string; messages: Message[] } | null = null;

  messages.forEach((msg) => {
    if (!current || current.userId !== msg.userId) {
      current = { userId: msg.userId, messages: [msg] };
      groups.push(current);
    } else {
      current.messages.push(msg);
    }
  });

  return groups;
}
