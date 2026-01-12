import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));
const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })).catch(() => ({ default: () => <div>加载失败，请刷新页面</div> })));

// 加载中占位符
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-blue-50/80 backdrop-blur-sm flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p className="text-neutral-600">加载中...</p>
    </div>
  </div>
);

/**
 * 公司官网应用主组件
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/company" element={<HomePage />} />
            <Route path="/company/about" element={<AboutPage />} />
            <Route path="/company/product" element={<ProductPage />} />
            <Route path="/company/services" element={<ServicesPage />} />
            <Route path="/company/contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/company" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
