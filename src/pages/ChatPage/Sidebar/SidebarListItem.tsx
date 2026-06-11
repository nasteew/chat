// Sidebar/SidebarItem.tsx
import type { Chat } from '@/api/chatApi';
import type { User } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';
import styles from './Sidebar.module.css';
import { Avatar } from '@/components/Avatar/Avatar';

type Props =
  | {
      type: 'chat';
      chat: Chat;
      otherUser?: User;
      isOnline: boolean;
      isActive: boolean;
      onClick: () => void;
    }
  | {
      type: 'user';
      user: User;
      onClick: () => void;
    };

export const SidebarItem = (props: Props) => {
  if (props.type === 'user') {
    return <UserVariant user={props.user} onClick={props.onClick} />;
  }
  return (
    <ChatVariant
      chat={props.chat}
      otherUser={props.otherUser}
      isOnline={props.isOnline}
      isActive={props.isActive}
      onClick={props.onClick}
    />
  );
};

function UserVariant({ user, onClick }: { user: User; onClick: () => void }) {
  return (
    <div className={styles.chatItem} onClick={onClick}>
      <Avatar url={user.avatar_url} fallback={user.display_name} />
      <div className={styles.chatInfo}>
        <span className={styles.chatName}>@{user.username}</span>
      </div>
    </div>
  );
}

function ChatVariant({
  chat,
  otherUser,
  isOnline,
  isActive,
  onClick,
}: {
  chat: Chat;
  otherUser?: User;
  isOnline: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const me = useAuthStore((s) => s.user?.id);
  const last = chat.lastMessage;
  const unread = chat.unreadCount;

  const preview = last
    ? last.isDeleted
      ? 'Message deleted'
      : last.content || ''
    : 'No messages yet';

  const isUnread = unread > 0 && last?.userId !== me;

  return (
    <div
      className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <Avatar
        url={otherUser?.avatar_url}
        fallback={otherUser?.display_name ?? otherUser?.username}
        isOnline={isOnline}
      />

      <div className={styles.chatInfo}>
        <span className={styles.chatName}>
          {otherUser
            ? otherUser.display_name || `@${otherUser.username}`
            : '\u00A0'}
        </span>

        <span
          className={`${styles.chatPreview} ${
            isUnread ? styles.unreadPreview : ''
          }`}
        >
          {preview}
        </span>
      </div>

      {unread > 0 && <span className={styles.unreadBadge}>{unread}</span>}
    </div>
  );
}
