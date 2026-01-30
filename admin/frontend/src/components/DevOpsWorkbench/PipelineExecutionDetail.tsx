import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { PipelineExecution } from '../../services/api/admin/devops';
import { PipelineProgressView } from './PipelineProgressView';

interface PipelineExecutionDetailProps {
    executionId: number;
    onClose: () => void;
}

export const PipelineExecutionDetail: React.FC<PipelineExecutionDetailProps> = ({
    executionId,
    onClose,
}) => {
    const [execution, setExecution] = useState<PipelineExecution | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        loadDetail();
    }, [executionId]);

    useEffect(() => {
        if (autoRefresh && execution && execution.status === 'RUNNING') {
            const interval = setInterval(() => {
                loadDetail();
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setAutoRefresh(false);
        }
    }, [autoRefresh, execution]);

    const loadDetail = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const data = await adminApi.devops.getPipelineExecutionDetail(token, executionId);
            setExecution(data);
            
            if (data.status === 'RUNNING') {
                setAutoRefresh(true);
            }
        } catch (error: any) {
            showAlert('加载执行详情失败: ' + (error.message || '未知错误'), '错误', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!execution) return;
        if (!window.confirm('确定要取消这个流程执行吗？')) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.devops.cancelPipelineExecution(token, execution.id);
            showAlert('流程执行已取消', '成功', 'success');
            setAutoRefresh(false);
            loadDetail();
        } catch (error: any) {
            showAlert('取消失败: ' + (error.message || '未知错误'), '错误', 'error');
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

    if (!execution) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 z-[9998]">
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">
                            流程执行详情: {execution.pipelineName}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <PipelineProgressView
                        execution={execution}
                        onCancel={handleCancel}
                        autoRefresh={autoRefresh}
                        onAutoRefreshChange={setAutoRefresh}
                    />
                </div>
            </div>
        </div>
    );
};
