import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import { MobileApp } from './mobile/MobileApp';
import { GameStateProvider } from './contexts/GameStateContext';
import { MobileErrorBoundary } from './mobile/components/MobileErrorBoundary';
import { MUIProvider } from './components/MUIProvider';

const MobileAppWrapper: React.FC = () => {
  const handleSwitchToPC = () => {
    // 从 mobile.html 跳转回 PC 版本的根路径
    window.location.href = '/';
  };

  return (
    <MobileErrorBoundary>
      <GameStateProvider>
        <MobileApp onSwitchToPC={handleSwitchToPC} />
      </GameStateProvider>
    </MobileErrorBoundary>
  );
};

const rootElement = document.getElementById('mobile-root');
if (!rootElement) {
  throw new Error("Could not find mobile root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MUIProvider>
    <MobileAppWrapper />
    </MUIProvider>
  </React.StrictMode>
);
