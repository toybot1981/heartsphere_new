import React, { memo } from 'react';

interface MobileSkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'image' | 'button';
  width?: string;
  height?: string;
  className?: string;
  lines?: number; // 文本骨架的行数
}

/**
 * Mobile版本骨架屏组件
 * 用于加载状态时显示占位内容，提升感知性能
 * 符合扁平化、简洁、科技感的设计风格
 */
export const MobileSkeleton: React.FC<MobileSkeletonProps> = memo(({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 1,
}) => {
  // 文本骨架
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg h-4"
            style={{
              width: width || undefined,
              backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))',
            }}
          />
        ))}
      </div>
    );
  }

  // 卡片骨架
  if (variant === 'card') {
    return (
      <div
        className={`animate-pulse rounded-xl p-4 border ${className}`}
        style={{
          width: width || undefined,
          height: height || undefined,
          backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))',
          borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
        }}
        role="status"
        aria-label="加载中"
      >
        <div className="space-y-3">
          <div 
            className="animate-pulse rounded-lg h-6 w-3/4"
            style={{ backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))' }}
          />
          <div 
            className="animate-pulse rounded-lg h-4 w-full"
            style={{ backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))' }}
          />
          <div 
            className="animate-pulse rounded-lg h-4 w-5/6"
            style={{ backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))' }}
          />
        </div>
      </div>
    );
  }

  // 头像骨架
  if (variant === 'avatar') {
    return (
      <div
        className={`animate-pulse rounded-full ${className}`}
        style={{
          width: width && height ? width : '48px',
          height: width && height ? height : '48px',
          backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))',
        }}
        role="status"
        aria-label="加载中"
      />
    );
  }

  // 图片骨架
  if (variant === 'image') {
    return (
      <div
        className={`animate-pulse rounded-lg ${className}`}
        style={{
          width: width || undefined,
          height: height || undefined,
          aspectRatio: width && height ? undefined : '16/9',
          backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))',
        }}
        role="status"
        aria-label="加载中"
      />
    );
  }

  // 按钮骨架
  if (variant === 'button') {
    return (
      <div
        className={`animate-pulse rounded-lg h-[44px] ${className}`}
        style={{
          width: width || '120px',
          backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))',
        }}
        role="status"
        aria-label="加载中"
      />
    );
  }

  return null;
});

MobileSkeleton.displayName = 'MobileSkeleton';

/**
 * 场景卡片骨架屏
 */
export const MobileSceneCardSkeleton: React.FC<{ className?: string }> = memo(({ className = '' }) => {
  return (
    <div 
      className={`relative h-48 w-full rounded-xl overflow-hidden border ${className}`}
      style={{ borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))' }}
    >
      <div 
        className="absolute inset-0 animate-pulse"
        style={{ backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))' }}
      />
      <div className="absolute bottom-0 left-0 w-full p-5">
        <div 
          className="animate-pulse rounded-lg h-6 w-2/3 mb-2"
          style={{ backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))' }}
        />
        <div 
          className="animate-pulse rounded-lg h-4 w-full mb-1"
          style={{ backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))' }}
        />
        <div 
          className="animate-pulse rounded-lg h-4 w-3/4"
          style={{ backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))' }}
        />
      </div>
    </div>
  );
});

MobileSceneCardSkeleton.displayName = 'MobileSceneCardSkeleton';

/**
 * 列表项骨架屏
 */
export const MobileListItemSkeleton: React.FC<{ className?: string }> = memo(({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse rounded-xl p-4 border ${className}`}
      style={{
        backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))',
        borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
      }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="animate-pulse rounded-full w-12 h-12 flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))' }}
        />
        <div className="flex-1 space-y-2">
          <div 
            className="animate-pulse rounded-lg h-5 w-3/4"
            style={{ backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))' }}
          />
          <div 
            className="animate-pulse rounded-lg h-4 w-full"
            style={{ backgroundColor: 'var(--bg-secondary, rgba(51, 65, 85, 0.5))' }}
          />
        </div>
      </div>
    </div>
  );
});

MobileListItemSkeleton.displayName = 'MobileListItemSkeleton';
