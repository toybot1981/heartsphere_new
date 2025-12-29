import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;  // 每个项目的高度
  containerHeight: number;  // 容器高度
  overscan?: number;  // 额外渲染的项目数量（用于平滑滚动）
}

/**
 * 虚拟滚动Hook
 * 用于优化大量列表的渲染性能
 */
export const useVirtualScroll = <T>(
  items: T[],
  options: UseVirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 计算可见范围
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  // 可见项目
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  // 总高度
  const totalHeight = items.length * itemHeight;
  
  // 偏移量
  const offsetY = startIndex * itemHeight;
  
  // 处理滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);
  
  return {
    containerRef,
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToIndex,
  };
};

