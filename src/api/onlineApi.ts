import { apiRequest } from './apiRequest';

export const onlineApi = {
  getOnlineUsers(signal?: AbortSignal): Promise<string[]> {
    return apiRequest<{ online: string[] }>(
      '/online-users',
      'GET',
      undefined,
      signal
    ).then((res) => res.online);
  },
};
