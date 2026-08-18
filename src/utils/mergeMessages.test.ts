import { describe, it, expect } from 'vitest';
import { mergeMessagesWithApi } from './mergeMessages';
import type { Message } from '@/types/message';

describe('mergeMessagesWithApi', () => {
  it('preserves WS messages not yet in API response', () => {
    const api: Message[] = [
      {
        id: '1',
        chatId: 'c1',
        userId: 'u1',
        content: 'hello',
        created_at: '2024-01-01T10:00:00.000Z',
      },
    ];

    const ws: Message[] = [
      {
        id: '2',
        chatId: 'c1',
        userId: 'u2',
        content: 'new via ws',
        created_at: '2024-01-01T10:01:00.000Z',
      },
    ];

    const merged = mergeMessagesWithApi(api, ws);
    expect(merged.map((m) => m.id)).toEqual(['1', '2']);
  });

  it('preserves pending optimistic messages', () => {
    const api: Message[] = [
      {
        id: '1',
        chatId: 'c1',
        userId: 'u1',
        content: 'hello',
        created_at: '2024-01-01T10:00:00.000Z',
      },
    ];

    const pending: Message[] = [
      {
        id: 'temp-1',
        clientId: 'temp-1',
        chatId: 'c1',
        userId: 'u1',
        content: 'sending',
        created_at: '2024-01-01T10:02:00.000Z',
        status: 'pending',
      },
    ];

    const merged = mergeMessagesWithApi(api, pending);
    expect(merged.map((m) => m.id)).toEqual(['1', 'temp-1']);
  });
});
