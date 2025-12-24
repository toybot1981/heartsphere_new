import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/Button';
import { InputGroup, TextInput, TextArea, ConfigSection } from './AdminUIComponents';
import { useAdminState } from '../contexts/AdminStateContext';
import { useAdminData } from '../hooks/useAdminData';
import { showAlert, showConfirm } from '../../utils/dialog';
import { GeneralSettings } from './settings/GeneralSettings';
import { AISettings } from './settings/AISettings';

interface SettingsManagementProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

interface AIModelConfig {
    id?: number;
    provider: string;
    modelName: string;
    capability: 'text' | 'image' | 'audio' | 'video';
    apiKey: string;
    baseUrl?: string;
    modelParams?: string;
    isDefault: boolean;
    priority: number;
    costPerToken?: number;
    isActive: boolean;
    description?: string;
}

interface RoutingStrategy {
    id?: number;
    capability: 'text' | 'image' | 'audio' | 'video';
    strategyType: 'single' | 'fallback' | 'economy';
    isActive: boolean;
    description?: string;
    defaultProvider?: string;
    defaultModel?: string;
    fallbackChain?: Array<{
        provider: string;
        model: string;
        priority: number;
    }>;
    economyConfig?: {
        enabled: boolean;
        preferredProvider?: string;
        maxCostPerToken?: number;
    };
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const { settingsTab, setSettingsTab } = useAdminState();
    const { notionConfig, loadSystemData } = useAdminData(adminToken);
    
    // AI模型配置状态
    const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>([]);
    const [editingModel, setEditingModel] = useState<AIModelConfig | null>(null);
    const [modelFormData, setModelFormData] = useState<Partial<AIModelConfig>>({});
    
    // 路由策略状态
    const [routingStrategies, setRoutingStrategies] = useState<RoutingStrategy[]>([]);
    const [editingStrategy, setEditingStrategy] = useState<RoutingStrategy | null>(null);
    const [strategyFormData, setStrategyFormData] = useState<Partial<RoutingStrategy>>({});
    
    const [loading, setLoading] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState<'models' | 'routing'>('models');
    
    // 用于存储每个能力类型和提供商的可用模型列表
    const [availableModels, setAvailableModels] = useState<Record<string, Record<string, AIModelConfig[]>>>({});
    
    // API Key申请引导模态框状态
    const [showApiKeyGuide, setShowApiKeyGuide] = useState(false);
    const [guideProvider, setGuideProvider] = useState<string>('');
    
    // 微信开放平台配置状态
    const [wechatConfig, setWechatConfig] = useState<{ appId: string; appSecret: string; redirectUri: string }>({
        appId: '',
        appSecret: '',
        redirectUri: '',
    });
    
    // 微信支付配置状态
    const [wechatPayConfig, setWechatPayConfig] = useState<{ appId: string; mchId: string; apiKey: string; apiV3Key: string; certPath: string; notifyUrl: string }>({
        appId: '',
        mchId: '',
        apiKey: '',
        apiV3Key: '',
        certPath: '',
        notifyUrl: '',
    });
    
    // 支付宝支付配置状态
    const [alipayConfig, setAlipayConfig] = useState<{ appId: string; privateKey: string; publicKey: string; notifyUrl: string; returnUrl: string; gatewayUrl: string }>({
        appId: '',
        privateKey: '',
        publicKey: '',
        notifyUrl: '',
        returnUrl: '',
        gatewayUrl: 'https://openapi.alipay.com/gateway.do',
    });

