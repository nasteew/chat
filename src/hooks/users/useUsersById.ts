import { useEffect, useState } from 'react';
import { userApi } from '@/api/userApi';
import type { User } from '@/types/auth';

export function useUsersByIds(ids: string[]) {
  const [users, setUsers] = useState<Record<string, User | null>>({});

  useEffect(() => {
    if (!ids.length) return;

    const controller = new AbortController();

    Promise.all(
      ids.map((id) =>
        userApi
          .getUserById(id, controller.signal)
          .then((u) => ({ id, user: u }))
          .catch(() => ({ id, user: null }))
      )
    ).then((results) => {
      const map: Record<string, User | null> = {};
      results.forEach((r) => (map[r.id] = r.user));
      setUsers(map);
    });

    return () => controller.abort();
  }, [ids]);

  return users;
}
