import { createBrowserRouter } from 'react-router-dom';
import { ChatPage } from '@/pages/ChatPage/ChatPage';
import { AppLayout } from '@/layout/AppLayout';
import { AuthPage } from '@/pages/LoginPage/AuthPage';
import { AppInitializer } from '@/app/AppInitializer';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';

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
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        ),
      },
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat/:id',
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
