import { useEffect, useState } from 'react';
import { refreshAccessToken } from '@/api/tokenRefresh';
import { useAuthStore } from '@/store/authStore';
import { Loader } from '@/components/Loader/Loader';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [ready, setReady] = useState(false);

  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await refreshAccessToken();
      } catch {
        if (mounted) {
          logout();
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [logout]);

  if (!ready) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
