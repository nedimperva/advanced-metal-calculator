import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import the CSS file with Tailwind directives
import App from './App';
import { registerServiceWorker } from './registerSW';

// Register service worker for PWA functionality
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);