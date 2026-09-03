import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (ev) => {
    console.error('[GLOBAL_ERROR]', ev.message, ev.filename, ev.lineno, ev.colno, ev.error);
  });
  window.addEventListener('unhandledrejection', (ev) => {
    console.error('[UNHANDLED_REJECTION]', ev.reason);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
