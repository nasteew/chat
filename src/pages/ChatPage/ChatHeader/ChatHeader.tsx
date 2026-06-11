import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useChatListStore } from '@/store/chatListStore';
import { useOnlineUsers } from '@/hooks/users/useOnlineUsers';
import { useTypingStore } from '@/store/typingStore';
import { chatApi } from '@/api/chatApi';
import { Modal } from '@/components/UI';
import styles from './ChatHeader.module.css';
import { Avatar } from '@/components/Avatar/Avatar';

export const ChatHeader = () => {
  const navigate = useNavigate();
  const { id: chatId } = useParams();
  const otherUser = useChatStore((s) => s.otherUser);
  const onlineUsers = useOnlineUsers();
  const typingRevision = useTypingStore((s) => s.revision);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOtherTyping = useMemo(() => {
    if (!chatId || !otherUser) return false;
    return useTypingStore
      .getState()
      .getChatTypingUsers(chatId)
      .some((u) => String(u.userId) === String(otherUser.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typingRevision, chatId, otherUser]);

  const handleDeleteChat = async () => {
    if (!chatId) return;

    setDeleting(true);
    try {
      await chatApi.deleteChat(chatId);
      useChatListStore.getState().removeChat(chatId);
      useChatStore.getState().clearChat();
      useChatStore.getState().setActiveChatId('');
      setDeleteOpen(false);
      navigate('/chat');
      toast.success('Chat deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete chat');
    } finally {
      setDeleting(false);
    }
  };

  if (!chatId || !otherUser) return null;

  const isOnline = onlineUsers.includes(otherUser.id);

  return (
    <>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/chat')}
          aria-label="Back to chats"
        >
          <ArrowLeft size={20} />
        </button>

        <div className={styles.main}>
          <Avatar
            url={otherUser.avatar_url}
            fallback={otherUser.display_name || otherUser.username}
            isOnline={isOnline}
            size={40}
          />
          <div className={styles.info}>
            <span className={styles.name}>
              {otherUser.display_name || otherUser.username}
            </span>
            <span className={styles.status}>
              {isOtherTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => setDeleteOpen(true)}
          title="Delete chat"
          aria-label="Delete chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <Modal
        isOpen={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
      >
        <div className={styles.deleteModal}>
          <h3 className={styles.deleteTitle}>Delete chat?</h3>
          <p className={styles.deleteText}>
            All messages with @{otherUser.username} will be permanently removed.
          </p>
          <div className={styles.deleteActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleDeleteChat}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
