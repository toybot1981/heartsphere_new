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
            className="bg-slate-700/50 animate-pulse rounded-lg h-4"
            style={width ? { width } : undefined}
          />
        ))}
      </div>
    );
  }

  // 卡片骨架
  if (variant === 'card') {
    return (
      <div
        className={`bg-slate-800/50 animate-pulse rounded-xl p-4 border border-white/10 ${className}`}
        style={width || height ? { width, height } : undefined}
        role="status"
        aria-label="加载中"
      >
        <div className="space-y-3">
          <div className="bg-slate-700/50 animate-pulse rounded-lg h-6 w-3/4" />
          <div className="bg-slate-700/50 animate-pulse rounded-lg h-4 w-full" />
          <div className="bg-slate-700/50 animate-pulse rounded-lg h-4 w-5/6" />
        </div>
      </div>
    );
  }

  // 头像骨架
  if (variant === 'avatar') {
    return (
      <div
        className={`bg-slate-700/50 animate-pulse rounded-full ${className}`}
        style={width && height ? { width, height } : { width: '48px', height: '48px' }}
        role="status"
        aria-label="加载中"
      />
    );
  }

  // 图片骨架
  if (variant === 'image') {
    return (
      <div
        className={`bg-slate-700/50 animate-pulse rounded-lg ${className}`}
        style={width && height ? { width, height } : { aspectRatio: '16/9' }}
        role="status"
        aria-label="加载中"
      />
    );
  }

  // 按钮骨架
  if (variant === 'button') {
    return (
      <div
        className={`bg-slate-700/50 animate-pulse rounded-lg h-[44px] ${className}`}
        style={width ? { width } : { width: '120px' }}
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
    <div className={`relative h-48 w-full rounded-xl overflow-hidden border border-white/10 ${className}`}>
      <div className="absolute inset-0 bg-slate-700/50 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full p-5">
        <div className="bg-slate-800/50 animate-pulse rounded-lg h-6 w-2/3 mb-2" />
        <div className="bg-slate-800/50 animate-pulse rounded-lg h-4 w-full mb-1" />
        <div className="bg-slate-800/50 animate-pulse rounded-lg h-4 w-3/4" />
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
    <div className={`bg-slate-800/50 animate-pulse rounded-xl p-4 border border-white/10 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="bg-slate-700/50 animate-pulse rounded-full w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="bg-slate-700/50 animate-pulse rounded-lg h-5 w-3/4" />
          <div className="bg-slate-700/50 animate-pulse rounded-lg h-4 w-full" />
        </div>
      </div>
    </div>
  );
});

MobileListItemSkeleton.displayName = 'MobileListItemSkeleton';
