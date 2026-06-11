import styles from './Avatar.module.css';

type AvatarProps = {
  url?: string | null;
  fallback?: string;
  isOnline?: boolean;
  size?: number;
};

export function Avatar({ url, fallback, isOnline, size = 44 }: AvatarProps) {
  return (
    <div className={styles.avatarWrapper} style={{ width: size, height: size }}>
      <div className={styles.avatar}>
        {url ? (
          <img src={url} alt="avatar" style={{ width: size, height: size }} />
        ) : fallback ? (
          fallback.charAt(0).toUpperCase()
        ) : null}
      </div>

      {isOnline && <span className={styles.onlineIndicator} />}
    </div>
  );
}
