import { authApi } from '@/api/authApi';

import { useAuthStore } from '@/store/authStore';

export function useLogout() {
  const logoutStore = useAuthStore((state) => state.logout);

  const logout = async () => {
    await authApi.logout();

    logoutStore();
  };

  return {
    logout,
  };
}
