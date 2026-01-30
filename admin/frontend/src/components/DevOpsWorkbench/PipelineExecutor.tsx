import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { DeploymentPipeline, PipelineExecution, PipelineExecutionRequest } from '../../services/api/admin/devops';
import { PipelineProgressView } from './PipelineProgressView';
import { EnvironmentVariableEditor } from './EnvironmentVariableEditor';

interface PipelineExecutorProps {
    pipeline: DeploymentPipeline;
    execution: PipelineExecution | null;
    onClose: () => void;
    onExecutionStart: (execution: PipelineExecution) => void;
}

export const PipelineExecutor: React.FC<PipelineExecutorProps> = ({
    pipeline,
    execution,
    onClose,
    onExecutionStart,
}) => {
    const [currentExecution, setCurrentExecution] = useState<PipelineExecution | null>(execution);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [environmentVariables, setEnvironmentVariables] = useState<Record<string, string>>({});
    const [showEnvVars, setShowEnvVars] = useState(false);

    useEffect(() => {
        if (execution) {
            setCurrentExecution(execution);
            if (execution.status === 'RUNNING') {
                setAutoRefresh(true);
            }
        }
    }, [execution]);

    useEffect(() => {
        if (autoRefresh && currentExecution && currentExecution.status === 'RUNNING') {
            const interval = setInterval(() => {
                refreshExecutionStatus();
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setAutoRefresh(false);
        }
    }, [autoRefresh, currentExecution]);

    const refreshExecutionStatus = async () => {
        if (!currentExecution) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            console.log('[PipelineExecutor] 刷新执行状态, executionId:', currentExecution.id);
            const updated = await adminApi.devops.getPipelineExecutionStatus(token, currentExecution.id);
            console.log('[PipelineExecutor] 刷新后的执行状态:', {
                id: updated.id,
                status: updated.status,
                stepExecutions: updated.stepExecutions,
                stepExecutionsLength: updated.stepExecutions?.length,
                totalSteps: updated.totalSteps,
                completedSteps: updated.completedSteps,
            });
            if (updated.stepExecutions) {
                console.log('[PipelineExecutor] 刷新后的步骤执行详情:', updated.stepExecutions.map(se => ({
                    id: se.id,
                    stepName: se.stepName,
                    status: se.status,
                    error: se.error,
                })));
                const failedSteps = updated.stepExecutions.filter(se => se.status === 'FAILED');
                console.log('[PipelineExecutor] 失败的步骤数量:', failedSteps.length, failedSteps);
            } else {
                console.warn('[PipelineExecutor] stepExecutions 为空或未定义');
            }
            setCurrentExecution(updated);

            if (updated.status !== 'RUNNING') {
                setAutoRefresh(false);
            }
        } catch (error: any) {
            console.error('[PipelineExecutor] Failed to refresh execution status', error);
        }
    };

    const handleExecute = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                showAlert('请先登录', '错误', 'error');
                return;
            }

            if (pipeline.environment === 'prod') {
                if (!window.confirm('确定要执行生产环境部署流程吗？此操作将影响生产环境！')) {
                    return;
                }
            }

            // 自动填充项目参数（如果流程关联了项目）
            const parameters: Record<string, any> = {};
            if (pipeline.project) {
                parameters.module = pipeline.project;
            }

            const executionRequest: PipelineExecutionRequest = {
                pipelineId: pipeline.id!,
                parameters,
                environmentVariables: Object.keys(environmentVariables).length > 0 ? environmentVariables : undefined,
            };

            const response = await adminApi.devops.executePipeline(token, executionRequest);
            
            // 检查返回的执行对象是否有 executionId
            if (!response || !response.executionId) {
                throw new Error('流程执行启动失败：未返回执行ID');
            }
            
            // 获取执行详情（确保获取完整信息）
            console.log('[PipelineExecutor] 获取执行详情, executionId:', response.executionId);
            const executionDetail = await adminApi.devops.getPipelineExecutionStatus(token, response.executionId);
            console.log('[PipelineExecutor] 执行详情响应:', {
                id: executionDetail.id,
                status: executionDetail.status,
                stepExecutions: executionDetail.stepExecutions,
                stepExecutionsLength: executionDetail.stepExecutions?.length,
                totalSteps: executionDetail.totalSteps,
                completedSteps: executionDetail.completedSteps,
            });
            if (executionDetail.stepExecutions) {
                console.log('[PipelineExecutor] 步骤执行详情:', executionDetail.stepExecutions.map(se => ({
                    id: se.id,
                    stepName: se.stepName,
                    status: se.status,
                    error: se.error,
                })));
            }
            setCurrentExecution(executionDetail);
            setAutoRefresh(true);
            onExecutionStart(executionDetail);
            
            showAlert('流程执行已启动', '成功', 'success');
        } catch (error: any) {
            showAlert('执行失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const handleCancel = async () => {
        if (!currentExecution) return;
        if (!window.confirm('确定要取消这个流程执行吗？')) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.devops.cancelPipelineExecution(token, currentExecution.id);
            showAlert('流程执行已取消', '成功', 'success');
            setAutoRefresh(false);
            refreshExecutionStatus();
        } catch (error: any) {
            showAlert('取消失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* 流程信息 */}
            <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white">{pipeline.name}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl"
                    >
                        ✕
                    </button>
                </div>
                {pipeline.description && (
                    <p className="text-slate-400 text-sm mb-2">{pipeline.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded ${
                        pipeline.environment === 'prod' 
                            ? 'bg-red-900 text-red-300' 
                            : 'bg-blue-900 text-blue-300'
                    }`}>
                        {pipeline.environment === 'prod' ? '生产环境' : '测试环境'}
                    </span>
                    <span className="text-slate-500">
                        步骤数: {pipeline.steps?.length || 0}
                    </span>
                </div>
            </div>

            {/* 环境变量配置 */}
            {!currentExecution && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">环境变量配置</h3>
                        <button
                            onClick={() => setShowEnvVars(!showEnvVars)}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                        >
                            {showEnvVars ? '隐藏' : '显示'}环境变量
                        </button>
                    </div>
                    {showEnvVars && (
                        <EnvironmentVariableEditor
                            project={pipeline.project}
                            module={pipeline.project} // 使用 project 作为 module
                            pipelineId={pipeline.id}
                            environment={pipeline.environment}
                            variables={environmentVariables}
                            onChange={setEnvironmentVariables}
                        />
                    )}
                </div>
            )}

            {/* 执行控制 */}
            {!currentExecution && (
                <div className="flex justify-center">
                    <button
                        onClick={handleExecute}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-lg"
                    >
                        🚀 一键执行
                    </button>
                </div>
            )}

            {/* 执行进度 */}
            {currentExecution && (
                <PipelineProgressView
                    execution={currentExecution}
                    onCancel={handleCancel}
                    autoRefresh={autoRefresh}
                    onAutoRefreshChange={setAutoRefresh}
                />
            )}
        </div>
    );
};
