import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { AdminStateProvider } from './contexts/AdminStateContext';
import { AdminLogin } from './components/AdminLogin';

// 懒加载管理页面
const AdminMainPage = lazy(() => 
  import('./AdminScreen')
    .then(m => {
      // 确保正确导出
      if (m.AdminScreen) {
        return { default: m.AdminScreen };
      }
      throw new Error('AdminScreen 未正确导出');
    })
    .catch((err) => {
      console.error('加载 AdminScreen 失败:', err);
      return { 
        default: () => (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-xl mb-4">加载失败</p>
              <p className="text-slate-400 mb-4">{err.message || '请刷新页面'}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                刷新
              </button>
            </div>
          </div>
        )
      };
    })
);

// 加载中占位符
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">加载中...</p>
    </div>
  </div>
);

// 内部组件：处理认证和路由
// 注意：此组件必须在 AdminAuthProvider 内部使用
const AppContent: React.FC = () => {
  const { isAuthenticated, login, loginError, loading } = useAdminAuth();

  // 如果未认证，显示登录页面
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={login}
        onBack={() => window.location.href = '/'}
        loginError={loginError || undefined}
        loading={loading}
      />
    );
  }

  // 已认证，显示管理界面
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminMainPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
};

/**
 * 统一管理后台应用主组件
 * 提供所有客户端产品（client、edu、company）的统一管理入口
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminStateProvider>
          <AppContent />
        </AdminStateProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
};

// 确保 AppContent 在 Provider 内部
// 如果出现 Context 错误，检查 Provider 的包裹顺序

export default App;
