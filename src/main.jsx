import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure 100dvh / dynamic viewport calculation on mobile browsers (iOS & Android)
function syncViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
syncViewportHeight();
window.addEventListener('resize', syncViewportHeight, { passive: true });
window.addEventListener('orientationchange', syncViewportHeight, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncViewportHeight, { passive: true });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
