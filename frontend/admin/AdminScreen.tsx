
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, GameState, AIProvider, WorldScene, Character, CustomScenario, StoryNode } from '../types';
import { Button } from '../components/Button';
import { WORLD_SCENES } from '../constants';
import { adminApi, imageApi, authApi } from '../services/api';
import { ResourcePicker } from '../components/ResourcePicker';
import { getAllTemplatesForCategory } from '../utils/promptTemplates';
import { AdminHeader, InputGroup, TextInput, TextArea, ConfigSection } from './components';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminLogin } from './components/AdminLogin';
import { DashboardView } from './components/DashboardView';
import { ErasManagement } from './components/ErasManagement';
import { MainStoriesManagement } from './components/MainStoriesManagement';
import { InviteCodesManagement } from './components/InviteCodesManagement';
import { SubscriptionPlansManagement } from './components/SubscriptionPlansManagement';
import { EmailConfigManagement } from './components/EmailConfigManagement';
import { CharactersManagement } from './components/CharactersManagement';
import { ResourcesManagement } from './components/ResourcesManagement';
import { ScenariosManagement } from './components/ScenariosManagement';
import { showAlert, showConfirm } from '../utils/dialog';
import { useAdminAuth, useAdminData, useAdminConfig } from './hooks';

interface AdminScreenProps {
    gameState: GameState;
    onUpdateGameState: (newState: GameState) => void;
    onResetWorld: () => void;
    onBack: () => void;
}

// --- MAIN COMPONENT ---

