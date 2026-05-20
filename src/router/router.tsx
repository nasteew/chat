import { createBrowserRouter } from 'react-router-dom';
import { ChatPage } from '@/pages/ChatPage/ChatPage';
import { AppLayout } from '@/layout/AppLayout';
import { AuthPage } from '@/pages/LoginPage/AuthPage';
import { AppInitializer } from '@/app/AppInitializer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppInitializer>
        <AppLayout />
      </AppInitializer>
    ),
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
      {
        path: 'login',
        element: <AuthPage />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
    ],
  },
]);
