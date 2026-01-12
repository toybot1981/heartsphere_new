import React, { useEffect } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { PageContainer } from './PageContainer';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 基础布局组件
 * 包含导航栏、页脚、页面容器
 * 确保页面可以正常滚动
 */
export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  // 确保公司官网页面可以滚动
  useEffect(() => {
    // 允许body滚动
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // 清理函数：组件卸载时恢复原样（如果需要）
    return () => {
      // 可以在这里恢复overflow: hidden，但通常不需要
      // document.body.style.overflow = 'hidden';
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navigation />
      <main className="flex-1 w-full">
        <PageContainer className={`w-full ${className}`}>
          {children}
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
};
