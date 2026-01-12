/**
 * Screen渲染辅助函数
 * 使用路由映射表渲染对应的Screen组件
 * Phase 5优化: 支持懒加载组件的Suspense包装
 */

import React, { Suspense } from 'react';
import { GameState } from '../../types';
import { getScreenComponent, isValidScreen } from '../config/screenRoutes';
import { buildScreenProps, ScreenPropsBuilder } from './buildScreenProps';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobilePageTransition } from '../components/MobilePageTransition';

/**
 * 加载中的占位组件
 */
const ScreenLoadingFallback: React.FC = () => (
  <div className="h-full flex items-center justify-center bg-black">
    <MobileLoadingSpinner size="lg" text="加载中..." />
  </div>
);

/**
 * 渲染当前Screen组件
 * Phase 5优化: 使用Suspense包装懒加载组件
 */
export const renderCurrentScreen = (
  gameState: GameState,
  builder: ScreenPropsBuilder
): React.ReactNode => {
  const currentScreen = gameState.currentScreen;

  // ProfileSetup特殊处理（在MobileApp中单独处理，不通过路由映射）
  if (currentScreen === 'profileSetup') {
    return null; // 返回null，让MobileApp单独处理
  }

  // 检查screen是否有效
  if (!isValidScreen(currentScreen)) {
    console.warn(`[MobileApp] 无效的screen: ${currentScreen}`);
    return (
      <div className="h-full flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-2">未知的页面</p>
          <p className="text-gray-400">Screen: {currentScreen}</p>
        </div>
      </div>
    );
  }

  // 获取Screen组件
  const ScreenComponent = getScreenComponent(currentScreen);
  if (!ScreenComponent) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-2">页面未实现</p>
          <p className="text-gray-400">Screen: {currentScreen}</p>
        </div>
      </div>
    );
  }

  // 构建Props
  const screenProps = buildScreenProps(currentScreen, builder);
  if (!screenProps) {
    // 某些screen可能需要特定的前置条件（如需要userProfile）
    // 显示友好的错误提示，而不是返回null
    if (currentScreen === 'mobileProfile' || currentScreen === 'profile') {
      return (
        <div className="h-full flex items-center justify-center bg-black text-white relative">
          {/* 关闭按钮 */}
          <button
            onClick={() => builder.dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
            aria-label="返回"
            title="返回"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center p-6 max-w-sm mx-auto">
            <p className="text-xl mb-2">需要登录</p>
            <p className="text-gray-400 mb-6">请先登录或创建访客档案</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => builder.dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' })}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg text-white font-semibold"
              >
                前往登录
              </button>
              <button
                onClick={() => builder.dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold border border-white/20 transition-all"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      );
    }
    // 对于connectionSpace，如果没有userProfile，显示提示
    if (currentScreen === 'connectionSpace') {
      return (
        <div className="h-full flex items-center justify-center bg-black text-white relative">
          {/* 关闭按钮 */}
          <button
            onClick={() => builder.dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
            aria-label="返回"
            title="返回"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center p-6 max-w-sm mx-auto">
            <p className="text-xl mb-2">需要登录</p>
            <p className="text-gray-400 mb-6">请先登录以使用心域连接功能</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => builder.handlers.handleOpenLoginModal()}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg text-white font-semibold"
              >
                前往登录
              </button>
              <button
                onClick={() => builder.dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold border border-white/20 transition-all"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      );
    }
    // 对于characterSelection，如果没有currentScene，显示提示
    if (currentScreen === 'characterSelection') {
      return (
        <div className="h-full flex items-center justify-center bg-black text-white">
          <div className="text-center p-6">
            <p className="text-xl mb-2">请先选择场景</p>
            <p className="text-gray-400 mb-4">需要先选择一个场景才能选择角色</p>
            <button
              onClick={() => builder.dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg text-white font-semibold"
            >
              前往选择场景
            </button>
          </div>
        </div>
      );
    }
    // 对于其他screen，显示错误提示
    console.warn(`[MobileApp] 无法为 ${currentScreen} 构建Props，可能缺少必要数据。`);
    return (
      <MobileEmptyState
        icon="⚠️"
        title="数据加载失败"
        description="无法获取显示此页面所需的数据。"
      />
    );
  }

  // 渲染Screen组件，使用Suspense包装懒加载组件，添加页面过渡动画
  return (
    <MobilePageTransition key={currentScreen}>
      <Suspense fallback={<ScreenLoadingFallback />}>
        <ScreenComponent {...screenProps} />
      </Suspense>
    </MobilePageTransition>
  );
};
