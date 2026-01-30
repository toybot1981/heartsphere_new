import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';

// 管理端入口文件
// 注意：完整的管理后台在 admin/frontend 项目中
// 这里提供一个占位页面或重定向

const AdminPlaceholder: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      fontFamily: 'Noto Sans SC, sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>管理后台</h1>
      <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.8 }}>
        完整的管理后台位于独立的管理端项目中
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          返回首页
        </button>
        <button
          onClick={() => window.open('/admin.html', '_self')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          刷新页面
        </button>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('admin-root');
if (!rootElement) {
  throw new Error("Could not find admin-root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AdminPlaceholder />
  </React.StrictMode>
);
