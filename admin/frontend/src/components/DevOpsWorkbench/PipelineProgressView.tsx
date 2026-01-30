import React, { useState } from 'react';
import type { PipelineExecution } from '../../services/api/admin/devops';
import { PipelineStepCard } from './PipelineStepCard';
import { adminApi } from '../../services/api';
import { AutoFixManager } from './AutoFixManager';

interface PipelineProgressViewProps {
    execution: PipelineExecution;
    onCancel: () => void;
    autoRefresh: boolean;
    onAutoRefreshChange: (value: boolean) => void;
}

export const PipelineProgressView: React.FC<PipelineProgressViewProps> = ({
    execution,
    onCancel,
    autoRefresh,
    onAutoRefreshChange,
}) => {
    const [showAutoFix, setShowAutoFix] = useState(false);
    const [fixLoading, setFixLoading] = useState(false);
    
    const handleAutoFix = async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        
        setFixLoading(true);
        try {
            await adminApi.autoFix.detectAndFix(token, execution.id);
            setShowAutoFix(true);
        } catch (error) {
            console.error('自动修复失败:', error);
            alert('自动修复失败');
        } finally {
            setFixLoading(false);
        }
    };
    // 添加调试日志
    React.useEffect(() => {
        console.log('[PipelineProgressView] 执行对象更新:', {
            id: execution.id,
            status: execution.status,
            stepExecutions: execution.stepExecutions,
            stepExecutionsLength: execution.stepExecutions?.length,
            totalSteps: execution.totalSteps,
            completedSteps: execution.completedSteps,
        });
        if (execution.stepExecutions) {
            console.log('[PipelineProgressView] 步骤执行列表:', execution.stepExecutions.map(se => ({
                id: se.id,
                stepName: se.stepName,
                scriptName: se.scriptName,
                status: se.status,
                error: se.error,
            })));
            const failedSteps = execution.stepExecutions.filter(se => se.status === 'FAILED');
            console.log('[PipelineProgressView] 失败的步骤:', failedSteps.length, failedSteps);
            if (execution.status === 'FAILED' && failedSteps.length === 0) {
                console.warn('[PipelineProgressView] ⚠️ 流程状态为 FAILED，但没有找到失败的步骤！');
            }
        } else {
            console.warn('[PipelineProgressView] ⚠️ stepExecutions 为空或未定义');
        }
    }, [execution]);
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'bg-green-900 text-green-300 border-green-700';
            case 'FAILED':
                return 'bg-red-900 text-red-300 border-red-700';
            case 'RUNNING':
                return 'bg-blue-900 text-blue-300 border-blue-700';
            case 'CANCELLED':
                return 'bg-slate-700 text-slate-300 border-slate-600';
            case 'PENDING':
                return 'bg-slate-800 text-slate-400 border-slate-700';
            case 'SKIPPED':
                return 'bg-yellow-900 text-yellow-300 border-yellow-700';
            default:
                return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return '✅';
            case 'FAILED':
                return '❌';
            case 'RUNNING':
                return '🟢';
            case 'CANCELLED':
                return '⏹️';
            case 'PENDING':
                return '⏸️';
            case 'SKIPPED':
                return '⏭️';
            default:
                return '⏸️';
        }
    };

    const progress = execution.totalSteps 
        ? Math.round((execution.completedSteps || 0) / execution.totalSteps * 100)
        : 0;

    return (
        <div className="bg-slate-800 rounded-lg p-6 space-y-6">
            {/* 执行状态头部 */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">执行进度</h3>
                    <div className="flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded border ${getStatusColor(execution.status)}`}>
                            {getStatusIcon(execution.status)} {execution.status}
                        </span>
                        <span className="text-slate-400">
                            已完成: {execution.completedSteps || 0} / {execution.totalSteps || 0}
                        </span>
                        {execution.durationSeconds && (
                            <span className="text-slate-400">
                                耗时: {execution.durationSeconds} 秒
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    {execution.status === 'RUNNING' && (
                        <>
                            <button
                                onClick={() => onAutoRefreshChange(!autoRefresh)}
                                className={`px-3 py-1 rounded text-sm ${
                                    autoRefresh 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-slate-700 text-slate-300'
                                }`}
                            >
                                {autoRefresh ? '🟢 自动刷新' : '⏸️ 暂停刷新'}
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                                取消
                            </button>
                        </>
                    )}
                    {execution.status === 'FAILED' && (
                        <button
                            onClick={handleAutoFix}
                            disabled={fixLoading}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50"
                        >
                            {fixLoading ? '检测中...' : '🔧 自动修复'}
                        </button>
                    )}
                </div>
            </div>

            {/* 进度条 */}
            <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                    className={`h-3 rounded-full transition-all ${
                        execution.status === 'SUCCESS' ? 'bg-green-600' :
                        execution.status === 'FAILED' ? 'bg-red-600' :
                        execution.status === 'RUNNING' ? 'bg-blue-600' :
                        'bg-slate-600'
                    }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* 自动修复面板 */}
            {showAutoFix && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-green-300 uppercase">🔧 自动修复</h4>
                        <button
                            onClick={() => setShowAutoFix(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                    <AutoFixManager executionId={execution.id} />
                </div>
            )}

            {/* 整体错误信息 */}
            {execution.status === 'FAILED' && !showAutoFix && (() => {
                const failedSteps = execution.stepExecutions?.filter(se => se.status === 'FAILED') || [];
                console.log('[PipelineProgressView] 渲染失败信息:', {
                    stepExecutionsLength: execution.stepExecutions?.length,
                    failedStepsCount: failedSteps.length,
                    failedSteps: failedSteps,
                });
                return (
                <div className="bg-red-900 bg-opacity-30 border-2 border-red-700 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-red-300 uppercase mb-2">❌ 流程执行失败</h4>
                    {execution.stepExecutions && execution.stepExecutions.length > 0 && failedSteps.length > 0 && (
                        <div className="space-y-2">
                            {failedSteps.map((failedStep, idx) => {
                                console.log('[PipelineProgressView] 渲染失败步骤:', idx, failedStep);
                                return (
                                    <div key={failedStep.id || idx} className="bg-red-950 bg-opacity-50 rounded p-3">
                                        <div className="font-semibold text-red-200 mb-1">
                                            步骤 {idx + 1}: {failedStep.stepName || failedStep.scriptName || '未知步骤'}
                                        </div>
                                        {failedStep.error && (
                                            <div className="text-red-300 text-sm whitespace-pre-wrap font-mono">
                                                {failedStep.error}
                                            </div>
                                        )}
                                        {!failedStep.error && (
                                            <div className="text-red-400 text-sm italic">
                                                未提供详细错误信息，请查看步骤日志
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {(!execution.stepExecutions || execution.stepExecutions.length === 0 || failedSteps.length === 0) && (
                        <div className="text-red-300 text-sm">
                            {execution.stepExecutions && execution.stepExecutions.length === 0 
                                ? "流程执行失败：流程没有定义任何步骤或步骤执行记录未创建"
                                : `流程执行失败，但未找到具体的失败步骤信息。步骤总数: ${execution.stepExecutions?.length || 0}，失败步骤数: ${failedSteps.length}。请检查流程模板配置或查看后端日志。`}
                        </div>
                    )}
                </div>
                );
            })()}

            {/* Pipeline 视图 */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-400 uppercase">执行流程</h4>
                <div className="relative">
                    {/* 步骤节点 */}
                    <div className="flex flex-wrap gap-4">
                        {execution.stepExecutions?.map((stepExecution, index) => {
                            const isLast = index === (execution.stepExecutions?.length || 0) - 1;
                            return (
                                <div key={stepExecution.id} className="flex items-center">
                                    <PipelineStepCard
                                        stepExecution={stepExecution}
                                        index={index}
                                    />
                                    {!isLast && (
                                        <div className="mx-2 w-8 h-0.5 bg-slate-700">
                                            <div className={`h-full transition-all ${
                                                stepExecution.status === 'SUCCESS' ? 'bg-green-600' :
                                                stepExecution.status === 'FAILED' ? 'bg-red-600' :
                                                stepExecution.status === 'RUNNING' ? 'bg-blue-600' :
                                                'bg-slate-600'
                                            }`} style={{
                                                width: stepExecution.status === 'SUCCESS' ? '100%' : 
                                                       stepExecution.status === 'RUNNING' ? '50%' : '0%'
                                            }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
