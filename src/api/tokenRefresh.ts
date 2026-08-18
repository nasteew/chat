import type { AuthResponse } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/api/socket';

const API_URL = import.meta.env.VITE_API_URL;

let refreshPromise: Promise<AuthResponse> | null = null;

/** Декодирует exp из JWT (секунды → ms). */
export function getAccessTokenExpiresAt(token: string): number | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const payload = JSON.parse(
      atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    );
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string, skewMs = 30_000): boolean {
  const exp = getAccessTokenExpiresAt(token);
  if (!exp) return false;
  return Date.now() >= exp - skewMs;
}

/**
 * Обновляет access по httpOnly refresh-cookie.
 * Параллельные вызовы схлопываются в один запрос.
 */
export async function refreshAccessToken(): Promise<AuthResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 204) {
      throw new Error('No session');
    }

    if (!response.ok) {
      const message = await response.text().catch(() => 'Refresh failed');
      throw new Error(message || 'Refresh failed');
    }

    const data = (await response.json()) as AuthResponse;

    useAuthStore.getState().setAuth(data.accessToken, data.user);
    socketService.reauthenticate();

    return data;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function ensureValidAccessToken(): Promise<string | null> {
  const { accessToken, isAuth } = useAuthStore.getState();
  if (!isAuth || !accessToken) return null;

  if (!isAccessTokenExpired(accessToken)) {
    return accessToken;
  }

  const data = await refreshAccessToken();
  return data.accessToken;
}

export function clearSession() {
  socketService.disconnect();
  useAuthStore.getState().logout();

  if (
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/login')
  ) {
    window.location.assign('/login');
  }
}
