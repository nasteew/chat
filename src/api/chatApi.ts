import { apiRequest } from './apiRequest';

/** Превью последнего сообщения в списке чатов */
export interface ChatLastMessage {
  id: string;
  content: string;
  created_at: string;
  chatId?: string;
  userId?: string;
  isDeleted?: boolean;
}

export interface ChatParticipant {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Chat {
  id: string;
  participants: string[];
  created_at: string;
  participantDetails?: ChatParticipant[];
  lastMessage: ChatLastMessage | null;
  unreadCount: number;
}

export const chatApi = {
  getChats(signal?: AbortSignal): Promise<Chat[]> {
    return apiRequest('/chats', 'GET', undefined, signal);
  },

  getChatById(chatId: string, signal?: AbortSignal): Promise<Chat> {
    return apiRequest(`/chats/${chatId}`, 'GET', undefined, signal);
  },

  createChat(userId: string, signal?: AbortSignal): Promise<Chat> {
    return apiRequest('/chats/create', 'POST', { userId }, signal);
  },

  deleteChat(chatId: string, signal?: AbortSignal): Promise<{ ok: boolean }> {
    return apiRequest(`/chats/${chatId}/delete`, 'POST', undefined, signal);
  },
};
