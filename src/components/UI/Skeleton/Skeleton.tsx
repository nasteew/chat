import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius:
          typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
      }}
    />
  );
}

export function ChatListSkeleton() {
  return (
    <div className={styles.chatList}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className={styles.chatItem}>
          <Skeleton width={44} height={44} borderRadius="50%" />
          <div className={styles.chatInfo}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="80%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className={styles.messageList}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`${styles.message} ${i % 2 === 0 ? styles.right : styles.left}`}
        >
          <Skeleton
            width={i % 2 === 0 ? '50%' : '70%'}
            height={36}
            borderRadius={16}
          />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className={styles.profile}>
      <Skeleton
        width={120}
        height={120}
        borderRadius="50%"
        className={styles.avatar}
      />
      <div className={styles.form}>
        <Skeleton width="100%" height={48} />
        <Skeleton width="100%" height={48} />
        <Skeleton width="100%" height={48} />
      </div>
    </div>
  );
}