    // 加载模型配置
    const loadModelConfigs = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.aiConfig.models.getAll(adminToken);
            setModelConfigs(data);
        } catch (error: any) {
            showAlert('加载模型配置失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        }
    };

    // 加载路由策略
    const loadRoutingStrategies = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.aiConfig.routingStrategies.getAll(adminToken);
            setRoutingStrategies(data);
        } catch (error: any) {
            showAlert('加载路由策略失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        }
    };

    useEffect(() => {
        if (adminToken && settingsTab === 'models') {
            loadModelConfigs();
            loadRoutingStrategies();
        }
        if (adminToken && settingsTab === 'general') {
            loadWechatConfig();
            loadWechatPayConfig();
            loadAlipayConfig();
        }
    }, [adminToken, settingsTab]);
    
    // 加载微信开放平台配置
    const loadWechatConfig = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.config.getWechatConfig(adminToken);
            // 如果 appSecret 是 "******"（隐藏的密码占位符），则设置为空字符串
            setWechatConfig({
                ...data,
                appSecret: data.appSecret === '******' ? '' : data.appSecret
            });
        } catch (error: any) {
            console.error('加载微信配置失败:', error);
        }
    };
    
    // 加载微信支付配置
    const loadWechatPayConfig = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.config.getWechatPayConfig(adminToken);
            setWechatPayConfig(data);
        } catch (error: any) {
            console.error('加载微信支付配置失败:', error);
        }
    };
    
    // 加载支付宝支付配置
    const loadAlipayConfig = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.config.getAlipayConfig(adminToken);
            setAlipayConfig(data);
        } catch (error: any) {
            console.error('加载支付宝配置失败:', error);
        }
    };
    
    // 保存微信开放平台配置
    const handleSaveWechatConfig = async () => {
        if (!adminToken) return;
        try {
            // 如果 appSecret 是 "******"（隐藏的密码占位符），则不发送
            const configToSave = {
                ...wechatConfig,
                appSecret: wechatConfig.appSecret === '******' ? undefined : wechatConfig.appSecret
            };
            await adminApi.config.setWechatConfig(configToSave, adminToken);
            await loadWechatConfig();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };
    
    // 保存微信支付配置
    const handleSaveWechatPayConfig = async () => {
        if (!adminToken) return;
        try {
            await adminApi.config.setWechatPayConfig(wechatPayConfig, adminToken);
            await loadWechatPayConfig();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };
    
    // 保存支付宝支付配置
    const handleSaveAlipayConfig = async () => {
        if (!adminToken) return;
        try {
            await adminApi.config.setAlipayConfig(alipayConfig, adminToken);
            await loadAlipayConfig();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };

    // 加载指定提供商和能力类型的模型列表
    const loadModelsByProvider = async (provider: string, capability: string) => {
        if (!adminToken || !provider || !capability) return;
        
        const key = `${capability}_${provider}`;
        if (availableModels[capability]?.[provider]) {
            return; // 已加载，不需要重复加载
        }
        
        try {
            const models = await adminApi.aiConfig.models.getByProviderAndCapability(capability, provider, adminToken);
            setAvailableModels(prev => ({
                ...prev,
                [capability]: {
                    ...prev[capability],
                    [provider]: models
                }
            }));
        } catch (error: any) {
            console.error('加载模型列表失败:', error);
        }
    };

    // 模型配置管理
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
        if (!modelFormData.provider || !modelFormData.modelName || !modelFormData.capability) {
            showAlert('请填写提供商、模型名称和能力类型', '缺少参数', 'warning');
            return;
        }
        
        setLoading(true);
        try {
            if (editingModel?.id) {
                await adminApi.aiConfig.models.update(editingModel.id, modelFormData, adminToken);
            } else {
                await adminApi.aiConfig.models.create(modelFormData as AIModelConfig, adminToken);
            }
            await loadModelConfigs();
            handleCancelModel();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteModel = async (id: number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定要删除这个模型配置吗？', '删除模型配置', 'danger');
        if (!confirmed) return;
        
        try {
            await adminApi.aiConfig.models.delete(id, adminToken);
            await loadModelConfigs();
            showAlert('删除成功', '成功', 'success');
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };

    const handleSetDefaultModel = async (id: number) => {
        if (!adminToken) return;
        try {
            await adminApi.aiConfig.models.setDefault(id, adminToken);
            await loadModelConfigs();
            showAlert('已设置为默认模型', '成功', 'success');
        } catch (error: any) {
            showAlert('设置失败: ' + (error.message || '未知错误'), '设置失败', 'error');
        }
    };

    // 路由策略管理
    const handleLoadStrategy = async (capability: 'text' | 'image' | 'audio' | 'video') => {
        if (!adminToken) return;
        try {
            const strategy = await adminApi.aiConfig.routingStrategies.getByCapability(capability, adminToken);
            setStrategyFormData({ ...strategy });
            setEditingStrategy({ ...strategy, capability });
            
            // 如果已有默认提供商，预加载模型列表
            if (strategy.defaultProvider) {
                await loadModelsByProvider(strategy.defaultProvider, capability);
            }
            
            // 如果是容错模式，预加载降级链中所有提供商的模型列表
            if (strategy.strategyType === 'fallback' && strategy.fallbackChain) {
                const providers = new Set(strategy.fallbackChain.map(item => item.provider));
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
            setEditingStrategy({ capability, strategyType: 'single', isActive: true } as RoutingStrategy);
        }
    };
    
    // 降级链管理
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
        const newChain = strategyFormData.fallbackChain || [];
        newChain.splice(index, 1);
        // 重新设置优先级
        newChain.forEach((item, idx) => {
            item.priority = idx + 1;
        });
        setStrategyFormData({ ...strategyFormData, fallbackChain: newChain });
    };
    
    const handleUpdateFallbackItem = (index: number, field: 'provider' | 'model', value: string) => {
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
    
    // 获取已配置API-key的模型列表（用于降级链选择）
    const getModelsWithApiKey = (capability: string) => {
        return modelConfigs.filter(m => {
            // 检查模型是否属于指定能力类型且启用
            if (m.capability !== capability || !m.isActive) {
                return false;
            }
            
            // 检查API key是否存在且有效
            // 注意：后端返回的API key可能是部分隐藏的（如 sk-****xxxx），
            // 但只要有值就说明已配置（即使前端看到的是隐藏后的值）
            // 如果apiKey包含****，说明后端返回的是隐藏后的值，但原始值已配置
            // 如果apiKey不包含****且不为空，说明是完整的或新配置的
            // 只有apiKey为空、null或undefined的才是未配置的
            return m.apiKey != null && m.apiKey.trim() !== '';
        });
    };

    const handleSaveStrategy = async () => {
        if (!adminToken) return;
        if (!strategyFormData.capability || !strategyFormData.strategyType) {
            showAlert('请填写能力类型和策略类型', '缺少参数', 'warning');
            return;
        }
        
        setLoading(true);
        try {
            await adminApi.aiConfig.routingStrategies.save(strategyFormData as RoutingStrategy, adminToken);
            await loadRoutingStrategies();
            setEditingStrategy(null);
            setStrategyFormData({});
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotionConfig = async (config: any) => {
        if (!adminToken) return;
        try {
            await adminApi.config.updateNotionConfig(config, adminToken);
            await loadSystemData(adminToken);
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };

    const capabilities = ['text', 'image', 'audio', 'video'] as const;
    const providers = [
        { value: 'gemini', label: 'Google Gemini' },
        { value: 'openai', label: 'OpenAI' },
        { value: 'qwen', label: 'Alibaba Qwen' },
        { value: 'doubao', label: 'Volcengine Doubao' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* 标签页切换 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex gap-2">
                    <button
                        onClick={() => setSettingsTab('general')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            settingsTab === 'general'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        通用设置
                    </button>
                    <button
                        onClick={() => setSettingsTab('models')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            settingsTab === 'models'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        AI模型配置
                    </button>
                </div>
            </div>

            {/* 通用设置 */}
            {settingsTab === 'general' && (
                <GeneralSettings adminToken={adminToken} onReload={onReload} />
            )}

            {/* AI模型配置 */}
            {settingsTab === 'models' && (
                <AISettings adminToken={adminToken} onReload={onReload} />
            )}
        </div>
    );
};
