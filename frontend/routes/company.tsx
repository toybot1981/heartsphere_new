import React, { lazy, Suspense } from 'react';
import { Layout } from '../components/company/Layout';

// 懒加载页面组件
const HomePage = lazy(() => import('../pages/company/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('../pages/company/AboutPage').then(m => ({ default: m.AboutPage })));
const ProductPage = lazy(() => import('../pages/company/ProductPage').then(m => ({ default: m.ProductPage })));
const ServicesPage = lazy(() => import('../pages/company/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ContactPage = lazy(() => import('../pages/company/ContactPage').then(m => ({ default: m.ContactPage })));

// 加载中占位符
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
      <p className="text-gray-400">加载中...</p>
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
