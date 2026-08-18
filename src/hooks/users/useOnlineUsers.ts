import { useOnlineStore } from '@/store/onlineStore';

/** Online users are updated centrally in useSocket — no raw WS listeners here. */
export function useOnlineUsers() {
  return useOnlineStore((s) => s.onlineUsers);
}
