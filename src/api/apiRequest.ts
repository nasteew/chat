const API_URL = import.meta.env.VITE_API_URL;

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Json
): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request error');
  }

  return response.json() as Promise<T>;
}
