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
  const [isMobileMode, setIsMobileMode] = useState(checkIsMobile());

  // 切换到移动端
  const handleSwitchToMobile = useCallback(async (): Promise<void> => {
    // Save PC state before switching
    await storageService.saveState({ ...gameState, lastLoginTime: Date.now() });
    setIsMobileMode(true);
  }, [gameState]);

  // 切换到PC端
  const handleSwitchToPC = useCallback((): void => {
    setIsMobileMode(false);
    // Note: GameStateProvider already handles loading, no need to reload here
    // loadGameData();
  }, []);

  // Responsive adaptation listener
  useEffect(() => {
    const handleResize = () => {
      const shouldBeMobile = checkIsMobile();
      if (shouldBeMobile !== isMobileMode) {
        // If switching FROM PC to Mobile, save PC state first
        if (!isMobileMode) {
          storageService.saveState({ ...gameStateRef.current, lastLoginTime: Date.now() });
        }
        setIsMobileMode(shouldBeMobile);
        
        // If switching FROM Mobile to PC, we need to reload data because MobileApp maintained its own state
        if (!shouldBeMobile) {
          // Delay slightly to ensure DB write finishes if MobileApp was unmounting
          // Note: GameStateProvider already handles loading, no need to reload here
          // setTimeout(() => loadGameData(), 200); 
        }
      }
    };

    // Debounce resize
    let timeoutId: any;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 300);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [isMobileMode, gameStateRef]);

  return {
    isMobileMode,
    handleSwitchToMobile,
    handleSwitchToPC,
  };
};

