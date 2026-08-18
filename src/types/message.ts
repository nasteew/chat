import type { User } from './auth';

export type MessageStatus = 'pending' | 'sent' | 'read' | 'failed';

export interface Message {
  id: string;
  clientId?: string;
  chatId: string;
  userId: string;
  content: string;
  created_at: string;
  updated_at?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  isPending?: boolean;
  status?: MessageStatus;
  isRead?: boolean;
}

export interface ChatStore {
  messages: Message[];
  lastReadMessageId: string | null;
  unreadCount: number;
  otherUser: User | null;
  setOtherUser: (user: User | null) => void;

  activeChatId: string | null;
  setActiveChatId: (id: string) => void;

  setMessages: (msgs: Message[]) => void;
  mergeMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
  markAsRead: (messageId: string) => void;
  setLastRead: (messageId: string) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  replaceMessage: (tempId: string, realMsg: Message) => void;
  hasMessage: (id: string) => boolean;

  clearChat: () => void;
}
