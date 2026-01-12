import React, { lazy, Suspense } from 'react';
import { Layout } from '../components/Layout';

// 懒加载页面组件（修复导入方式）
const HomePage = lazy(() => import('../pages/company/HomePage').then(m => ({ default: m.HomePage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));
const AboutPage = lazy(() => import('../pages/company/AboutPage').then(m => ({ default: m.AboutPage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));
const ProductPage = lazy(() => import('../pages/company/ProductPage').then(m => ({ default: m.ProductPage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));
const ServicesPage = lazy(() => import('../pages/company/ServicesPage').then(m => ({ default: m.ServicesPage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));
const ContactPage = lazy(() => import('../pages/company/ContactPage').then(m => ({ default: m.ContactPage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));

// 加载中占位符 - 浅蓝色半透明
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-blue-50/80 backdrop-blur-sm flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p className="text-neutral-600">加载中...</p>
    </div>
  </div>
);

/**
 * 公司官网路由组件
 * 根据路径渲染对应的页面
 */
export const CompanyRoutes: React.FC = () => {
  const pathname = window.location.pathname;

  // 路由匹配
  let PageComponent: React.ComponentType | null = null;

  if (pathname === '/company' || pathname === '/company/') {
    PageComponent = HomePage;
  } else if (pathname === '/company/about') {
    PageComponent = AboutPage;
  } else if (pathname === '/company/product') {
    PageComponent = ProductPage;
  } else if (pathname === '/company/services') {
    PageComponent = ServicesPage;
  } else if (pathname === '/company/contact') {
    PageComponent = ContactPage;
  }

  // 404处理
  if (!PageComponent) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">404</h1>
          <p className="text-gray-400 mb-8">页面未找到</p>
          <a
            href="/company"
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            返回首页
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <PageComponent />
      </Suspense>
    </Layout>
  );
};
