import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuth);
  if (isAuth) return <Navigate to="/" replace />;
  return <>{children}</>;
}
