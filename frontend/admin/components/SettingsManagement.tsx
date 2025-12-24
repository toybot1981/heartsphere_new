import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/Button';
import { InputGroup, TextInput, TextArea, ConfigSection } from './AdminUIComponents';
import { useAdminState } from '../contexts/AdminStateContext';
import { useAdminData } from '../hooks/useAdminData';
import { showAlert, showConfirm } from '../../utils/dialog';

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
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">通用设置</h3>
                    
                    {/* Notion 配置 */}
                    <ConfigSection title="Notion 配置">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs text-slate-400">配置 Notion 集成以同步笔记数据</span>
                            <a 
                                href="https://developers.notion.com/docs/getting-started" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                                📖 如何申请
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <InputGroup label="Notion Integration Token">
                            <TextInput
                                type="password"
                                value={notionConfig?.integrationToken || ''}
                                onChange={(e) => handleSaveNotionConfig({ ...notionConfig, integrationToken: e.target.value })}
                                placeholder="输入 Notion Integration Token"
                            />
                        </InputGroup>
                        <InputGroup label="Notion Database ID">
                            <TextInput
                                value={notionConfig?.databaseId || ''}
                                onChange={(e) => handleSaveNotionConfig({ ...notionConfig, databaseId: e.target.value })}
                                placeholder="输入 Notion Database ID"
                            />
                        </InputGroup>
                    </ConfigSection>
                    
                    {/* 微信开放平台配置 */}
                    <ConfigSection title="微信开放平台配置（用于扫码登录）">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs text-slate-400">配置微信开放平台网站应用以启用扫码登录</span>
                            <a 
                                href="https://open.weixin.qq.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                                📖 如何申请
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <InputGroup label="AppID">
                            <TextInput
                                value={wechatConfig.appId}
                                onChange={(e) => setWechatConfig({ ...wechatConfig, appId: e.target.value })}
                                placeholder="输入微信开放平台网站应用的AppID"
                            />
                        </InputGroup>
                        <InputGroup label="AppSecret">
                            <TextInput
                                type="password"
                                value={wechatConfig.appSecret}
                                onChange={(e) => setWechatConfig({ ...wechatConfig, appSecret: e.target.value })}
                                placeholder="输入微信开放平台网站应用的AppSecret"
                            />
                        </InputGroup>
                        <InputGroup label="回调地址（Redirect URI）">
                            <TextInput
                                value={wechatConfig.redirectUri}
                                onChange={(e) => setWechatConfig({ ...wechatConfig, redirectUri: e.target.value })}
                                placeholder="例如：http://localhost:8081/api/wechat/callback"
                            />
                        </InputGroup>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleSaveWechatConfig} className="bg-indigo-600 hover:bg-indigo-700">
                                保存配置
                            </Button>
                        </div>
                    </ConfigSection>
                    
                    {/* 微信支付配置 */}
                    <ConfigSection title="微信支付配置">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs text-slate-400">配置微信支付以启用支付功能</span>
                            <a 
                                href="https://pay.weixin.qq.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                                📖 如何申请
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <InputGroup label="AppID（商户号对应的AppID）">
                            <TextInput
                                value={wechatPayConfig.appId}
                                onChange={(e) => setWechatPayConfig({ ...wechatPayConfig, appId: e.target.value })}
                                placeholder="输入微信支付AppID"
                            />
                        </InputGroup>
                        <InputGroup label="商户号（MchId）">
                            <TextInput
                                value={wechatPayConfig.mchId}
                                onChange={(e) => setWechatPayConfig({ ...wechatPayConfig, mchId: e.target.value })}
                                placeholder="输入微信支付商户号"
                            />
                        </InputGroup>
                        <InputGroup label="API密钥（用于签名）">
                            <TextInput
                                type="password"
                                value={wechatPayConfig.apiKey}
                                onChange={(e) => setWechatPayConfig({ ...wechatPayConfig, apiKey: e.target.value })}
                                placeholder="输入微信支付API密钥"
                            />
                        </InputGroup>
                        <InputGroup label="API v3密钥">
                            <TextInput
                                type="password"
                                value={wechatPayConfig.apiV3Key}
                                onChange={(e) => setWechatPayConfig({ ...wechatPayConfig, apiV3Key: e.target.value })}
                                placeholder="输入微信支付API v3密钥"
                            />
                        </InputGroup>
                        <InputGroup label="证书路径（可选）">
                            <TextInput
                                value={wechatPayConfig.certPath || ''}
                                onChange={(e) => setWechatPayConfig({ ...wechatPayConfig, certPath: e.target.value })}
                                placeholder="输入微信支付证书路径（可选）"
                            />
                        </InputGroup>
                        <InputGroup label="回调通知地址">
                            <TextInput
                                value={wechatPayConfig.notifyUrl}
                                onChange={(e) => setWechatPayConfig({ ...wechatPayConfig, notifyUrl: e.target.value })}
                                placeholder="例如：http://yourdomain.com/api/payment/wechat/notify"
                            />
                        </InputGroup>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleSaveWechatPayConfig} className="bg-indigo-600 hover:bg-indigo-700">
                                保存配置
                            </Button>
                        </div>
                    </ConfigSection>
                    
                    {/* 支付宝支付配置 */}
                    <ConfigSection title="支付宝支付配置">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs text-slate-400">配置支付宝支付以启用支付功能</span>
                            <a 
                                href="https://open.alipay.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                                📖 如何申请
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <InputGroup label="应用AppID">
                            <TextInput
                                value={alipayConfig.appId}
                                onChange={(e) => setAlipayConfig({ ...alipayConfig, appId: e.target.value })}
                                placeholder="输入支付宝应用AppID"
                            />
                        </InputGroup>
                        <InputGroup label="应用私钥（RSA2）">
                            <TextArea
                                value={alipayConfig.privateKey}
                                onChange={(e) => setAlipayConfig({ ...alipayConfig, privateKey: e.target.value })}
                                placeholder="输入支付宝应用私钥（RSA2格式）"
                                rows={4}
                                className="font-mono text-xs"
                            />
                        </InputGroup>
                        <InputGroup label="支付宝公钥（用于验签）">
                            <TextArea
                                value={alipayConfig.publicKey}
                                onChange={(e) => setAlipayConfig({ ...alipayConfig, publicKey: e.target.value })}
                                placeholder="输入支付宝公钥"
                                rows={4}
                                className="font-mono text-xs"
                            />
                        </InputGroup>
                        <InputGroup label="异步回调通知地址">
                            <TextInput
                                value={alipayConfig.notifyUrl}
                                onChange={(e) => setAlipayConfig({ ...alipayConfig, notifyUrl: e.target.value })}
                                placeholder="例如：http://yourdomain.com/api/payment/alipay/notify"
                            />
                        </InputGroup>
                        <InputGroup label="同步返回地址">
                            <TextInput
                                value={alipayConfig.returnUrl}
                                onChange={(e) => setAlipayConfig({ ...alipayConfig, returnUrl: e.target.value })}
                                placeholder="例如：http://yourdomain.com/payment/return"
                            />
                        </InputGroup>
                        <InputGroup label="网关地址">
                            <TextInput
                                value={alipayConfig.gatewayUrl}
                                onChange={(e) => setAlipayConfig({ ...alipayConfig, gatewayUrl: e.target.value })}
                                placeholder="默认：https://openapi.alipay.com/gateway.do"
                            />
                        </InputGroup>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleSaveAlipayConfig} className="bg-indigo-600 hover:bg-indigo-700">
                                保存配置
                            </Button>
                        </div>
                    </ConfigSection>
                </div>
            )}

            {/* AI模型配置 */}
            {settingsTab === 'models' && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-100 mb-2">AI 模型配置（统一接入模式）</h3>
                        <p className="text-sm text-slate-400">
                            管理系统统一接入模式下的AI模型配置和路由策略。所有配置将用于后台统一路由。
                        </p>
                    </div>

                    {/* 子标签页 */}
                    <div className="mb-6 flex gap-2 border-b border-slate-700">
                        <button
                            onClick={() => setActiveSubTab('models')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeSubTab === 'models'
                                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                                    : 'text-slate-400 hover:text-slate-300'
                            }`}
                        >
                            模型配置
                        </button>
                        <button
                            onClick={() => setActiveSubTab('routing')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeSubTab === 'routing'
                                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                                    : 'text-slate-400 hover:text-slate-300'
                            }`}
                        >
                            路由策略
                        </button>
                    </div>

                    {/* 模型配置管理 */}
                    {activeSubTab === 'models' && (
                        <div className="space-y-6">
                            {!editingModel ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-md font-bold text-slate-200">模型配置列表</h4>
                                        <Button onClick={handleCreateModel} className="bg-indigo-600 hover:bg-indigo-700">
                                            + 新增模型配置
                                        </Button>
                                    </div>

                                    {/* 按供应商分组显示 */}
                                    {providers.map(provider => {
                                        const models = modelConfigs.filter(m => m.provider === provider.value);
                                        if (models.length === 0) return null;
                                        
                                        return (
                                            <div key={provider.value} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                                <h5 className="text-sm font-bold text-slate-300 mb-3">
                                                    {provider.label}
                                                </h5>
                                                <div className="space-y-3">
                                                    {/* 按能力类型进一步分组 */}
                                                    {capabilities.map(capability => {
                                                        const capabilityModels = models.filter(m => m.capability === capability);
                                                        if (capabilityModels.length === 0) return null;
                                                        
                                                        return (
                                                            <div key={capability} className="bg-slate-900 p-3 rounded border border-slate-700">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-xs font-medium text-slate-400 uppercase">
                                                                        {capability === 'text' ? '📝 文本生成' : 
                                                                         capability === 'image' ? '🖼️ 图片生成' :
                                                                         capability === 'audio' ? '🎵 音频处理' : '🎬 视频生成'}
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {capabilityModels.map(model => (
                                                                        <div key={model.id} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-sm font-medium text-slate-200">{model.modelName}</span>
                                                                                    {model.isDefault && (
                                                                                        <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded border border-green-600/30">
                                                                                            默认
                                                                                        </span>
                                                                                    )}
                                                                                    {!model.isActive && (
                                                                                        <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-0.5 rounded border border-slate-600/30">
                                                                                            禁用
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                {model.baseUrl && (
                                                                                    <p className="text-xs text-slate-500 mt-1">{model.baseUrl}</p>
                                                                                )}
                                                                                {model.description && (
                                                                                    <p className="text-xs text-slate-400 mt-1">{model.description}</p>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                {!model.isDefault && (
                                                                                    <Button
                                                                                        onClick={() => model.id && handleSetDefaultModel(model.id)}
                                                                                        className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                                                                                    >
                                                                                        设为默认
                                                                                    </Button>
                                                                                )}
                                                                                <Button
                                                                                    onClick={() => handleEditModel(model)}
                                                                                    className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1"
                                                                                >
                                                                                    编辑
                                                                                </Button>
                                                                                <Button
                                                                                    onClick={() => model.id && handleDeleteModel(model.id)}
                                                                                    className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
                                                                                >
                                                                                    删除
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-md font-bold text-slate-200">
                                            {editingModel.id ? '编辑模型配置' : '新建模型配置'}
                                        </h4>
                                        <Button variant="ghost" onClick={handleCancelModel}>取消</Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="提供商 *">
                                            <select
                                                value={modelFormData.provider || ''}
                                                onChange={(e) => setModelFormData({ ...modelFormData, provider: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                            >
                                                <option value="">选择提供商</option>
                                                {providers.map(p => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </InputGroup>
                                        <InputGroup label="模型名称 *">
                                            <TextInput
                                                value={modelFormData.modelName || ''}
                                                onChange={(e) => setModelFormData({ ...modelFormData, modelName: e.target.value })}
                                                placeholder="例如：gemini-2.0-flash-exp"
                                            />
                                        </InputGroup>
                                        <InputGroup label="能力类型 *">
                                            <select
                                                value={modelFormData.capability || ''}
                                                onChange={(e) => setModelFormData({ ...modelFormData, capability: e.target.value as any })}
                                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                            >
                                                <option value="">选择能力类型</option>
                                                <option value="text">文本生成</option>
                                                <option value="image">图片生成</option>
                                                <option value="audio">音频处理</option>
                                                <option value="video">视频生成</option>
                                            </select>
                                        </InputGroup>
                                        <InputGroup label="API Key *">
                                            <div className="flex gap-2">
                                                <TextInput
                                                    type="password"
                                                    value={modelFormData.apiKey || ''}
                                                    onChange={(e) => setModelFormData({ ...modelFormData, apiKey: e.target.value })}
                                                    placeholder="输入API Key"
                                                    className="flex-1"
                                                />
                                                {modelFormData.provider && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setGuideProvider(modelFormData.provider || '');
                                                            setShowApiKeyGuide(true);
                                                        }}
                                                        className="bg-slate-700 hover:bg-slate-600 text-xs whitespace-nowrap"
                                                    >
                                                        📖 如何申请
                                                    </Button>
                                                )}
                                            </div>
                                        </InputGroup>
                                        <InputGroup label="Base URL">
                                            <TextInput
                                                value={modelFormData.baseUrl || ''}
                                                onChange={(e) => setModelFormData({ ...modelFormData, baseUrl: e.target.value })}
                                                placeholder="例如：https://api.openai.com/v1"
                                            />
                                        </InputGroup>
                                        <InputGroup label="优先级">
                                            <TextInput
                                                type="number"
                                                value={modelFormData.priority || 0}
                                                onChange={(e) => setModelFormData({ ...modelFormData, priority: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                            />
                                        </InputGroup>
                                        <InputGroup label="每Token成本">
                                            <TextInput
                                                type="number"
                                                step="0.00000001"
                                                value={modelFormData.costPerToken || ''}
                                                onChange={(e) => setModelFormData({ ...modelFormData, costPerToken: parseFloat(e.target.value) || undefined })}
                                                placeholder="0.00000001"
                                            />
                                        </InputGroup>
                                        <InputGroup label="模型参数（JSON）">
                                            <TextArea
                                                value={modelFormData.modelParams || ''}
                                                onChange={(e) => setModelFormData({ ...modelFormData, modelParams: e.target.value })}
                                                placeholder='{"temperature": 0.7, "max_tokens": 2000}'
                                                rows={3}
                                                className="font-mono text-xs"
                                            />
                                        </InputGroup>
                                        <InputGroup label="描述">
                                            <TextInput
                                                value={modelFormData.description || ''}
                                                onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
                                                placeholder="模型描述"
                                            />
                                        </InputGroup>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <label className="flex items-center gap-2 text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={modelFormData.isDefault || false}
                                                onChange={(e) => setModelFormData({ ...modelFormData, isDefault: e.target.checked })}
                                                className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                            />
                                            设为默认模型
                                        </label>
                                        <label className="flex items-center gap-2 text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={modelFormData.isActive !== false}
                                                onChange={(e) => setModelFormData({ ...modelFormData, isActive: e.target.checked })}
                                                className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                            />
                                            启用
                                        </label>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button variant="ghost" onClick={handleCancelModel}>取消</Button>
                                        <Button onClick={handleSaveModel} disabled={loading} className="bg-indigo-600">
                                            {loading ? '保存中...' : '保存'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 路由策略配置 */}
                    {activeSubTab === 'routing' && (
                        <div className="space-y-6">
                            {capabilities.map(capability => {
                                const strategy = routingStrategies.find(s => s.capability === capability);
                                const isEditing = editingStrategy?.capability === capability;
                                
                                return (
                                    <div key={capability} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-md font-bold text-slate-200 uppercase">
                                                {capability === 'text' ? '文本生成路由策略' : 
                                                 capability === 'image' ? '图片生成路由策略' :
                                                 capability === 'audio' ? '音频处理路由策略' : '视频生成路由策略'}
                                            </h4>
                                            {!isEditing && (
                                                <Button
                                                    onClick={() => handleLoadStrategy(capability)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-sm"
                                                >
                                                    {strategy ? '编辑策略' : '创建策略'}
                                                </Button>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <InputGroup label="策略类型 *">
                                                    <select
                                                        value={strategyFormData.strategyType || 'single'}
                                                        onChange={(e) => setStrategyFormData({ 
                                                            ...strategyFormData, 
                                                            strategyType: e.target.value as 'single' | 'fallback' | 'economy' 
                                                        })}
                                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                    >
                                                        <option value="single">单一模式（只使用默认模型）</option>
                                                        <option value="fallback">容错模式（按顺序试错）</option>
                                                        <option value="economy">经济模式（选择最便宜的模型）</option>
                                                    </select>
                                                </InputGroup>

                                                {strategyFormData.strategyType === 'single' && (
                                                    <>
                                                        <InputGroup label="默认模型（从模型配置中读取）">
                                                            {(() => {
                                                                const defaultModel = modelConfigs.find(m => 
                                                                    m.capability === editingStrategy?.capability && m.isDefault && m.isActive
                                                                );
                                                                if (defaultModel) {
                                                                    return (
                                                                        <div className="p-3 bg-slate-900 rounded border border-slate-700">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-bold text-white">{defaultModel.provider}</span>
                                                                                <span className="text-slate-400">/</span>
                                                                                <span className="text-slate-300">{defaultModel.modelName}</span>
                                                                                <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded border border-green-600/30">
                                                                                    默认
                                                                                </span>
                                                                            </div>
                                                                            {defaultModel.description && (
                                                                                <p className="text-xs text-slate-400 mt-1">{defaultModel.description}</p>
                                                                            )}
                                                                            <p className="text-xs text-slate-500 mt-2">
                                                                                💡 提示：在"模型配置"中设置默认模型后，这里会自动显示
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <div className="p-3 bg-yellow-900/20 rounded border border-yellow-700/50">
                                                                            <p className="text-sm text-yellow-300">
                                                                                ⚠️ 当前能力类型未设置默认模型
                                                                            </p>
                                                                            <p className="text-xs text-yellow-400 mt-1">
                                                                                请在"模型配置"中为该能力类型设置一个默认模型
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                }
                                                            })()}
                                                        </InputGroup>
                                                    </>
                                                )}

                                                {strategyFormData.strategyType === 'fallback' && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <label className="text-sm font-medium text-slate-300">降级链（按优先级顺序）</label>
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    当主模型失败时，按顺序尝试备用模型。只有配置了API-key的模型可以添加到降级链中。
                                                                </p>
                                                            </div>
                                                            <Button
                                                                onClick={handleAddFallbackItem}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                                                            >
                                                                + 添加模型
                                                            </Button>
                                                        </div>
                                                        
                                                        {strategyFormData.fallbackChain && strategyFormData.fallbackChain.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {strategyFormData.fallbackChain.map((item, index) => {
                                                                    const availableModels = getModelsWithApiKey(editingStrategy?.capability || '');
                                                                    const providerModels = item.provider 
                                                                        ? availableModels.filter(m => m.provider === item.provider)
                                                                        : [];
                                                                    
                                                                    return (
                                                                        <div key={index} className="p-3 bg-slate-900 rounded border border-slate-700">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className="text-xs font-medium text-slate-400 w-8">
                                                                                    #{item.priority}
                                                                                </span>
                                                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                                                    <select
                                                                                        value={item.provider || ''}
                                                                                        onChange={async (e) => {
                                                                                            const provider = e.target.value;
                                                                                            handleUpdateFallbackItem(index, 'provider', provider);
                                                                                        }}
                                                                                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 outline-none"
                                                                                    >
                                                                                        <option value="">选择提供商</option>
                                                                                        {providers.map(p => (
                                                                                            <option key={p.value} value={p.value}>{p.label}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                    <select
                                                                                        value={item.model || ''}
                                                                                        onChange={(e) => handleUpdateFallbackItem(index, 'model', e.target.value)}
                                                                                        disabled={!item.provider}
                                                                                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                    >
                                                                                        <option value="">选择模型</option>
                                                                                        {providerModels.map(model => (
                                                                                            <option key={model.id || model.modelName} value={model.modelName}>
                                                                                                {model.modelName} {model.description ? ` - ${model.description}` : ''}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                                <div className="flex gap-1">
                                                                                    <button
                                                                                        onClick={() => handleMoveFallbackItem(index, 'up')}
                                                                                        disabled={index === 0}
                                                                                        className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                        title="上移"
                                                                                    >
                                                                                        ↑
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleMoveFallbackItem(index, 'down')}
                                                                                        disabled={index === strategyFormData.fallbackChain!.length - 1}
                                                                                        className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                        title="下移"
                                                                                    >
                                                                                        ↓
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleRemoveFallbackItem(index)}
                                                                                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                                                                                        title="删除"
                                                                                    >
                                                                                        ×
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            {!item.provider && (
                                                                                <p className="text-xs text-yellow-400 mt-1">⚠️ 请选择提供商</p>
                                                                            )}
                                                                            {item.provider && !item.model && (
                                                                                <p className="text-xs text-yellow-400 mt-1">⚠️ 请选择模型</p>
                                                                            )}
                                                                            {item.provider && providerModels.length === 0 && (
                                                                                <p className="text-xs text-red-400 mt-1">⚠️ 该提供商暂无已配置API-key的模型</p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 bg-slate-900 rounded border border-slate-700 text-center">
                                                                <p className="text-sm text-slate-400">暂无降级链配置</p>
                                                                <p className="text-xs text-slate-500 mt-1">点击"添加模型"按钮开始配置降级链</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {strategyFormData.strategyType === 'economy' && (
                                                    <>
                                                        <InputGroup label="优先提供商">
                                                            <select
                                                                value={strategyFormData.economyConfig?.preferredProvider || ''}
                                                                onChange={(e) => setStrategyFormData({ 
                                                                    ...strategyFormData, 
                                                                    economyConfig: {
                                                                        ...strategyFormData.economyConfig,
                                                                        enabled: true,
                                                                        preferredProvider: e.target.value
                                                                    } as any
                                                                })}
                                                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                            >
                                                                <option value="">不指定</option>
                                                                {providers.map(p => (
                                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                                ))}
                                                            </select>
                                                        </InputGroup>
                                                        <InputGroup label="最大成本限制（每Token）">
                                                            <TextInput
                                                                type="number"
                                                                step="0.00000001"
                                                                value={strategyFormData.economyConfig?.maxCostPerToken || ''}
                                                                onChange={(e) => setStrategyFormData({ 
                                                                    ...strategyFormData, 
                                                                    economyConfig: {
                                                                        ...strategyFormData.economyConfig,
                                                                        enabled: true,
                                                                        maxCostPerToken: parseFloat(e.target.value) || undefined
                                                                    } as any
                                                                })}
                                                                placeholder="0.00000001"
                                                            />
                                                        </InputGroup>
                                                    </>
                                                )}

                                                <InputGroup label="描述">
                                                    <TextInput
                                                        value={strategyFormData.description || ''}
                                                        onChange={(e) => setStrategyFormData({ ...strategyFormData, description: e.target.value })}
                                                        placeholder="策略描述"
                                                    />
                                                </InputGroup>

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={strategyFormData.isActive !== false}
                                                        onChange={(e) => setStrategyFormData({ ...strategyFormData, isActive: e.target.checked })}
                                                        className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                                    />
                                                    <label className="text-sm text-slate-300">启用策略</label>
                                                </div>

                                                <div className="flex justify-end gap-3 mt-4">
                                                    <Button variant="ghost" onClick={() => {
                                                        setEditingStrategy(null);
                                                        setStrategyFormData({});
                                                    }}>取消</Button>
                                                    <Button onClick={handleSaveStrategy} disabled={loading} className="bg-indigo-600">
                                                        {loading ? '保存中...' : '保存策略'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-400">
                                                {strategy ? (
                                                    <div className="space-y-2">
                                                        <p>策略类型: <span className="text-white font-medium">{strategy.strategyType}</span></p>
                                                        {strategy.strategyType === 'single' && (() => {
                                                            const defaultModel = modelConfigs.find(m => 
                                                                m.capability === capability && m.isDefault && m.isActive
                                                            );
                                                            if (defaultModel) {
                                                                return (
                                                                    <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-700">
                                                                        <p className="text-xs text-slate-500 mb-1">默认模型:</p>
                                                                        <p className="text-white">
                                                                            <span className="font-bold">{defaultModel.provider}</span>
                                                                            <span className="text-slate-400"> / </span>
                                                                            <span>{defaultModel.modelName}</span>
                                                                        </p>
                                                                        {defaultModel.description && (
                                                                            <p className="text-xs text-slate-400 mt-1">{defaultModel.description}</p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            } else {
                                                                return (
                                                                    <p className="text-yellow-400 text-xs mt-1">
                                                                        ⚠️ 未设置默认模型
                                                                    </p>
                                                                );
                                                            }
                                                        })()}
                                                        {strategy.strategyType !== 'single' && strategy.defaultProvider && (
                                                            <p>默认提供商: <span className="text-white">{strategy.defaultProvider}</span></p>
                                                        )}
                                                        {strategy.strategyType !== 'single' && strategy.defaultModel && (
                                                            <p>默认模型: <span className="text-white">{strategy.defaultModel}</span></p>
                                                        )}
                                                        {strategy.description && (
                                                            <p>描述: <span className="text-white">{strategy.description}</span></p>
                                                        )}
                                                        <p>状态: <span className={strategy.isActive ? 'text-green-400' : 'text-red-400'}>
                                                            {strategy.isActive ? '启用' : '禁用'}
                                                        </span></p>
                                                    </div>
                                                ) : (
                                                    <p>未配置路由策略</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            
            {/* API Key申请引导模态框 */}
            {showApiKeyGuide && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowApiKeyGuide(false)}>
                    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-100">
                                {guideProvider === 'gemini' && 'Google Gemini API Key 申请指南'}
                                {guideProvider === 'openai' && 'OpenAI API Key 申请指南'}
                                {guideProvider === 'qwen' && '通义千问 (DashScope) API Key 申请指南'}
                                {guideProvider === 'doubao' && '豆包 (Doubao) API Key 申请指南'}
                            </h3>
                            <button
                                onClick={() => setShowApiKeyGuide(false)}
                                className="text-slate-400 hover:text-white text-xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="space-y-4 text-sm text-slate-300">
                            {guideProvider === 'gemini' && (
                                <>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">1. 访问 Google AI Studio</h4>
                                        <p className="mb-2">访问 <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Google AI Studio</a> 并登录您的 Google 账号。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">2. 创建 API Key</h4>
                                        <p className="mb-2">点击"Create API Key"按钮，选择或创建 Google Cloud 项目。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">3. 复制 API Key</h4>
                                        <p className="mb-2">创建成功后，复制生成的 API Key（通常以字母开头）。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">4. 配置到系统</h4>
                                        <p>将复制的 API Key 粘贴到上方的"API Key"输入框中，然后保存配置。</p>
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded">
                                        <p className="text-xs text-blue-300">
                                            💡 <strong>提示：</strong> Gemini API Key 是免费的，但有一定的使用限额。如需更高限额，可以升级到付费计划。
                                        </p>
                                    </div>
                                </>
                            )}
                            
                            {guideProvider === 'openai' && (
                                <>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">1. 访问 OpenAI Platform</h4>
                                        <p className="mb-2">访问 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">OpenAI Platform</a> 并登录您的 OpenAI 账号。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">2. 创建 API Key</h4>
                                        <p className="mb-2">点击"Create new secret key"按钮，输入密钥名称（可选），然后点击"Create secret key"。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">3. 复制 API Key</h4>
                                        <p className="mb-2">创建成功后，立即复制 API Key（以 <code className="bg-slate-800 px-1 rounded">sk-</code> 开头）。<strong className="text-yellow-400">注意：</strong>关闭对话框后将无法再次查看完整密钥。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">4. 配置到系统</h4>
                                        <p>将复制的 API Key 粘贴到上方的"API Key"输入框中，然后保存配置。</p>
                                    </div>
                                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
                                        <p className="text-xs text-yellow-300">
                                            ⚠️ <strong>注意：</strong> OpenAI API 是付费服务，按使用量计费。请确保账户有足够的余额。
                                        </p>
                                    </div>
                                </>
                            )}
                            
                            {guideProvider === 'qwen' && (
                                <>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">1. 访问阿里云 DashScope</h4>
                                        <p className="mb-2">访问 <a href="https://dashscope.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">阿里云 DashScope 控制台</a> 并登录您的阿里云账号。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">2. 开通服务</h4>
                                        <p className="mb-2">首次使用需要开通 DashScope 服务，按照页面提示完成开通流程。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">3. 创建 API Key</h4>
                                        <p className="mb-2">在控制台中找到"API-KEY管理"，点击"创建新的API-KEY"，输入名称后创建。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">4. 复制 API Key</h4>
                                        <p className="mb-2">创建成功后，复制生成的 API Key（以 <code className="bg-slate-800 px-1 rounded">sk-</code> 开头）。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">5. 配置到系统</h4>
                                        <p>将复制的 API Key 粘贴到上方的"API Key"输入框中，然后保存配置。</p>
                                    </div>
                                    <div className="mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded">
                                        <p className="text-xs text-green-300">
                                            💡 <strong>提示：</strong> 通义千问提供免费额度，超出后按使用量计费。新用户通常有免费试用额度。
                                        </p>
                                    </div>
                                </>
                            )}
                            
                            {guideProvider === 'doubao' && (
                                <>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">1. 访问火山引擎控制台</h4>
                                        <p className="mb-2">访问 <a href="https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">火山引擎控制台</a> 并登录您的火山引擎账号。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">2. 创建推理接入点</h4>
                                        <p className="mb-2">在控制台中找到"推理接入点"，点击"创建推理接入点"，选择模型和配置，创建后获取 Endpoint ID。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">3. 创建 API Key</h4>
                                        <p className="mb-2">在"API密钥管理"中创建新的 API Key，复制生成的密钥（UUID 格式）。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">4. 配置到系统</h4>
                                        <p className="mb-2">将 API Key 填入"API Key"输入框。模型名称可以使用：</p>
                                        <ul className="list-disc list-inside ml-4 mb-2 space-y-1 text-xs">
                                            <li><code className="bg-slate-800 px-1 rounded">doubao-1-5-pro-32k-250115</code> - 最新Pro 32K模型（推荐）</li>
                                            <li><code className="bg-slate-800 px-1 rounded">doubao-pro-4k</code> - Pro 4K模型</li>
                                            <li><code className="bg-slate-800 px-1 rounded">doubao-pro-32k</code> - Pro 32K模型</li>
                                            <li><code className="bg-slate-800 px-1 rounded">doubao-lite-4k</code> - Lite 4K模型（经济型）</li>
                                        </ul>
                                        <p className="mb-2">或者使用推理接入点的 Endpoint ID（格式：<code className="bg-slate-800 px-1 rounded">ep-2024...</code>）。</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 mb-2">5. 配置 Base URL</h4>
                                        <p>Base URL 固定为：<code className="bg-slate-800 px-1 rounded">https://ark.cn-beijing.volces.com/api/v3</code></p>
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded">
                                        <p className="text-xs text-blue-300">
                                            💡 <strong>提示：</strong> 豆包提供免费额度，超出后按使用量计费。请查看火山引擎的定价页面了解详细计费信息。
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                onClick={() => setShowApiKeyGuide(false)}
                                className="bg-slate-700 hover:bg-slate-600"
                            >
                                关闭
                            </Button>
                            {guideProvider && (
                                <Button
                                    onClick={() => {
                                        const urls: Record<string, string> = {
                                            gemini: 'https://makersuite.google.com/app/apikey',
                                            openai: 'https://platform.openai.com/api-keys',
                                            qwen: 'https://dashscope.console.aliyun.com/',
                                            doubao: 'https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint',
                                        };
                                        window.open(urls[guideProvider], '_blank');
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    前往申请页面
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
