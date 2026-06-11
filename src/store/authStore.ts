import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuth: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  accessToken: null,
  isAuth: false,

  setAuth: (token, user) => {
    set({ accessToken: token, user, isAuth: true });
  },

  logout: () => {
    set({ user: null, accessToken: null, isAuth: false });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
