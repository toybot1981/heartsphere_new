// 模型管理 Hook

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../../services/api';
import { showAlert, showConfirm } from '../../../../utils/dialog';
import type { AIModelConfig } from '../types';

export const useModelsManagement = (adminToken: string | null) => {
    const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>([]);
    const [editingModel, setEditingModel] = useState<AIModelConfig | null>(null);
    const [modelFormData, setModelFormData] = useState<Partial<AIModelConfig>>({});
    const [loading, setLoading] = useState(false);
    const [availableModels, setAvailableModels] = useState<
        Record<string, Record<string, AIModelConfig[]>>
    >({});

    const loadModelConfigs = useCallback(async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.aiConfig.models.getAll(adminToken);
            setModelConfigs(data);
        } catch (error: any) {
            showAlert(
                '加载模型配置失败: ' + (error.message || '未知错误'),
                '加载失败',
                'error'
            );
        }
    }, [adminToken]);

    const loadModelsByProvider = useCallback(
        async (provider: string, capability: string) => {
            if (!adminToken || !provider || !capability) return;

            const key = `${capability}_${provider}`;
            if (availableModels[capability]?.[provider]) {
                return; // 已加载，不需要重复加载
            }

            try {
                const models = await adminApi.aiConfig.models.getByProviderAndCapability(
                    capability,
                    provider,
                    adminToken
                );
                setAvailableModels((prev) => ({
                    ...prev,
                    [capability]: {
                        ...prev[capability],
                        [provider]: models,
                    },
                }));
            } catch (error: any) {
                console.error('加载模型列表失败:', error);
            }
        },
        [adminToken, availableModels]
    );

    useEffect(() => {
        if (adminToken) {
            loadModelConfigs();
        }
    }, [adminToken, loadModelConfigs]);

    const handleCreateModel = () => {
        setModelFormData({
            provider: 'gemini',
            modelName: '',
            capability: 'text',
            apiKey: '',
            baseUrl: '',
            modelParams: '',
            isDefault: false,
            priority: 0,
            costPerToken: 0,
            isActive: true,
        });
        setEditingModel({ id: undefined, ...modelFormData } as AIModelConfig);
    };

    const handleEditModel = (model: AIModelConfig) => {
        setModelFormData({ ...model });
        setEditingModel(model);
    };

    const handleCancelModel = () => {
        setEditingModel(null);
        setModelFormData({});
    };

    const handleSaveModel = async () => {
        if (!adminToken) return;
        if (
            !modelFormData.provider ||
            !modelFormData.modelName ||
            !modelFormData.capability
        ) {
            showAlert('请填写提供商、模型名称和能力类型', '缺少参数', 'warning');
            return;
        }

        setLoading(true);
        try {
            if (editingModel?.id) {
                await adminApi.aiConfig.models.update(
                    editingModel.id,
                    modelFormData,
                    adminToken
                );
            } else {
                await adminApi.aiConfig.models.create(
                    modelFormData as AIModelConfig,
                    adminToken
                );
            }
            await loadModelConfigs();
            handleCancelModel();
            showAlert('保存成功', '成功', 'success');
            onReload?.();
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

    const handleDeleteModel = async (id: number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm(
            '确定要删除这个模型配置吗？',
            '删除模型配置',
            'danger'
        );
        if (!confirmed) return;

        try {
            await adminApi.aiConfig.models.delete(id, adminToken);
            await loadModelConfigs();
            showAlert('删除成功', '成功', 'success');
            onReload?.();
        } catch (error: any) {
            showAlert(
                '删除失败: ' + (error.message || '未知错误'),
                '删除失败',
                'error'
            );
        }
    };

    const handleSetDefaultModel = async (id: number) => {
        if (!adminToken) return;
        try {
            await adminApi.aiConfig.models.setDefault(id, adminToken);
            await loadModelConfigs();
            showAlert('已设置为默认模型', '成功', 'success');
        } catch (error: any) {
            showAlert(
                '设置失败: ' + (error.message || '未知错误'),
                '设置失败',
                'error'
            );
        }
    };

    const getModelsWithApiKey = (capability: string) => {
        return modelConfigs.filter((m) => {
            if (m.capability !== capability || !m.isActive) {
                return false;
            }
            return m.apiKey != null && m.apiKey.trim() !== '';
        });
    };

    return {
        modelConfigs,
        editingModel,
        modelFormData,
        loading,
        availableModels,
        setModelFormData,
        setEditingModel,
        loadModelConfigs,
        loadModelsByProvider,
        handleCreateModel,
        handleEditModel,
        handleCancelModel,
        handleSaveModel,
        handleDeleteModel,
        handleSetDefaultModel,
        getModelsWithApiKey,
    };
};

