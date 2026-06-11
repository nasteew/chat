import { useEffect, useState } from 'react';
import { userApi } from '@/api/userApi';
import type { User } from '@/types/auth';

export function useUserById(id: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    userApi
      .getUserById(id, controller.signal)
      .then(setUser)
      .catch(() => setUser(null));
    return () => controller.abort();
  }, [id]);

  return { user };
}
