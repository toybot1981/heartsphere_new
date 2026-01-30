import React from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { DeploymentPipeline } from '../../services/api/admin/devops';

interface PipelineTemplateListProps {
    pipelines: DeploymentPipeline[];
    loading: boolean;
    onExecute: (pipeline: DeploymentPipeline) => void;
    onRefresh: () => void;
}

export const PipelineTemplateList: React.FC<PipelineTemplateListProps> = ({
    pipelines,
    loading,
    onExecute,
    onRefresh,
}) => {
    const handleDelete = async (pipelineId: number) => {
        if (!window.confirm('确定要删除这个流程模板吗？')) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.devops.deletePipeline(token, pipelineId);
            showAlert('流程模板已删除', '成功', 'success');
            onRefresh();
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    if (loading) {
        return <div className="text-slate-400">加载中...</div>;
    }

    if (pipelines.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <p>暂无流程模板</p>
                <p className="text-sm mt-2">系统会在启动时自动加载预定义模板</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelines.map((pipeline) => (
                <div
                    key={pipeline.id}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-semibold text-white">{pipeline.name}</h3>
                            {pipeline.description && (
                                <p className="text-sm text-slate-400 mt-1">{pipeline.description}</p>
                            )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                            pipeline.environment === 'prod' 
                                ? 'bg-red-900 text-red-300' 
                                : 'bg-blue-900 text-blue-300'
                        }`}>
                            {pipeline.environment === 'prod' ? '生产' : '测试'}
                        </span>
                    </div>

                    <div className="mb-3">
                        <p className="text-xs text-slate-500">
                            步骤数: {pipeline.steps?.length || 0}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onExecute(pipeline)}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                        >
                            执行
                        </button>
                        {pipeline.isTemplate && (
                            <button
                                onClick={() => handleDelete(pipeline.id!)}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                                删除
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
