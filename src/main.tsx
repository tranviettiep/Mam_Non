import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { pwaManager } from './utils/pwa';
import './index.css';

pwaManager.registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
