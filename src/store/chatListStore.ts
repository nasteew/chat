import { create } from 'zustand';
import type { Chat, ChatLastMessage } from '@/api/chatApi';
import type { Message } from '@/types/message';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

interface ChatListStore {
  chats: Chat[];
  version: number;

  setChats: (chats: Chat[]) => void;

  updateChatOnNewMessage: (msg: Message) => void;

  markChatAsRead: (chatId: string) => void;

  removeChat: (chatId: string) => void;
}

function toLastMessage(msg: Message): ChatLastMessage {
  return {
    id: msg.id,
    chatId: msg.chatId,
    userId: msg.userId,
    content: msg.content,
    isDeleted: msg.isDeleted ?? false,
    created_at: msg.created_at,
  };
}

/** Нормализует lastMessage с API (snake_case) в клиентский формат */
export function normalizeChat(chat: Chat): Chat {
  if (!chat.lastMessage) return chat;

  const raw = chat.lastMessage as ChatLastMessage & {
    chat_id?: string;
    sender_id?: string;
    is_deleted?: boolean;
  };

  return {
    ...chat,
    lastMessage: {
      id: raw.id,
      content: raw.content,
      created_at: raw.created_at,
      chatId: raw.chatId ?? raw.chat_id,
      userId: raw.userId ?? raw.sender_id,
      isDeleted: raw.isDeleted ?? raw.is_deleted ?? false,
    },
  };
}

export const useChatListStore = create<ChatListStore>((set) => ({
  chats: [],
  version: 0,

  setChats: (chats) =>
    set({ chats: chats.map(normalizeChat), version: Date.now() }),

  updateChatOnNewMessage: (msg) =>
    set((state) => {
      const chatId = String(msg.chatId);
      const idx = state.chats.findIndex((c) => String(c.id) === chatId);
      if (idx === -1) return state;

      const currentUserId = useAuthStore.getState().user?.id;
      const activeChatId = useChatStore.getState().activeChatId;
      const chat = state.chats[idx];
      const isOwn = String(msg.userId) === String(currentUserId);
      const shouldIncrement = !isOwn && String(activeChatId) !== chatId;

      const updatedChat: Chat = {
        ...chat,
        lastMessage: toLastMessage(msg),
        unreadCount: shouldIncrement
          ? (chat.unreadCount || 0) + 1
          : chat.unreadCount,
      };

      const chats = [...state.chats];
      chats.splice(idx, 1);
      chats.unshift(updatedChat);

      return { chats, version: Date.now() };
    }),

  markChatAsRead: (chatId) =>
    set((state) => {
      const normalizedId = String(chatId);
      const idx = state.chats.findIndex((c) => String(c.id) === normalizedId);
      if (idx === -1) return state;

      const chats = [...state.chats];
      chats[idx] = { ...chats[idx], unreadCount: 0 };

      return { chats, version: Date.now() };
    }),

  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((c) => String(c.id) !== String(chatId)),
      version: Date.now(),
    })),
}));
