import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserProfilePanoramaMap } from './components/UserProfilePanoramaMap';
import { exampleUserProfileData } from './components/UserProfilePanoramaMap.example';
import './components/UserProfilePanoramaMap.css';

function PanoramaTestApp() {
  return (
    <UserProfilePanoramaMap 
      data={exampleUserProfileData}
      title="用户画像全景地图"
    />
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <PanoramaTestApp />
    </React.StrictMode>
  );
}
