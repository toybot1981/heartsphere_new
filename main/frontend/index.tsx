import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './src/index.css';
import App from './App';
import { MUIProvider } from './components/MUIProvider';
import { initPortalSystem } from './services/api/portal/init';

// 初始化传送门系统（在应用启动时）
initPortalSystem().catch(err => {
  console.error('[Main] 传送门系统初始化失败:', err);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <MUIProvider>
        <App />
      </MUIProvider>
    </HelmetProvider>
  </React.StrictMode>
);