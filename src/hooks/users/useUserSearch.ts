import { useEffect, useState } from 'react';
import { userApi } from '@/api/userApi';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/auth';

export function useUserSearch(query: string) {
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Используем хук для подписки на изменения
  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    // ✅ Очищаем при пустом запросе
    if (!query.trim()) {
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);

      userApi
        .search(query, signal)
        .then((data) => {
          if (!signal.aborted) {
            const users = Array.isArray(data) ? data : [];

            setResults(users);
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Search error:', err);
            setError(err.message || 'Search error');
            setResults([]);
          }
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, currentUserId]);

  return { results, loading, error };
}
