import { create } from 'zustand';
import type { Message, ChatStore, MessageStatus } from '@/types/message';
import type { User } from '@/types/auth';
import { mergeMessagesWithApi } from '@/utils/mergeMessages';

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  lastReadMessageId: null,
  unreadCount: 0,
  // 👇 новый блок
  otherUser: null,
  setOtherUser: (user: User | null) =>
    set({
      otherUser: user,
    }),

  activeChatId: null,
  setActiveChatId: (id: string) => set({ activeChatId: id }),

  setMessages: (msgs: Message[]) => set({ messages: msgs }),

  mergeMessages: (apiMessages: Message[]) =>
    set((state) => ({
      messages: mergeMessagesWithApi(apiMessages, state.messages),
    })),

  addMessage: (msg: Message) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  updateMessageStatus: (messageId: string, status: MessageStatus) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId || m.clientId === messageId ? { ...m, status } : m
      ),
    })),

  markAsRead: (messageId: string) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              isRead: true,
              status: 'read',
            }
          : m
      ),
    })),

  setLastRead: (messageId: string) =>
    set({
      lastReadMessageId: messageId,
    }),

  editMessage: (messageId: string, content: string) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content,
              isEdited: true,
              updated_at: new Date().toISOString(),
            }
          : m
      ),
    })),

  deleteMessage: (messageId: string) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              isDeleted: true,
              content: 'Message deleted',
            }
          : m
      ),
    })),

  replaceMessage: (tempId: string, realMsg: Message) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === tempId || m.clientId === tempId
          ? {
              ...realMsg,
              clientId: tempId,
              status: 'sent',
            }
          : m
      ),
    })),

  hasMessage: (id: string) => {
    return get().messages.some((m) => m.id === id || m.clientId === id);
  },

  clearChat: () =>
    set({
      messages: [],
      lastReadMessageId: null,
      unreadCount: 0,
      otherUser: null,
    }),
}));
