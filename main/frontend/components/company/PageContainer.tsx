import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 页面容器组件
 * 提供统一的页面布局和样式
 * 扁平化设计：浅色背景，简洁清晰
 * 优化的UX设计：统一的间距系统，响应式布局
 */
export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={className}
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {children}
      </div>
    </div>
  );
};
