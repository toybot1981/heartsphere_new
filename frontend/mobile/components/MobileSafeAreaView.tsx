import React from 'react';

interface MobileSafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
  safeAreaLeft?: boolean;
  safeAreaRight?: boolean;
}

/**
 * Mobile版本安全区域容器组件
 * 自动适配iOS Safe Area，确保内容不被系统UI遮挡
 */
export const MobileSafeAreaView: React.FC<MobileSafeAreaViewProps> = ({
  children,
  className = '',
  safeAreaTop = true,
  safeAreaBottom = true,
  safeAreaLeft = true,
  safeAreaRight = true,
}) => {
  const safeAreaClasses = [
    safeAreaTop ? 'pt-[env(safe-area-inset-top)]' : '',
    safeAreaBottom ? 'pb-[env(safe-area-inset-bottom)]' : '',
    safeAreaLeft ? 'pl-[env(safe-area-inset-left)]' : '',
    safeAreaRight ? 'pr-[env(safe-area-inset-right)]' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${safeAreaClasses} ${className}`}>
      {children}
    </div>
  );
};

MobileSafeAreaView.displayName = 'MobileSafeAreaView';
