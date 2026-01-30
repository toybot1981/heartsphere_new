// 用户画像全景地图演示组件
import React from 'react';
import { UserProfilePanoramaMap } from './UserProfilePanoramaMap';
import { exampleUserProfileData } from './UserProfilePanoramaMap.example';

/**
 * 用户画像全景地图演示页面
 * 使用此组件可以在应用中快速预览用户画像全景地图
 */
export const UserProfilePanoramaMapDemo: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
      <UserProfilePanoramaMap 
        data={exampleUserProfileData}
        title="用户画像全景地图"
      />
    </div>
  );
};

export default UserProfilePanoramaMapDemo;
