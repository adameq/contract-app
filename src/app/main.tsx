import '../index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider } from '@/shared/contexts/ThemeContext';

import { RootLayout } from './layouts/RootLayout';
import { QueryProvider } from './providers/QueryProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <RootLayout />
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>
);
