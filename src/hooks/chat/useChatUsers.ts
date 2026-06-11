import { useState, useEffect } from 'react';
import type { Chat } from '@/api/chatApi';
import type { User } from '@/types/auth';
import { userApi } from '@/api/userApi';
import { chatNeedsUserFetch } from '@/utils/getChatOtherUser';

export const useChatUsers = (chats: Chat[], currentUserId?: string) => {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (chats.length === 0) {
      setUsers({});
      setIsLoading(false);
      return;
    }

    const chatsToFetch = chats.filter((c) =>
      chatNeedsUserFetch(c, currentUserId)
    );

    if (chatsToFetch.length === 0) {
      setIsLoading(false);
      return;
    }

    const ids = chatsToFetch.map(
      (c) =>
        c.participants.find((id) => String(id) !== String(currentUserId)) ??
        c.participants[0]
    );

    const uniqueIds = Array.from(new Set(ids));

    setIsLoading(true);

    Promise.all(uniqueIds.map((id) => userApi.getUserById(id)))
      .then((results) => {
        setUsers((prev) => {
          const map = { ...prev };
          results.forEach((u) => {
            map[u.id] = u;
          });
          return map;
        });
      })
      .finally(() => setIsLoading(false));
  }, [chats, currentUserId]);

  return { users, isLoading };
};
