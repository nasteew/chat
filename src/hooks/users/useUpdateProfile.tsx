import { useState, useCallback } from 'react';
import { userApi } from '@/api/userApi';
import { useAuthStore } from '@/store/authStore';
import type { ProfileUpdateData } from '@/api/userApi';
import type { User } from '@/types/auth';

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.updateUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (
      data: ProfileUpdateData,
      callbacks?: {
        onSuccess?: (user: User) => void;
        onError?: (err: unknown) => void;
      }
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await userApi.updateProfile(data);

        // обновляем Zustand
        setUser(updated);

        callbacks?.onSuccess?.(updated);
        return updated;
      } catch (err: unknown) {
        if (err instanceof Error) {
          const message = err?.message || 'Update failed';
          setError(message);
        }
        callbacks?.onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  return {
    updateProfile,
    isLoading,
    error,
  };
}
