
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
import { ScenarioBuilder } from '../components/ScenarioBuilder';
import { showAlert, showConfirm } from '../utils/dialog';

interface AdminScreenProps {
    gameState: GameState;
    onUpdateGameState: (newState: GameState) => void;
    onResetWorld: () => void;
    onBack: () => void;
}

// --- MAIN COMPONENT ---

export const AdminScreen: React.FC<AdminScreenProps> = ({ gameState, onUpdateGameState, onResetWorld, onBack }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    
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
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingBackground, setIsUploadingBackground] = useState(false);
    const [uploadError, setUploadError] = useState('');
    
    // File input refs
    const eraImageInputRef = useRef<HTMLInputElement>(null);
    const charAvatarInputRef = useRef<HTMLInputElement>(null);
    const charBackgroundInputRef = useRef<HTMLInputElement>(null);

    // 系统数据状态
    const [systemWorlds, setSystemWorlds] = useState<any[]>([]);
    const [systemEras, setSystemEras] = useState<any[]>([]);
    const [systemCharacters, setSystemCharacters] = useState<any[]>([]);
    const [systemScripts, setSystemScripts] = useState<any[]>([]);
    const [systemMainStories, setSystemMainStories] = useState<any[]>([]);
    const [inviteCodes, setInviteCodes] = useState<any[]>([]);
    const [inviteCodeRequired, setInviteCodeRequired] = useState(false);
    const [emailVerificationRequired, setEmailVerificationRequired] = useState(true); // 邮箱验证开关，默认开启
    
    // 调试：监听邮箱验证状态变化
    useEffect(() => {
        console.log("[AdminScreen] 邮箱验证状态变化:", emailVerificationRequired);
    }, [emailVerificationRequired]);
    
    // 邮箱配置状态
    const [emailConfig, setEmailConfig] = useState({
        emailType: '163' as 'qq' | '163', // 邮箱类型
        host: 'smtp.163.com',
        port: '25',
        username: 'tongyexin@163.com',
        password: '',
        from: 'tongyexin@163.com'
    });
    const [isLoadingEmailConfig, setIsLoadingEmailConfig] = useState(false);
    const [showAuthCodeGuide, setShowAuthCodeGuide] = useState(false);
    
    // 印象笔记配置状态
    const [evernoteConfig, setEvernoteConfig] = useState({
        consumerKey: 'heartsphere',
        consumerSecret: '',
        sandbox: true
    });
    const [isLoadingEvernoteConfig, setIsLoadingEvernoteConfig] = useState(false);
    
    // 邀请码生成表单
    const [generateQuantity, setGenerateQuantity] = useState(10);
    const [generateExpiresAt, setGenerateExpiresAt] = useState('');
    
    // 邀请码筛选状态
    const [inviteCodeFilter, setInviteCodeFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');
    
    // 场景过滤状态（用于角色和剧本）
    const [characterEraFilter, setCharacterEraFilter] = useState<number | 'all'>('all');
    const [scenarioEraFilter, setScenarioEraFilter] = useState<number | 'all'>('all');
    
    // 资源管理状态
    const [resources, setResources] = useState<any[]>([]);
    const [resourceCategory, setResourceCategory] = useState<string>('all');
    const [resourceUploading, setResourceUploading] = useState(false);
    const [newResourceName, setNewResourceName] = useState('');
    const [newResourceDescription, setNewResourceDescription] = useState('');
    const [newResourcePrompt, setNewResourcePrompt] = useState('');
    const [newResourceTags, setNewResourceTags] = useState('');
    
    // 资源编辑状态
    const [editingResource, setEditingResource] = useState<any | null>(null);
    const [editResourceName, setEditResourceName] = useState('');
    const [editResourceDescription, setEditResourceDescription] = useState('');
    const [editResourcePrompt, setEditResourcePrompt] = useState('');
    const [editResourceTags, setEditResourceTags] = useState('');
    const [editResourceUrl, setEditResourceUrl] = useState('');
    const [editResourceUploading, setEditResourceUploading] = useState(false);
    
    // 资源选择器状态
    const [showResourcePicker, setShowResourcePicker] = useState(false);
    const [resourcePickerCategory, setResourcePickerCategory] = useState<string>('era');
    const [resourcePickerCallback, setResourcePickerCallback] = useState<((url: string) => void) | null>(null);
    const [resourcePickerCurrentUrl, setResourcePickerCurrentUrl] = useState<string | undefined>(undefined);
    
    // 订阅计划管理状态
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [planFormData, setPlanFormData] = useState<any>({});

    // 检查本地存储的token
    useEffect(() => {
        console.log("========== [AdminScreen] 检查本地token ==========");
        const token = localStorage.getItem('admin_token');
        console.log("[AdminScreen] 本地token存在:", !!token);
        if (token) {
            console.log("[AdminScreen] 发现本地token，自动登录...");
            setAdminToken(token);
            setIsAuthenticated(true);
            loadSystemData(token);
        } else {
            console.log("[AdminScreen] 未找到本地token，显示登录界面");
        }

        // 监听 token 过期事件
        const handleTokenExpired = () => {
            console.warn("[AdminScreen] 收到 token 过期事件，清除认证状态");
            handleLogout();
            showAlert('登录已过期，请重新登录', '登录过期', 'warning');
        };

        window.addEventListener('admin-token-expired', handleTokenExpired);
        return () => {
            window.removeEventListener('admin-token-expired', handleTokenExpired);
        };
    }, []);

    const handleLogin = async (loginUsername: string, loginPassword: string) => {
        console.log("========== [AdminScreen] 管理员登录 ==========");
        console.log("[AdminScreen] 接收到的用户名:", loginUsername);
        console.log("[AdminScreen] 接收到的密码长度:", loginPassword ? loginPassword.length : 0);
        setLoginError('');
        setLoading(true);
        try {
            console.log("[AdminScreen] 调用adminApi.login...");
            const response = await adminApi.login(loginUsername, loginPassword);
            console.log("[AdminScreen] 登录成功，收到token:", !!response.token);
            setAdminToken(response.token);
            localStorage.setItem('admin_token', response.token);
            setIsAuthenticated(true);
            console.log("[AdminScreen] 认证状态已更新，开始加载系统数据...");
            await loadSystemData(response.token);
            console.log("[AdminScreen] 登录流程完成");
        } catch (error: any) {
            console.error('[AdminScreen] 登录失败:', error);
            console.error('[AdminScreen] 错误详情:', error.message || error);
            setLoginError(error.message || '登录失败，请检查用户名和密码');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setAdminToken(null);
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
    };

    // 检查错误是否是 token 验证失败，如果是则清除 token
    const checkAndHandleTokenError = (error: any): boolean => {
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

    const loadSystemData = async (token: string) => {
        console.log("========== [AdminScreen] 加载系统数据 ==========");
        console.log("[AdminScreen] Token存在:", !!token);
        try {
            console.log("[AdminScreen] 开始并行加载系统数据...");
            
            // 分别加载数据，允许部分失败
            const results = await Promise.allSettled([
                adminApi.worlds.getAll(token),
                adminApi.eras.getAll(token),
                adminApi.characters.getAll(token),
                adminApi.inviteCodes.getAll(token),
                adminApi.config.getInviteCodeRequired(token),
                adminApi.config.getEmailConfig(token).catch(() => null), // 如果失败返回null
                adminApi.config.getEmailVerificationRequired(token).catch(() => null), // 如果失败返回null
                adminApi.config.getEvernoteConfig(token).catch(() => null), // 如果失败返回null
                // 订阅计划API可能未加载，使用catch处理404错误
                adminApi.subscriptionPlans.getAll(token),
                // 加载剧本数据（使用管理员专用API）
                adminApi.scripts.getAll(token),
                // 加载主线剧情数据
                adminApi.mainStories.getAll(token)
            ]);
            
            const worlds = results[0].status === 'fulfilled' ? results[0].value : [];
            const eras = results[1].status === 'fulfilled' ? results[1].value : [];
            const characters = results[2].status === 'fulfilled' ? results[2].value : [];
            const codes = results[3].status === 'fulfilled' ? results[3].value : [];
            const config = results[4].status === 'fulfilled' ? results[4].value : { inviteCodeRequired: false };
            const emailConfigData = results[5].status === 'fulfilled' && results[5].value ? results[5].value : null;
            const emailVerificationConfig = results[6].status === 'fulfilled' && results[6].value ? results[6].value : null;
            const evernoteConfigData = results[7].status === 'fulfilled' && results[7].value ? results[7].value : null;
            const plans = results[8].status === 'fulfilled' ? results[8].value : [];
            const scripts = results[9].status === 'fulfilled' ? results[9].value : [];
            const mainStories = results[10].status === 'fulfilled' ? results[10].value : [];
            
            console.log("[AdminScreen] 邮箱验证配置加载结果:", {
                emailVerificationConfig,
                hasValue: !!emailVerificationConfig,
                emailVerificationRequired: emailVerificationConfig?.emailVerificationRequired
            });
            
            console.log("[AdminScreen] 数据加载结果:", {
                worlds: Array.isArray(worlds) ? worlds.length : 0,
                eras: Array.isArray(eras) ? eras.length : 0,
                characters: Array.isArray(characters) ? characters.length : 0,
                scripts: Array.isArray(scripts) ? scripts.length : 0,
                inviteCodes: Array.isArray(codes) ? codes.length : 0,
                plans: Array.isArray(plans) ? plans.length : 0,
                config: config
            });
            console.log("[AdminScreen] 邀请码数据详情:", codes);
            console.log("[AdminScreen] 邀请码数据类型:", typeof codes, Array.isArray(codes));
            
            // 确保 codes 是数组
            const inviteCodesArray = Array.isArray(codes) ? codes : (codes ? [codes] : []);
            console.log("[AdminScreen] 处理后的邀请码数组:", inviteCodesArray);
            
            setSystemWorlds(Array.isArray(worlds) ? worlds : []);
            setSystemEras(Array.isArray(eras) ? eras : []);
            setSystemCharacters(Array.isArray(characters) ? characters : []);
            setSystemScripts(Array.isArray(scripts) ? scripts : []);
            setSystemMainStories(Array.isArray(mainStories) ? mainStories : []);
            setInviteCodes(inviteCodesArray);
            setInviteCodeRequired(config.inviteCodeRequired || false);
            setSubscriptionPlans(Array.isArray(plans) ? plans : []);
            // 更新邮箱验证配置
            if (emailVerificationConfig) {
                const required = emailVerificationConfig.emailVerificationRequired;
                if (required !== undefined && required !== null) {
                    console.log("[AdminScreen] 设置邮箱验证状态:", required);
                    setEmailVerificationRequired(Boolean(required));
                } else {
                    console.warn("[AdminScreen] 邮箱验证配置存在但 emailVerificationRequired 字段无效:", emailVerificationConfig);
                }
            } else {
                console.warn("[AdminScreen] 邮箱验证配置未加载，使用默认值: true");
                // 如果配置未加载，保持默认值（true），但可以尝试重新加载
            }
            if (emailConfigData) {
                // 根据host判断邮箱类型
                const emailType = emailConfigData.host?.includes('qq.com') ? 'qq' : '163';
                setEmailConfig({
                    emailType: emailType,
                    host: emailConfigData.host || 'smtp.163.com',
                    port: emailConfigData.port || (emailType === 'qq' ? '587' : '25'),
                    username: emailConfigData.username || (emailType === 'qq' ? 'heartsphere@qq.com' : 'tongyexin@163.com'),
                    password: emailConfigData.password || '',
                    from: emailConfigData.from || (emailType === 'qq' ? 'heartsphere@qq.com' : 'tongyexin@163.com')
                });
            }
            if (evernoteConfigData) {
                console.log("[AdminScreen] 加载印象笔记配置:", evernoteConfigData);
                setEvernoteConfig({
                    consumerKey: evernoteConfigData.consumerKey || 'heartsphere',
                    consumerSecret: evernoteConfigData.consumerSecret || '',
                    sandbox: evernoteConfigData.sandbox !== undefined ? evernoteConfigData.sandbox : true
                });
            } else {
                console.log("[AdminScreen] 未加载到印象笔记配置，使用默认值");
            }
            console.log("[AdminScreen] 系统数据状态已更新，邀请码数量:", inviteCodesArray.length);
        } catch (error: any) {
            console.error('[AdminScreen] 加载系统数据失败:', error);
            console.error('[AdminScreen] 错误详情:', error);
            
            // 检查是否是 token 验证失败
            if (checkAndHandleTokenError(error)) {
                return;
            }
            
            // 即使加载失败，也显示界面，只是数据为空
            setSystemWorlds([]);
            setSystemEras([]);
            setSystemCharacters([]);
            setSystemScripts([]);
            setInviteCodes([]);
            setSubscriptionPlans([]);
        }
    };

    // 加载资源数据
    const loadResources = async (category?: string) => {
        if (!adminToken) return;
        try {
            const data = category && category !== 'all'
                ? await adminApi.resources.getAll(category, adminToken)
                : await adminApi.resources.getAll(undefined, adminToken);
            setResources(data);
        } catch (err: any) {
            console.error('加载资源失败:', err);
            // 检查是否是 token 验证失败
            if (checkAndHandleTokenError(err)) {
                return;
            }
            setResources([]);
        }
    };

    // 加载预置剧本数据（只加载系统预设的剧本）
    const loadScenariosData = async (token: string) => {
        console.log("========== [AdminScreen] 加载预置剧本数据 ==========");
        try {
            // 只加载系统预设的剧本，不需要 token（公开 API）
            const scripts = await systemScriptApi.getAll();
            console.log("[AdminScreen] 预置剧本数据加载结果:", {
                scripts: Array.isArray(scripts) ? scripts.length : 0
            });
            setSystemScripts(Array.isArray(scripts) ? scripts : []);
        } catch (error) {
            console.error('[AdminScreen] 加载预置剧本数据失败:', error);
            setSystemScripts([]);
        }
    };

    // 当切换到资源管理页面时，自动加载资源
    useEffect(() => {
        if (activeSection === 'resources' && adminToken) {
            loadResources(resourceCategory === 'all' ? undefined : resourceCategory);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection, adminToken]);

    // 当切换到订阅计划管理页面时，自动加载数据
    useEffect(() => {
        if (activeSection === 'subscription-plans' && adminToken) {
            loadSystemData(adminToken);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection, adminToken]);

    // --- CRUD Logic Wrappers ---

    const switchToCreate = () => {
        setFormData({});
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

    // --- Character Management ---

    const saveCharacter = async () => {
        if (!adminToken) return;
        
        try {
            // 使用 formData.systemEraId 或 formData.targetSceneId
            const systemEraId = formData.systemEraId || (formData.targetSceneId ? parseInt(formData.targetSceneId) : null);
            
            // 构建DTO
            const dto: any = {
                name: formData.name || '新角色',
                description: formData.description || formData.bio || '',
                age: formData.age ? (typeof formData.age === 'string' ? parseInt(formData.age) : formData.age) : null,
                gender: formData.gender || null,
                role: formData.role || '未定义',
                bio: formData.bio || formData.description || '',
                avatarUrl: formData.avatarUrl || '',
                backgroundUrl: formData.backgroundUrl || '',
                themeColor: formData.themeColor || null,
                colorAccent: formData.colorAccent || null,
                firstMessage: formData.firstMessage || '',
                systemInstruction: formData.systemInstruction || '',
                voiceName: formData.voiceName || null,
                mbti: formData.mbti || null,
                tags: formData.tags ? (typeof formData.tags === 'string' ? formData.tags : (Array.isArray(formData.tags) ? formData.tags.join(',') : null)) : null,
                speechStyle: formData.speechStyle || null,
                catchphrases: formData.catchphrases ? (typeof formData.catchphrases === 'string' ? formData.catchphrases : (Array.isArray(formData.catchphrases) ? formData.catchphrases.join(',') : null)) : null,
                secrets: formData.secrets || null,
                motivations: formData.motivations || null,
                relationships: formData.relationships || null,
                systemEraId: systemEraId,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                sortOrder: formData.sortOrder || 0
            };

            if (editingId && typeof editingId === 'number') {
                // 更新系统角色
                await adminApi.characters.update(editingId, dto, adminToken);
            } else {
                // 创建新角色
                await adminApi.characters.create(dto, adminToken);
            }
            
            // 重新加载数据
            await loadSystemData(adminToken);
            switchToList();
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };

    const deleteCharacter = async (id: number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定要删除这个系统角色吗？', '删除角色', 'danger');
        if (!confirmed) return;
        
        try {
            await adminApi.characters.delete(id, adminToken);
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
                    if (section === 'resources' && adminToken) {
                        loadResources(resourceCategory === 'all' ? undefined : resourceCategory);
                    }
                    if (section === 'scenarios' && adminToken) {
                        loadScenariosData(adminToken);
                    }
                }}
                onResourcesLoad={() => {
                    if (adminToken) {
                        loadResources(resourceCategory === 'all' ? undefined : resourceCategory);
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
                        <>
                            {viewMode === 'list' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-slate-400 text-sm">管理所有场景的登场角色。</p>
                                        <Button onClick={switchToCreate} className="bg-indigo-600 hover:bg-indigo-500 text-sm">+ 新增角色</Button>
                                    </div>
                                    {/* 场景过滤 */}
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-400 whitespace-nowrap">筛选场景：</span>
                                            <select
                                                value={characterEraFilter === 'all' ? '' : characterEraFilter}
                                                onChange={(e) => setCharacterEraFilter(e.target.value === '' ? 'all' : parseInt(e.target.value))}
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
                                                    <th className="p-4">头像</th>
                                                    <th className="p-4">姓名</th>
                                                    <th className="p-4">角色定位</th>
                                                    <th className="p-4">所属场景</th>
                                                    <th className="p-4 text-right">操作</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {systemCharacters
                                                    .filter(char => 
                                                        characterEraFilter === 'all' || char.systemEraId === characterEraFilter
                                                    )
                                                    .map((char) => {
                                                    // 找到对应的场景信息
                                                    const era = systemEras.find(e => e.id === char.systemEraId);
                                                    const sceneName = era ? era.name : '未分类';
                                                    return (
                                                        <tr key={char.id} className="hover:bg-slate-800/50 transition-colors">
                                                            <td className="p-4"><img src={char.avatarUrl || 'https://picsum.photos/seed/avatar/400/600'} className="w-10 h-10 object-cover rounded-full border border-slate-700" alt="" /></td>
                                                            <td className="p-4 font-bold text-white">
                                                                {char.name}
                                                                <span className="ml-2 text-[10px] bg-indigo-800 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700">SYSTEM</span>
                                                            </td>
                                                            <td className="p-4 text-sm text-slate-400">{char.role || '未定义'}</td>
                                                            <td className="p-4 text-sm text-slate-400">{sceneName}</td>
                                                            <td className="p-4 text-right space-x-2">
                                                                <button onClick={() => {
                                                                    // 使用系统角色的ID和完整数据
                                                                    const editData = { 
                                                                        ...char, 
                                                                        targetSceneId: char.systemEraId ? char.systemEraId.toString() : '',
                                                                        systemEraId: char.systemEraId
                                                                    }; 
                                                                    switchToEdit(editData);
                                                                }} className="text-indigo-400 hover:text-white text-sm font-medium">编辑</button>
                                                                <button onClick={() => deleteCharacter(char.id)} className="text-red-400 hover:text-white text-sm font-medium">删除</button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {(viewMode === 'create' || viewMode === 'edit') && (
                                <div className="max-w-4xl mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800">
                                    <h3 className="text-xl font-bold text-white mb-6">{viewMode === 'create' ? '新建角色' : '编辑角色'}</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-indigo-400 border-b border-indigo-900/30 pb-2">基础信息</h4>
                                            <InputGroup label="姓名">
                                                <TextInput value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                                            </InputGroup>
                                            <InputGroup label="角色定位 (Role)">
                                                <TextInput value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                                            </InputGroup>
                                            <InputGroup label="所属场景 (Scene)">
                                                <select 
                                                    value={formData.systemEraId || formData.targetSceneId || ''} 
                                                    onChange={e => {
                                                        const eraId = e.target.value ? parseInt(e.target.value) : null;
                                                        setFormData({...formData, systemEraId: eraId, targetSceneId: e.target.value});
                                                    }}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                >
                                                    <option value="">请选择场景</option>
                                                    {systemEras.map(era => <option key={era.id} value={era.id}>{era.name}</option>)}
                                                </select>
                                            </InputGroup>
                                            <InputGroup label="简介 (Bio)">
                                                <TextArea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} />
                                            </InputGroup>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-pink-400 border-b border-pink-900/30 pb-2">视觉与人设</h4>
                                            <InputGroup label="头像">
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <TextInput 
                                                            value={formData.avatarUrl || ''} 
                                                            onChange={e => setFormData({...formData, avatarUrl: e.target.value})} 
                                                            placeholder="头像URL或点击上传"
                                                        />
                                                        <button 
                                                            onClick={() => charAvatarInputRef.current?.click()} 
                                                            disabled={isUploadingAvatar}
                                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded disabled:opacity-50"
                                                        >
                                                            {isUploadingAvatar ? '上传中...' : '上传'}
                                                        </button>
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        ref={charAvatarInputRef} 
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            
                                                            setIsUploadingAvatar(true);
                                                            setUploadError('');
                                                            
                                                            try {
                                                                const result = await imageApi.uploadImage(file, 'character', adminToken || undefined);
                                                                if (result.success && result.url) {
                                                                    setFormData({...formData, avatarUrl: result.url});
                                                                } else {
                                                                    throw new Error(result.error || '上传失败');
                                                                }
                                                            } catch (err: any) {
                                                                setUploadError('头像上传失败: ' + (err.message || '未知错误'));
                                                            } finally {
                                                                setIsUploadingAvatar(false);
                                                            }
                                                        }} 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                    />
                                                    {formData.avatarUrl && (
                                                        <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-600">
                                                            <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                            <button 
                                                                onClick={() => setFormData({...formData, avatarUrl: ''})} 
                                                                className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors text-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </InputGroup>
                                            <InputGroup label="背景">
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <TextInput 
                                                            value={formData.backgroundUrl || ''} 
                                                            onChange={e => setFormData({...formData, backgroundUrl: e.target.value})} 
                                                            placeholder="背景URL或点击上传"
                                                        />
                                                        <button 
                                                            onClick={() => charBackgroundInputRef.current?.click()} 
                                                            disabled={isUploadingBackground}
                                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded disabled:opacity-50"
                                                        >
                                                            {isUploadingBackground ? '上传中...' : '上传'}
                                                        </button>
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        ref={charBackgroundInputRef} 
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            
                                                            setIsUploadingBackground(true);
                                                            setUploadError('');
                                                            
                                                            try {
                                                                const result = await imageApi.uploadImage(file, 'character', adminToken || undefined);
                                                                if (result.success && result.url) {
                                                                    setFormData({...formData, backgroundUrl: result.url});
                                                                } else {
                                                                    throw new Error(result.error || '上传失败');
                                                                }
                                                            } catch (err: any) {
                                                                setUploadError('背景上传失败: ' + (err.message || '未知错误'));
                                                            } finally {
                                                                setIsUploadingBackground(false);
                                                            }
                                                        }} 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                    />
                                                    {formData.backgroundUrl && (
                                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                                                            <img src={formData.backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                                                            <button 
                                                                onClick={() => setFormData({...formData, backgroundUrl: ''})} 
                                                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </InputGroup>
                                            {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
                                            <InputGroup label="第一句问候">
                                                <TextArea value={formData.firstMessage || ''} onChange={e => setFormData({...formData, firstMessage: e.target.value})} rows={2} />
                                            </InputGroup>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h4 className="text-sm font-bold text-green-400 border-b border-green-900/30 pb-2 mb-4">系统指令 (System Prompt)</h4>
                                        <InputGroup label="完整角色扮演指令 (Prompt)">
                                            <TextArea value={formData.systemInstruction || ''} onChange={e => setFormData({...formData, systemInstruction: e.target.value})} rows={6} className="font-mono text-xs" />
                                        </InputGroup>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8">
                                        <Button variant="ghost" onClick={switchToList}>取消</Button>
                                        <Button onClick={saveCharacter} className="bg-indigo-600">保存角色</Button>
                                    </div>
                                </div>
                            )}
                        </>
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

                                    {/* 节点流程可视化 */}
                                    {(() => {
                                        try {
                                            const nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
                                            if (nodes && typeof nodes === 'object' && Object.keys(nodes).length > 0) {
                                                return (
                                                    <div className="mt-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2 flex-1">节点流程</h4>
                                                            <Button 
                                                                onClick={() => setShowScenarioBuilder(true)}
                                                                className="bg-emerald-600 hover:bg-emerald-500 text-sm"
                                                            >
                                                                📝 打开可视化编辑器
                                                            </Button>
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
                        <div className="max-w-6xl mx-auto space-y-6">
                            {/* 邀请码开关 */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-lg font-bold text-slate-100 mb-4">邀请码设置</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-300 mb-1">注册是否需要邀请码</p>
                                        <p className="text-xs text-slate-500">开启后，用户注册时必须输入有效的邀请码</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={inviteCodeRequired}
                                            onChange={async (e) => {
                                                if (!adminToken) return;
                                                try {
                                                    await adminApi.config.setInviteCodeRequired(e.target.checked, adminToken);
                                                    setInviteCodeRequired(e.target.checked);
                                                } catch (error: any) {
                                                    showAlert('设置失败: ' + (error.message || '未知错误'), '设置失败', 'error');
                                                }
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* 邮箱配置 */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-lg font-bold text-slate-100 mb-4">邮箱配置</h3>
                                <div className="space-y-4">
                                    <InputGroup label="SMTP服务器">
                                        <TextInput
                                            value={emailConfig.host}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                                            placeholder="smtp.163.com"
                                        />
                                    </InputGroup>
                                    <InputGroup label="SMTP端口">
                                        <TextInput
                                            type="number"
                                            value={emailConfig.port}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, port: e.target.value })}
                                            placeholder="25"
                                        />
                                    </InputGroup>
                                    <InputGroup label="邮箱用户名">
                                        <TextInput
                                            value={emailConfig.username}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, username: e.target.value })}
                                            placeholder="tongyexin@163.com"
                                        />
                                    </InputGroup>
                                    <InputGroup label="邮箱密码/授权码">
                                        <TextInput
                                            type="password"
                                            value={emailConfig.password}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                                            placeholder="请输入授权码"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">163邮箱需要授权码，不是登录密码</p>
                                    </InputGroup>
                                    <InputGroup label="发件人邮箱">
                                        <TextInput
                                            value={emailConfig.from}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, from: e.target.value })}
                                            placeholder="tongyexin@163.com"
                                        />
                                    </InputGroup>
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={async () => {
                                                if (!adminToken) return;
                                                setIsLoadingEmailConfig(true);
                                                try {
                                                    await adminApi.config.setEmailConfig(emailConfig, adminToken);
                                                    showAlert('邮箱配置已保存', '保存成功', 'success');
                                                } catch (error: any) {
                                                    showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
                                                } finally {
                                                    setIsLoadingEmailConfig(false);
                                                }
                                            }}
                                            disabled={isLoadingEmailConfig}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {isLoadingEmailConfig ? '保存中...' : '保存配置'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* 生成邀请码 */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-lg font-bold text-slate-100 mb-4">生成邀请码</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <InputGroup label="生成数量">
                                        <TextInput
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={generateQuantity}
                                            onChange={(e) => setGenerateQuantity(parseInt(e.target.value) || 10)}
                                        />
                                    </InputGroup>
                                    <InputGroup label="过期时间">
                                        <TextInput
                                            type="datetime-local"
                                            value={generateExpiresAt}
                                            onChange={(e) => setGenerateExpiresAt(e.target.value)}
                                        />
                                    </InputGroup>
                                    <div className="flex items-end">
                                        <button
                                            onClick={async () => {
                                                if (!adminToken) return;
                                                if (!generateExpiresAt) {
                                                    showAlert('请设置过期时间', '缺少参数', 'warning');
                                                    return;
                                                }
                                                try {
                                                    const codes = await adminApi.inviteCodes.generate(
                                                        generateQuantity,
                                                        new Date(generateExpiresAt).toISOString(),
                                                        adminToken
                                                    );
                                                    showAlert(`成功生成 ${codes.length} 个邀请码`, '生成成功', 'success');
                                                    await loadSystemData(adminToken);
                                                } catch (error: any) {
                                                    showAlert('生成失败: ' + (error.message || '未知错误'), '生成失败', 'error');
                                                }
                                            }}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
                                        >
                                            生成邀请码
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 邀请码列表 */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-100">邀请码列表</h3>
                                    <div className="flex gap-2 items-center">
                                        {/* 筛选按钮 */}
                                        <div className="flex gap-2 mr-4">
                                            <button
                                                onClick={() => setInviteCodeFilter('all')}
                                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                                    inviteCodeFilter === 'all' 
                                                        ? 'bg-indigo-600 text-white' 
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                全部
                                            </button>
                                            <button
                                                onClick={() => setInviteCodeFilter('available')}
                                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                                    inviteCodeFilter === 'available' 
                                                        ? 'bg-green-600 text-white' 
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                可用
                                            </button>
                                            <button
                                                onClick={() => setInviteCodeFilter('used')}
                                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                                    inviteCodeFilter === 'used' 
                                                        ? 'bg-red-600 text-white' 
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                已使用
                                            </button>
                                            <button
                                                onClick={() => setInviteCodeFilter('expired')}
                                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                                    inviteCodeFilter === 'expired' 
                                                        ? 'bg-yellow-600 text-white' 
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                已过期
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const availableCodes = inviteCodes
                                                    .filter(code => !code.isUsed && new Date(code.expiresAt) >= new Date())
                                                    .map(code => code.code)
                                                    .join('\n');
                                                if (availableCodes) {
                                                    navigator.clipboard.writeText(availableCodes).then(() => {
                                                        showAlert('已复制所有可用邀请码到剪贴板', '复制成功', 'success');
                                                    }).catch(() => {
                                                        showAlert('复制失败，请手动复制', '复制失败', 'error');
                                                    });
                                                } else {
                                                    showAlert('没有可用的邀请码', '提示', 'warning');
                                                }
                                            }}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded transition-colors"
                                        >
                                            复制所有可用
                                        </button>
                                        <button
                                            onClick={() => {
                                                const csvContent = [
                                                    ['邀请码', '状态', '使用用户', '使用时间', '过期时间', '创建时间'].join(','),
                                                    ...inviteCodes.map(code => {
                                                        const isExpired = new Date(code.expiresAt) < new Date();
                                                        const status = code.isUsed ? '已使用' : isExpired ? '已过期' : '可用';
                                                        return [
                                                            code.code,
                                                            status,
                                                            code.usedByUserId || '',
                                                            code.usedAt ? new Date(code.usedAt).toLocaleString('zh-CN') : '',
                                                            new Date(code.expiresAt).toLocaleString('zh-CN'),
                                                            new Date(code.createdAt).toLocaleString('zh-CN')
                                                        ].join(',');
                                                    })
                                                ].join('\n');
                                                
                                                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                                                const link = document.createElement('a');
                                                const url = URL.createObjectURL(blob);
                                                link.setAttribute('href', url);
                                                link.setAttribute('download', `invite-codes-${new Date().toISOString().split('T')[0]}.csv`);
                                                link.style.visibility = 'hidden';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded transition-colors"
                                        >
                                            导出 CSV
                                        </button>
                                        <button
                                            onClick={() => {
                                                const txtContent = inviteCodes
                                                    .filter(code => !code.isUsed && new Date(code.expiresAt) >= new Date())
                                                    .map(code => code.code)
                                                    .join('\n');
                                                
                                                if (txtContent) {
                                                    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
                                                    const link = document.createElement('a');
                                                    const url = URL.createObjectURL(blob);
                                                    link.setAttribute('href', url);
                                                    link.setAttribute('download', `invite-codes-${new Date().toISOString().split('T')[0]}.txt`);
                                                    link.style.visibility = 'hidden';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                } else {
                                                    showAlert('没有可用的邀请码', '提示', 'warning');
                                                }
                                            }}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded transition-colors"
                                        >
                                            导出可用码 (TXT)
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">邀请码</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">状态</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">使用用户</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">使用时间</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">过期时间</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">创建时间</th>
                                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                // 筛选邀请码
                                                const filteredCodes = inviteCodes && inviteCodes.length > 0 ? inviteCodes.filter((code) => {
                                                    const isExpired = new Date(code.expiresAt) < new Date();
                                                    if (inviteCodeFilter === 'all') return true;
                                                    if (inviteCodeFilter === 'available') return !code.isUsed && !isExpired;
                                                    if (inviteCodeFilter === 'used') return code.isUsed;
                                                    if (inviteCodeFilter === 'expired') return !code.isUsed && isExpired;
                                                    return true;
                                                }) : [];
                                                
                                                if (filteredCodes.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan={7} className="text-center text-slate-500 py-8">
                                                                {inviteCodes && inviteCodes.length > 0 
                                                                    ? `没有${inviteCodeFilter === 'all' ? '' : inviteCodeFilter === 'available' ? '可用' : inviteCodeFilter === 'used' ? '已使用' : '已过期'}的邀请码`
                                                                    : '暂无邀请码，请先生成邀请码'}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                
                                                return filteredCodes.map((code) => {
                                                    const isExpired = new Date(code.expiresAt) < new Date();
                                                    const status = code.isUsed ? '已使用' : isExpired ? '已过期' : '可用';
                                                    const statusColor = code.isUsed ? 'text-red-400' : isExpired ? 'text-yellow-400' : 'text-green-400';
                                                    return (
                                                    <tr key={code.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                        <td className="py-3 px-4 font-mono font-bold text-slate-200">
                                                            <div className="flex items-center gap-2">
                                                                <span>{code.code}</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        navigator.clipboard.writeText(code.code).then(() => {
                                                                            const btn = e.target as HTMLElement;
                                                                            if (btn) {
                                                                                const originalText = btn.textContent;
                                                                                btn.textContent = '✓';
                                                                                btn.className = 'text-green-400 hover:text-green-300 text-xs';
                                                                                setTimeout(() => {
                                                                                    btn.textContent = originalText;
                                                                                    btn.className = 'text-slate-400 hover:text-slate-300 text-xs';
                                                                                }, 1000);
                                                                            }
                                                                        }).catch(() => {
                                                                            showAlert('复制失败，请手动复制: ' + code.code, '复制失败', 'error');
                                                                        });
                                                                    }}
                                                                    className="text-slate-400 hover:text-slate-300 text-xs"
                                                                    title="复制邀请码"
                                                                >
                                                                    📋
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className={`py-3 px-4 ${statusColor} font-bold`}>{status}</td>
                                                        <td className="py-3 px-4 text-slate-400">{code.usedByUserId || '-'}</td>
                                                        <td className="py-3 px-4 text-slate-400">{code.usedAt ? new Date(code.usedAt).toLocaleString('zh-CN') : '-'}</td>
                                                        <td className={`py-3 px-4 ${isExpired ? 'text-red-400' : 'text-slate-400'}`}>
                                                            {new Date(code.expiresAt).toLocaleString('zh-CN')}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-500">{new Date(code.createdAt).toLocaleString('zh-CN')}</td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(code.code).then(() => {
                                                                        showAlert('已复制: ' + code.code, '复制成功', 'success');
                                                                    }).catch(() => {
                                                                        showAlert('复制失败，请手动复制: ' + code.code, '复制失败', 'error');
                                                                    });
                                                                }}
                                                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
                                                            >
                                                                复制
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- RESOURCES MANAGEMENT --- */}
                    {activeSection === 'resources' && (
                        <div className="max-w-7xl mx-auto space-y-6">
                            {/* 顶部工具栏 */}
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-slate-100">资源管理</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-slate-400">分类筛选:</span>
                                        <select
                                            value={resourceCategory}
                                            onChange={async (e) => {
                                                const category = e.target.value;
                                                setResourceCategory(category);
                                                await loadResources(category === 'all' ? undefined : category);
                                            }}
                                            className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white text-sm focus:border-indigo-500 outline-none"
                                        >
                                            <option value="all">全部分类 ({resources.length})</option>
                                            <option value="avatar">头像</option>
                                            <option value="character">角色</option>
                                            <option value="era">场景</option>
                                            <option value="scenario">剧本</option>
                                            <option value="journal">日记</option>
                                            <option value="general">通用</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* 左侧：上传/编辑表单 */}
                                <div className="lg:col-span-1">
                                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-lg sticky top-4">
                                        {editingResource ? (
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                                        <span>✏️</span> 编辑资源
                                                    </h3>
                                                    <button
                                                        onClick={() => {
                                                            setEditingResource(null);
                                                            setEditResourceName('');
                                                            setEditResourceDescription('');
                                                            setEditResourcePrompt('');
                                                            setEditResourceTags('');
                                                            setEditResourceUrl('');
                                                        }}
                                                        className="text-slate-400 hover:text-white text-sm"
                                                    >
                                                        取消
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <InputGroup label="资源名称">
                                                        <TextInput
                                                            value={editResourceName}
                                                            onChange={e => setEditResourceName(e.target.value)}
                                                            placeholder="输入资源名称"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="描述">
                                                        <TextInput
                                                            value={editResourceDescription}
                                                            onChange={e => setEditResourceDescription(e.target.value)}
                                                            placeholder="输入描述"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="提示词" subLabel="AI生成图片的提示词">
                                                        <textarea
                                                            value={editResourcePrompt}
                                                            onChange={e => setEditResourcePrompt(e.target.value)}
                                                            placeholder="输入提示词..."
                                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-3 text-white text-sm placeholder-slate-500 focus:border-indigo-500 outline-none resize-none h-24"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="标签">
                                                        <TextInput
                                                            value={editResourceTags}
                                                            onChange={e => setEditResourceTags(e.target.value)}
                                                            placeholder="例如：古风,唯美,二次元"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="图片URL" subLabel="根据提示词生成图片后，粘贴图片URL">
                                                        <TextInput
                                                            value={editResourceUrl}
                                                            onChange={e => setEditResourceUrl(e.target.value)}
                                                            placeholder="输入图片URL或上传新图片"
                                                        />
                                                    </InputGroup>
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file || !adminToken || !editingResource) return;
                                                                setEditResourceUploading(true);
                                                                try {
                                                                    const result = await imageApi.uploadImage(file, 'general', adminToken);
                                                                    if (result && result.url) {
                                                                        setEditResourceUrl(result.url);
                                                                        showAlert('图片上传成功', '上传成功', 'success');
                                                                    } else {
                                                                        showAlert('图片上传失败：未返回URL', '上传失败', 'error');
                                                                    }
                                                                } catch (err: any) {
                                                                    showAlert('上传失败: ' + (err.message || '未知错误'), '上传失败', 'error');
                                                                } finally {
                                                                    setEditResourceUploading(false);
                                                                }
                                                            }}
                                                            className="hidden"
                                                            id="edit-resource-upload"
                                                        />
                                                        <label
                                                            htmlFor="edit-resource-upload"
                                                            className={`block w-full text-center px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors cursor-pointer text-sm ${editResourceUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {editResourceUploading ? '上传中...' : '📁 上传新图片'}
                                                        </label>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            if (!adminToken || !editingResource) return;
                                                            try {
                                                                await adminApi.resources.update(
                                                                    editingResource.id,
                                                                    {
                                                                        name: editResourceName,
                                                                        description: editResourceDescription,
                                                                        prompt: editResourcePrompt,
                                                                        tags: editResourceTags,
                                                                        url: editResourceUrl
                                                                    },
                                                                    adminToken
                                                                );
                                                                await loadResources(resourceCategory === 'all' ? undefined : resourceCategory);
                                                                setEditingResource(null);
                                                                setEditResourceName('');
                                                                setEditResourceDescription('');
                                                                setEditResourcePrompt('');
                                                                setEditResourceTags('');
                                                                setEditResourceUrl('');
                                                                showAlert('资源更新成功', '更新成功', 'success');
                                                            } catch (err: any) {
                                                                showAlert('更新失败: ' + (err.message || '未知错误'), '更新失败', 'error');
                                                            }
                                                        }}
                                                        className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-sm"
                                                    >
                                                        保存更改
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                                                    <span>📤</span> 上传新资源
                                                </h3>
                                                <div className="space-y-4">
                                                    <InputGroup label="分类" subLabel="选择资源分类">
                                                        <select
                                                            value={resourceCategory === 'all' ? '' : resourceCategory}
                                                            onChange={e => setResourceCategory(e.target.value)}
                                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-3 text-white text-sm focus:border-indigo-500 outline-none"
                                                        >
                                                            <option value="">选择分类</option>
                                                            <option value="avatar">头像</option>
                                                            <option value="character">角色</option>
                                                            <option value="era">场景</option>
                                                            <option value="scenario">剧本</option>
                                                            <option value="journal">日记</option>
                                                            <option value="general">通用</option>
                                                        </select>
                                                    </InputGroup>
                                                    <InputGroup label="资源名称">
                                                        <TextInput
                                                            value={newResourceName}
                                                            onChange={e => setNewResourceName(e.target.value)}
                                                            placeholder="输入资源名称"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="描述">
                                                        <TextInput
                                                            value={newResourceDescription}
                                                            onChange={e => setNewResourceDescription(e.target.value)}
                                                            placeholder="输入描述"
                                                        />
                                                    </InputGroup>
                                                    <InputGroup label="提示词" subLabel="AI生成图片的提示词">
                                                        <textarea
                                                            value={newResourcePrompt}
                                                            onChange={e => setNewResourcePrompt(e.target.value)}
                                                            placeholder="输入提示词..."
                                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-3 text-white text-sm placeholder-slate-500 focus:border-indigo-500 outline-none resize-none h-20"
                                                        />
                                                        {resourceCategory && resourceCategory !== 'all' && getAllTemplatesForCategory(resourceCategory).length > 0 && (
                                                            <div className="mt-2 flex gap-2 flex-wrap">
                                                                {getAllTemplatesForCategory(resourceCategory).slice(0, 3).map((template, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => setNewResourcePrompt(template.prompt)}
                                                                        className="text-xs px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded border border-indigo-500/30 transition-colors"
                                                                        title={template.description}
                                                                    >
                                                                        {template.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </InputGroup>
                                                    <InputGroup label="标签">
                                                        <TextInput
                                                            value={newResourceTags}
                                                            onChange={e => setNewResourceTags(e.target.value)}
                                                            placeholder="例如：古风,唯美,二次元"
                                                        />
                                                    </InputGroup>
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file || !resourceCategory || resourceCategory === 'all') {
                                                                    showAlert('请先选择分类', '缺少参数', 'warning');
                                                                    return;
                                                                }
                                                                if (!adminToken) return;
                                                                setResourceUploading(true);
                                                                try {
                                                                    await adminApi.resources.create(
                                                                        file,
                                                                        resourceCategory,
                                                                        newResourceName || undefined,
                                                                        newResourceDescription || undefined,
                                                                        newResourcePrompt || undefined,
                                                                        newResourceTags || undefined,
                                                                        adminToken
                                                                    );
                                                                    setNewResourceName('');
                                                                    setNewResourceDescription('');
                                                                    setNewResourcePrompt('');
                                                                    setNewResourceTags('');
                                                                    const data = resourceCategory === 'all' 
                                                                        ? await adminApi.resources.getAll(undefined, adminToken)
                                                                        : await adminApi.resources.getAll(resourceCategory, adminToken);
                                                                    setResources(data);
                                                                    showAlert('资源上传成功', '上传成功', 'success');
                                                                } catch (err: any) {
                                                                    showAlert('上传失败: ' + (err.message || '未知错误'), '上传失败', 'error');
                                                                } finally {
                                                                    setResourceUploading(false);
                                                                }
                                                            }}
                                                            className="hidden"
                                                            id="resource-upload"
                                                        />
                                                        <label
                                                            htmlFor="resource-upload"
                                                            className={`block w-full text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-sm ${resourceUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {resourceUploading ? '上传中...' : '📁 选择并上传图片'}
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 右侧：资源列表 */}
                                <div className="lg:col-span-2">
                                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-slate-100">
                                                资源列表 
                                                <span className="text-sm font-normal text-slate-400 ml-2">({resources.length} 个)</span>
                                            </h3>
                                        </div>
                                        
                                        {resources.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-slate-500 text-sm">暂无资源</p>
                                                <p className="text-slate-600 text-xs mt-2">请上传新资源或选择其他分类</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {resources.map((resource) => (
                                                    <div key={resource.id} className="group bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer" onClick={() => {
                                                        setEditingResource(resource);
                                                        setEditResourceName(resource.name || '');
                                                        setEditResourceDescription(resource.description || '');
                                                        setEditResourcePrompt(resource.prompt || '');
                                                        setEditResourceTags(resource.tags || '');
                                                        setEditResourceUrl(resource.url || '');
                                                    }}>
                                                        {/* 图片区域 */}
                                                        <div className="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
                                                            <img
                                                                src={resource.url}
                                                                alt={resource.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%231e293b" width="200" height="200"/%3E%3Ctext fill="%2364758b" x="100" y="100" text-anchor="middle" dy=".3em" font-size="14"%3E占位符%3C/text%3E%3C/svg%3E';
                                                                }}
                                                            />
                                                            {/* 悬浮操作按钮 */}
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 flex-wrap">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingResource(resource);
                                                                        setEditResourceName(resource.name || '');
                                                                        setEditResourceDescription(resource.description || '');
                                                                        setEditResourcePrompt(resource.prompt || '');
                                                                        setEditResourceTags(resource.tags || '');
                                                                        setEditResourceUrl(resource.url || '');
                                                                    }}
                                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors z-10"
                                                                    title="编辑资源"
                                                                >
                                                                    ✏️ 编辑
                                                                </button>
                                                                {resource.prompt && (
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            try {
                                                                                await navigator.clipboard.writeText(resource.prompt);
                                                                                showAlert('提示词已复制到剪贴板', '复制成功', 'success');
                                                                            } catch (err) {
                                                                                showAlert('复制失败', '复制失败', 'error');
                                                                            }
                                                                        }}
                                                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                                                                        title="复制提示词"
                                                                    >
                                                                        📋 复制
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (!adminToken) return;
                                                                        const confirmed = await showConfirm('确定要删除这个资源吗？', '删除资源', 'danger');
                                                                        if (confirmed) {
                                                                            try {
                                                                                await adminApi.resources.delete(resource.id, adminToken);
                                                                                setResources(resources.filter(r => r.id !== resource.id));
                                                                            } catch (err: any) {
                                                                                showAlert('删除失败: ' + (err.message || '未知错误'), '删除失败', 'error');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                                                    title="删除资源"
                                                                >
                                                                    🗑️ 删除
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* 信息区域 */}
                                                        <div className="p-3 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-white truncate" title={resource.name}>
                                                                        {resource.name}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-xs px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded border border-indigo-500/30">
                                                                            {resource.category}
                                                                        </span>
                                                                        {resource.tags && (
                                                                            <span className="text-xs text-slate-500 truncate" title={resource.tags}>
                                                                                {resource.tags.split(',').slice(0, 2).join(', ')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingResource(resource);
                                                                        setEditResourceName(resource.name || '');
                                                                        setEditResourceDescription(resource.description || '');
                                                                        setEditResourcePrompt(resource.prompt || '');
                                                                        setEditResourceTags(resource.tags || '');
                                                                        setEditResourceUrl(resource.url || '');
                                                                    }}
                                                                    className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex-shrink-0"
                                                                    title="编辑资源"
                                                                >
                                                                    ✏️
                                                                </button>
                                                            </div>
                                                            
                                                            {resource.description && (
                                                                <p className="text-xs text-slate-400 line-clamp-2" title={resource.description}>
                                                                    {resource.description}
                                                                </p>
                                                            )}
                                                            
                                                            {resource.prompt && (
                                                                <details className="text-xs" onClick={(e) => e.stopPropagation()}>
                                                                    <summary className="text-indigo-400 hover:text-indigo-300 cursor-pointer">
                                                                        查看提示词
                                                                    </summary>
                                                                    <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-700">
                                                                        <p className="text-slate-300 line-clamp-4 text-xs" title={resource.prompt}>
                                                                            {resource.prompt}
                                                                        </p>
                                                                    </div>
                                                                </details>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- SETTINGS --- */}
                    {activeSection === 'subscription-plans' && (
                        <div className="max-w-6xl mx-auto">
                            {!editingPlan ? (
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-100">会员配置管理</h3>
                                            <p className="text-slate-400 text-sm mt-1">
                                                当前共有 {subscriptionPlans.length} 个订阅计划
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setPlanFormData({
                                                    name: '',
                                                    type: 'basic',
                                                    billingCycle: 'monthly',
                                                    price: 0,
                                                    originalPrice: null,
                                                    discountPercent: 0,
                                                    pointsPerMonth: 0,
                                                    maxImagesPerMonth: 0,
                                                    maxVideosPerMonth: 0,
                                                    maxTextGenerationsPerMonth: -1,
                                                    maxAudioGenerationsPerMonth: 0,
                                                    allowPriorityQueue: false,
                                                    allowWatermarkRemoval: false,
                                                    allowBatchProcessing: false,
                                                    allowApiAccess: false,
                                                    maxApiCallsPerDay: 0,
                                                    isActive: true,
                                                    sortOrder: subscriptionPlans.length + 1
                                                });
                                                setEditingPlan({ id: null });
                                            }}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                        >
                                            + 新建订阅计划
                                        </button>
                                    </div>
                                    {subscriptionPlans.length === 0 && (
                                        <div className="text-center py-8 text-slate-500">
                                            <p>暂无订阅计划</p>
                                            <p className="text-xs mt-2">点击"新建订阅计划"按钮创建第一个计划</p>
                                        </div>
                                    )}
                                    {subscriptionPlans.length > 0 && (
                                        <div className="space-y-4">
                                            {subscriptionPlans.map((plan: any) => (
                                                <div key={plan.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h4 className="text-white font-bold">{plan.name}</h4>
                                                            <p className="text-slate-400 text-sm mt-1">{plan.type} · {plan.billingCycle}</p>
                                                            <p className="text-indigo-400 text-lg font-bold mt-2">¥{plan.price}</p>
                                                            {plan.originalPrice && plan.originalPrice > plan.price && (
                                                                <p className="text-slate-500 text-sm line-through">原价: ¥{plan.originalPrice}</p>
                                                            )}
                                                            {plan.discountPercent && plan.discountPercent > 0 && (
                                                                <p className="text-green-400 text-sm">优惠: {plan.discountPercent}%</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs px-2 py-1 rounded ${plan.isActive ? 'bg-green-600/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                                                {plan.isActive ? '启用' : '禁用'}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setPlanFormData({ ...plan });
                                                                    setEditingPlan(plan);
                                                                }}
                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                编辑
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!adminToken) return;
                                                                    const confirmed = await showConfirm(`确定要删除订阅计划"${plan.name}"吗？`, '删除订阅计划', 'danger');
                                                                    if (!confirmed) return;
                                                                    try {
                                                                        await adminApi.subscriptionPlans.delete(plan.id, adminToken);
                                                                        await loadSystemData(adminToken);
                                                                        showAlert('删除成功', '操作成功', 'success');
                                                                    } catch (error: any) {
                                                                        showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                删除
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-100">
                                            {editingPlan.id ? '编辑订阅计划' : '新建订阅计划'}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setEditingPlan(null);
                                                setPlanFormData({});
                                            }}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                        >
                                            取消
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="计划名称 *">
                                                <TextInput
                                                    value={planFormData.name || ''}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                                                    placeholder="例如：基础版"
                                                />
                                            </InputGroup>
                                            <InputGroup label="计划类型 *">
                                                <select
                                                    value={planFormData.type || 'basic'}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, type: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                >
                                                    <option value="free">免费版 (free)</option>
                                                    <option value="basic">基础版 (basic)</option>
                                                    <option value="standard">标准版 (standard)</option>
                                                    <option value="premium">高级版 (premium)</option>
                                                </select>
                                            </InputGroup>
                                            <InputGroup label="计费周期 *">
                                                <select
                                                    value={planFormData.billingCycle || 'monthly'}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, billingCycle: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                >
                                                    <option value="monthly">月付 (monthly)</option>
                                                    <option value="yearly">年付 (yearly)</option>
                                                    <option value="continuous_monthly">连续包月 (continuous_monthly)</option>
                                                    <option value="continuous_yearly">连续包年 (continuous_yearly)</option>
                                                </select>
                                            </InputGroup>
                                            <InputGroup label="价格 *">
                                                <TextInput
                                                    type="number"
                                                    step="0.01"
                                                    value={planFormData.price || 0}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, price: parseFloat(e.target.value) || 0 })}
                                                    placeholder="0.00"
                                                />
                                            </InputGroup>
                                            <InputGroup label="原价">
                                                <TextInput
                                                    type="number"
                                                    step="0.01"
                                                    value={planFormData.originalPrice || ''}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, originalPrice: e.target.value ? parseFloat(e.target.value) : null })}
                                                    placeholder="留空表示无原价"
                                                />
                                            </InputGroup>
                                            <InputGroup label="折扣百分比">
                                                <TextInput
                                                    type="number"
                                                    value={planFormData.discountPercent || 0}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, discountPercent: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                />
                                            </InputGroup>
                                            <InputGroup label="每月积分">
                                                <TextInput
                                                    type="number"
                                                    value={planFormData.pointsPerMonth || 0}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, pointsPerMonth: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                />
                                            </InputGroup>
                                            <InputGroup label="每月图片生成数">
                                                <TextInput
                                                    type="number"
                                                    value={planFormData.maxImagesPerMonth || 0}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, maxImagesPerMonth: e.target.value ? parseInt(e.target.value) : null })}
                                                    placeholder="0 或留空表示无限制"
                                                />
                                            </InputGroup>
                                            <InputGroup label="每月视频生成数">
                                                <TextInput
                                                    type="number"
                                                    value={planFormData.maxVideosPerMonth || 0}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, maxVideosPerMonth: e.target.value ? parseInt(e.target.value) : null })}
                                                    placeholder="0 或留空表示无限制"
                                                />
                                            </InputGroup>
                                            <InputGroup label="每月文本生成数">
                                                <TextInput
                                                    type="number"
                                                    value={planFormData.maxTextGenerationsPerMonth === -1 ? '' : (planFormData.maxTextGenerationsPerMonth || 0)}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, maxTextGenerationsPerMonth: e.target.value ? parseInt(e.target.value) : -1 })}
                                                    placeholder="-1 表示无限制"
                                                />
                                            </InputGroup>
                                            <InputGroup label="每月音频生成数">
                                                <TextInput
                                                    type="number"
                                                    value={planFormData.maxAudioGenerationsPerMonth || 0}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, maxAudioGenerationsPerMonth: e.target.value ? parseInt(e.target.value) : null })}
                                                    placeholder="0 或留空表示无限制"
                                                />
                                            </InputGroup>
                                            <InputGroup label="每日API调用数">
                                                <TextInput
                                                    type="number"
                                                    value={planFormData.maxApiCallsPerDay || 0}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, maxApiCallsPerDay: e.target.value ? parseInt(e.target.value) : null })}
                                                    placeholder="0 或留空表示无限制"
                                                />
                                            </InputGroup>
                                            <InputGroup label="排序顺序">
                                                <TextInput
                                                    type="number"
                                                    value={planFormData.sortOrder || 0}
                                                    onChange={(e) => setPlanFormData({ ...planFormData, sortOrder: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                />
                                            </InputGroup>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-slate-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={planFormData.allowPriorityQueue || false}
                                                        onChange={(e) => setPlanFormData({ ...planFormData, allowPriorityQueue: e.target.checked })}
                                                        className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                                    />
                                                    允许优先队列
                                                </label>
                                                <label className="flex items-center gap-2 text-slate-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={planFormData.allowWatermarkRemoval || false}
                                                        onChange={(e) => setPlanFormData({ ...planFormData, allowWatermarkRemoval: e.target.checked })}
                                                        className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                                    />
                                                    允许去除水印
                                                </label>
                                                <label className="flex items-center gap-2 text-slate-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={planFormData.allowBatchProcessing || false}
                                                        onChange={(e) => setPlanFormData({ ...planFormData, allowBatchProcessing: e.target.checked })}
                                                        className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                                    />
                                                    允许批量处理
                                                </label>
                                                <label className="flex items-center gap-2 text-slate-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={planFormData.allowApiAccess || false}
                                                        onChange={(e) => setPlanFormData({ ...planFormData, allowApiAccess: e.target.checked })}
                                                        className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                                    />
                                                    允许API访问
                                                </label>
                                                <label className="flex items-center gap-2 text-slate-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={planFormData.isActive !== false}
                                                        onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.checked })}
                                                        className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                                    />
                                                    启用
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                onClick={() => {
                                                    setEditingPlan(null);
                                                    setPlanFormData({});
                                                }}
                                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!adminToken) return;
                                                    if (!planFormData.name) {
                                                        showAlert('请输入计划名称', '缺少参数', 'warning');
                                                        return;
                                                    }
                                                    try {
                                                        if (editingPlan.id) {
                                                            await adminApi.subscriptionPlans.update(editingPlan.id, planFormData, adminToken);
                                                        } else {
                                                            await adminApi.subscriptionPlans.create(planFormData, adminToken);
                                                        }
                                                        await loadSystemData(adminToken);
                                                        setEditingPlan(null);
                                                        setPlanFormData({});
                                                        showAlert(editingPlan.id ? '更新成功' : '创建成功', editingPlan.id ? '更新成功' : '创建成功', 'success');
                                                    } catch (error: any) {
                                                        showAlert((editingPlan.id ? '更新' : '创建') + '失败: ' + (error.message || '未知错误'), (editingPlan.id ? '更新' : '创建') + '失败', 'error');
                                                    }
                                                }}
                                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                            >
                                                {editingPlan.id ? '保存' : '创建'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- EMAIL CONFIG --- */}
                    {activeSection === 'email-config' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* 邮箱验证开关 */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-lg font-bold text-slate-100 mb-4">邮箱验证设置</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-300 mb-1">注册是否需要邮箱验证码</p>
                                        <p className="text-xs text-slate-500">开启后，用户注册时必须输入有效的邮箱验证码</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={emailVerificationRequired}
                                            onChange={async (e) => {
                                                if (!adminToken) {
                                                    console.error("[AdminScreen] 没有管理员token");
                                                    return;
                                                }
                                                const newValue = e.target.checked;
                                                console.log("[AdminScreen] 切换邮箱验证状态:", {
                                                    当前值: emailVerificationRequired,
                                                    新值: newValue
                                                });
                                                
                                                // 立即更新UI状态（乐观更新）
                                                setEmailVerificationRequired(newValue);
                                                
                                                try {
                                                    const response = await adminApi.config.setEmailVerificationRequired(newValue, adminToken);
                                                    console.log("[AdminScreen] API调用成功，响应:", response);
                                                    // 确保状态与服务器响应一致
                                                    if (response && response.emailVerificationRequired !== undefined) {
                                                        setEmailVerificationRequired(response.emailVerificationRequired);
                                                    }
                                                    showAlert('邮箱验证设置已更新', '设置成功', 'success');
                                                } catch (error: any) {
                                                    console.error("[AdminScreen] 更新邮箱验证状态失败:", error);
                                                    // 回滚状态
                                                    setEmailVerificationRequired(!newValue);
                                                    showAlert('设置失败: ' + (error.message || '未知错误'), '设置失败', 'error');
                                                }
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-lg font-bold text-slate-100 mb-6">邮箱配置</h3>
                                
                                {/* 邮箱类型选择 */}
                                <div className="mb-6">
                                    <InputGroup label="邮箱类型">
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="emailType"
                                                    value="163"
                                                    checked={emailConfig.emailType === '163'}
                                                    onChange={(e) => {
                                                        setEmailConfig({
                                                            emailType: '163',
                                                            host: 'smtp.163.com',
                                                            port: '25',
                                                            username: 'tongyexin@163.com',
                                                            password: emailConfig.password,
                                                            from: 'tongyexin@163.com'
                                                        });
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-white">163邮箱</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="emailType"
                                                    value="qq"
                                                    checked={emailConfig.emailType === 'qq'}
                                                    onChange={(e) => {
                                                        setEmailConfig({
                                                            emailType: 'qq',
                                                            host: 'smtp.qq.com',
                                                            port: '587',
                                                            username: 'heartsphere@qq.com',
                                                            password: emailConfig.password,
                                                            from: 'heartsphere@qq.com'
                                                        });
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-white">QQ邮箱</span>
                                            </label>
                                        </div>
                                    </InputGroup>
                                </div>

                                {/* SMTP配置 */}
                                <div className="space-y-4">
                                    <InputGroup label="SMTP服务器">
                                        <TextInput
                                            value={emailConfig.host}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                                            placeholder={emailConfig.emailType === 'qq' ? 'smtp.qq.com' : 'smtp.163.com'}
                                        />
                                    </InputGroup>
                                    <InputGroup label="SMTP端口">
                                        <TextInput
                                            type="number"
                                            value={emailConfig.port}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, port: e.target.value })}
                                            placeholder={emailConfig.emailType === 'qq' ? '587' : '25'}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            {emailConfig.emailType === 'qq' 
                                                ? 'QQ邮箱使用587端口（推荐）或465端口（SSL）' 
                                                : '163邮箱使用25端口（推荐）或465端口（SSL）'}
                                        </p>
                                    </InputGroup>
                                    <InputGroup label="邮箱用户名">
                                        <TextInput
                                            value={emailConfig.username}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, username: e.target.value })}
                                            placeholder={emailConfig.emailType === 'qq' ? 'your-email@qq.com' : 'your-email@163.com'}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">通常是完整的邮箱地址</p>
                                    </InputGroup>
                                    <InputGroup label="邮箱密码/授权码">
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <TextInput
                                                    type="password"
                                                    value={emailConfig.password}
                                                    onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                                                    placeholder="请输入授权码"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    onClick={() => setShowAuthCodeGuide(!showAuthCodeGuide)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-sm whitespace-nowrap"
                                                >
                                                    {showAuthCodeGuide ? '隐藏' : '获取授权码'}
                                                </Button>
                                            </div>
                                            {showAuthCodeGuide && (
                                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
                                                    {emailConfig.emailType === '163' ? (
                                                        <>
                                                            <h4 className="text-sm font-bold text-white">163邮箱获取授权码步骤：</h4>
                                                            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                                                                <li>登录163邮箱网页版</li>
                                                                <li>点击右上角"设置" → 选择"POP3/SMTP/IMAP"</li>
                                                                <li>开启"POP3/SMTP服务"或"IMAP/SMTP服务"</li>
                                                                <li>点击"生成授权码"，按提示完成验证</li>
                                                                <li>复制生成的授权码（16位字符），粘贴到上方"邮箱密码/授权码"输入框</li>
                                                                <li><strong className="text-yellow-400">注意：授权码不是登录密码，需要单独生成</strong></li>
                                                            </ol>
                                                            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                                                                <p className="text-xs text-yellow-300">
                                                                    <strong>重要提示：</strong>如果25端口被防火墙阻止，可以将端口改为465（SSL加密端口）
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <h4 className="text-sm font-bold text-white">QQ邮箱获取授权码步骤：</h4>
                                                            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                                                                <li>登录QQ邮箱网页版</li>
                                                                <li>点击右上角"设置" → 选择"账户"</li>
                                                                <li>找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"</li>
                                                                <li>开启"POP3/SMTP服务"或"IMAP/SMTP服务"</li>
                                                                <li>点击"生成授权码"，按提示完成验证（可能需要手机验证）</li>
                                                                <li>复制生成的授权码（16位字符），粘贴到上方"邮箱密码/授权码"输入框</li>
                                                                <li><strong className="text-yellow-400">注意：授权码不是QQ密码，需要单独生成</strong></li>
                                                            </ol>
                                                            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                                                                <p className="text-xs text-yellow-300">
                                                                    <strong>重要提示：</strong>QQ邮箱推荐使用587端口，如果被阻止可以使用465端口（SSL）
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </InputGroup>
                                    <InputGroup label="发件人邮箱">
                                        <TextInput
                                            value={emailConfig.from}
                                            onChange={(e) => setEmailConfig({ ...emailConfig, from: e.target.value })}
                                            placeholder={emailConfig.emailType === 'qq' ? 'your-email@qq.com' : 'your-email@163.com'}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">用于发送验证码邮件的发件人地址</p>
                                    </InputGroup>
                                </div>

                                {/* 保存按钮 */}
                                <div className="flex justify-end mt-6">
                                    <Button
                                        onClick={async () => {
                                            if (!adminToken) return;
                                            setIsLoadingEmailConfig(true);
                                            try {
                                                await adminApi.config.setEmailConfig({
                                                    host: emailConfig.host,
                                                    port: emailConfig.port,
                                                    username: emailConfig.username,
                                                    password: emailConfig.password,
                                                    from: emailConfig.from
                                                }, adminToken);
                                                showAlert('邮箱配置已保存', '保存成功', 'success');
                                            } catch (error: any) {
                                                showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
                                            } finally {
                                                setIsLoadingEmailConfig(false);
                                            }
                                        }}
                                        disabled={isLoadingEmailConfig}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {isLoadingEmailConfig ? '保存中...' : '保存配置'}
                                    </Button>
                                </div>
                            </div>

                            {/* 测试邮件发送 */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-lg font-bold text-slate-100 mb-4">测试邮件发送</h3>
                                <p className="text-sm text-slate-400 mb-4">配置完成后，可以发送测试邮件验证配置是否正确</p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="输入测试邮箱地址"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:border-indigo-500 outline-none"
                                        id="test-email-input"
                                    />
                                    <Button
                                        onClick={async () => {
                                            const testEmail = (document.getElementById('test-email-input') as HTMLInputElement)?.value;
                                            if (!testEmail || !testEmail.includes('@')) {
                                                showAlert('请输入有效的邮箱地址', '输入错误', 'error');
                                                return;
                                            }
                                            if (!adminToken) return;
                                            try {
                                                await authApi.sendEmailVerificationCode(testEmail);
                                                showAlert('测试邮件已发送，请查收', '发送成功', 'success');
                                            } catch (error: any) {
                                                showAlert('发送失败: ' + (error.message || '未知错误'), '发送失败', 'error');
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        发送测试邮件
                                    </Button>
                                </div>
                            </div>

                            {/* 印象笔记配置 */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                                <h3 className="text-lg font-bold text-slate-100 mb-6">印象笔记配置</h3>
                                <p className="text-sm text-slate-400 mb-4">配置印象笔记API密钥，用于笔记同步功能</p>
                                
                                <div className="space-y-4">
                                    <InputGroup label="Consumer Key">
                                        <TextInput
                                            value={evernoteConfig.consumerKey}
                                            onChange={(e) => setEvernoteConfig({ ...evernoteConfig, consumerKey: e.target.value })}
                                            placeholder="heartsphere"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">印象笔记应用的Consumer Key</p>
                                    </InputGroup>
                                    
                                    <InputGroup label="Consumer Secret">
                                        <TextInput
                                            type="password"
                                            value={evernoteConfig.consumerSecret}
                                            onChange={(e) => setEvernoteConfig({ ...evernoteConfig, consumerSecret: e.target.value })}
                                            placeholder="输入Consumer Secret"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">印象笔记应用的Consumer Secret</p>
                                    </InputGroup>
                                    
                                    <InputGroup label="环境设置">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={evernoteConfig.sandbox}
                                                onChange={(e) => setEvernoteConfig({ ...evernoteConfig, sandbox: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-white">使用沙箱环境（开发测试用）</span>
                                        </label>
                                        <p className="text-xs text-slate-500 mt-1">开发时建议开启，生产环境请关闭</p>
                                    </InputGroup>
                                </div>

                                {/* 保存按钮 */}
                                <div className="flex justify-end mt-6">
                                    <Button
                                        onClick={async () => {
                                            if (!adminToken) return;
                                            setIsLoadingEvernoteConfig(true);
                                            try {
                                                await adminApi.config.setEvernoteConfig({
                                                    consumerKey: evernoteConfig.consumerKey,
                                                    consumerSecret: evernoteConfig.consumerSecret,
                                                    sandbox: evernoteConfig.sandbox
                                                }, adminToken);
                                                showAlert('印象笔记配置已保存', '保存成功', 'success');
                                            } catch (error: any) {
                                                showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
                                            } finally {
                                                setIsLoadingEvernoteConfig(false);
                                            }
                                        }}
                                        disabled={isLoadingEvernoteConfig}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {isLoadingEvernoteConfig ? '保存中...' : '保存配置'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex border-b border-slate-700 mb-6">
                                <button onClick={() => setSettingsTab('models')} className={`pb-3 px-4 text-sm font-bold ${settingsTab === 'models' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-white'}`}>AI 模型接入</button>
                                <button onClick={() => setSettingsTab('general')} className={`pb-3 px-4 text-sm font-bold ${settingsTab === 'general' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-white'}`}>通用与策略</button>
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
