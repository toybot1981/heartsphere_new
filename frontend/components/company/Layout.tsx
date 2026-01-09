import React from 'react';
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
 */
export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <PageContainer className={`flex-1 ${className}`}>
        {children}
      </PageContainer>
      <Footer />
    </div>
  );
};
