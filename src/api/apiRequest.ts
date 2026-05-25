import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

async function parseError(response: Response) {
  try {
    const data = await response.json();
    return (
      data.error ||
      data.message ||
      data?.error?.message ||
      data?.errors?.[0]?.message ||
      JSON.stringify(data)
    );
  } catch {
    return response.text();
  }
}

export async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const token = useAuthStore.getState().accessToken;

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

  const response = await fetch(`${API_URL}${url}`, options);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<T>;
}
