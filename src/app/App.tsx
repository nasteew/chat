import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/router';

import '@/styles/global.css';
import '@/styles/variables.css';
import { Toaster } from 'react-hot-toast';
import { useSocket } from '@/hooks/socket/useSocket';
import { useTokenRefresh } from '@/hooks/auth/useTokenRefresh';

export const App = () => {
  useSocket();
  useTokenRefresh();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
};
