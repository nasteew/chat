import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/router';

import '@/styles/global.css';
import '@/styles/variables.css';
import { Toaster } from 'react-hot-toast';

export const App = () => {
  <Toaster position="top-right" />;
  return <RouterProvider router={router} />;
};
