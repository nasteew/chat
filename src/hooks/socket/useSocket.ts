import { useEffect } from 'react';
import { socketService } from '@/api/socket';
import { useOnlineStore } from '@/store/onlineStore';
import { useChatStore } from '@/store/chatStore';
import { useTypingStore } from '@/store/typingStore';
import { useAuthStore } from '@/store/authStore';
import { onlineApi } from '@/api/onlineApi';
import type { MessageStatus } from '@/types/message';
import { useChatListStore } from '@/store/chatListStore';
import { clearSession } from '@/api/tokenRefresh';

export function useSocket() {
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (token) {
      socketService.reauthenticate();

      onlineApi
        .getOnlineUsers()
        .then((online) => {
          useOnlineStore.getState().setOnlineList(online);
        })
        .catch(() => {
          /* 401 → refresh в apiRequest */
        });
    } else {
      socketService.disconnect();
    }
  }, [token]);

  useEffect(() => {
    const typingCleanup = setInterval(() => {
      useTypingStore.getState().cleanup();
    }, 2000);

    const unsubscribe = socketService.subscribe((msg) => {
      const currentUserId = useAuthStore.getState().user?.id;

      switch (msg.type) {
        case 'AUTH_SUCCESS': {
          const activeChatId = useChatStore.getState().activeChatId;
          if (activeChatId) {
            socketService.send({
              type: 'CHAT_OPEN',
              payload: { chat_id: activeChatId },
            });
          }
          break;
        }

        case 'AUTH_FAILURE':
          clearSession();
          break;

        case 'MSG_ERROR': {
          const { chat_id, temp_id } = msg.payload;
          if (!temp_id) break;

          const chatStore = useChatStore.getState();
          if (String(chatStore.activeChatId) === String(chat_id)) {
            chatStore.updateMessageStatus(temp_id, 'failed');
          }
          break;
        }

        case 'USER_ONLINE':
          useOnlineStore.getState().setOnline(msg.payload.user_id);
          break;

        case 'USER_OFFLINE':
          useOnlineStore.getState().setOffline(msg.payload.user_id);
          break;

        case 'MSG_NEW': {
          const raw = msg.payload;
          const senderId = raw.sender_id;
          const chatId = String(raw.chat_id);
          const chatStore = useChatStore.getState();
          const isActiveChat = String(chatStore.activeChatId) === chatId;

          if (chatStore.hasMessage(raw.id)) return;

          const listMessage = {
            id: raw.id,
            chatId,
            userId: senderId,
            content: raw.content,
            created_at: raw.created_at,
            isRead: false,
            isEdited: false,
            isDeleted: false,
          };

          if (raw.temp_id && chatStore.hasMessage(raw.temp_id)) {
            if (isActiveChat) {
              useChatStore.getState().replaceMessage(raw.temp_id, {
                ...listMessage,
                status: 'sent',
              });
            }
          } else if (isActiveChat) {
            useChatStore.getState().addMessage(listMessage);
          }

          useChatListStore.getState().updateChatOnNewMessage(listMessage);
          break;
        }

        case 'MSG_EDITED': {
          const { chat_id, message_id, content } = msg.payload;
          const chatStore = useChatStore.getState();

          if (String(chatStore.activeChatId) === String(chat_id)) {
            chatStore.editMessage(message_id, content);
          }

          useChatListStore
            .getState()
            .updateChatOnMessageEdit(chat_id, message_id, content);
          break;
        }

        case 'MSG_DELETED': {
          const { chat_id, message_id } = msg.payload;
          const chatStore = useChatStore.getState();

          if (String(chatStore.activeChatId) === String(chat_id)) {
            chatStore.deleteMessage(message_id);
          }

          useChatListStore
            .getState()
            .updateChatOnMessageDelete(chat_id, message_id);
          break;
        }

        case 'MESSAGES_READ_ACK': {
          const { chat_id, last_read_message_id } = msg.payload;

          useChatStore.setState((state) => {
            const lastReadMsg = state.messages.find(
              (m) =>
                m.id === last_read_message_id ||
                m.clientId === last_read_message_id
            );

            if (!lastReadMsg) {
              return {};
            }

            const lastReadTime = lastReadMsg.created_at;

            const updated = state.messages.map((m) => {
              const isMine = m.userId === currentUserId;
              const isBeforeOrEqual = m.created_at <= lastReadTime;

              if (!isMine || !isBeforeOrEqual) return m;

              return {
                ...m,
                status: 'read' as MessageStatus,
                isRead: true,
              };
            });

            return { messages: updated };
          });

          useChatListStore.getState().markChatAsRead(chat_id);
          break;
        }

        case 'USER_TYPING':
          if (String(msg.payload.sender_id) !== String(currentUserId)) {
            useTypingStore
              .getState()
              .setTyping(msg.payload.sender_id, msg.payload.chat_id);
          }
          break;

        case 'USER_STOPPED_TYPING':
          if (String(msg.payload.sender_id) !== String(currentUserId)) {
            useTypingStore
              .getState()
              .clearTyping(msg.payload.sender_id, msg.payload.chat_id);
          }
          break;
      }
    });

    return () => {
      clearInterval(typingCleanup);
      unsubscribe();
    };
  }, []);
}
