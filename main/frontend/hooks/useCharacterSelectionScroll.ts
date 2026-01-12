/**
 * 角色选择页面滚动位置管理 Hook
 * 处理滚动位置的保存和恢复
 */

import { useRef, useEffect } from 'react';
import { GameState } from '../types';

interface UseCharacterSelectionScrollProps {
  gameState: GameState;
  handleScrollPositionChange: (pageKey: string, position: number) => void;
}

export const useCharacterSelectionScroll = ({
  gameState,
  handleScrollPositionChange,
}: UseCharacterSelectionScrollProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRestoringScrollRef = useRef(false);
  
  // 处理场景详情页面滚动位置恢复
  useEffect(() => {
    if (gameState.currentScreen === 'characterSelection' && gameState.selectedSceneId) {
      const scrollPageKey = `characterSelection:${gameState.selectedSceneId}`;
      const savedScrollPosition = gameState.pageScrollPositions[scrollPageKey] || 0;
      const container = scrollRef.current;
      
      // 恢复滚动位置 - 使用双重requestAnimationFrame确保在浏览器完成布局后执行
      if (container && savedScrollPosition > 0) {
        isRestoringScrollRef.current = true;
        
        // 立即设置滚动位置，避免先显示顶部
        container.scrollTop = savedScrollPosition;
        
        // 使用双重requestAnimationFrame确保在浏览器完成布局和绘制后再次确认
        const rafId1 = requestAnimationFrame(() => {
          const rafId2 = requestAnimationFrame(() => {
            if (container) {
              // 再次确认滚动位置，确保准确性
              container.scrollTop = savedScrollPosition;
            }
            // 稍长延迟后允许滚动事件触发保存，确保滚动完成
            setTimeout(() => {
              isRestoringScrollRef.current = false;
            }, 200);
          });
          return () => cancelAnimationFrame(rafId2);
        });
        
        return () => {
          cancelAnimationFrame(rafId1);
          isRestoringScrollRef.current = false;
        };
      } else {
        isRestoringScrollRef.current = false;
      }
    }
  }, [gameState.currentScreen, gameState.selectedSceneId, gameState.pageScrollPositions]); // 只在页面切换时恢复
  
  // 保存场景详情页面滚动位置
  useEffect(() => {
    if (gameState.currentScreen === 'characterSelection' && gameState.selectedSceneId) {
      const scrollPageKey = `characterSelection:${gameState.selectedSceneId}`;
      const container = scrollRef.current;
      if (!container) return;
      
      const handleScroll = () => {
        // 如果正在恢复滚动位置，不保存
        if (isRestoringScrollRef.current) {
          return;
        }
        handleScrollPositionChange(scrollPageKey, container.scrollTop);
      };
      
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [gameState.currentScreen, gameState.selectedSceneId, handleScrollPositionChange]);

  return {
    scrollRef,
  };
};




