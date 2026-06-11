import { useAuthStore } from '@/store/authStore';
import {
  refreshAccessToken,
  ensureValidAccessToken,
  clearSession,
  isAccessTokenExpired,
} from './tokenRefresh';

const API_URL = import.meta.env.VITE_API_URL;

const AUTH_SKIP_RETRY = ['/auth/login', '/auth/register', '/auth/refresh'];

function shouldRetryOn401(url: string): boolean {
  return !AUTH_SKIP_RETRY.some((path) => url.startsWith(path));
}

async function readResponseText(response: Response): Promise<string> {
  return response.text();
}

async function parseError(response: Response) {
  const text = await readResponseText(response);
  if (!text) {
    return `HTTP ${response.status}`;
  }

  try {
    const data = JSON.parse(text);
    return (
      data.error ||
      data.message ||
      data?.error?.message ||
      data?.errors?.[0]?.message ||
      text
    );
  } catch {
    return text;
  }
}

async function parseSuccessBody<T>(response: Response): Promise<T> {
  const text = await readResponseText(response);
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON response');
  }
}

async function fetchWithAuth(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body: object | undefined,
  signal: AbortSignal | undefined,
  token: string | null
): Promise<Response> {
  const options: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  };

  if (method !== 'GET' && body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return fetch(`${API_URL}${url}`, options);
}

export async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object,
  signal?: AbortSignal
): Promise<T> {
  let token = useAuthStore.getState().accessToken;

  if (token && isAccessTokenExpired(token) && shouldRetryOn401(url)) {
    try {
      const data = await refreshAccessToken();
      token = data.accessToken;
    } catch {
      clearSession();
      throw new Error('Session expired');
    }
  }

  let response = await fetchWithAuth(url, method, body, signal, token);

  if (response.status === 401 && shouldRetryOn401(url)) {
    try {
      const data = await refreshAccessToken();
      token = data.accessToken;
      response = await fetchWithAuth(url, method, body, signal, token);
    } catch {
      clearSession();
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return parseSuccessBody<T>(response);
}

async function fetchFormWithAuth(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE',
  formData: FormData,
  signal: AbortSignal | undefined,
  token: string | null
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${url}`, {
    method,
    credentials: 'include',
    headers,
    body: formData,
    signal,
  });
}

export async function apiFormRequest<T>(
  url: string,
  formData: FormData,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  signal?: AbortSignal
): Promise<T> {
  let token = useAuthStore.getState().accessToken;

  if (token && isAccessTokenExpired(token) && shouldRetryOn401(url)) {
    try {
      const data = await refreshAccessToken();
      token = data.accessToken;
    } catch {
      clearSession();
      throw new Error('Session expired');
    }
  }

  let response = await fetchFormWithAuth(url, method, formData, signal, token);

  if (response.status === 401 && shouldRetryOn401(url)) {
    try {
      const data = await refreshAccessToken();
      token = data.accessToken;
      response = await fetchFormWithAuth(url, method, formData, signal, token);
    } catch {
      clearSession();
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return parseSuccessBody<T>(response);
}

export { ensureValidAccessToken, refreshAccessToken };
