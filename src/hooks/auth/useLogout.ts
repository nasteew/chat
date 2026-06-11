import { authApi } from '@/api/authApi';
import { socketService } from '@/api/socket';
import { useAuthStore } from '@/store/authStore';
import { useChatListStore } from '@/store/chatListStore';
import { useChatStore } from '@/store/chatStore';
import { useTypingStore } from '@/store/typingStore';

export function useLogout() {
  const logoutStore = useAuthStore((state) => state.logout);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // очищаем локальное состояние даже при ошибке сети
    }

    socketService.disconnect();
    useChatListStore.getState().setChats([]);
    useChatStore.getState().clearChat();
    useTypingStore.setState({ typingUsers: [], revision: 0 });
    logoutStore();
  };

  return { logout };
}
