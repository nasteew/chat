import { useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useTypingStore } from '@/store/typingStore';
import { useMessageScroll } from '@/hooks/chat/useMessageScroll';
import { useMessageEdit } from '@/hooks/chat/useMessageEdit';
import { useMessageDelete } from '@/hooks/chat/useMessageDelete';
import { useContextMenu } from '@/hooks/chat/useContextMenu';
import { StatusIcon } from './StatusIcon';
import { groupMessages, messageStableKey } from './groupMessages';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './MessageList.module.css';

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MessageList = () => {
  const { id } = useParams<{ id: string }>();
  const messages = useChatStore((s) => s.messages);
  const otherUser = useChatStore((s) => s.otherUser);
  const me = useAuthStore((s) => s.user?.id);

  const typingRevision = useTypingStore((s) => s.revision);
  const typingUsers = useMemo(() => {
    if (!id) return [];
    return useTypingStore.getState().getChatTypingUsers(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revision drives updates
  }, [id, typingRevision]);

  const { containerRef, messagesEndRef, handleScroll } = useMessageScroll(
    messages,
    id ?? '',
    me,
    otherUser!
  );

  useEffect(() => {
    if (typingUsers.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [typingUsers.length, typingRevision, messagesEndRef]);

  const {
    editingId,
    editText,
    setEditText,
    start: startEdit,
    save: saveEdit,
    cancel: cancelEdit,
  } = useMessageEdit(id ?? '');

  const { remove: deleteMsg } = useMessageDelete(id ?? '');
  const {
    contextMenu,
    menuRef,
    openFromMouse,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    close: closeMenu,
  } = useContextMenu();

  const handleClick = useCallback(() => {
    handleScroll();
    closeMenu();
  }, [handleScroll, closeMenu]);

  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  const isLoading = messages.length === 0 && otherUser !== null;

  if (isLoading) {
    return (
      <div className={styles.messages}>
        <div className={styles.emptyScreen}></div>
      </div>
    );
  }

  return (
    <div className={styles.messages} ref={containerRef} onClick={handleClick}>
      {groupedMessages.map((group) => {
        const isMe = group.userId === me;

        return (
          <div key={`${group.userId}-${messageStableKey(group.messages[0])}`}>
            <div
              className={`${styles.group} ${
                isMe ? styles.groupMe : styles.groupOther
              }`}
            >
              {group.messages.map((m, i) => {
                const isFirst = i === 0;
                const isLast = i === group.messages.length - 1;

                return (
                  <div key={messageStableKey(m)} className={styles.bubbleWrap}>
                    {!isMe && (
                      <div
                        className={`${styles.avatarSlot} ${
                          !isFirst ? styles.avatarHidden : ''
                        }`}
                      >
                        <Avatar
                          url={otherUser?.avatar_url}
                          fallback={
                            otherUser?.display_name ?? otherUser?.username
                          }
                          size={28}
                        />
                      </div>
                    )}

                    <div>
                      {!isMe && isFirst && (
                        <span className={styles.sender}>
                          {otherUser?.display_name ??
                            otherUser?.username ??
                            'Unknown'}
                        </span>
                      )}

                      <div
                        className={[
                          styles.bubble,
                          isMe ? styles.me : styles.other,
                          m.isDeleted ? styles.deleted : '',
                          !isLast ? styles.middle : '',
                          isLast ? styles.lastInGroup : '',
                        ].join(' ')}
                        onContextMenu={(e) =>
                          openFromMouse(e, m.id, isMe && !m.isDeleted)
                        }
                        onTouchStart={(e) =>
                          handleTouchStart(e, m.id, isMe && !m.isDeleted)
                        }
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                      >
                        {editingId === m.id ? (
                          <div className={styles.editContainer}>
                            <input
                              className={styles.editInput}
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                            />

                            <div className={styles.editActions}>
                              <button
                                onClick={saveEdit}
                                className={styles.saveBtn}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className={styles.cancelBtn}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.text}>{m.content}</div>

                            <div className={styles.meta}>
                              <span className={styles.time}>
                                {formatTime(m.created_at)}
                              </span>

                              {m.isEdited && (
                                <span className={styles.edited}>(edited)</span>
                              )}

                              {isMe && (
                                <span className={styles.status}>
                                  <StatusIcon status={m.status} />
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {typingUsers.length > 0 && (
        <div className={styles.typingIndicator}>
          <div className={styles.avatarSlot}>
            <Avatar
              url={otherUser?.avatar_url}
              fallback={otherUser?.display_name ?? otherUser?.username}
              size={28}
            />
          </div>
          <div className={styles.typingBubble}>
            <div className={styles.typingDots}>
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {contextMenu && (
        <div
          ref={menuRef}
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const msg = messages.find((m) => m.id === contextMenu.messageId);
              if (msg) startEdit(msg.id, msg.content);
              closeMenu();
            }}
          >
            Edit
          </button>

          <button
            onClick={() => {
              deleteMsg(contextMenu.messageId);
              closeMenu();
            }}
            className={styles.deleteBtn}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
