import React, { useState, useEffect } from 'react';
import { ToolCallMonitorPanel } from './agentscope-demo/ToolCallMonitorPanel';
import { VmManagementPanel } from './agentscope-demo/VmManagementPanel';
import { SessionManagementPanel } from './agentscope-demo/SessionManagementPanel';
import { PerformancePanel } from './agentscope-demo/PerformancePanel';

interface AgentScopeDemoAdminProps {
  adminToken: string | null;
}

type ActiveTab = 'tool-calls' | 'vms' | 'sessions' | 'performance';

export const AgentScopeDemoAdmin: React.FC<AgentScopeDemoAdminProps> = ({ adminToken }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tool-calls');

  if (!adminToken) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600">需要管理员权限才能访问此页面</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          AgentScope Computer-Use 演示管理
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          监控和管理 AgentScope 工具调用、虚拟机状态和系统性能
        </p>
      </div>

      {/* 标签导航 */}
      <div className="bg-white border-b">
        <div className="flex space-x-1 px-6">
          <button
            onClick={() => setActiveTab('tool-calls')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tool-calls'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            工具调用监控
          </button>
          <button
            onClick={() => setActiveTab('vms')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'vms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            虚拟机管理
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sessions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            会话管理
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            性能监控
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tool-calls' && <ToolCallMonitorPanel adminToken={adminToken} />}
        {activeTab === 'vms' && <VmManagementPanel adminToken={adminToken} />}
        {activeTab === 'sessions' && <SessionManagementPanel adminToken={adminToken} />}
        {activeTab === 'performance' && <PerformancePanel adminToken={adminToken} />}
      </div>
    </div>
  );
};
