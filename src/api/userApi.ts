import type { User } from '@/types/auth';

import { apiRequest, apiFormRequest } from './apiRequest';

export interface ProfileUpdateData {
  username?: string;
  display_name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  avatar_url?: string;
}

export const userApi = {
  async search(query: string, signal?: AbortSignal): Promise<User[]> {
    return apiRequest(`/users/search?query=${query}`, 'GET', undefined, signal);
  },

  async updateProfile(data: ProfileUpdateData): Promise<User> {
    return apiRequest('/users/profile', 'PUT', data);
  },

  async getProfile(): Promise<User> {
    return apiRequest('/users/me', 'GET');
  },

  async getUserById(id: string, signal?: AbortSignal): Promise<User> {
    return apiRequest(`/users/${id}`, 'GET', undefined, signal);
  },

  async uploadAvatar(file: File, signal?: AbortSignal): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiFormRequest<User>('/users/avatar', formData, 'POST', signal);
  },

  async deleteAvatar(signal?: AbortSignal): Promise<User> {
    return apiRequest('/users/avatar', 'DELETE', undefined, signal);
  },
};
