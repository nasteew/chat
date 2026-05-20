import { apiRequest } from './apiRequest';

export interface User {
  id: string;
  login: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  login(login: string, password: string) {
    return apiRequest<AuthResponse>('/auth/login', 'POST', { login, password });
  },

  refresh() {
    return apiRequest<AuthResponse>('/auth/refresh', 'POST');
  },

  logout() {
    return apiRequest<void>('/auth/logout', 'POST');
  },

  register(login: string, password: string) {
    return apiRequest<AuthResponse>('/auth/register', 'POST', {
      login,
      password,
    });
  },
};
