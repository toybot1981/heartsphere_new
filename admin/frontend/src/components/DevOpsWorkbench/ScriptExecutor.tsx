import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { ScriptInfo, ScriptExecutionResponse } from '../../services/api/admin/devops';
import { ExecutionMonitor } from './ExecutionMonitor';

interface ScriptExecutorProps {
    script: ScriptInfo;
    onClose: () => void;
    onExecutionStart: (execution: ScriptExecutionResponse) => void;
}

export const ScriptExecutor: React.FC<ScriptExecutorProps> = ({ script, onClose, onExecutionStart }) => {
    const [parameters, setParameters] = useState<Record<string, any>>({});
    const [executing, setExecuting] = useState(false);
    const [execution, setExecution] = useState<ScriptExecutionResponse | null>(null);
    const [showMonitor, setShowMonitor] = useState(false);

    useEffect(() => {
        // 初始化默认参数
        const defaults: Record<string, any> = {};
        script.parameters?.forEach(param => {
            if (param.type === 'boolean') {
                // 布尔类型：保持布尔值
                if (param.defaultValue !== undefined && param.defaultValue !== null) {
                    defaults[param.name] = param.defaultValue === true || param.defaultValue === 'true' || param.defaultValue === 'True';
                } else {
                    defaults[param.name] = false;
                }
            } else {
                // 其他类型：转换为字符串
                if (param.defaultValue !== undefined && param.defaultValue !== null) {
                    defaults[param.name] = String(param.defaultValue);
                } else {
                    // 如果没有默认值，设置为空字符串而不是 null
                    defaults[param.name] = '';
                }
            }
        });
        setParameters(defaults);
    }, [script]);

    const handleExecute = async () => {
        if (script.confirmRequired) {
            const confirmed = window.confirm(
                `⚠️ 警告：这是一个高风险操作！\n\n脚本：${script.name}\n\n确定要继续执行吗？`
            );
            if (!confirmed) return;
        }

        try {
            setExecuting(true);
            const token = localStorage.getItem('admin_token');
            if (!token) {
                showAlert('请先登录', '错误', 'error');
                return;
            }

            const response = await adminApi.devops.executeScript(token, script.id, parameters);
            setExecution(response);
            onExecutionStart(response);
            showAlert('脚本执行已启动', '成功', 'success');
            
            // 自动打开可视化窗口
            setShowMonitor(true);
        } catch (error: any) {
            showAlert('执行失败: ' + (error.message || '未知错误'), '错误', 'error');
        } finally {
            setExecuting(false);
        }
    };

    const handleParameterChange = (name: string, value: any) => {
        setParameters(prev => ({ ...prev, [name]: value }));
    };

    // 根据参数名提供默认选项
    const getDefaultOptionsForParameter = (paramName: string): string[] => {
        const lowerName = paramName.toLowerCase();
        if (lowerName.includes('module')) {
            return ['', 'main', 'admin', 'company', 'edu', 'mentis', 'shared'];
        }
        if (lowerName.includes('environment') || lowerName.includes('env')) {
            return ['dev', 'test', 'prod'];
        }
        if (lowerName.includes('browser')) {
            return ['chromium', 'firefox', 'webkit', 'all'];
        }
        if (lowerName.includes('mode')) {
            return ['development', 'production'];
        }
        if (lowerName.includes('version')) {
            return ['latest', 'stable', 'dev'];
        }
        // 默认返回空选项（允许用户输入）
        return [''];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]">
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">执行脚本: {script.name}</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* 脚本信息 */}
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">脚本信息</h3>
                        <p className="text-slate-300">{script.description}</p>
                        <div className="mt-2 flex gap-2">
                            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                                分类: {script.category}
                            </span>
                            {script.timeout && (
                                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                                    超时: {script.timeout}s
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 参数输入 */}
                    {script.parameters && script.parameters.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">执行参数</h3>
                            <div className="space-y-3">
                                {script.parameters.map((param) => (
                                    <div key={param.name}>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            {param.name}
                                            {param.required && <span className="text-red-400 ml-1">*</span>}
                                        </label>
                                        {param.description && (
                                            <p className="text-xs text-slate-500 mb-1">{param.description}</p>
                                        )}
                                        {param.type === 'boolean' ? (
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={(() => {
                                                        const value = parameters[param.name];
                                                        // 确保是布尔值，处理字符串 "true"/"false"
                                                        if (typeof value === 'boolean') {
                                                            return value;
                                                        }
                                                        if (typeof value === 'string') {
                                                            return value === 'true' || value === 'True';
                                                        }
                                                        return false;
                                                    })()}
                                                    onChange={(e) => handleParameterChange(param.name, e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-slate-300 text-sm">启用</span>
                                            </label>
                                        ) : (
                                            // 所有非 boolean 类型都使用下拉框
                                            <select
                                                value={(() => {
                                                    const paramValue = parameters[param.name];
                                                    // 确保值不是 null 或 undefined，转换为字符串或空字符串
                                                    if (paramValue !== undefined && paramValue !== null) {
                                                        return String(paramValue);
                                                    }
                                                    if (param.defaultValue !== undefined && param.defaultValue !== null) {
                                                        return String(param.defaultValue);
                                                    }
                                                    return '';
                                                })()}
                                                onChange={(e) => handleParameterChange(param.name, e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                            >
                                                {param.type === 'enum' && param.values ? (
                                                    // 枚举类型：使用配置的值
                                                    param.values.map((value) => (
                                                        <option key={value} value={value}>
                                                            {value === '' ? '(留空)' : value}
                                                        </option>
                                                    ))
                                                ) : (
                                                    // 字符串类型：根据参数名提供常用选项
                                                    (() => {
                                                        const options = getDefaultOptionsForParameter(param.name);
                                                        return options.map((value) => (
                                                            <option key={value} value={value}>
                                                                {value === '' ? '(留空/全部)' : value}
                                                            </option>
                                                        ));
                                                    })()
                                                )}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 执行按钮 */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleExecute}
                            disabled={executing}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            {executing ? '执行中...' : '开始执行'}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            取消
                        </button>
                    </div>

                    {/* 执行状态 */}
                    {execution && (
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">执行状态</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        execution.status === 'SUCCESS' ? 'bg-green-900 text-green-300' :
                                        execution.status === 'FAILED' ? 'bg-red-900 text-red-300' :
                                        execution.status === 'RUNNING' ? 'bg-blue-900 text-blue-300' :
                                        'bg-slate-700 text-slate-300'
                                    }`}>
                                        {execution.status}
                                    </span>
                                    <span className="text-slate-400 text-sm">
                                        执行ID: {execution.id}
                                    </span>
                                </div>
                                {execution.error && (
                                    <div className="text-red-400 text-sm mt-2">
                                        错误: {execution.error}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* 可视化监控窗口 */}
            {showMonitor && execution && (
                <ExecutionMonitor
                    executionId={execution.id}
                    scriptName={script.name}
                    onClose={() => setShowMonitor(false)}
                    onCancel={() => {
                        setShowMonitor(false);
                        // 刷新执行状态
                        const refreshStatus = async () => {
                            try {
                                const token = localStorage.getItem('admin_token');
                                if (!token) return;
                                const updated = await adminApi.devops.getExecutionStatus(token, execution.id);
                                setExecution(updated);
                            } catch (e) {
                                console.error('Failed to refresh execution status', e);
                            }
                        };
                        refreshStatus();
                    }}
                />
            )}
        </div>
    );
};
