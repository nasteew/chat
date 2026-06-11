import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from '@/hooks/chat/useMessages';
import { socketService } from '@/api/socket';

import styles from './ChatInput.module.css';

export const ChatInput = () => {
  const { id } = useParams();
  const hasChat = Boolean(id);

  const { send } = useMessages(id || '');
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (!id || !isTypingRef.current) return;

    isTypingRef.current = false;
    socketService.send({
      type: 'TYPING_STOP',
      payload: { chat_id: id },
    });
  }, [id]);

  const handleTyping = useCallback(() => {
    if (!id) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketService.send({
        type: 'TYPING_START',
        payload: { chat_id: id },
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  }, [id, stopTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping();
    };
  }, [id, stopTyping]);

  const handleSend = () => {
    if (!id) return;
    if (!text.trim()) return;

    stopTyping();
    send(text);
    setText('');
  };

  return (
    <div className={styles.inputBox}>
      <input
        className={styles.input}
        placeholder="Message..."
        value={text}
        disabled={!hasChat}
        onChange={(e) => {
          setText(e.target.value);
          if (hasChat) handleTyping();
        }}
        onKeyDown={(e) => hasChat && e.key === 'Enter' && handleSend()}
      />

      <button
        className={`${styles.send} ${text.trim() ? styles.active : ''}`}
        onClick={handleSend}
        disabled={!hasChat || !text.trim()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
};
