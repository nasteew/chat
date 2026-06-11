import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  getAccessTokenExpiresAt,
  refreshAccessToken,
  clearSession,
} from '@/api/tokenRefresh';

const REFRESH_BEFORE_MS = 60_000;

export function useTokenRefresh() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuth = useAuthStore((s) => s.isAuth);

  useEffect(() => {
    if (!isAuth || !accessToken) return;

    const expiresAt = getAccessTokenExpiresAt(accessToken);
    if (!expiresAt) return;

    const delay = expiresAt - Date.now() - REFRESH_BEFORE_MS;

    const runRefresh = () => {
      refreshAccessToken().catch(() => {
        clearSession();
      });
    };

    if (delay <= 0) {
      runRefresh();
      return;
    }

    const timer = setTimeout(runRefresh, delay);

    return () => clearTimeout(timer);
  }, [accessToken, isAuth]);
}
