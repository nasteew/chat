import type { Chat } from '@/api/chatApi';
import type { User } from '@/types/auth';

export function getChatOtherUser(
  chat: Chat,
  currentUserId?: string,
  usersMap: Record<string, User> = {}
): User | undefined {
  const otherId =
    chat.participants.find((id) => String(id) !== String(currentUserId)) ??
    chat.participants[0];

  if (!otherId) return undefined;

  const fromDetails = chat.participantDetails?.find(
    (p) => String(p.id) === String(otherId)
  );

  if (fromDetails) {
    return {
      id: fromDetails.id,
      username: fromDetails.username,
      display_name: fromDetails.display_name,
      email: '',
      avatar_url: fromDetails.avatar_url,
    };
  }

  return usersMap[otherId];
}

export function chatNeedsUserFetch(
  chat: Chat,
  currentUserId?: string
): boolean {
  return !getChatOtherUser(chat, currentUserId);
}
