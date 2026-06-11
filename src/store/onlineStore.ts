import { create } from 'zustand';
interface OnlineStore {
  onlineUsers: string[];
  setOnline: (id: string) => void;
  setOffline: (id: string) => void;
  setOnlineList: (ids: string[]) => void;
}

export const useOnlineStore = create<OnlineStore>((set) => ({
  onlineUsers: [],

  setOnline: (id) =>
    set((state) => ({
      onlineUsers: [...new Set([...state.onlineUsers, id])],
    })),

  setOffline: (id) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u !== id),
    })),

  setOnlineList: (ids) =>
    set({
      onlineUsers: ids,
    }),
}));
