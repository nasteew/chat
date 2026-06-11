// MessageList/StatusIcon.tsx
import type { MessageStatus } from '@/types/message';
import styles from './MessageList.module.css';

export function StatusIcon({ status }: { status?: MessageStatus }) {
  if (!status) return null;

  return (
    <span className={`${styles.status} ${styles[status]}`}>
      {status === 'pending' && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" opacity="0.3" />
        </svg>
      )}
      {status === 'sent' && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {status === 'read' && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M18 6L7 17l-5-5" />
          <path d="M22 6L11 17" />
        </svg>
      )}
    </span>
  );
}
