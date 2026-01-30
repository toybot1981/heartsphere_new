import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { ScriptInfo, ScriptExecutionResponse, DevOpsStatistics } from '../../services/api/admin/devops';
import { ScriptList } from './ScriptList';
import { ScriptExecutor } from './ScriptExecutor';
import { ExecutionDetail } from './ExecutionDetail';
import { ScheduledTasks } from './ScheduledTasks';
import { PipelineManager } from './PipelineManager';
import { RemoteServerConfig } from './RemoteServerConfig';
import { CMDBManager } from './CMDBManager';
import { AutoFixManager } from './AutoFixManager';
import { useAdminState } from '../../contexts/AdminStateContext';

export const DevOpsWorkbench: React.FC = () => {
    const { activeSection } = useAdminState();
    
    // 根据 activeSection 确定当前显示的 tab
    const getActiveTab = (): 'overview' | 'scan' | 'test' | 'build' | 'database' | 'server' | 'scheduled' | 'pipeline' | 'cmdb' | 'autofix' => {
        switch (activeSection) {
            case 'devops-overview': return 'overview';
            case 'devops-scan': return 'scan';
            case 'devops-test': return 'test';
            case 'devops-build': return 'build';
            case 'devops-database': return 'database';
            case 'devops-server': return 'server';
            case 'devops-scheduled': return 'scheduled';
            case 'devops-pipeline': return 'pipeline';
            case 'devops-cmdb': return 'cmdb';
            case 'devops-autofix': return 'autofix';
            case 'devops-workbench': return 'overview'; // 兼容旧的路由
            default: return 'overview';
        }
    };
    
    const activeTab = getActiveTab();
    const [statistics, setStatistics] = useState<DevOpsStatistics | null>(null);
    const [scripts, setScripts] = useState<ScriptInfo[]>([]);
    const [executionHistory, setExecutionHistory] = useState<ScriptExecutionResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedScript, setSelectedScript] = useState<ScriptInfo | null>(null);
    const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(null);
    const [historyFilters, setHistoryFilters] = useState<{
        scriptId?: string;
        status?: string;
        executedById?: number;
        startTime?: string;
        endTime?: string;
    }>({});
    const [historyPage, setHistoryPage] = useState(0);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [showRemoteServerConfig, setShowRemoteServerConfig] = useState(false);

    useEffect(() => {
        loadStatistics();
        loadScripts();
        loadExecutionHistory();
    }, []);

    const loadStatistics = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;
            
            const data = await adminApi.devops.getStatistics(token);
            setStatistics(data);
        } catch (error: any) {
            // 如果是认证错误，不显示弹框，由 AdminAuthContext 统一处理
            const errorMessage = error.message || '未知错误';
            if (!errorMessage.includes('登录已过期') && !errorMessage.includes('401') && !errorMessage.includes('未授权')) {
                showAlert('加载统计数据失败: ' + errorMessage, '加载失败', 'error');
            }
        }
    };

    const loadScripts = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                console.warn('No admin token found');
                return;
            }
            
            const data = await adminApi.devops.getScripts(token);
            console.log('Loaded scripts:', data);
            setScripts(data || []);
            
            if (!data || data.length === 0) {
                showAlert('未找到可用脚本，请检查脚本配置文件', '提示', 'warning');
            }
        } catch (error: any) {
            console.error('Failed to load scripts', error);
            // 如果是认证错误，不显示弹框，由 AdminAuthContext 统一处理
            const errorMessage = error.message || '未知错误';
            if (!errorMessage.includes('登录已过期') && !errorMessage.includes('401') && !errorMessage.includes('未授权')) {
                showAlert('加载脚本列表失败: ' + errorMessage, '错误', 'error');
            }
        }
    };

    const loadExecutionHistory = async (page: number = 0) => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;
            
            // 转换时间格式为 ISO 格式
            const filters = { ...historyFilters };
            if (filters.startTime) {
                filters.startTime = new Date(filters.startTime).toISOString();
            }
            if (filters.endTime) {
                filters.endTime = new Date(filters.endTime).toISOString();
            }
            
            const data = await adminApi.devops.getExecutionHistory(
                token, 
                page, 
                10,
                filters
            );
            setExecutionHistory(data.content || []);
            setHistoryTotal(data.totalElements || 0);
            setHistoryPage(page);
        } catch (error: any) {
            console.error('Failed to load execution history', error);
            // 如果是认证错误，不显示弹框，由 AdminAuthContext 统一处理
            const errorMessage = error.message || '未知错误';
            if (!errorMessage.includes('登录已过期') && !errorMessage.includes('401') && !errorMessage.includes('未授权')) {
                showAlert('加载执行历史失败: ' + errorMessage, '错误', 'error');
            }
        }
    };

    useEffect(() => {
        if (activeTab === 'overview') {
            loadExecutionHistory(historyPage);
        }
    }, [historyFilters, activeTab]);

    const handleDownloadLog = async (executionId: number) => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            showAlert('请先登录', '错误', 'error');
            return;
        }
        
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/admin';
            // 先尝试流程执行的日志下载端点（pipelines/executions）
            let url = `${baseUrl}/devops/pipelines/executions/${executionId}/log/download`;
            
            let response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            // 如果流程执行端点返回 404，尝试脚本执行端点（executions）
            if (response.status === 404) {
                url = `${baseUrl}/devops/executions/${executionId}/log/download`;
                response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
            
            if (!response.ok) {
                throw new Error(`下载失败: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `execution-${executionId}.log`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            showAlert('日志下载成功', '成功', 'success');
        } catch (error: any) {
            console.error('下载日志失败:', error);
            showAlert('下载日志失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">DevOps 工作台</h1>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">今日执行</h3>
                                <p className="text-3xl font-bold text-white">
                                    {statistics?.totalExecutions || 0}
                                </p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">成功</h3>
                                <p className="text-3xl font-bold text-green-400">
                                    {statistics?.successExecutions || 0}
                                </p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">失败</h3>
                                <p className="text-3xl font-bold text-red-400">
                                    {statistics?.failedExecutions || 0}
                                </p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">运行中</h3>
                                <p className="text-3xl font-bold text-blue-400">
                                    {statistics?.runningExecutions || 0}
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">最近执行历史</h2>
                                <button
                                    onClick={() => loadExecutionHistory(historyPage)}
                                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                                >
                                    刷新
                                </button>
                            </div>
                            
                            {/* 筛选器 */}
                            <div className="mb-4 flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm text-slate-400 mb-1">脚本</label>
                                    <select
                                        value={historyFilters.scriptId || ''}
                                        onChange={(e) => setHistoryFilters({...historyFilters, scriptId: e.target.value || undefined})}
                                        className="w-full bg-slate-800 text-white rounded px-3 py-2 border border-slate-700"
                                    >
                                        <option value="">全部</option>
                                        {scripts.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-slate-400 mb-1">状态</label>
                                    <select
                                        value={historyFilters.status || ''}
                                        onChange={(e) => setHistoryFilters({...historyFilters, status: e.target.value || undefined})}
                                        className="w-full bg-slate-800 text-white rounded px-3 py-2 border border-slate-700"
                                    >
                                        <option value="">全部</option>
                                        <option value="SUCCESS">成功</option>
                                        <option value="FAILED">失败</option>
                                        <option value="RUNNING">运行中</option>
                                        <option value="CANCELLED">已取消</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => {
                                        setHistoryFilters({});
                                        loadExecutionHistory(0);
                                    }}
                                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                                >
                                    清除筛选
                                </button>
                            </div>
                            
                            {executionHistory.length === 0 ? (
                                <p className="text-slate-400">暂无执行记录</p>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-700">
                                                    <th className="text-left py-2 px-4 text-slate-400">时间</th>
                                                    <th className="text-left py-2 px-4 text-slate-400">脚本</th>
                                                    <th className="text-left py-2 px-4 text-slate-400">状态</th>
                                                    <th className="text-left py-2 px-4 text-slate-400">操作</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {executionHistory.map((execution) => (
                                                    <tr key={execution.id} className="border-b border-slate-800">
                                                        <td className="py-2 px-4 text-slate-300">
                                                            {new Date(execution.startedAt).toLocaleString()}
                                                        </td>
                                                        <td className="py-2 px-4 text-slate-300">{execution.scriptName}</td>
                                                        <td className="py-2 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                execution.status === 'SUCCESS' ? 'bg-green-900 text-green-300' :
                                                                execution.status === 'FAILED' ? 'bg-red-900 text-red-300' :
                                                                execution.status === 'RUNNING' ? 'bg-blue-900 text-blue-300' :
                                                                'bg-slate-700 text-slate-300'
                                                            }`}>
                                                                {execution.status === 'SUCCESS' ? '✅ 成功' :
                                                                 execution.status === 'FAILED' ? '❌ 失败' :
                                                                 execution.status === 'RUNNING' ? '🟢 运行中' :
                                                                 '⏸️ 已取消'}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                                                    onClick={() => setSelectedExecutionId(execution.id)}
                                                                >
                                                                    查看
                                                                </button>
                                                                {execution.status !== 'RUNNING' && (
                                                                    <button
                                                                        className="text-green-400 hover:text-green-300 text-sm"
                                                                        onClick={() => handleDownloadLog(execution.id)}
                                                                    >
                                                                        下载日志
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {historyTotal > 10 && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">
                                                共 {historyTotal} 条记录，第 {historyPage + 1} 页
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => loadExecutionHistory(Math.max(0, historyPage - 1))}
                                                    disabled={historyPage === 0}
                                                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    上一页
                                                </button>
                                                <button
                                                    onClick={() => loadExecutionHistory(historyPage + 1)}
                                                    disabled={(historyPage + 1) * 10 >= historyTotal}
                                                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    下一页
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'scan' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">代码扫描</h2>
                        <ScriptList
                            scripts={scripts}
                            category="scan"
                            onExecute={(script) => setSelectedScript(script)}
                        />
                    </div>
                )}
                {activeTab === 'test' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">自动化测试</h2>
                        <ScriptList
                            scripts={scripts}
                            category="test"
                            onExecute={(script) => setSelectedScript(script)}
                        />
                    </div>
                )}
                {activeTab === 'build' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">构建和部署</h2>
                            <button
                                onClick={loadScripts}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                            >
                                刷新脚本列表
                            </button>
                        </div>
                        
                        {scripts.length === 0 ? (
                            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
                                <p className="text-slate-400 text-lg mb-2">正在加载脚本列表...</p>
                                <p className="text-slate-500 text-sm">如果长时间未加载，请检查网络连接或刷新页面</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">构建脚本</h3>
                                    <ScriptList
                                        scripts={scripts}
                                        category="build"
                                        onExecute={(script) => setSelectedScript(script)}
                                    />
                                </div>
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-white mb-4">部署脚本</h3>
                                    <ScriptList
                                        scripts={scripts}
                                        category="deploy"
                                        onExecute={(script) => setSelectedScript(script)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
                {activeTab === 'database' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">数据库管理</h2>
                        <ScriptList
                            scripts={scripts}
                            category="database"
                            onExecute={(script) => setSelectedScript(script)}
                        />
                    </div>
                )}
                {activeTab === 'server' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">服务器管理</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowRemoteServerConfig(!showRemoteServerConfig)}
                                    className={`px-4 py-2 rounded text-sm ${
                                        showRemoteServerConfig
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                                    }`}
                                >
                                    {showRemoteServerConfig ? '返回脚本列表' : '远程服务器配置'}
                                </button>
                            </div>
                        </div>
                        {showRemoteServerConfig ? (
                            <RemoteServerConfig />
                        ) : (
                            <ScriptList
                                scripts={scripts}
                                category="server"
                                onExecute={(script) => setSelectedScript(script)}
                            />
                        )}
                    </div>
                )}
                {activeTab === 'scheduled' && <ScheduledTasks />}
                {activeTab === 'pipeline' && <PipelineManager />}
                {activeTab === 'cmdb' && <CMDBManager />}
                {activeTab === 'autofix' && <AutoFixManager />}
            </div>

            {/* 脚本执行对话框 */}
            {selectedScript && (
                <ScriptExecutor
                    script={selectedScript}
                    onClose={() => {
                        setSelectedScript(null);
                        loadExecutionHistory();
                    }}
                    onExecutionStart={(execution) => {
                        setSelectedScript(null);
                        loadExecutionHistory();
                        loadStatistics();
                    }}
                />
            )}

            {/* 执行详情对话框 */}
            {selectedExecutionId && (
                <ExecutionDetail
                    executionId={selectedExecutionId}
                    onClose={() => {
                        setSelectedExecutionId(null);
                        loadExecutionHistory();
                        loadStatistics();
                    }}
                    onRefresh={() => {
                        loadExecutionHistory();
                        loadStatistics();
                    }}
                />
            )}
        </div>
    );
};
