import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionListPage } from './components/SessionListPage';
import { MentisPage } from './pages/MentisPage';
import { TaskListPage } from './pages/TaskListPage';
import { VmManagementPage } from './pages/VmManagementPage';
import { ExecutionLogPage } from './pages/ExecutionLogPage';
import { Workspace } from './components/Workspace';
import { McpConfigManager } from './components/McpConfigManager';

/**
 * Mentis 应用主组件
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 统一工作台（新界面）- 包含左侧会话列表 */}
        <Route path="/mentis/workspace" element={<Workspace />} />
        <Route path="/mentis/workspace/:sessionId" element={<Workspace />} />
        
        {/* MCP 配置管理 */}
        <Route path="/mentis/mcp/configs" element={<McpConfigManager />} />
        
        {/* 默认路由重定向到工作台 */}
        <Route path="/" element={<Navigate to="/mentis/workspace" replace />} />
        <Route path="/mentis" element={<Navigate to="/mentis/workspace" replace />} />
        
        {/* 保留旧的会话列表页路由（用于兼容，但建议使用工作台） */}
        <Route path="/mentis/sessions" element={<SessionListPage />} />
        
        {/* 会话主页面（旧界面，保留兼容） */}
        <Route path="/mentis/session/:sessionId" element={<MentisPage />} />
        
        {/* 任务相关页面 */}
        <Route path="/mentis/session/:sessionId/tasks" element={<TaskListPage />} />
        
        {/* 虚拟机管理页面 */}
        <Route path="/mentis/session/:sessionId/vm" element={<VmManagementPage />} />
        
        {/* 执行日志页面 */}
        <Route path="/mentis/session/:sessionId/logs" element={<ExecutionLogPage />} />
        
        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/mentis" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
