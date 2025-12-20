
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, GameState, AIProvider, WorldScene, Character, CustomScenario, StoryNode } from '../types';
import { Button } from '../components/Button';
import { WORLD_SCENES } from '../constants';
import { adminApi, imageApi, systemScriptApi, authApi } from '../services/api';
import { ResourcePicker } from '../components/ResourcePicker';
import { getAllTemplatesForCategory } from '../utils/promptTemplates';
import { AdminHeader, InputGroup, TextInput, TextArea, ConfigSection } from './components';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminLogin } from './components/AdminLogin';
import { DashboardView } from './components/DashboardView';
import { ErasManagement } from './components/ErasManagement';
import { MainStoriesManagement } from './components/MainStoriesManagement';
import { ScenarioNodeFlow } from './components/ScenarioNodeFlow';
import { InviteCodesManagement } from './components/InviteCodesManagement';
import { SubscriptionPlansManagement } from './components/SubscriptionPlansManagement';
import { EmailConfigManagement } from './components/EmailConfigManagement';
import { CharactersManagement } from './components/CharactersManagement';
import { ResourcesManagement } from './components/ResourcesManagement';
import { ScenarioBuilder } from '../components/ScenarioBuilder';
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
    
    // CRUD State
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'create'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    
    // Form Data Holders
    const [formData, setFormData] = useState<any>({});
    
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
    
    // 场景过滤状态（用于剧本）
    const [scenarioEraFilter, setScenarioEraFilter] = useState<number | 'all'>('all');
    
    
    // 资源选择器状态
    const [showResourcePicker, setShowResourcePicker] = useState(false);
    const [resourcePickerCategory, setResourcePickerCategory] = useState<string>('era');
    const [resourcePickerCallback, setResourcePickerCallback] = useState<((url: string) => void) | null>(null);
    const [resourcePickerCurrentUrl, setResourcePickerCurrentUrl] = useState<string | undefined>(undefined);
    
      // 订阅计划管理状态（从 useAdminData hook 获取）

    // Token 检查和过期处理已由 useAdminAuth hook 处理
      // 如果需要本地版本，使用 checkAndHandleTokenErrorLocal
      const checkAndHandleTokenErrorLocal = (error: any): boolean => {
        const errorMessage = error?.message || '';
        if (errorMessage.includes('未授权') || 
            errorMessage.includes('token') || 
            errorMessage.includes('Token') || 
            errorMessage.includes('JWT') ||
            errorMessage.includes('无效的管理员token')) {
            console.warn('[AdminScreen] 检测到 token 验证失败，清除认证状态');
            handleLogout();
            showAlert('登录已过期，请重新登录', '登录过期', 'warning');
            return true;
        }
        return false;
    };

    // loadSystemData 现在由 hooks 处理，这里保留一个包装函数用于向后兼容
    const loadSystemData = async (token: string) => {
        await loadAllData(token);
    };

    // 加载资源数据

    // 加载预置剧本数据（只加载系统预设的剧本）
    const loadScenariosData = async (token: string) => {
        console.log("========== [AdminScreen] 加载预置剧本数据 ==========");
        try {
            // 只加载系统预设的剧本，不需要 token（公开 API）
            const scripts = await systemScriptApi.getAll(adminToken);
            console.log("[AdminScreen] 预置剧本数据加载结果:", {
                scripts: Array.isArray(scripts) ? scripts.length : 0
            });
            setSystemScripts(Array.isArray(scripts) ? scripts : []);
        } catch (error) {
            console.error('[AdminScreen] 加载预置剧本数据失败:', error);
            setSystemScripts([]);
        }
    };


    // 当切换到订阅计划管理页面时，自动加载数据
    useEffect(() => {
        if (activeSection === 'subscription-plans' && adminToken) {
            loadSystemData(adminToken);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection, adminToken]);

    // --- CRUD Logic Wrappers ---

    const switchToCreate = () => {
        // 初始化空的节点结构，方便用户添加节点内容
        setFormData({
            nodes: JSON.stringify({
                start: {
                    id: 'start',
                    title: '开始',
                    content: '这是故事的开始...',
                    choices: []
                }
            }, null, 2),
            startNodeId: 'start'
        });
        setEditingId(null);
        setViewMode('create');
    };

    const switchToEdit = (item: any) => {
        // Create a deep copy to avoid mutating the original object directly
        setFormData(JSON.parse(JSON.stringify(item)));
        setEditingId(item.id);
        setViewMode('edit');
    };

    const switchToList = () => {
        setViewMode('list');
        setEditingId(null);
        setFormData({});
        setShowScenarioBuilder(false);
        setSelectedNodeId(undefined);
    };

    // --- Era (Scene) Management ---
    
    const saveEra = async () => {
        if (!adminToken) return;
        
        try {
            const dto = {
                name: formData.name || '未命名场景',
                description: formData.description || '',
                imageUrl: formData.imageUrl || '',
                startYear: formData.startYear || null,
                endYear: formData.endYear || null,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                sortOrder: formData.sortOrder || 0
            };

            if (editingId && typeof editingId === 'number') {
                // 更新
                await adminApi.eras.update(editingId, dto, adminToken);
            } else {
                // 创建
                await adminApi.eras.create(dto, adminToken);
            }
            
            // 重新加载数据
            await loadSystemData(adminToken);
            switchToList();
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };

    const deleteEra = async (id: number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定要删除这个系统场景吗？', '删除场景', 'danger');
        if (!confirmed) return;
        
        try {
            await adminApi.eras.delete(id, adminToken);
            await loadSystemData(adminToken);
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };


    // --- Scenario Management ---

    const saveScenario = async () => {
        if (!adminToken) return;
        
        try {
            // 解析节点数据
            let nodes = {};
            try {
                nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes) : (formData.nodes || {});
            } catch (e) {
                showAlert('节点 JSON 格式错误，请检查格式', '格式错误', 'error');
                return;
            }

            // 获取第一个世界ID作为默认值（如果没有指定）
            const defaultWorldId = systemWorlds.length > 0 ? systemWorlds[0].id : 1;
            
            // 构建剧本内容，包含参与角色信息
            const contentData: any = {
                startNodeId: formData.startNodeId || 'start',
                nodes: nodes
            };
            
            // 如果有参与角色，添加到内容中
            if (Array.isArray(formData.participatingCharacters) && formData.participatingCharacters.length > 0) {
                contentData.participatingCharacters = formData.participatingCharacters;
            }
            
            const scriptData = {
                title: formData.title || '新剧本',
                description: formData.description || '',
                content: JSON.stringify(contentData),
                worldId: formData.worldId ? parseInt(formData.worldId) : defaultWorldId,
                eraId: formData.eraId ? parseInt(formData.eraId) : undefined
            };

            if (editingId && typeof editingId === 'number') {
                // 更新现有剧本（使用管理员API）
                await adminApi.scripts.update(editingId, scriptData, adminToken);
            } else {
                // 创建新剧本（使用管理员API）
                // 注意：管理员创建剧本时需要指定 userId
                // 如果 formData 中有 userId，使用它；否则使用 worldId 对应的用户的 userId
                const userId = formData.userId ? parseInt(formData.userId) : 
                              (systemWorlds.find(w => w.id === scriptData.worldId)?.userId || 1);
                
                await adminApi.scripts.create({
                    ...scriptData,
                    userId: userId
                }, adminToken);
            }
            
            // 重新加载数据
            await loadSystemData(adminToken);
            switchToList();
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
            console.error('保存剧本失败:', error);
        }
    };

    const deleteScenario = async (id: string | number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定删除此剧本吗？', '删除剧本', 'danger');
        if (!confirmed) return;
        
        try {
            if (typeof id === 'number') {
                // 使用管理员API删除
                await adminApi.scripts.delete(id, adminToken);
            } else {
                // 如果是本地创建的剧本（字符串ID），只从本地状态删除
                const updatedScenarios = gameState.customScenarios.filter(s => s.id !== id);
                onUpdateGameState({ ...gameState, customScenarios: updatedScenarios });
                return;
            }
            
            // 重新加载数据
            await loadSystemData(adminToken);
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
            console.error('删除剧本失败:', error);
        }
    };


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
                    switchToList();
                    if (section === 'scenarios' && adminToken) {
                        loadScenariosData(adminToken);
                    }
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
                        <>
                            {viewMode === 'list' && (
                                <div className="space-y-4">
                                     <div className="flex justify-between items-center">
                                        <p className="text-slate-400 text-sm">管理互动分支剧本。</p>
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={async () => {
                                                    if (!adminToken) return;
                                                    const confirmed = await showConfirm('确定要为每个场景创建两个默认剧本吗？', '创建默认剧本', 'info');
                                                    if (!confirmed) return;
                                                    
                                                    try {
                                                        const defaultWorldId = systemWorlds.length > 0 ? systemWorlds[0].id : 1;
                                                        const userId = systemWorlds.find(w => w.id === defaultWorldId)?.userId || 1;
                                                        
                                                        let createdCount = 0;
                                                        for (const era of systemEras) {
                                                            // 获取该场景的角色
                                                            const eraCharacters = systemCharacters.filter(c => c.systemEraId === era.id);
                                                            const characterIds = eraCharacters.length > 0 
                                                                ? eraCharacters.slice(0, 3).map(c => c.id.toString()) // 最多选择3个角色
                                                                : [];
                                                            
                                                            // 创建第一个剧本
                                                            const script1 = {
                                                                title: `${era.name} - 初遇`,
                                                                description: `在${era.name}的初次相遇，探索角色之间的关系。`,
                                                                content: JSON.stringify({
                                                                    startNodeId: 'start',
                                                                    nodes: {
                                                                        start: {
                                                                            id: 'start',
                                                                            title: '初遇',
                                                                            prompt: characterIds.length > 0 
                                                                                ? `你来到了${era.name}，遇到了${characterIds.map(id => {
                                                                                    const char = eraCharacters.find(c => c.id.toString() === id);
                                                                                    return char?.name || '';
                                                                                }).filter(Boolean).join('、')}。开始你们的对话吧。`
                                                                                : `你来到了${era.name}，开始探索这个场景的故事。`,
                                                                            options: []
                                                                        }
                                                                    },
                                                                    participatingCharacters: characterIds
                                                                }),
                                                                worldId: defaultWorldId,
                                                                eraId: era.id,
                                                                userId: userId
                                                            };
                                                            
                                                            // 创建第二个剧本
                                                            const script2 = {
                                                                title: `${era.name} - 深入`,
                                                                description: `在${era.name}的深入探索，了解更多角色背后的故事。`,
                                                                content: JSON.stringify({
                                                                    startNodeId: 'start',
                                                                    nodes: {
                                                                        start: {
                                                                            id: 'start',
                                                                            title: '深入探索',
                                                                            prompt: characterIds.length > 0
                                                                                ? `在${era.name}中，你与${characterIds.map(id => {
                                                                                    const char = eraCharacters.find(c => c.id.toString() === id);
                                                                                    return char?.name || '';
                                                                                }).filter(Boolean).join('、')}的关系进一步加深。探索他们背后的故事和秘密。`
                                                                                : `在${era.name}中，你开始深入了解这个场景的秘密。`,
                                                                            options: []
                                                                        }
                                                                    },
                                                                    participatingCharacters: characterIds
                                                                }),
                                                                worldId: defaultWorldId,
                                                                eraId: era.id,
                                                                userId: userId
                                                            };
                                                            
                                                            try {
                                                                await adminApi.scripts.create(script1, adminToken);
                                                                await adminApi.scripts.create(script2, adminToken);
                                                                createdCount += 2;
                                                            } catch (err: any) {
                                                                console.error(`为场景 ${era.name} 创建剧本失败:`, err);
                                                            }
                                                        }
                                                        
                                                        showAlert(`成功为 ${createdCount / 2} 个场景创建了 ${createdCount} 个默认剧本`, '创建成功', 'success');
                                                        await loadSystemData(adminToken);
                                                    } catch (error: any) {
                                                        showAlert('创建默认剧本失败: ' + (error.message || '未知错误'), '创建失败', 'error');
                                                        console.error('创建默认剧本失败:', error);
                                                    }
                                                }}
                                                className="bg-green-600 hover:bg-green-500 text-sm"
                                            >
                                                为所有场景创建默认剧本
                                            </Button>
                                            <Button onClick={switchToCreate} className="bg-indigo-600 hover:bg-indigo-500 text-sm">+ 新增剧本</Button>
                                        </div>
                                    </div>
                                    {/* 场景过滤 */}
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-400 whitespace-nowrap">筛选场景：</span>
                                            <select
                                                value={scenarioEraFilter === 'all' ? '' : scenarioEraFilter}
                                                onChange={(e) => setScenarioEraFilter(e.target.value === '' ? 'all' : parseInt(e.target.value))}
                                                className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="">全部场景</option>
                                                {systemEras.map(era => (
                                                    <option key={era.id} value={era.id}>{era.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="p-4">标题</th>
                                                    <th className="p-4">对应场景</th>
                                                    <th className="p-4">作者</th>
                                                    <th className="p-4">节点数</th>
                                                    <th className="p-4 text-right">操作</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {/* 显示系统预设的剧本 */}
                                                {systemScripts
                                                    .filter((script: any) => 
                                                        scenarioEraFilter === 'all' || script.systemEraId === scenarioEraFilter
                                                    )
                                                    .map((script: any) => {
                                                    let content: { startNodeId?: string; nodes?: Record<string, any>; participatingCharacters?: string[] } = {};
                                                    let nodeCount = 0;
                                                    try {
                                                        const parsed = typeof script.content === 'string' ? JSON.parse(script.content) : (script.content || {});
                                                        content = parsed as { startNodeId?: string; nodes?: Record<string, any>; participatingCharacters?: string[] };
                                                        nodeCount = content.nodes ? Object.keys(content.nodes).length : 0;
                                                    } catch (e) {
                                                        console.error('解析剧本内容失败:', e);
                                                    }
                                                    
                                                    // 系统预设剧本使用 systemEraId 和 eraName
                                                    const eraName = script.eraName || systemEras.find(e => e.id === script.systemEraId)?.name || '未指定';
                                                    return (
                                                        <tr key={script.id} className="hover:bg-slate-800/50 transition-colors">
                                                            <td className="p-4 font-bold text-white">{script.title}</td>
                                                            <td className="p-4 text-sm text-slate-400">{eraName}</td>
                                                            <td className="p-4 text-sm text-slate-400">系统预设</td>
                                                            <td className="p-4 text-sm text-slate-400">{nodeCount}</td>
                                                            <td className="p-4 text-right space-x-2">
                                                                <button onClick={() => {
                                                                    const editData = {
                                                                        ...script,
                                                                        title: script.title,
                                                                        description: script.description || '',
                                                                        eraId: script.systemEraId?.toString() || '',
                                                                        startNodeId: content.startNodeId || 'start',
                                                                        nodes: JSON.stringify(content.nodes || {}, null, 2),
                                                                        participatingCharacters: content.participatingCharacters || []
                                                                    };
                                                                    switchToEdit(editData);
                                                                }} className="text-indigo-400 hover:text-white text-sm font-medium">编辑</button>
                                                                <button onClick={() => deleteScenario(script.id)} className="text-red-400 hover:text-white text-sm font-medium">删除</button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {/* 显示本地自定义剧本 */}
                                                {gameState.customScenarios
                                                    .filter(scen => {
                                                        if (scenarioEraFilter === 'all') return true;
                                                        // 查找对应的场景
                                                        const era = systemEras.find(e => e.id.toString() === scen.sceneId);
                                                        return era && era.id === scenarioEraFilter;
                                                    })
                                                    .map(scen => {
                                                    const sceneName = allScenes.find(s => s.id === scen.sceneId)?.name || '未知';
                                                    return (
                                                        <tr key={scen.id} className="hover:bg-slate-800/50 transition-colors">
                                                            <td className="p-4 font-bold text-white">{scen.title}</td>
                                                            <td className="p-4 text-sm text-slate-400">{sceneName}</td>
                                                            <td className="p-4 text-sm text-slate-400">{scen.author}</td>
                                                            <td className="p-4 text-sm text-slate-400">{Object.keys(scen.nodes).length}</td>
                                                            <td className="p-4 text-right space-x-2">
                                                                <button onClick={() => {
                                                                    // Convert nodes object to formatted JSON string for editing
                                                                    const editData = { ...scen, nodes: JSON.stringify(scen.nodes, null, 2) };
                                                                    switchToEdit(editData);
                                                                }} className="text-indigo-400 hover:text-white text-sm font-medium">编辑</button>
                                                                <button onClick={() => deleteScenario(scen.id)} className="text-red-400 hover:text-white text-sm font-medium">删除</button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {systemScripts.length === 0 && gameState.customScenarios.length === 0 && (
                                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">暂无剧本</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {(viewMode === 'create' || viewMode === 'edit') && (
                                <div className="max-w-4xl mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800">
                                    <h3 className="text-xl font-bold text-white mb-6">{viewMode === 'create' ? '新建剧本' : '编辑剧本'}</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <InputGroup label="剧本标题">
                                            <TextInput value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                                        </InputGroup>
                                        <InputGroup label="所属场景">
                                            <select 
                                                value={formData.eraId || ''} 
                                                onChange={e => {
                                                    const eraId = e.target.value;
                                                    setFormData({...formData, eraId: eraId});
                                                    // 当场景改变时，清空已选角色（因为它们可能不属于新场景）
                                                    if (eraId) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            eraId: eraId,
                                                            participatingCharacters: []
                                                        }));
                                                    }
                                                }}
                                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                            >
                                                <option value="">未指定</option>
                                                {systemEras.map(era => <option key={era.id} value={era.id}>{era.name}</option>)}
                                            </select>
                                        </InputGroup>
                                    </div>
                                    <InputGroup label="简介">
                                        <TextArea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
                                    </InputGroup>
                                    
                                    {/* 参与角色选择 */}
                                    <div className="mt-6">
                                        <h4 className="text-sm font-bold text-purple-400 border-b border-purple-900/30 pb-2 mb-4">参与角色</h4>
                                        <p className="text-xs text-slate-500 mb-3">选择参与此剧本的角色，故事流程将主要围绕这些角色展开。</p>
                                        {formData.eraId ? (
                                            <div className="space-y-2">
                                                {systemCharacters
                                                    .filter(char => char.systemEraId?.toString() === formData.eraId)
                                                    .map(char => {
                                                        const isSelected = Array.isArray(formData.participatingCharacters) && formData.participatingCharacters.includes(char.id.toString());
                                                        return (
                                                            <label key={char.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={e => {
                                                                        const currentChars = Array.isArray(formData.participatingCharacters) ? formData.participatingCharacters : [];
                                                                        if (e.target.checked) {
                                                                            setFormData({
                                                                                ...formData,
                                                                                participatingCharacters: [...currentChars, char.id.toString()]
                                                                            });
                                                                        } else {
                                                                            setFormData({
                                                                                ...formData,
                                                                                participatingCharacters: currentChars.filter(id => id !== char.id.toString())
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <img src={char.avatarUrl || 'https://picsum.photos/seed/avatar/400/600'} alt={char.name} className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                                                                <div className="flex-1">
                                                                    <div className="text-white font-medium">{char.name}</div>
                                                                    <div className="text-xs text-slate-400">{char.role || '未定义'}</div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                {systemCharacters.filter(char => char.systemEraId?.toString() === formData.eraId).length === 0 && (
                                                    <p className="text-sm text-slate-500 text-center py-4">该场景暂无角色，请先创建角色。</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 text-center py-4">请先选择所属场景，然后选择参与角色。</p>
                                        )}
                                    </div>

                                    {/* 节点内容编辑 */}
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2 flex-1">剧本节点内容</h4>
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={() => {
                                                        // 初始化空节点结构
                                                        const emptyNodes = {
                                                            start: {
                                                                id: 'start',
                                                                title: '开始',
                                                                content: '这是故事的开始...',
                                                                choices: []
                                                            }
                                                        };
                                                        setFormData({
                                                            ...formData,
                                                            nodes: JSON.stringify(emptyNodes, null, 2),
                                                            startNodeId: 'start'
                                                        });
                                                    }}
                                                    className="bg-slate-600 hover:bg-slate-500 text-sm"
                                                >
                                                    🆕 初始化节点
                                                </Button>
                                                <Button 
                                                    onClick={() => {
                                                        try {
                                                            const nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
                                                            setShowScenarioBuilder(true);
                                                        } catch (e) {
                                                            showAlert('节点 JSON 格式错误，请先修复格式', '格式错误', 'error');
                                                        }
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-sm"
                                                >
                                                    📝 打开可视化编辑器
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <InputGroup label="起始节点ID">
                                                <TextInput 
                                                    value={formData.startNodeId || 'start'} 
                                                    onChange={e => setFormData({...formData, startNodeId: e.target.value})}
                                                    placeholder="start"
                                                />
                                            </InputGroup>
                                        </div>
                                        <InputGroup label="节点 JSON 数据">
                                            <TextArea 
                                                value={formData.nodes || ''} 
                                                onChange={e => setFormData({...formData, nodes: e.target.value})} 
                                                rows={15}
                                                placeholder='{"start": {"id": "start", "title": "开始", "content": "这是故事的开始...", "choices": []}}'
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-slate-500 mt-2">
                                                💡 提示：可以直接编辑 JSON 格式的节点数据，或使用可视化编辑器进行编辑。节点格式示例：<code className="text-slate-400">&#123;"id": "节点ID", "title": "节点标题", "content": "节点内容", "choices": [&#123;"text": "选择文本", "nextNodeId": "下一个节点ID"&#125;]&#125;</code>
                                            </p>
                                        </InputGroup>
                                    </div>

                                    {/* 节点流程可视化 */}
                                    {(() => {
                                        try {
                                            const nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
                                            if (nodes && typeof nodes === 'object' && Object.keys(nodes).length > 0) {
                                                return (
                                                    <div className="mt-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2 flex-1">节点流程预览</h4>
                                                        </div>
                                                        <ScenarioNodeFlow
                                                            nodes={nodes}
                                                            startNodeId={formData.startNodeId || 'start'}
                                                            selectedNodeId={selectedNodeId}
                                                            onNodeClick={(nodeId) => {
                                                                setSelectedNodeId(nodeId);
                                                                // 可以在这里添加跳转到该节点的逻辑
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            }
                                        } catch (e) {
                                            // JSON 解析失败，不显示可视化
                                            return (
                                                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                                                    <p className="text-sm text-red-400">⚠️ 节点 JSON 格式错误，无法显示预览。请检查 JSON 格式。</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}


                                    <div className="flex justify-end gap-3 mt-8">
                                        <Button variant="ghost" onClick={switchToList}>取消</Button>
                                        <Button onClick={saveScenario} className="bg-indigo-600">保存剧本</Button>
                                    </div>
                                    
                                    {/* 可视化编辑器弹窗 */}
                                    {showScenarioBuilder && (() => {
                                        try {
                                            const nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
                                            const scenario: CustomScenario = {
                                                id: editingId?.toString() || 'temp',
                                                sceneId: formData.eraId?.toString() || '',
                                                title: formData.title || '新剧本',
                                                description: formData.description || '',
                                                nodes: nodes,
                                                startNodeId: formData.startNodeId || 'start',
                                                author: 'Admin',
                                                participatingCharacters: formData.participatingCharacters || []
                                            };
                                            
                                            return (
                                                <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm">
                                                    <ScenarioBuilder
                                                        initialScenario={scenario}
                                                        onSave={(updatedScenario) => {
                                                            // 更新表单数据
                                                            setFormData({
                                                                ...formData,
                                                                title: updatedScenario.title,
                                                                description: updatedScenario.description,
                                                                nodes: JSON.stringify(updatedScenario.nodes, null, 2),
                                                                startNodeId: updatedScenario.startNodeId,
                                                                participatingCharacters: updatedScenario.participatingCharacters || formData.participatingCharacters || []
                                                            });
                                                            setShowScenarioBuilder(false);
                                                            setSelectedNodeId(undefined);
                                                        }}
                                                        onCancel={() => {
                                                            setShowScenarioBuilder(false);
                                                            setSelectedNodeId(undefined);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        } catch (e) {
                                            return (
                                                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                                                    <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md">
                                                        <h3 className="text-lg font-bold text-red-400 mb-2">无法打开编辑器</h3>
                                                        <p className="text-sm text-slate-400 mb-4">节点数据格式错误，请先修复 JSON 格式。</p>
                                                        <Button onClick={() => setShowScenarioBuilder(false)} className="bg-indigo-600 w-full">关闭</Button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            )}
                        </>
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
