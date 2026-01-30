import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import type { EnvironmentVariable } from '../../services/api/admin/devops';
import { showAlert } from '../../utils/dialog';

interface EnvironmentVariableEditorProps {
    project?: string;
    module?: string;
    pipelineId?: number;
    environment?: string;
    variables?: Record<string, string>;
    onChange?: (variables: Record<string, string>) => void;
    readOnly?: boolean;
}

export const EnvironmentVariableEditor: React.FC<EnvironmentVariableEditorProps> = ({
    project,
    module,
    pipelineId,
    environment,
    variables: initialVariables,
    onChange,
    readOnly = false,
}) => {
    const [variables, setVariables] = useState<Record<string, string>>(initialVariables || {});
    const [resolvedVariables, setResolvedVariables] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (initialVariables) {
            setVariables(initialVariables);
        }
    }, [initialVariables]);

    useEffect(() => {
        loadResolvedVariables();
    }, [project, module, pipelineId, environment]);

    const loadResolvedVariables = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            setLoading(true);
            const resolved = await adminApi.devops.resolveEnvironmentVariables(
                token,
                project,
                module,
                pipelineId,
                environment
            );
            setResolvedVariables(resolved);
            
            // 合并解析的变量到当前变量（用户覆盖的变量优先级更高）
            const merged = { ...resolved, ...variables };
            setVariables(merged);
            onChange?.(merged);
        } catch (error: any) {
            console.error('Failed to load resolved variables', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVariable = () => {
        const name = prompt('请输入变量名（HS_ 前缀，UPPER_SNAKE_CASE）：');
        if (!name) return;

        if (!name.match(/^HS_[A-Z][A-Z0-9_]*$/)) {
            showAlert('变量名必须符合命名规范：HS_ 前缀，UPPER_SNAKE_CASE（如：HS_DB_PASSWORD）', '错误', 'error');
            return;
        }

        const newVariables = { ...variables, [name]: '' };
        setVariables(newVariables);
        onChange?.(newVariables);
    };

    const handleRemoveVariable = (name: string) => {
        const newVariables = { ...variables };
        delete newVariables[name];
        setVariables(newVariables);
        onChange?.(newVariables);
    };

    const handleVariableChange = (name: string, value: string) => {
        const newVariables = { ...variables, [name]: value };
        setVariables(newVariables);
        onChange?.(newVariables);
    };

    const toggleShowSensitive = (name: string) => {
        setShowSensitive(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const isResolved = (name: string) => {
        return resolvedVariables.hasOwnProperty(name) && !variables.hasOwnProperty(name);
    };

    const isOverridden = (name: string) => {
        return resolvedVariables.hasOwnProperty(name) && variables.hasOwnProperty(name) &&
               resolvedVariables[name] !== variables[name];
    };

    return (
        <div className="bg-slate-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">环境变量配置</h3>
                {!readOnly && (
                    <button
                        onClick={handleAddVariable}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                        + 添加变量
                    </button>
                )}
            </div>

            {loading && (
                <div className="text-slate-400 text-sm">加载中...</div>
            )}

            {Object.keys(variables).length === 0 && !loading && (
                <div className="text-slate-400 text-sm">暂无环境变量</div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(variables).map(([name, value]) => {
                    const isResolvedVar = isResolved(name);
                    const isOverriddenVar = isOverridden(name);
                    const isSensitive = name.toLowerCase().includes('password') || 
                                       name.toLowerCase().includes('secret') ||
                                       name.toLowerCase().includes('key');
                    const showValue = showSensitive[name] || !isSensitive;

                    return (
                        <div
                            key={name}
                            className={`p-3 rounded border ${
                                isOverriddenVar ? 'border-yellow-600 bg-yellow-900 bg-opacity-20' :
                                isResolvedVar ? 'border-blue-600 bg-blue-900 bg-opacity-20' :
                                'border-slate-700 bg-slate-900'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono text-sm">{name}</span>
                                    {isResolvedVar && (
                                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">已解析</span>
                                    )}
                                    {isOverriddenVar && (
                                        <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs rounded">已覆盖</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSensitive && (
                                        <button
                                            onClick={() => toggleShowSensitive(name)}
                                            className="text-slate-400 hover:text-slate-300 text-xs"
                                        >
                                            {showValue ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    )}
                                    {!readOnly && (
                                        <button
                                            onClick={() => handleRemoveVariable(name)}
                                            className="text-red-400 hover:text-red-300 text-xs"
                                        >
                                            删除
                                        </button>
                                    )}
                                </div>
                            </div>
                            {readOnly ? (
                                <div className="text-slate-300 font-mono text-sm">
                                    {showValue ? value : '****'}
                                </div>
                            ) : (
                                <input
                                    type={showValue ? 'text' : 'password'}
                                    value={showValue ? value : '****'}
                                    onChange={(e) => handleVariableChange(name, e.target.value)}
                                    className="w-full px-2 py-1 bg-slate-700 text-white rounded text-sm font-mono"
                                    placeholder="变量值"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {Object.keys(resolvedVariables).length > 0 && (
                <div className="text-xs text-slate-400 mt-2">
                    提示：已解析 {Object.keys(resolvedVariables).length} 个环境变量（GLOBAL → PROJECT → MODULE → PIPELINE）
                </div>
            )}
        </div>
    );
};
