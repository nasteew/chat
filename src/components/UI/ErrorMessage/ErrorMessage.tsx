import type { ReactNode } from 'react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  children: ReactNode;
}

export const ErrorMessage = ({ children }: ErrorMessageProps) => {
  if (!children) return null;

  return (
    <div className={styles.errorBox}>
      <p className={styles.text}>{children}</p>
    </div>
  );
};
