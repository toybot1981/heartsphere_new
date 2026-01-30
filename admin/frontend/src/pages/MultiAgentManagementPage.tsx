import React, { useState } from 'react';
import { CollaborationManagement } from '../components/multiAgent/CollaborationManagement';
import { AgentManagement } from '../components/multiAgent/AgentManagement';
import { RoutingConfigManagement } from '../components/multiAgent/RoutingConfigManagement';
import { SystemConfigManagement } from '../components/multiAgent/SystemConfigManagement';
import { LogManagement } from '../components/multiAgent/LogManagement';

/**
 * 多智能体管理页面
 * 提供多智能体协作系统的管理功能
 */
const MultiAgentManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'collaborations' | 'agents' | 'routing' | 'config' | 'logs'>('collaborations');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">多智能体协作管理</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('collaborations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'collaborations'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            协作管理
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'agents'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            智能体管理
          </button>
          <button
            onClick={() => setActiveTab('routing')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'routing'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            路由配置
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            系统配置
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            日志查看
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'collaborations' && <CollaborationManagement />}
        {activeTab === 'agents' && <AgentManagement />}
        {activeTab === 'routing' && <RoutingConfigManagement />}
        {activeTab === 'config' && <SystemConfigManagement />}
        {activeTab === 'logs' && <LogManagement />}
      </div>
    </div>
  );
};

export default MultiAgentManagementPage;
