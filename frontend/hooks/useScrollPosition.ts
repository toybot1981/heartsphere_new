import { useEffect, useRef } from 'react';

/**
 * 自定义hook，用于保存和恢复页面滚动位置
 * @param pageKey 页面标识符，用于区分不同页面（如'characterSelection:sceneId'）
 * @param scrollPosition 保存的滚动位置
 * @param onScrollPositionChange 当滚动位置改变时的回调
 * @param enabled 是否启用滚动位置保存（默认true）
 */
export const useScrollPosition = (
  pageKey: string,
  scrollPosition: number | undefined,
  onScrollPositionChange: (key: string, position: number) => void,
  enabled: boolean = true
) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);

  // 恢复滚动位置
  useEffect(() => {
    if (!enabled || !scrollContainerRef.current || scrollPosition === undefined || scrollPosition === 0) {
      return;
    }

    // 使用requestAnimationFrame确保DOM已渲染
    const timeoutId = setTimeout(() => {
      if (scrollContainerRef.current && scrollPosition !== undefined) {
        isRestoringRef.current = true;
        scrollContainerRef.current.scrollTop = scrollPosition;
        // 重置标志，允许后续滚动事件
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pageKey, enabled]); // 只在pageKey改变时恢复

  // 保存滚动位置
  useEffect(() => {
    if (!enabled || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const handleScroll = () => {
      // 如果正在恢复滚动位置，不保存
      if (isRestoringRef.current) {
        return;
      }
      onScrollPositionChange(pageKey, container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [pageKey, enabled, onScrollPositionChange]);

  return scrollContainerRef;
};


