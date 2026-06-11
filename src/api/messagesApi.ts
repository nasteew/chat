import { apiRequest } from './apiRequest';
export interface ApiMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_edited?: boolean;
  is_deleted?: boolean;
  updated_at?: string;
  is_read?: boolean;
}

export interface GetMessagesResponse {
  messages: ApiMessage[];
  lastReadMessageId: string | null;
}

export const messagesApi = {
  async getMessages(
    chatId: string,
    signal?: AbortSignal
  ): Promise<GetMessagesResponse> {
    const data = await apiRequest<GetMessagesResponse>(
      `/messages/${chatId}`,
      'GET',
      undefined,
      signal
    );
    return data;
  },
};
