import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { PipelineExecution } from '../../services/api/admin/devops';
import { PipelineExecutionDetail } from './PipelineExecutionDetail';

export const PipelineHistory: React.FC = () => {
    const [executions, setExecutions] = useState<PipelineExecution[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedExecution, setSelectedExecution] = useState<number | null>(null);

    useEffect(() => {
        loadHistory();
    }, [page]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const response = await adminApi.devops.getPipelineExecutionHistory(token, page, 20);
            setExecutions(response.content);
            setTotalPages(response.totalPages);
        } catch (error: any) {
            showAlert('加载历史记录失败: ' + (error.message || '未知错误'), '错误', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'bg-green-900 text-green-300';
            case 'FAILED':
                return 'bg-red-900 text-red-300';
            case 'RUNNING':
                return 'bg-blue-900 text-blue-300';
            case 'CANCELLED':
                return 'bg-slate-700 text-slate-300';
            default:
                return 'bg-slate-800 text-slate-400';
        }
    };

    if (loading) {
        return <div className="text-slate-400">加载中...</div>;
    }

    return (
        <div className="space-y-4">
            {executions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p>暂无执行记录</p>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {executions.map((execution) => (
                            <div
                                key={execution.id}
                                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                                onClick={() => setSelectedExecution(execution.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-semibold">{execution.pipelineName}</h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {new Date(execution.startedAt).toLocaleString()}
                                            {execution.finishedAt && (
                                                <span> - {new Date(execution.finishedAt).toLocaleString()}</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded text-sm ${getStatusColor(execution.status)}`}>
                                            {execution.status}
                                        </span>
                                        {execution.totalSteps && (
                                            <span className="text-sm text-slate-400">
                                                {execution.completedSteps || 0} / {execution.totalSteps}
                                            </span>
                                        )}
                                        {execution.durationSeconds && (
                                            <span className="text-sm text-slate-400">
                                                {execution.durationSeconds}s
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50"
                            >
                                上一页
                            </button>
                            <span className="px-4 py-2 text-slate-400">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50"
                            >
                                下一页
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedExecution && (
                <PipelineExecutionDetail
                    executionId={selectedExecution}
                    onClose={() => setSelectedExecution(null)}
                />
            )}
        </div>
    );
};
