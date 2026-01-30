import React, { useState } from 'react';
import type { PipelineStepExecution } from '../../services/api/admin/devops';
import { ExecutionDetail } from './ExecutionDetail';
import { ExecutionMonitor } from './ExecutionMonitor';

interface PipelineStepCardProps {
    stepExecution: PipelineStepExecution;
    index: number;
}

export const PipelineStepCard: React.FC<PipelineStepCardProps> = ({
    stepExecution,
    index,
}) => {
    const [showDetail, setShowDetail] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'bg-green-900 text-green-300 border-green-700';
            case 'FAILED':
                return 'bg-red-900 text-red-300 border-red-700';
            case 'RUNNING':
                return 'bg-blue-900 text-blue-300 border-blue-700 animate-pulse';
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

    return (
        <>
            <div
                className={`bg-slate-900 rounded-lg p-4 border-2 ${getStatusColor(stepExecution.status)} transition-opacity`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">{index + 1}</span>
                        <div>
                            <h4 className="font-semibold text-white">{stepExecution.stepName || '未知步骤'}</h4>
                            {stepExecution.scriptName && (
                                <p className="text-xs text-slate-400 mt-1">{stepExecution.scriptName}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(stepExecution.status)}`}>
                            {getStatusIcon(stepExecution.status)} {stepExecution.status}
                        </span>
                        {stepExecution.durationSeconds && (
                            <span className="text-xs text-slate-400">
                                {stepExecution.durationSeconds}s
                            </span>
                        )}
                    </div>
                </div>
                {/* 错误信息显示 */}
                {stepExecution.status === 'FAILED' && (
                    <div className="mt-3 bg-red-950 bg-opacity-50 border border-red-800 rounded p-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <div className="text-red-200 font-semibold text-sm mb-1">❌ 执行失败</div>
                                {stepExecution.error ? (
                                    <div className="text-red-300 text-xs whitespace-pre-wrap font-mono break-words">
                                        {stepExecution.error}
                                    </div>
                                ) : (
                                    <div className="text-red-400 text-xs italic">
                                        未提供详细错误信息
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 操作按钮 */}
                <div className="mt-3 flex gap-2">
                    {stepExecution.scriptExecutionId ? (
                        <>
                            <button
                                onClick={() => setShowLogs(true)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1"
                            >
                                📋 实时日志
                            </button>
                            <button
                                onClick={() => setShowDetail(true)}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                            >
                                详情
                            </button>
                        </>
                    ) : stepExecution.status === 'FAILED' ? (
                        <div className="text-xs text-slate-400 italic">
                            此步骤未关联脚本执行，无法查看日志
                        </div>
                    ) : null}
                </div>
            </div>

            {showLogs && stepExecution.scriptExecutionId && (
                <ExecutionMonitor
                    executionId={stepExecution.scriptExecutionId}
                    scriptName={stepExecution.scriptName || stepExecution.stepName}
                    onClose={() => setShowLogs(false)}
                />
            )}

            {showDetail && stepExecution.scriptExecutionId && (
                <ExecutionDetail
                    executionId={stepExecution.scriptExecutionId}
                    onClose={() => setShowDetail(false)}
                />
            )}
        </>
    );
};
