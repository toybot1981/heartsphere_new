// 路由策略管理 Hook

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../../services/api';
import { showAlert } from '../../../../utils/dialog';
import type { RoutingStrategy, AIModelConfig } from '../types';

export const useRoutingStrategies = (
    adminToken: string | null,
    modelConfigs: AIModelConfig[],
    loadModelsByProvider: (provider: string, capability: string) => Promise<void>
) => {
    const [routingStrategies, setRoutingStrategies] = useState<RoutingStrategy[]>([]);
    const [editingStrategy, setEditingStrategy] = useState<RoutingStrategy | null>(null);
    const [strategyFormData, setStrategyFormData] = useState<Partial<RoutingStrategy>>({});
    const [loading, setLoading] = useState(false);

    const loadRoutingStrategies = useCallback(async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.aiConfig.routingStrategies.getAll(adminToken);
            setRoutingStrategies(data);
        } catch (error: any) {
            showAlert(
                '加载路由策略失败: ' + (error.message || '未知错误'),
                '加载失败',
                'error'
            );
        }
    }, [adminToken]);

    useEffect(() => {
        if (adminToken) {
            loadRoutingStrategies();
        }
    }, [adminToken, loadRoutingStrategies]);

    const handleLoadStrategy = async (capability: 'text' | 'image' | 'audio' | 'video') => {
        if (!adminToken) return;
        try {
            const strategy = await adminApi.aiConfig.routingStrategies.getByCapability(
                capability,
                adminToken
            );
            setStrategyFormData({ ...strategy });
            setEditingStrategy({ ...strategy, capability });

            // 如果已有默认提供商，预加载模型列表
            if (strategy.defaultProvider) {
                await loadModelsByProvider(strategy.defaultProvider, capability);
            }

            // 如果是容错模式，预加载降级链中所有提供商的模型列表
            if (strategy.strategyType === 'fallback' && strategy.fallbackChain) {
                const providers = new Set(
                    strategy.fallbackChain.map((item) => item.provider)
                );
                for (const provider of providers) {
                    await loadModelsByProvider(provider, capability);
                }
            }
        } catch (error: any) {
            // 如果不存在，创建新的
            setStrategyFormData({
                capability,
                strategyType: 'single',
                isActive: true,
                defaultProvider: '',
                defaultModel: '',
                fallbackChain: [],
            });
            setEditingStrategy({
                capability,
                strategyType: 'single',
                isActive: true,
            } as RoutingStrategy);
        }
    };

    const handleAddFallbackItem = () => {
        const newChain = strategyFormData.fallbackChain || [];
        newChain.push({
            provider: '',
            model: '',
            priority: newChain.length + 1,
        });
        setStrategyFormData({ ...strategyFormData, fallbackChain: newChain });
    };

    const handleRemoveFallbackItem = (index: number) => {
        const newChain = [...(strategyFormData.fallbackChain || [])];
        newChain.splice(index, 1);
        // 重新设置优先级
        newChain.forEach((item, idx) => {
            item.priority = idx + 1;
        });
        setStrategyFormData({ ...strategyFormData, fallbackChain: newChain });
    };

    const handleUpdateFallbackItem = (
        index: number,
        field: 'provider' | 'model',
        value: string
    ) => {
        const newChain = [...(strategyFormData.fallbackChain || [])];
        newChain[index] = { ...newChain[index], [field]: value };
        // 如果选择了提供商，清空模型选择并加载模型列表
        if (field === 'provider' && value && editingStrategy?.capability) {
            loadModelsByProvider(value, editingStrategy.capability);
            newChain[index].model = '';
        }
        setStrategyFormData({ ...strategyFormData, fallbackChain: newChain });
    };

    const handleMoveFallbackItem = (index: number, direction: 'up' | 'down') => {
        const newChain = [...(strategyFormData.fallbackChain || [])];
        if (direction === 'up' && index > 0) {
            [newChain[index - 1], newChain[index]] = [newChain[index], newChain[index - 1]];
        } else if (direction === 'down' && index < newChain.length - 1) {
            [newChain[index], newChain[index + 1]] = [newChain[index + 1], newChain[index]];
        }
        // 重新设置优先级
        newChain.forEach((item, idx) => {
            item.priority = idx + 1;
        });
        setStrategyFormData({ ...strategyFormData, fallbackChain: newChain });
    };

    const handleSaveStrategy = async () => {
        if (!adminToken) return;
        if (!strategyFormData.capability || !strategyFormData.strategyType) {
            showAlert('请填写能力类型和策略类型', '缺少参数', 'warning');
            return;
        }

        setLoading(true);
        try {
            await adminApi.aiConfig.routingStrategies.save(
                strategyFormData as RoutingStrategy,
                adminToken
            );
            await loadRoutingStrategies();
            setEditingStrategy(null);
            setStrategyFormData({});
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert(
                '保存失败: ' + (error.message || '未知错误'),
                '保存失败',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        routingStrategies,
        editingStrategy,
        strategyFormData,
        loading,
        setStrategyFormData,
        setEditingStrategy,
        loadRoutingStrategies,
        handleLoadStrategy,
        handleAddFallbackItem,
        handleRemoveFallbackItem,
        handleUpdateFallbackItem,
        handleMoveFallbackItem,
        handleSaveStrategy,
    };
};

