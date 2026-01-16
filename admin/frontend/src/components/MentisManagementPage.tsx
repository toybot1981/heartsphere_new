import React, { useState } from 'react';
import { McpConfigManagement } from './McpConfigManagement';
import { AgentRoleManagement } from './AgentRoleManagement';
import { MentisToolManagement } from './MentisToolManagement';

export const MentisManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'mcp' | 'agents' | 'tools'>('mcp');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Mentis 管理</h1>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('mcp')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'mcp'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                        MCP 配置
                    </button>
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'agents'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                        Agent 角色
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'tools'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                        Mentis 工具管理
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'mcp' && <McpConfigManagement />}
                {activeTab === 'agents' && <AgentRoleManagement />}
                {activeTab === 'tools' && <MentisToolManagement />}
            </div>
        </div>
    );
};
