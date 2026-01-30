import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { AdminStateProvider } from './contexts/AdminStateContext';
import { AdminLogin } from './components/AdminLogin';
import { AdminScreen } from './AdminScreen';

// 直接导入 AdminScreen，避免懒加载在 e2e/部分环境下动态 chunk 请求失败导致「加载失败」
// 若需恢复懒加载以减小首包，可仅在生产构建使用 lazy，或确保 e2e 环境能稳定加载 chunk

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
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminScreen />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
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
