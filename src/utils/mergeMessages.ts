import type { Message } from '@/types/message';

function messageKeys(msg: Message): string[] {
  const keys = [msg.id];
  if (msg.clientId) keys.push(msg.clientId);
  return keys;
}

/** Merge API history with in-flight / WS messages without losing newer items. */
export function mergeMessagesWithApi(
  apiMessages: Message[],
  existingMessages: Message[]
): Message[] {
  const apiIds = new Set(apiMessages.flatMap((m) => messageKeys(m)));

  const preserved = existingMessages.filter((m) => {
    if (m.status === 'pending' || m.status === 'failed') return true;

    const keys = messageKeys(m);
    return keys.every((k) => !apiIds.has(k));
  });

  const merged = [...apiMessages, ...preserved].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );

  return merged;
}
