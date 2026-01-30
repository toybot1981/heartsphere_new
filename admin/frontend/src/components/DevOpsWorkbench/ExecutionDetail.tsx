import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { ScriptExecutionDetail } from '../../services/api/admin/devops';
import { ExecutionMonitor } from './ExecutionMonitor';

interface ExecutionDetailProps {
    executionId: number;
    onClose: () => void;
    onRefresh?: () => void;
}

export const ExecutionDetail: React.FC<ExecutionDetailProps> = ({ executionId, onClose, onRefresh }) => {
    const [detail, setDetail] = useState<ScriptExecutionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [showRealtimeMonitor, setShowRealtimeMonitor] = useState(false);

    useEffect(() => {
        loadDetail();
    }, [executionId]);

    useEffect(() => {
        if (autoRefresh && detail && detail.status === 'RUNNING') {
            const interval = setInterval(() => {
                loadDetail();
            }, 2000); // 每2秒刷新一次
            return () => clearInterval(interval);
        }
    }, [autoRefresh, detail]);

    const loadDetail = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const data = await adminApi.devops.getExecutionDetail(token, executionId);
            setDetail(data);
            
            // 如果执行完成，停止自动刷新
            if (data.status !== 'RUNNING') {
                setAutoRefresh(false);
            }
        } catch (error: any) {
            // 如果是认证错误，不显示弹框，由 AdminAuthContext 统一处理
            const errorMessage = error.message || '未知错误';
            if (!errorMessage.includes('登录已过期') && !errorMessage.includes('401') && !errorMessage.includes('未授权')) {
                showAlert('加载执行详情失败: ' + errorMessage, '错误', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('确定要取消这个执行吗？')) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.devops.cancelExecution(token, executionId);
            showAlert('执行已取消', '成功', 'success');
            setAutoRefresh(false);
            loadDetail();
            onRefresh?.();
        } catch (error: any) {
            showAlert('取消执行失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl p-8">
                    <div className="text-white">加载中...</div>
                </div>
            </div>
        );
    }

    if (!detail) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">执行详情: {detail.scriptName}</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* 执行信息 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">执行状态</h3>
                            <span className={`px-3 py-1 rounded text-sm font-medium ${
                                detail.status === 'SUCCESS' ? 'bg-green-900 text-green-300' :
                                detail.status === 'FAILED' ? 'bg-red-900 text-red-300' :
                                detail.status === 'RUNNING' ? 'bg-blue-900 text-blue-300' :
                                'bg-slate-700 text-slate-300'
                            }`}>
                                {detail.status === 'SUCCESS' ? '✅ 成功' :
                                 detail.status === 'FAILED' ? '❌ 失败' :
                                 detail.status === 'RUNNING' ? '🟢 运行中' :
                                 '⏸️ 已取消'}
                            </span>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">执行ID</h3>
                            <p className="text-white">{detail.id}</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">开始时间</h3>
                            <p className="text-white">{new Date(detail.startedAt).toLocaleString()}</p>
                        </div>
                        {detail.finishedAt && (
                            <div className="bg-slate-800 p-4 rounded-lg">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">结束时间</h3>
                                <p className="text-white">{new Date(detail.finishedAt).toLocaleString()}</p>
                            </div>
                        )}
                        {detail.durationSeconds !== undefined && (
                            <div className="bg-slate-800 p-4 rounded-lg">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">执行时长</h3>
                                <p className="text-white">{detail.durationSeconds} 秒</p>
                            </div>
                        )}
                        {detail.exitCode !== undefined && (
                            <div className="bg-slate-800 p-4 rounded-lg">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">退出代码</h3>
                                <p className="text-white">{detail.exitCode}</p>
                            </div>
                        )}
                    </div>

                    {/* 错误信息 */}
                    {detail.error && (
                        <div className="bg-red-900 bg-opacity-20 border border-red-800 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-red-400 uppercase mb-2">错误信息</h3>
                            <pre className="text-red-300 text-sm whitespace-pre-wrap">{detail.error}</pre>
                        </div>
                    )}

                    {/* 日志内容 */}
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase">执行日志</h3>
                            <div className="flex gap-2">
                                {detail.status === 'RUNNING' && (
                                    <button
                                        onClick={() => setShowRealtimeMonitor(true)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                                    >
                                        📊 实时监控
                                    </button>
                                )}
                                {detail.status === 'RUNNING' && (
                                    <button
                                        onClick={() => setAutoRefresh(!autoRefresh)}
                                        className={`px-3 py-1 rounded text-sm ${
                                            autoRefresh 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-slate-700 text-slate-300'
                                        }`}
                                    >
                                        {autoRefresh ? '🟢 自动刷新中' : '⏸️ 自动刷新'}
                                    </button>
                                )}
                                {detail.status === 'RUNNING' && (
                                    <button
                                        onClick={handleCancel}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                                    >
                                        取消执行
                                    </button>
                                )}
                                {detail.status !== 'RUNNING' && (
                                    <button
                                        onClick={async () => {
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
                                        }}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                                    >
                                        下载日志
                                    </button>
                                )}
                                <button
                                    onClick={loadDetail}
                                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                                >
                                    刷新
                                </button>
                            </div>
                        </div>
                        <div className="bg-black p-4 rounded font-mono text-sm text-green-400 max-h-96 overflow-y-auto">
                            {detail.logContent ? (
                                <pre className="whitespace-pre-wrap">{detail.logContent}</pre>
                            ) : (
                                <p className="text-slate-500">暂无日志内容</p>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* 实时监控窗口 */}
                {showRealtimeMonitor && (
                    <ExecutionMonitor
                        executionId={executionId}
                        scriptName={detail.scriptName}
                        onClose={() => setShowRealtimeMonitor(false)}
                        onCancel={() => {
                            setShowRealtimeMonitor(false);
                            loadDetail();
                            onRefresh?.();
                        }}
                    />
                )}
            </div>
        </div>
    );
};
