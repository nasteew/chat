import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOnlineUsers } from '@/hooks/users/useOnlineUsers';
import { useUserSearch } from '@/hooks/users/useUserSearch';
import { useAuthStore } from '@/store/authStore';
import { useChatUsers } from '@/hooks/chat/useChatUsers';
import { getChatOtherUser, chatNeedsUserFetch } from '@/utils/getChatOtherUser';
import { ChatListSkeleton } from '@/components/UI';
import { chatApi } from '@/api/chatApi';
import { SidebarItem } from './SidebarListItem';
import styles from './Sidebar.module.css';
import { userApi } from '@/api/userApi';
import { useChatStore } from '@/store/chatStore';
import { useChatListStore, normalizeChat } from '@/store/chatListStore';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const online = useOnlineUsers();
  const chats = useChatListStore((s) => s.chats);
  const setChats = useChatListStore((s) => s.setChats);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { results, loading } = useUserSearch(searchQuery);
  const { id: activeChatId } = useParams();

  const { users, isLoading: usersLoading } = useChatUsers(chats, user?.id);

  const needsUserFetch = chats.some((c) => chatNeedsUserFetch(c, user?.id));

  const isLoading =
    chatsLoading ||
    (needsUserFetch && usersLoading) ||
    (Boolean(searchQuery) && loading);

  useEffect(() => {
    chatApi
      .getChats()
      .then(setChats)
      .finally(() => setChatsLoading(false));
  }, []);

  const handleChatClick = (chatId: string) => navigate(`/chat/${chatId}`);
  const handleProfileClick = () => navigate('/profile');

  const handleUserClick = async (userId: string) => {
    const existing = chats.find((c) => c.participants.includes(userId));
    if (existing) {
      navigate(`/chat/${existing.id}`);
      return;
    }
    const newChat = await chatApi.createChat(userId);
    setChats([...chats, normalizeChat(newChat)]);
    const u = await userApi.getUserById(userId);
    useChatStore.getState().setOtherUser(u);
    navigate(`/chat/${newChat.id}`);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>

          <input
            className={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearchQuery('')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button className={styles.settingsBtn} onClick={handleProfileClick}>
          <svg
            className={styles.settingsIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.sectionTitle}>Chats</div>

        {isLoading ? (
          <ChatListSkeleton />
        ) : searchQuery ? (
          <div className={styles.section}>
            {results.length > 0 ? (
              results.map((u) => (
                <SidebarItem
                  key={u.id}
                  type="user"
                  user={u}
                  onClick={() => handleUserClick(u.id)}
                />
              ))
            ) : (
              <div className={styles.empty}>No users found</div>
            )}
          </div>
        ) : (
          <div className={styles.section}>
            {chats.length > 0 ? (
              chats.map((c) => {
                const otherUser = getChatOtherUser(c, user?.id, users);
                const otherUserId =
                  c.participants.find((id) => id !== user?.id) ??
                  c.participants[0];

                return (
                  <SidebarItem
                    key={c.id}
                    type="chat"
                    chat={c}
                    otherUser={otherUser}
                    isOnline={online.includes(otherUserId)}
                    isActive={activeChatId === c.id}
                    onClick={() => handleChatClick(c.id)}
                  />
                );
              })
            ) : (
              <div className={styles.empty}>No chats yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
