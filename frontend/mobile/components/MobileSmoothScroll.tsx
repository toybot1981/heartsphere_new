import React, { useRef, useEffect, memo } from 'react';

interface MobileSmoothScrollProps {
  children: React.ReactNode;
  className?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Mobile版本平滑滚动容器组件
 * 提供优化的滚动体验，支持平滑滚动和性能优化
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileSmoothScroll: React.FC<MobileSmoothScrollProps> = memo(({
  children,
  className = '',
  onScroll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 启用平滑滚动
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'smooth';
      // 优化滚动性能
      scrollRef.current.style.webkitOverflowScrolling = 'touch';
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`overflow-y-auto overscroll-behavior-contain ${className}`}
      onScroll={onScroll}
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
      }}
    >
      {children}
    </div>
  );
});

MobileSmoothScroll.displayName = 'MobileSmoothScroll';
