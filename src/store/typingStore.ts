import { create } from 'zustand';

interface TypingUser {
  userId: string;
  chatId: string;
  timestamp: number;
}

interface TypingStore {
  typingUsers: TypingUser[];
  revision: number;
  setTyping: (userId: string, chatId: string) => void;
  clearTyping: (userId: string, chatId: string) => void;
  getChatTypingUsers: (chatId: string) => TypingUser[];
  cleanup: () => void;
}

const TYPING_TTL_MS = 5000;

export const useTypingStore = create<TypingStore>((set, get) => ({
  typingUsers: [],
  revision: 0,

  setTyping: (userId, chatId) => {
    const uid = String(userId);
    const cid = String(chatId);
    const now = Date.now();

    set((state) => {
      const idx = state.typingUsers.findIndex(
        (u) => u.userId === uid && u.chatId === cid
      );

      const typingUsers =
        idx === -1
          ? [...state.typingUsers, { userId: uid, chatId: cid, timestamp: now }]
          : state.typingUsers.map((u, i) =>
              i === idx ? { ...u, timestamp: now } : u
            );

      return { typingUsers, revision: state.revision + 1 };
    });
  },

  clearTyping: (userId, chatId) => {
    const uid = String(userId);
    const cid = String(chatId);

    set((state) => {
      const typingUsers = state.typingUsers.filter(
        (u) => !(u.userId === uid && u.chatId === cid)
      );

      if (typingUsers.length === state.typingUsers.length) {
        return state;
      }

      return { typingUsers, revision: state.revision + 1 };
    });
  },

  getChatTypingUsers: (chatId) => {
    const cid = String(chatId);
    const now = Date.now();
    return get().typingUsers.filter(
      (u) => u.chatId === cid && now - u.timestamp < TYPING_TTL_MS
    );
  },

  cleanup: () => {
    const now = Date.now();
    set((state) => {
      const typingUsers = state.typingUsers.filter(
        (u) => now - u.timestamp < TYPING_TTL_MS
      );

      if (typingUsers.length === state.typingUsers.length) {
        return state;
      }

      return { typingUsers, revision: state.revision + 1 };
    });
  },
}));
