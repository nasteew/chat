import styles from './ChatPage.module.css';

import { Sidebar } from './Sidebar/Sidebar';
import { MessageList } from './MessageList/MessageList';
import { ChatInput } from './ChatInput/ChatInput';
import { ChatHeader } from './ChatHeader/ChatHeader';

import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useOtherUser } from '@/hooks/users/useOtherUser';
import { useChatStore } from '@/store/chatStore';
import { useEffect } from 'react';
import { socketService } from '@/api/socket';

export const ChatPage = () => {
  const { id: chatId } = useParams();

  const { user } = useAuthStore();
  useOtherUser(chatId ?? '', user?.id);

  useEffect(() => {
    const id = chatId ?? '';
    useChatStore.getState().setActiveChatId(id);

    if (id) {
      socketService.send({
        type: 'CHAT_OPEN',
        payload: { chat_id: id },
      });
    }
  }, [chatId]);
  return (
    <div className={`${styles.chatWrapper} ${chatId ? styles.chatActive : ''}`}>
      <aside className={styles.sidebarPanel}>
        <Sidebar />
      </aside>

      <div className={styles.chatWindow}>
        {!chatId ? (
          <div className={styles.emptyState}>
            <h2>Choose a chat</h2>
            <p>Select a conversation from the list</p>
          </div>
        ) : (
          <>
            <ChatHeader />
            <MessageList />
            <ChatInput />
          </>
        )}
      </div>
    </div>
  );
};
