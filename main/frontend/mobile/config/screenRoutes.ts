/**
 * Mobile版本路由映射配置
 * 定义所有Screen组件的路由映射关系
 * Phase 5优化: 使用React.lazy实现代码分割和懒加载
 */

import React, { lazy } from 'react';
import { GameState } from '../../types';

// 使用React.lazy实现代码分割和懒加载
// 注意：使用实际导出的组件名称，并处理可能的错误
const MobileProfileSetupScreen = lazy(() => import('../screens/MobileProfileSetupScreen').then(m => ({ default: m.MobileProfileSetupScreen })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileProfileSetupScreen:', err);
  throw err;
}));
const MobileEntryPointScreen = lazy(() => import('../screens/MobileEntryPointScreen').then(m => ({ default: m.MobileEntryPointScreen })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileEntryPointScreen:', err);
  throw err;
}));
const MobileRealWorldScreen = lazy(() => import('../screens/MobileRealWorldScreen').then(m => ({ default: m.MobileRealWorld })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileRealWorldScreen:', err);
  throw err;
}));
const MobileSceneSelectionScreen = lazy(() => import('../screens/MobileSceneSelectionScreen').then(m => ({ default: m.MobileSceneSelection })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileSceneSelectionScreen:', err);
  throw err;
}));
const MobileCharacterSelectionScreen = lazy(() => import('../screens/MobileCharacterSelectionScreen').then(m => ({ default: m.MobileCharacterSelection })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileCharacterSelectionScreen:', err);
  throw err;
}));
const MobileChatWindowScreen = lazy(() => 
  import('../screens/MobileChatWindowScreen').then(module => {
    if (module.MobileChatWindowScreen) {
      return { default: module.MobileChatWindowScreen };
    }
    throw new Error('MobileChatWindowScreen not found in module');
  }).catch(err => {
    console.error('[screenRoutes] Failed to load MobileChatWindowScreen:', err);
    throw err;
  })
);
const MobileScenarioBuilderScreen = lazy(() => import('../screens/MobileScenarioBuilderScreen').then(m => ({ default: m.MobileScenarioBuilder })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileScenarioBuilderScreen:', err);
  throw err;
}));
const MobileConnectionSpaceScreen = lazy(() => import('../screens/MobileConnectionSpaceScreen').then(m => ({ default: m.MobileConnectionSpaceScreen })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileConnectionSpaceScreen:', err);
  throw err;
}));
const MobileProfileScreen = lazy(() => import('../screens/MobileProfileScreen').then(m => ({ default: m.MobileProfile })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileProfileScreen:', err);
  throw err;
}));
const MobileSharedHeartSphereScreen = lazy(() => import('../screens/MobileSharedHeartSphereScreen').then(m => ({ default: m.MobileSharedHeartSphereScreen })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileSharedHeartSphereScreen:', err);
  throw err;
}));
const MobileSharedCharacterSelectionScreen = lazy(() => import('../screens/MobileSharedCharacterSelectionScreen').then(m => ({ default: m.MobileSharedCharacterSelectionScreen })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileSharedCharacterSelectionScreen:', err);
  throw err;
}));
const MobileSharedChatWindowScreen = lazy(() => import('../screens/MobileSharedChatWindowScreen').then(m => ({ default: m.MobileSharedChatWindowScreen })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileSharedChatWindowScreen:', err);
  throw err;
}));
const MobileMailboxScreen = lazy(() => import('../screens/MobileMailboxScreen').then(m => ({ default: m.MobileMailboxScreen })).catch(err => {
  console.error('[screenRoutes] Failed to load MobileMailboxScreen:', err);
  throw err;
}));

/**
 * Screen组件Props基础接口
 */
export interface MobileScreenPropsBase {
  gameState: GameState;
  dispatch: (action: any) => void;
}

/**
 * 路由映射表
 * 将currentScreen值映射到对应的Screen组件
 */
export const SCREEN_ROUTES: Record<
  GameState['currentScreen'],
  React.ComponentType<any> | null
> = {
  'profileSetup': MobileProfileSetupScreen,
  'entryPoint': MobileEntryPointScreen,
  'realWorld': MobileRealWorldScreen,
  'sceneSelection': MobileSceneSelectionScreen,
  'characterSelection': MobileCharacterSelectionScreen,
  'chat': MobileChatWindowScreen,
  'builder': MobileScenarioBuilderScreen,
  'connectionSpace': MobileConnectionSpaceScreen,
  'mobileProfile': MobileProfileScreen,
  'profile': MobileProfileScreen, // 兼容PC版本的profile
  'sharedHeartSphere': MobileSharedHeartSphereScreen,
  'sharedCharacterSelection': MobileSharedCharacterSelectionScreen,
  'sharedChat': MobileSharedChatWindowScreen,
  'mailbox': MobileMailboxScreen,
  'admin': null, // Mobile版本不支持admin，返回null
};

/**
 * 获取当前Screen组件
 */
export const getScreenComponent = (
  screen: GameState['currentScreen']
): React.ComponentType<any> | null => {
  return SCREEN_ROUTES[screen] || null;
};

/**
 * 检查Screen是否有效
 */
export const isValidScreen = (screen: GameState['currentScreen']): boolean => {
  return SCREEN_ROUTES[screen] !== null;
};
