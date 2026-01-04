/**
 * 设备模式管理 Hook
 * 处理移动端和PC端的切换逻辑
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { checkIsMobile } from '../utils/deviceDetection';
import { storageService } from '../services/storage';
import { GameState } from '../types';

interface UseDeviceModeProps {
  gameState: GameState;
  gameStateRef: React.MutableRefObject<GameState>;
}

export const useDeviceMode = ({ gameState, gameStateRef }: UseDeviceModeProps) => {
  // PC版本（/）不再自动检测移动设备，始终显示PC界面
  // 移动端使用独立的 /mobile.html 页面
  // 只有在 mobile.html 页面中才应该检测移动设备
  const [isMobileMode, setIsMobileMode] = useState(false);

  // 切换到移动端 - 跳转到独立的 mobile.html 页面
  const handleSwitchToMobile = useCallback(async (): Promise<void> => {
    // Save PC state before switching
    await storageService.saveState({ ...gameState, lastLoginTime: Date.now() });
    // 跳转到独立的移动端页面
    window.location.href = '/mobile.html';
  }, [gameState]);

  // 切换到PC端
  const handleSwitchToPC = useCallback((): void => {
    setIsMobileMode(false);
    // Note: GameStateProvider already handles loading, no need to reload here
    // loadGameData();
  }, []);

  // PC版本不再自动响应窗口大小变化切换模式
  // 移动端使用独立的 /mobile.html 页面，不需要在这里处理响应式切换
  // 如果需要响应式切换，应该在 mobile.html 页面中单独处理
  // useEffect(() => {
  //   const handleResize = () => {
  //     const shouldBeMobile = checkIsMobile();
  //     if (shouldBeMobile !== isMobileMode) {
  //       // If switching FROM PC to Mobile, save PC state first
  //       if (!isMobileMode) {
  //         storageService.saveState({ ...gameStateRef.current, lastLoginTime: Date.now() });
  //       }
  //       setIsMobileMode(shouldBeMobile);
  //     }
  //   };
  //   // ... resize listener code ...
  // }, [isMobileMode, gameStateRef]);

  return {
    isMobileMode,
    handleSwitchToMobile,
    handleSwitchToPC,
  };
};




