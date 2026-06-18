import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeDemoData } from './api/localStorageService';
import App from './App';

// TODO: Replace local demo data initialization with backend-provided data before production.
if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_DATA === 'true') {
  initializeDemoData();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
