import { useState } from 'react';

import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (
    username: string,
    display_name: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authApi.register(
        username,
        display_name,
        email,
        password
      );

      setAuth(data.accessToken, data.user);

      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration error');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
  };
}