export const AdminScreen: React.FC<AdminScreenProps> = ({ gameState, onUpdateGameState, onResetWorld, onBack }) => {
    // 使用自定义 hooks - 先初始化 auth hook 以获取 checkAndHandleTokenError
    const {
        isAuthenticated,
        username,
        setUsername,
        password,
        setPassword,
        adminToken,
        loginError,
        loading,
        handleLogin,
        handleLogout,
        checkAndHandleTokenError,
        setOnDataLoad
    } = useAdminAuth();
    
    // 使用 checkAndHandleTokenError 初始化 data 和 config hooks
    const adminData = useAdminData(checkAndHandleTokenError);
    const adminConfig = useAdminConfig();
    
    // 创建统一的 loadAllData 函数
    const loadAllData = async (token: string) => {
        await Promise.all([
            adminData.loadSystemData(token),
            adminConfig.loadConfigData(token)
        ]);
    };
    
    // 设置 useAdminAuth 的 onDataLoad 回调
    React.useEffect(() => {
        setOnDataLoad(loadAllData);
    }, []);
    
    // Navigation
    const [activeSection, setActiveSection] = useState<'dashboard' | 'eras' | 'characters' | 'scenarios' | 'invite-codes' | 'settings' | 'resources' | 'subscription-plans' | 'email-config'>('dashboard');
    const [settingsTab, setSettingsTab] = useState<'general' | 'models'>('models');
    
    
    // Image upload states
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    
    // File input refs
    const eraImageInputRef = useRef<HTMLInputElement>(null);

    // 从 hooks 中解构状态
    const {
        systemWorlds,
        setSystemWorlds,
        systemEras,
        setSystemEras,
        systemCharacters,
        setSystemCharacters,
        systemScripts,
        setSystemScripts,
        systemMainStories,
        setSystemMainStories,
        inviteCodes,
        setInviteCodes,
        inviteCodeRequired,
        setInviteCodeRequired,
        subscriptionPlans,
        setSubscriptionPlans
    } = adminData;
    
    const {
        emailVerificationRequired,
        setEmailVerificationRequired,
        emailConfig,
        setEmailConfig,
        isLoadingEmailConfig,
        setIsLoadingEmailConfig,
        showAuthCodeGuide,
        setShowAuthCodeGuide,
        notionConfig,
        setNotionConfig,
        isLoadingNotionConfig,
        setIsLoadingNotionConfig,
        wechatConfig,
        setWechatConfig,
        isLoadingWechatConfig,
        setIsLoadingWechatConfig,
        wechatPayConfig,
        setWechatPayConfig,
        isLoadingWechatPayConfig,
        setIsLoadingWechatPayConfig,
        alipayConfig,
        setAlipayConfig,
        isLoadingAlipayConfig,
        setIsLoadingAlipayConfig
    } = adminConfig;
    
    // 调试：监听邮箱验证状态变化
    useEffect(() => {
        console.log("[AdminScreen] 邮箱验证状态变化:", emailVerificationRequired);
    }, [emailVerificationRequired]);
    
    // 邀请码生成表单
    const [generateQuantity, setGenerateQuantity] = useState(10);
    const [generateExpiresAt, setGenerateExpiresAt] = useState('');
    
    // 邀请码筛选状态
    const [inviteCodeFilter, setInviteCodeFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');
    
    
    
    // 资源选择器状态
    const [showResourcePicker, setShowResourcePicker] = useState(false);
    const [resourcePickerCategory, setResourcePickerCategory] = useState<string>('era');
    const [resourcePickerCallback, setResourcePickerCallback] = useState<((url: string) => void) | null>(null);
    const [resourcePickerCurrentUrl, setResourcePickerCurrentUrl] = useState<string | undefined>(undefined);
    
      // 订阅计划管理状态（从 useAdminData hook 获取）

    // Token 检查和过期处理已由 useAdminAuth hook 处理

    // loadSystemData 现在由 hooks 处理，这里保留一个包装函数用于向后兼容
    const loadSystemData = async (token: string) => {
        await loadAllData(token);
    };

    // 加载资源数据



    // 当切换到订阅计划管理页面时，自动加载数据
    useEffect(() => {
        if (activeSection === 'subscription-plans' && adminToken) {
            loadSystemData(adminToken);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection, adminToken]);



    // --- View Helpers ---
    
    const allScenes = [...WORLD_SCENES, ...gameState.customScenes];
    
    const getAllCharacters = () => {
        const list: (Character & { sceneId: string, sceneName: string, isSystem: boolean })[] = [];
        allScenes.forEach(scene => {
            // Built-in
            scene.characters.forEach(c => list.push({ ...c, sceneId: scene.id, sceneName: scene.name, isSystem: true }));
            // Custom
            const customs = gameState.customCharacters[scene.id] || [];
            customs.forEach(c => list.push({ ...c, sceneId: scene.id, sceneName: scene.name, isSystem: false }));
        });
        return list;
    };
    
    // --- Settings Helper ---
    const updateProviderConfig = (provider: AIProvider, key: string, value: string) => {
        const configKey = provider === 'gemini' ? 'geminiConfig' : provider === 'openai' ? 'openaiConfig' : provider === 'doubao' ? 'doubaoConfig' : 'qwenConfig';
        const currentConfig = gameState.settings[configKey];
        onUpdateGameState({
            ...gameState,
            settings: {
                ...gameState.settings,
                [configKey]: { ...currentConfig, [key]: value }
            }
        });
    };

    const PROVIDERS: {id: AIProvider, name: string}[] = [
        { id: 'gemini', name: 'Gemini (Google)' },
        { id: 'openai', name: 'ChatGPT (OpenAI)' },
        { id: 'qwen', name: '通义千问 (Qwen)' },
        { id: 'doubao', name: '豆包 (Volcengine)' }
    ];


    // --- LOGIN SCREEN ---
    if (!isAuthenticated) {
        return (
            <AdminLogin
                onLogin={handleLogin}
                onBack={onBack}
                loginError={loginError}
                loading={loading}
            />
        );
    }

    return (
        <div className="flex h-screen w-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
            
            {/* SIDEBAR */}
            <AdminSidebar
                activeSection={activeSection}
                onSectionChange={(section) => {
                    setActiveSection(section);
                }}
            />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader title={
                    activeSection === 'dashboard' ? '系统概览' :
                    activeSection === 'eras' ? '场景管理' :
                    activeSection === 'characters' ? 'E-Soul 角色数据库' :
                    activeSection === 'scenarios' ? '互动剧本库' :
                    activeSection === 'main-stories' ? '主线剧情管理' :
                    activeSection === 'invite-codes' ? '邀请码管理' :
                    activeSection === 'resources' ? '资源管理' :
                    activeSection === 'subscription-plans' ? '会员配置管理' :
                    activeSection === 'email-config' ? '邮箱配置' : '系统全局设置'
                } onBack={onBack} onLogout={handleLogout} />

                <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
                    
                    {/* --- DASHBOARD VIEW --- */}
                    {activeSection === 'dashboard' && (
                        <DashboardView gameState={gameState} onResetWorld={onResetWorld} />
                    )}

                    {/* --- ERAS MANAGEMENT --- */}
                    {activeSection === 'eras' && (
                        <ErasManagement
                            eras={systemEras}
                            adminToken={adminToken}
                            onSave={async (data, editingId) => {
                                if (!adminToken) return;
                                const dto = {
                                    name: data.name || '未命名场景',
                                    description: data.description || '',
                                    imageUrl: data.imageUrl || '',
                                    startYear: data.startYear || null,
                                    endYear: data.endYear || null,
                                    isActive: data.isActive !== undefined ? data.isActive : true,
                                    sortOrder: data.sortOrder || 0
                                };
                                if (editingId && typeof editingId === 'number') {
                                    await adminApi.eras.update(editingId, dto, adminToken);
                                } else {
                                    await adminApi.eras.create(dto, adminToken);
                                }
                            }}
                            onDelete={async (id) => {
                                if (!adminToken) return;
                                await adminApi.eras.delete(id, adminToken);
                            }}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}

                    {/* --- CHARACTERS MANAGEMENT --- */}
                    {activeSection === 'characters' && (
                        <CharactersManagement
                            systemCharacters={systemCharacters}
                            systemEras={systemEras}
                            adminToken={adminToken}
                            onRefresh={() => adminToken && loadAllData(adminToken)}
                        />
                    )}

                    {/* --- MAIN STORIES MANAGEMENT --- */}
                    {activeSection === 'main-stories' && (
                        <MainStoriesManagement
                            mainStories={systemMainStories.map(story => ({
                                ...story,
                                systemEraName: systemEras.find(e => e.id === story.systemEraId)?.name
                            }))}
                            eras={systemEras}
                            characters={systemCharacters}
                            adminToken={adminToken}
                            onSave={async (data, editingId) => {
                                if (!adminToken) return;
                                const dto = {
                                    systemEraId: data.systemEraId,
                                    name: data.name || '未命名主线剧情',
                                    age: data.age || null,
                                    role: data.role || '叙事者',
                                    bio: data.bio || '',
                                    avatarUrl: data.avatarUrl || '',
                                    backgroundUrl: data.backgroundUrl || '',
                                    themeColor: data.themeColor || '',
                                    colorAccent: data.colorAccent || '',
                                    firstMessage: data.firstMessage || '',
                                    systemInstruction: '', // 不再使用 systemInstruction
                                    voiceName: data.voiceName || '',
                                    tags: data.tags || '',
                                    speechStyle: data.speechStyle || '',
                                    catchphrases: data.catchphrases || '',
                                    secrets: data.secrets || '',
                                    motivations: data.motivations || '',
                                    isActive: data.isActive !== undefined ? data.isActive : true,
                                    sortOrder: data.sortOrder || 0
                                };
                                if (editingId && typeof editingId === 'number') {
                                    await adminApi.mainStories.update(editingId, dto, adminToken);
                                } else {
                                    await adminApi.mainStories.create(dto, adminToken);
                                }
                            }}
                            onDelete={async (id) => {
                                if (!adminToken) return;
                                await adminApi.mainStories.delete(id, adminToken);
                            }}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}

                    {/* --- SCENARIOS MANAGEMENT --- */}
                    {activeSection === 'scenarios' && (
                        <ScenariosManagement
                            systemScripts={systemScripts}
                            systemEras={systemEras}
                            systemCharacters={systemCharacters}
                            systemWorlds={systemWorlds}
                            gameState={gameState}
                            adminToken={adminToken}
                            onRefresh={async () => {
                                if (adminToken) {
                                    await loadAllData(adminToken);
                                }
                            }}
                            onUpdateGameState={onUpdateGameState}
                        />
                    )}

                    {/* --- INVITE CODES MANAGEMENT --- */}
                    {activeSection === 'invite-codes' && (
                        <InviteCodesManagement
                            inviteCodes={inviteCodes}
                            inviteCodeRequired={inviteCodeRequired}
                            adminToken={adminToken}
                            onUpdateInviteCodeRequired={setInviteCodeRequired}
                            onRefresh={() => adminToken && loadAllData(adminToken)}
                        />
                    )}

                    {/* --- RESOURCES MANAGEMENT --- */}
                    {activeSection === 'resources' && (
                        <ResourcesManagement
                            adminToken={adminToken}
                            onRefresh={() => adminToken && loadAllData(adminToken)}
                        />
                    )}

                    {/* --- SETTINGS --- */}
                    {activeSection === 'subscription-plans' && (
                        <SubscriptionPlansManagement
                            subscriptionPlans={subscriptionPlans}
                            adminToken={adminToken}
                            onRefresh={() => adminToken && loadAllData(adminToken)}
                        />
                    )}

                    {/* --- EMAIL CONFIG --- */}
                    {activeSection === 'email-config' && (
                        <EmailConfigManagement
                            emailVerificationRequired={emailVerificationRequired}
                            setEmailVerificationRequired={setEmailVerificationRequired}
                            emailConfig={emailConfig}
                            setEmailConfig={setEmailConfig}
                            isLoadingEmailConfig={isLoadingEmailConfig}
                            setIsLoadingEmailConfig={setIsLoadingEmailConfig}
                            showAuthCodeGuide={showAuthCodeGuide}
                            setShowAuthCodeGuide={setShowAuthCodeGuide}
                            notionConfig={notionConfig}
                            setNotionConfig={setNotionConfig}
                            isLoadingNotionConfig={isLoadingNotionConfig}
                            setIsLoadingNotionConfig={setIsLoadingNotionConfig}
                            adminToken={adminToken}
                        />
                    )}

                    {activeSection === 'settings' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex border-b border-slate-700 mb-6">
                                <button onClick={() => setSettingsTab('models')} className={`pb-3 px-4 text-sm font-bold ${settingsTab === 'models' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-white'}`}>AI 模型接入</button>
                                <button onClick={() => setSettingsTab('general')} className={`pb-3 px-4 text-sm font-bold ${settingsTab === 'general' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-white'}`}>通用与策略</button>
                                <button onClick={() => setSettingsTab('third-party')} className={`pb-3 px-4 text-sm font-bold ${settingsTab === 'third-party' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-white'}`}>第三方登录与支付</button>
                            </div>

                            {settingsTab === 'models' && (
                                <div className="space-y-8">
                                    {/* GEMINI */}
                                    <ConfigSection title="Google Gemini">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup label="API Key">
                                                <TextInput type="password" value={gameState.settings.geminiConfig.apiKey} onChange={e => updateProviderConfig('gemini', 'apiKey', e.target.value)} />
                                            </InputGroup>
                                            <InputGroup label="Text Model">
                                                <TextInput value={gameState.settings.geminiConfig.modelName} onChange={e => updateProviderConfig('gemini', 'modelName', e.target.value)} placeholder="gemini-2.5-flash" />
                                            </InputGroup>
                                            <InputGroup label="Image Model">
                                                <TextInput value={gameState.settings.geminiConfig.imageModel || ''} onChange={e => updateProviderConfig('gemini', 'imageModel', e.target.value)} placeholder="gemini-2.5-flash-image" />
                                            </InputGroup>
                                            <InputGroup label="Video Model">
                                                <TextInput value={gameState.settings.geminiConfig.videoModel || ''} onChange={e => updateProviderConfig('gemini', 'videoModel', e.target.value)} placeholder="veo-3.1-fast-generate-preview" />
                                            </InputGroup>
                                        </div>
                                    </ConfigSection>

                                    {/* OPENAI */}
                                    <ConfigSection title="OpenAI / ChatGPT">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup label="API Key">
                                                <TextInput type="password" value={gameState.settings.openaiConfig.apiKey} onChange={e => updateProviderConfig('openai', 'apiKey', e.target.value)} />
                                            </InputGroup>
                                            <InputGroup label="Base URL (Optional)">
                                                <TextInput value={gameState.settings.openaiConfig.baseUrl || ''} onChange={e => updateProviderConfig('openai', 'baseUrl', e.target.value)} placeholder="https://api.openai.com/v1" />
                                            </InputGroup>
                                            <InputGroup label="Text Model">
                                                <TextInput value={gameState.settings.openaiConfig.modelName} onChange={e => updateProviderConfig('openai', 'modelName', e.target.value)} placeholder="gpt-4o" />
                                            </InputGroup>
                                        </div>
                                    </ConfigSection>

                                    {/* QWEN */}
                                    <ConfigSection title="Alibaba Qwen (通义千问)">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup label="DashScope API Key">
                                                <TextInput type="password" value={gameState.settings.qwenConfig.apiKey} onChange={e => updateProviderConfig('qwen', 'apiKey', e.target.value)} />
                                            </InputGroup>
                                            <InputGroup label="Text Model">
                                                <TextInput value={gameState.settings.qwenConfig.modelName} onChange={e => updateProviderConfig('qwen', 'modelName', e.target.value)} placeholder="qwen-max" />
                                            </InputGroup>
                                            <InputGroup label="Image Model">
                                                <TextInput value={gameState.settings.qwenConfig.imageModel || ''} onChange={e => updateProviderConfig('qwen', 'imageModel', e.target.value)} placeholder="qwen-image-plus" />
                                            </InputGroup>
                                            <InputGroup label="Video Model">
                                                <TextInput value={gameState.settings.qwenConfig.videoModel || ''} onChange={e => updateProviderConfig('qwen', 'videoModel', e.target.value)} placeholder="wanx-video" />
                                            </InputGroup>
                                        </div>
                                    </ConfigSection>

                                    {/* DOUBAO */}
                                    <ConfigSection title="Volcengine Doubao (豆包)">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup label="API Key">
                                                <TextInput type="password" value={gameState.settings.doubaoConfig.apiKey} onChange={e => updateProviderConfig('doubao', 'apiKey', e.target.value)} />
                                            </InputGroup>
                                            <InputGroup label="Text Model Endpoint ID (ep-...)">
                                                <TextInput value={gameState.settings.doubaoConfig.modelName} onChange={e => updateProviderConfig('doubao', 'modelName', e.target.value)} placeholder="ep-2024..." />
                                            </InputGroup>
                                            <InputGroup label="Base URL">
                                                <TextInput value={gameState.settings.doubaoConfig.baseUrl || ''} onChange={e => updateProviderConfig('doubao', 'baseUrl', e.target.value)} placeholder="https://ark.cn-beijing.volces.com/api/v3" />
                                            </InputGroup>
                                        </div>
                                    </ConfigSection>
                                </div>
                            )}

                            {settingsTab === 'general' && (
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
                                    <div>
                                        <h4 className="text-white font-bold mb-4">功能开关</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
                                                <span className="text-sm text-slate-300">调试模式 (Debug Mode)</span>
                                                <input type="checkbox" checked={gameState.settings.debugMode} onChange={e => onUpdateGameState({...gameState, settings: {...gameState.settings, debugMode: e.target.checked}})} className="rounded bg-slate-700 h-5 w-5 accent-indigo-500" />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
                                                <span className="text-sm text-slate-300">自动生成角色头像 (Auto Avatar)</span>
                                                <input type="checkbox" checked={gameState.settings.autoGenerateAvatars} onChange={e => onUpdateGameState({...gameState, settings: {...gameState.settings, autoGenerateAvatars: e.target.checked}})} className="rounded bg-slate-700 h-5 w-5 accent-indigo-500" />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
                                                <span className="text-sm text-slate-300">故障自动降级 (Auto Fallback)</span>
                                                <input type="checkbox" checked={gameState.settings.enableFallback} onChange={e => onUpdateGameState({...gameState, settings: {...gameState.settings, enableFallback: e.target.checked}})} className="rounded bg-slate-700 h-5 w-5 accent-indigo-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-white font-bold mb-4">AI 路由策略 (Routing Strategy)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Text Chat Provider">
                                                <select 
                                                    value={gameState.settings.textProvider} 
                                                    onChange={(e) => onUpdateGameState({...gameState, settings: {...gameState.settings, textProvider: e.target.value as AIProvider}})}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                >
                                                    {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </InputGroup>
                                            <InputGroup label="Image Gen Provider">
                                                <select 
                                                    value={gameState.settings.imageProvider} 
                                                    onChange={(e) => onUpdateGameState({...gameState, settings: {...gameState.settings, imageProvider: e.target.value as AIProvider}})}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                >
                                                    {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </InputGroup>
                                            <InputGroup label="Video Gen Provider">
                                                <select 
                                                    value={gameState.settings.videoProvider} 
                                                    onChange={(e) => onUpdateGameState({...gameState, settings: {...gameState.settings, videoProvider: e.target.value as AIProvider}})}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                >
                                                    {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </InputGroup>
                                            <InputGroup label="Audio/TTS Provider">
                                                <select 
                                                    value={gameState.settings.audioProvider} 
                                                    onChange={(e) => onUpdateGameState({...gameState, settings: {...gameState.settings, audioProvider: e.target.value as AIProvider}})}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                >
                                                    {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </InputGroup>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {settingsTab === 'third-party' && (
                                <div className="space-y-8">
                                    {/* 微信开放平台配置 */}
                                    <ConfigSection title="微信开放平台 (WeChat Open Platform)">
                                        <div className="space-y-4">
                                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                                <div className="flex items-start justify-between mb-3">
                                                    <p className="text-xs text-slate-400">
                                                        用于微信扫码登录功能。需要在微信开放平台创建网站应用并获取 AppID 和 AppSecret。
                                                    </p>
                                                    <a 
                                                        href="https://open.weixin.qq.com/" 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="ml-2 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                                                    >
                                                        <span>🔗</span>
                                                        申请 AppID
                                                    </a>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputGroup label="AppID">
                                                        <TextInput 
                                                            value={wechatConfig.appId} 
                                                            onChange={e => setWechatConfig({...wechatConfig, appId: e.target.value})} 
                                                            placeholder="wx1234567890abcdef"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="AppSecret">
                                                        <TextInput 
                                                            type="password" 
                                                            value={wechatConfig.appSecret} 
                                                            onChange={e => setWechatConfig({...wechatConfig, appSecret: e.target.value})} 
                                                            placeholder="输入 AppSecret（已加密显示）"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="回调地址 (Redirect URI)" className="md:col-span-2">
                                                        <TextInput 
                                                            value={wechatConfig.redirectUri} 
                                                            onChange={e => setWechatConfig({...wechatConfig, redirectUri: e.target.value})} 
                                                            placeholder="http://localhost:8081/api/wechat/callback"
                                                        />
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            在微信开放平台配置的回调地址，需要与后台接口路径一致
                                                        </p>
                                                    </InputGroup>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button
                                                        onClick={async () => {
                                                            if (!adminToken) return;
                                                            setIsLoadingWechatConfig(true);
                                                            try {
                                                                const configToSave: { appId?: string; appSecret?: string; redirectUri?: string } = {
                                                                    appId: wechatConfig.appId,
                                                                    redirectUri: wechatConfig.redirectUri
                                                                };
                                                                // 只有非空时才更新 AppSecret
                                                                if (wechatConfig.appSecret && wechatConfig.appSecret.trim() !== '') {
                                                                    configToSave.appSecret = wechatConfig.appSecret;
                                                                }
                                                                await adminApi.config.setWechatConfig(configToSave, adminToken);
                                                                showAlert('保存成功', '微信配置已保存', 'success');
                                                                // 保存成功后，清空 AppSecret 输入框（因为后端返回的是******）
                                                                setWechatConfig({...wechatConfig, appSecret: ''});
                                                            } catch (err: any) {
                                                                console.error('保存微信配置失败:', err);
                                                                showAlert('保存失败', err.message || '未知错误', 'error');
                                                            } finally {
                                                                setIsLoadingWechatConfig(false);
                                                            }
                                                        }}
                                                        disabled={isLoadingWechatConfig}
                                                        className="bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                        {isLoadingWechatConfig ? '保存中...' : '保存配置'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </ConfigSection>

                                    {/* 微信支付配置 */}
                                    <ConfigSection title="微信支付 (WeChat Pay)">
                                        <div className="space-y-4">
                                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                                <div className="flex items-start justify-between mb-3">
                                                    <p className="text-xs text-slate-400">
                                                        配置微信支付相关参数。需要在微信支付商户平台获取相关信息。
                                                    </p>
                                                    <a 
                                                        href="https://pay.weixin.qq.com/" 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="ml-2 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                                                    >
                                                        <span>🔗</span>
                                                        申请商户号
                                                    </a>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputGroup label="AppID">
                                                        <TextInput 
                                                            value={wechatPayConfig.appId} 
                                                            onChange={e => setWechatPayConfig({...wechatPayConfig, appId: e.target.value})} 
                                                            placeholder="微信支付 AppID"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="商户号 (MchID)">
                                                        <TextInput 
                                                            value={wechatPayConfig.mchId} 
                                                            onChange={e => setWechatPayConfig({...wechatPayConfig, mchId: e.target.value})} 
                                                            placeholder="商户号"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="API Key">
                                                        <TextInput 
                                                            type="password" 
                                                            value={wechatPayConfig.apiKey} 
                                                            onChange={e => setWechatPayConfig({...wechatPayConfig, apiKey: e.target.value})} 
                                                            placeholder="API Key（已加密显示）"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="API V3 Key">
                                                        <TextInput 
                                                            type="password" 
                                                            value={wechatPayConfig.apiV3Key} 
                                                            onChange={e => setWechatPayConfig({...wechatPayConfig, apiV3Key: e.target.value})} 
                                                            placeholder="API V3 Key（已加密显示）"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="证书路径 (Cert Path)" className="md:col-span-2">
                                                        <TextInput 
                                                            value={wechatPayConfig.certPath} 
                                                            onChange={e => setWechatPayConfig({...wechatPayConfig, certPath: e.target.value})} 
                                                            placeholder="/path/to/cert.pem"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="支付通知地址 (Notify URL)" className="md:col-span-2">
                                                        <TextInput 
                                                            value={wechatPayConfig.notifyUrl} 
                                                            onChange={e => setWechatPayConfig({...wechatPayConfig, notifyUrl: e.target.value})} 
                                                            placeholder="http://yourdomain.com/api/payment/wechat/notify"
                                                        />
                                                    </InputGroup>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button
                                                        onClick={async () => {
                                                            if (!adminToken) return;
                                                            setIsLoadingWechatPayConfig(true);
                                                            try {
                                                                const configToSave: { appId?: string; mchId?: string; apiKey?: string; apiV3Key?: string; certPath?: string; notifyUrl?: string } = {
                                                                    appId: wechatPayConfig.appId,
                                                                    mchId: wechatPayConfig.mchId,
                                                                    certPath: wechatPayConfig.certPath,
                                                                    notifyUrl: wechatPayConfig.notifyUrl
                                                                };
                                                                // 只有非空时才更新密钥
                                                                if (wechatPayConfig.apiKey && wechatPayConfig.apiKey.trim() !== '' && wechatPayConfig.apiKey !== '******') {
                                                                    configToSave.apiKey = wechatPayConfig.apiKey;
                                                                }
                                                                if (wechatPayConfig.apiV3Key && wechatPayConfig.apiV3Key.trim() !== '' && wechatPayConfig.apiV3Key !== '******') {
                                                                    configToSave.apiV3Key = wechatPayConfig.apiV3Key;
                                                                }
                                                                await adminApi.config.setWechatPayConfig(configToSave, adminToken);
                                                                showAlert('保存成功', '微信支付配置已保存', 'success');
                                                                // 保存成功后，清空密钥输入框
                                                                setWechatPayConfig({...wechatPayConfig, apiKey: '', apiV3Key: ''});
                                                            } catch (err: any) {
                                                                console.error('保存微信支付配置失败:', err);
                                                                showAlert('保存失败', err.message || '未知错误', 'error');
                                                            } finally {
                                                                setIsLoadingWechatPayConfig(false);
                                                            }
                                                        }}
                                                        disabled={isLoadingWechatPayConfig}
                                                        className="bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                        {isLoadingWechatPayConfig ? '保存中...' : '保存配置'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </ConfigSection>

                                    {/* 支付宝配置 */}
                                    <ConfigSection title="支付宝 (Alipay)">
                                        <div className="space-y-4">
                                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                                <div className="flex items-start justify-between mb-3">
                                                    <p className="text-xs text-slate-400">
                                                        配置支付宝支付相关参数。需要在支付宝开放平台获取相关信息。
                                                    </p>
                                                    <a 
                                                        href="https://open.alipay.com/" 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="ml-2 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                                                    >
                                                        <span>🔗</span>
                                                        申请 AppID
                                                    </a>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputGroup label="AppID">
                                                        <TextInput 
                                                            value={alipayConfig.appId} 
                                                            onChange={e => setAlipayConfig({...alipayConfig, appId: e.target.value})} 
                                                            placeholder="支付宝 AppID"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="应用私钥 (Private Key)" className="md:col-span-2">
                                                        <TextArea 
                                                            value={alipayConfig.privateKey} 
                                                            onChange={e => setAlipayConfig({...alipayConfig, privateKey: e.target.value})} 
                                                            placeholder="应用私钥（已加密显示）"
                                                            rows={4}
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="支付宝公钥 (Public Key)" className="md:col-span-2">
                                                        <TextArea 
                                                            value={alipayConfig.publicKey} 
                                                            onChange={e => setAlipayConfig({...alipayConfig, publicKey: e.target.value})} 
                                                            placeholder="支付宝公钥"
                                                            rows={4}
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="网关地址 (Gateway URL)" className="md:col-span-2">
                                                        <TextInput 
                                                            value={alipayConfig.gatewayUrl} 
                                                            onChange={e => setAlipayConfig({...alipayConfig, gatewayUrl: e.target.value})} 
                                                            placeholder="https://openapi.alipay.com/gateway.do"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="异步通知地址 (Notify URL)" className="md:col-span-2">
                                                        <TextInput 
                                                            value={alipayConfig.notifyUrl} 
                                                            onChange={e => setAlipayConfig({...alipayConfig, notifyUrl: e.target.value})} 
                                                            placeholder="http://yourdomain.com/api/payment/alipay/notify"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="同步返回地址 (Return URL)" className="md:col-span-2">
                                                        <TextInput 
                                                            value={alipayConfig.returnUrl} 
                                                            onChange={e => setAlipayConfig({...alipayConfig, returnUrl: e.target.value})} 
                                                            placeholder="http://yourdomain.com/api/payment/alipay/return"
                                                        />
                                                    </InputGroup>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <Button
                                                        onClick={async () => {
                                                            if (!adminToken) return;
                                                            setIsLoadingAlipayConfig(true);
                                                            try {
                                                                const configToSave: { appId?: string; privateKey?: string; publicKey?: string; gatewayUrl?: string; notifyUrl?: string; returnUrl?: string } = {
                                                                    appId: alipayConfig.appId,
                                                                    publicKey: alipayConfig.publicKey,
                                                                    gatewayUrl: alipayConfig.gatewayUrl,
                                                                    notifyUrl: alipayConfig.notifyUrl,
                                                                    returnUrl: alipayConfig.returnUrl
                                                                };
                                                                // 只有非空时才更新私钥
                                                                if (alipayConfig.privateKey && alipayConfig.privateKey.trim() !== '' && alipayConfig.privateKey !== '******') {
                                                                    configToSave.privateKey = alipayConfig.privateKey;
                                                                }
                                                                await adminApi.config.setAlipayConfig(configToSave, adminToken);
                                                                showAlert('保存成功', '支付宝配置已保存', 'success');
                                                                // 保存成功后，清空私钥输入框
                                                                setAlipayConfig({...alipayConfig, privateKey: ''});
                                                            } catch (err: any) {
                                                                console.error('保存支付宝配置失败:', err);
                                                                showAlert('保存失败', err.message || '未知错误', 'error');
                                                            } finally {
                                                                setIsLoadingAlipayConfig(false);
                                                            }
                                                        }}
                                                        disabled={isLoadingAlipayConfig}
                                                        className="bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                        {isLoadingAlipayConfig ? '保存中...' : '保存配置'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </ConfigSection>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
            {showResourcePicker && resourcePickerCallback && (
                <ResourcePicker
                    category={resourcePickerCategory as any}
                    onSelect={(url) => {
                        resourcePickerCallback(url);
                        setShowResourcePicker(false);
                        setResourcePickerCallback(null);
                    }}
                    onClose={() => {
                        setShowResourcePicker(false);
                        setResourcePickerCallback(null);
                    }}
                    currentUrl={resourcePickerCurrentUrl}
                    token={adminToken || undefined}
                />
            )}
        </div>
    );
};
