import type { AuthResponse } from '@/types/auth';
import { apiRequest } from './apiRequest';

export const authApi = {
  login(email: string, password: string, signal?: AbortSignal) {
    return apiRequest<AuthResponse>(
      '/auth/login',
      'POST',
      { email, password },
      signal
    );
  },

  refresh(signal?: AbortSignal) {
    return apiRequest<AuthResponse>('/auth/refresh', 'POST', undefined, signal);
  },

  logout(signal?: AbortSignal) {
    return apiRequest<void>('/auth/logout', 'POST', undefined, signal);
  },

  register(
    username: string,
    display_name: string,
    email: string,
    password: string,
    signal?: AbortSignal
  ) {
    return apiRequest<AuthResponse>(
      '/auth/register',
      'POST',
      { username, display_name, email, password },
      signal
    );
  },
};
