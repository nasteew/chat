import { Outlet, useLocation } from 'react-router-dom';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { pathname } = useLocation();
  const isChatRoute =
    pathname === '/' || pathname === '/chat' || pathname.startsWith('/chat/');

  return (
    <div className={`${styles.layout} ${isChatRoute ? styles.layoutChat : ''}`}>
      <Outlet />
    </div>
  );
}
