import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/Button';
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { imageApi } from '../../services/api';
import { ResourcePicker } from '../../components/ResourcePicker';
import { aiService } from '../../services/ai';
import { AppSettings } from '../../types';
import { storageService } from '../../services/storage';
import { showConfirm, showAlert } from '../../utils/dialog';
import { constructCharacterAvatarPrompt, constructCharacterBackgroundPrompt } from '../../utils/promptConstructors';

interface MainStory {
    id: number;
    systemEraId: number;
    systemEraName?: string;
    name: string;
    age?: number;
    role?: string;
    bio?: string;
    avatarUrl?: string;
    backgroundUrl?: string;
    themeColor?: string;
    colorAccent?: string;
    firstMessage?: string;
    voiceName?: string;
    tags?: string;
    speechStyle?: string;
    catchphrases?: string;
    secrets?: string;
    motivations?: string;
    isActive?: boolean;
    sortOrder?: number;
}

interface MainStoriesManagementProps {
    mainStories: MainStory[];
    eras: Array<{ id: number; name: string; description?: string }>;
    characters: Array<{ id: number; name: string; role: string; bio: string; systemEraId: number | null }>;
    adminToken: string | null;
    onSave: (data: any, editingId: number | null) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onReload: () => Promise<void>;
}

export const MainStoriesManagement: React.FC<MainStoriesManagementProps> = ({ 
    mainStories, eras, characters, adminToken, onSave, onDelete, onReload 
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'create'>('list');
    const [formData, setFormData] = useState<any>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingBackground, setIsUploadingBackground] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [showAvatarResourcePicker, setShowAvatarResourcePicker] = useState(false);
    const [showBackgroundResourcePicker, setShowBackgroundResourcePicker] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
    const [generateError, setGenerateError] = useState('');
    const [optionalPrompt, setOptionalPrompt] = useState('');

    // 初始化 aiService 配置
    useEffect(() => {
        const loadSettings = async () => {
            try {
                // 首先尝试从 IndexedDB 加载（主应用使用的存储方式）
                const loadedState = await storageService.loadState();
                if (loadedState && loadedState.settings) {
                    console.log('[MainStoriesManagement] 从 IndexedDB 加载配置:', {
                        textProvider: loadedState.settings.textProvider,
                        enableFallback: loadedState.settings.enableFallback,
                        qwenHasKey: !!(loadedState.settings.qwenConfig?.apiKey?.trim()),
                        qwenKeyLength: loadedState.settings.qwenConfig?.apiKey?.length || 0
                    });
                    aiService.updateConfigFromAppSettings(loadedState.settings);
                    return;
                }
                
                // 如果 IndexedDB 没有，尝试从 localStorage 加载（兼容旧版本）
                const savedState = localStorage.getItem('heartsphere_game_state');
                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    if (parsed.settings) {
                        console.log('[MainStoriesManagement] 从 localStorage 加载配置');
                        aiService.updateConfigFromAppSettings(parsed.settings);
                        return;
                    }
                }
                
                // 使用默认配置
                console.warn('[MainStoriesManagement] 使用默认配置（未找到保存的配置）');
                const defaultSettings: AppSettings = {
                    autoGenerateAvatars: false,
                    autoGenerateStoryScenes: false,
                    autoGenerateJournalImages: false,
                    debugMode: false,
                    textProvider: 'gemini',
                    imageProvider: 'gemini',
                    videoProvider: 'gemini',
                    audioProvider: 'gemini',
                    enableFallback: true,
                    geminiConfig: { apiKey: '', modelName: 'gemini-2.5-flash', imageModel: 'gemini-2.5-flash-image', videoModel: 'veo-3.1-fast-generate-preview' },
                    openaiConfig: { apiKey: '', baseUrl: 'https://api.openai.com/v1', modelName: 'gpt-4o', imageModel: 'dall-e-3' },
                    qwenConfig: { apiKey: '', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', modelName: 'qwen-max', imageModel: 'qwen-image-plus', videoModel: 'wanx-video' },
                    doubaoConfig: { apiKey: '', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', modelName: 'ep-...', imageModel: 'doubao-image-v1', videoModel: 'doubao-video-v1' }
                };
                aiService.updateConfigFromAppSettings(defaultSettings);
            } catch (e) {
                console.error('[MainStoriesManagement] 初始化 aiService 配置失败:', e);
            }
        };
        
        loadSettings();
    }, []);

    const switchToCreate = () => {
        setFormData({ role: '叙事者' });
        setEditingId(null);
        setViewMode('create');
    };

    const switchToEdit = (story: MainStory) => {
        setFormData(JSON.parse(JSON.stringify(story)));
        setEditingId(story.id);
        setViewMode('edit');
    };

    const switchToList = () => {
        setViewMode('list');
        setEditingId(null);
        setFormData({});
    };

    const handleSave = async () => {
        await onSave(formData, editingId);
        await onReload();
        switchToList();
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('确定要删除这个主线剧情吗？', '删除主线剧情', 'danger');
        if (!confirmed) return;
        await onDelete(id);
        await onReload();
    };

    const handleGenerate = async () => {
        if (!formData.systemEraId) {
            setGenerateError('请先选择场景');
            return;
        }

        const selectedEra = eras.find(e => e.id === formData.systemEraId);
        if (!selectedEra) {
            setGenerateError('未找到所选场景');
            return;
        }

        // 获取该场景的预设角色
        const eraCharacters = characters.filter(c => c.systemEraId === formData.systemEraId);
        
        if (eraCharacters.length === 0) {
            setGenerateError('该场景没有预设角色，无法生成主线剧情');
            return;
        }

        setIsGenerating(true);
        setGenerateError('');

        try {
            const characterInfo = eraCharacters.map(c => ({
                name: c.name,
                role: c.role || '角色',
                bio: c.bio || ''
            }));

            const generated = await aiService.generateMainStory(
                selectedEra.name,
                selectedEra.description || '',
                characterInfo,
                optionalPrompt || undefined
            );

            if (generated) {
                setFormData({
                    ...formData,
                    name: generated.name,
                    role: generated.role,
                    bio: generated.bio,
                    firstMessage: generated.firstMessage,
                    themeColor: generated.themeColor,
                    colorAccent: generated.colorAccent,
                    age: generated.age,
                    voiceName: generated.voiceName,
                    tags: generated.tags,
                    speechStyle: generated.speechStyle,
                    motivations: generated.motivations
                });
            }
        } catch (err: any) {
            console.error('生成主线剧情失败:', err);
            const errorMsg = err.message || '未知错误';
            if (errorMsg.includes('所有 AI 模型都失败了')) {
                setGenerateError('所有 AI 模型都失败了，请检查设置中的 API Key 配置');
            } else {
                setGenerateError('生成失败: ' + errorMsg);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
        const file = e.target.files?.[0];
        if (!file || !adminToken) return;
        
        if (type === 'avatar') {
            setIsUploadingAvatar(true);
        } else {
            setIsUploadingBackground(true);
        }
        setUploadError('');
        
        try {
            const result = await imageApi.uploadImage(file, 'character', adminToken);
            if (result.success && result.url) {
                if (type === 'avatar') {
                    setFormData({...formData, avatarUrl: result.url});
                } else {
                    setFormData({...formData, backgroundUrl: result.url});
                }
            } else {
                throw new Error(result.error || '上传失败');
            }
        } catch (err: any) {
            setUploadError('图片上传失败: ' + (err.message || '未知错误'));
        } finally {
            if (type === 'avatar') {
                setIsUploadingAvatar(false);
            } else {
                setIsUploadingBackground(false);
            }
        }
    };

    const handleGenerateAvatar = async () => {
        if (!formData.name || !formData.role || !formData.bio) {
            setUploadError('请先填写剧情名称、角色定位和简介');
            return;
        }

        setIsGeneratingAvatar(true);
        setUploadError('');

        try {
            // 构建提示词（后台管理没有worldStyle，使用默认风格）
            const prompt = constructCharacterAvatarPrompt(
                formData.name,
                formData.role || '叙事者',
                formData.bio,
                formData.themeColor || 'indigo-500'
            );
            
            // 调用AI生成图片（3:4比例，适合头像）
            const response = await aiService.generateImage({
                prompt: prompt,
                aspectRatio: '3:4',
                width: 1024,
                height: 1366,
                numberOfImages: 1
            });

            if (response.images && response.images.length > 0) {
                const generatedImage = response.images[0];
                let imageDataUrl = '';

                // 处理返回的图片
                if (generatedImage.base64) {
                    imageDataUrl = `data:image/png;base64,${generatedImage.base64}`;
                } else if (generatedImage.url) {
                    try {
                        const proxyResult = await imageApi.proxyDownload(generatedImage.url);
                        if (proxyResult.success && proxyResult.dataUrl) {
                            imageDataUrl = proxyResult.dataUrl;
                        } else {
                            imageDataUrl = generatedImage.url;
                        }
                    } catch (e) {
                        imageDataUrl = generatedImage.url;
                    }
                }

                if (imageDataUrl) {
                    // 自动上传到服务器
                    setIsUploadingAvatar(true);
                    try {
                        const uploadResult = await imageApi.uploadBase64Image(imageDataUrl, 'character', adminToken || undefined);
                        
                        if (uploadResult.success && uploadResult.url) {
                            setFormData({...formData, avatarUrl: uploadResult.url});
                            showAlert('头像生成并上传成功！', '成功', 'success');
                        } else {
                            throw new Error(uploadResult.error || '上传失败');
                        }
                    } catch (uploadErr: any) {
                        console.error('上传生成的头像失败:', uploadErr);
                        setUploadError('头像生成成功，但上传失败: ' + (uploadErr.message || '未知错误'));
                    } finally {
                        setIsUploadingAvatar(false);
                    }
                } else {
                    throw new Error('生成的图片数据无效');
                }
            } else {
                throw new Error('未生成图片');
            }
        } catch (err: any) {
            console.error('AI生成头像失败:', err);
            const errorMsg = err.message || '未知错误';
            if (errorMsg.includes('API key') || errorMsg.includes('配置')) {
                setUploadError('AI生成失败：请检查设置中的图片生成API Key配置');
            } else {
                setUploadError('AI生成头像失败: ' + errorMsg);
            }
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleGenerateBackground = async () => {
        if (!formData.name || !formData.bio) {
            setUploadError('请先填写剧情名称和简介');
            return;
        }

        // 获取场景名称（从eras中查找）
        const selectedEra = eras.find(e => e.id === formData.systemEraId);
        const eraName = selectedEra?.name || '场景';

        setIsGeneratingBackground(true);
        setUploadError('');

        try {
            // 构建提示词
            const prompt = constructCharacterBackgroundPrompt(
                formData.name,
                formData.bio,
                eraName
            );
            
            // 调用AI生成图片（16:9比例，适合背景）
            const response = await aiService.generateImage({
                prompt: prompt,
                aspectRatio: '16:9',
                width: 1920,
                height: 1080,
                numberOfImages: 1
            });

            if (response.images && response.images.length > 0) {
                const generatedImage = response.images[0];
                let imageDataUrl = '';

                // 处理返回的图片
                if (generatedImage.base64) {
                    imageDataUrl = `data:image/png;base64,${generatedImage.base64}`;
                } else if (generatedImage.url) {
                    try {
                        const proxyResult = await imageApi.proxyDownload(generatedImage.url);
                        if (proxyResult.success && proxyResult.dataUrl) {
                            imageDataUrl = proxyResult.dataUrl;
                        } else {
                            imageDataUrl = generatedImage.url;
                        }
                    } catch (e) {
                        imageDataUrl = generatedImage.url;
                    }
                }

                if (imageDataUrl) {
                    // 自动上传到服务器
                    setIsUploadingBackground(true);
                    try {
                        const uploadResult = await imageApi.uploadBase64Image(imageDataUrl, 'character', adminToken || undefined);
                        
                        if (uploadResult.success && uploadResult.url) {
                            setFormData({...formData, backgroundUrl: uploadResult.url});
                            showAlert('背景图生成并上传成功！', '成功', 'success');
                        } else {
                            throw new Error(uploadResult.error || '上传失败');
                        }
                    } catch (uploadErr: any) {
                        console.error('上传生成的背景图失败:', uploadErr);
                        setUploadError('背景图生成成功，但上传失败: ' + (uploadErr.message || '未知错误'));
                    } finally {
                        setIsUploadingBackground(false);
                    }
                } else {
                    throw new Error('生成的图片数据无效');
                }
            } else {
                throw new Error('未生成图片');
            }
        } catch (err: any) {
            console.error('AI生成背景图失败:', err);
            const errorMsg = err.message || '未知错误';
            if (errorMsg.includes('API key') || errorMsg.includes('配置')) {
                setUploadError('AI生成失败：请检查设置中的图片生成API Key配置');
            } else {
                setUploadError('AI生成背景图失败: ' + errorMsg);
            }
        } finally {
            setIsGeneratingBackground(false);
        }
    };

    if (viewMode === 'list') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-slate-400 text-sm">管理各场景的主线剧情。每个场景只能有一个主线剧情。</p>
                    <Button onClick={switchToCreate} className="bg-indigo-600 hover:bg-indigo-500 text-sm">+ 新增主线剧情</Button>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">场景</th>
                                <th className="p-4">剧情名称</th>
                                <th className="p-4">角色定位</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {mainStories.map(story => (
                                <tr key={story.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-bold text-white">
                                        {story.systemEraName || `场景ID: ${story.systemEraId}`}
                                    </td>
                                    <td className="p-4 font-bold text-white">{story.name}</td>
                                    <td className="p-4 text-sm text-slate-400">{story.role || '叙事者'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => switchToEdit(story)} className="text-indigo-400 hover:text-white text-sm font-medium">
                                            编辑
                                        </button>
                                        <button onClick={() => handleDelete(story.id)} className="text-red-400 hover:text-white text-sm font-medium">删除</button>
                                    </td>
                                </tr>
                            ))}
                            {mainStories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                                        暂无主线剧情，点击右上角创建
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6">{viewMode === 'create' ? '新建主线剧情' : '编辑主线剧情'}</h3>
            
            <div className="space-y-6">
                {viewMode === 'create' && (
                    <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-indigo-300">✨ AI 智能生成</h4>
                            <Button 
                                onClick={handleGenerate} 
                                disabled={isGenerating || !formData.systemEraId}
                                className="bg-indigo-600 hover:bg-indigo-500 text-sm disabled:opacity-50"
                            >
                                {isGenerating ? '生成中...' : '🤖 AI 生成主线剧情'}
                            </Button>
                        </div>
                        <p className="text-xs text-indigo-400/80 mb-2">
                            选择场景后，AI 将根据场景信息和预设角色自动生成主线剧情序章（开场白）。如果 Gemini 不可用，将自动切换到其他可用的大模型。
                        </p>
                        {formData.systemEraId && (
                            <>
                                <div className="mt-2">
                                    <TextArea
                                        value={optionalPrompt}
                                        onChange={e => setOptionalPrompt(e.target.value)}
                                        placeholder="（可选）额外要求，例如：希望故事风格是悬疑类型，或者希望包含某个特定情节..."
                                        rows={2}
                                        className="text-xs"
                                    />
                                </div>
                                <div className="mt-2 text-xs text-slate-400">
                                    该场景有 {characters.filter(c => c.systemEraId === formData.systemEraId).length} 个预设角色
                                </div>
                            </>
                        )}
                        {generateError && (
                            <p className="text-xs text-red-400 mt-2">{generateError}</p>
                        )}
                    </div>
                )}

                <InputGroup label="所属场景 *">
                    <select 
                        value={formData.systemEraId || ''} 
                        onChange={e => {
                            setFormData({...formData, systemEraId: parseInt(e.target.value)});
                            setOptionalPrompt('');
                            setGenerateError('');
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                        disabled={viewMode === 'edit'}
                    >
                        <option value="">选择场景</option>
                        {eras.map(era => (
                            <option key={era.id} value={era.id}>{era.name}</option>
                        ))}
                    </select>
                </InputGroup>

                <InputGroup label="剧情名称 *">
                    <TextInput value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="叙事者年龄">
                        <TextInput 
                            type="number"
                            value={formData.age || ''} 
                            onChange={e => setFormData({...formData, age: e.target.value ? parseInt(e.target.value) : null})} 
                        />
                    </InputGroup>
                    <InputGroup label="角色定位">
                        <TextInput value={formData.role || '叙事者'} onChange={e => setFormData({...formData, role: e.target.value})} />
                    </InputGroup>
                </div>

                <InputGroup label="剧情简介">
                    <TextArea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} />
                </InputGroup>

                <InputGroup label="开场白（第一句问候）*">
                    <TextArea 
                        value={formData.firstMessage || ''} 
                        onChange={e => setFormData({...formData, firstMessage: e.target.value})} 
                        rows={6}
                        placeholder="例如：【序幕：雨夜逃亡】&#10;&#10;冰冷的酸雨混合着霓虹灯的倒影..."
                    />
                </InputGroup>


                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="叙事者头像">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <TextInput 
                                    value={formData.avatarUrl || ''} 
                                    onChange={e => setFormData({...formData, avatarUrl: e.target.value})} 
                                    placeholder="头像URL或点击上传"
                                />
                                <button 
                                    onClick={handleGenerateAvatar}
                                    disabled={!formData.name || !formData.role || !formData.bio || isGeneratingAvatar || isUploadingAvatar}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm rounded disabled:opacity-50"
                                >
                                    {isGeneratingAvatar ? '生成中...' : '🤖 AI生成'}
                                </button>
                                <button 
                                    onClick={() => avatarInputRef.current?.click()} 
                                    disabled={isUploadingAvatar || isGeneratingAvatar}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded disabled:opacity-50"
                                >
                                    {isUploadingAvatar ? '上传中...' : '上传'}
                                </button>
                                <button 
                                    onClick={() => setShowAvatarResourcePicker(true)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded"
                                >
                                    选择资源
                                </button>
                            </div>
                            <input 
                                type="file" 
                                ref={avatarInputRef} 
                                onChange={(e) => handleImageUpload(e, 'avatar')}
                                accept="image/*" 
                                className="hidden" 
                            />
                            {formData.avatarUrl && (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-600">
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setFormData({...formData, avatarUrl: ''})} 
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    </InputGroup>

                    <InputGroup label="背景图">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <TextInput 
                                    value={formData.backgroundUrl || ''} 
                                    onChange={e => setFormData({...formData, backgroundUrl: e.target.value})} 
                                    placeholder="背景图URL或点击上传"
                                />
                                <button 
                                    onClick={handleGenerateBackground}
                                    disabled={!formData.name || !formData.bio || isGeneratingBackground || isUploadingBackground}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm rounded disabled:opacity-50"
                                >
                                    {isGeneratingBackground ? '生成中...' : '🤖 AI生成'}
                                </button>
                                <button 
                                    onClick={() => backgroundInputRef.current?.click()} 
                                    disabled={isUploadingBackground || isGeneratingBackground}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded disabled:opacity-50"
                                >
                                    {isUploadingBackground ? '上传中...' : '上传'}
                                </button>
                                <button 
                                    onClick={() => setShowBackgroundResourcePicker(true)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded"
                                >
                                    选择资源
                                </button>
                            </div>
                            <input 
                                type="file" 
                                ref={backgroundInputRef} 
                                onChange={(e) => handleImageUpload(e, 'background')}
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="主题色">
                        <TextInput value={formData.themeColor || ''} onChange={e => setFormData({...formData, themeColor: e.target.value})} placeholder="例如: indigo-500" />
                    </InputGroup>
                    <InputGroup label="强调色">
                        <TextInput value={formData.colorAccent || ''} onChange={e => setFormData({...formData, colorAccent: e.target.value})} placeholder="例如: #6366f1" />
                    </InputGroup>
                </div>

                <InputGroup label="语音名称">
                    <TextInput value={formData.voiceName || ''} onChange={e => setFormData({...formData, voiceName: e.target.value})} placeholder="例如: Charon" />
                </InputGroup>

                <InputGroup label="标签（逗号分隔）">
                    <TextInput value={formData.tags || ''} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="例如: Narrator,Story" />
                </InputGroup>

                <InputGroup label="语言风格">
                    <TextArea value={formData.speechStyle || ''} onChange={e => setFormData({...formData, speechStyle: e.target.value})} rows={2} />
                </InputGroup>

                <InputGroup label="动机">
                    <TextArea value={formData.motivations || ''} onChange={e => setFormData({...formData, motivations: e.target.value})} rows={2} />
                </InputGroup>

                {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

                {showAvatarResourcePicker && adminToken && (
                    <ResourcePicker
                        category="character"
                        onSelect={(url) => {
                            setFormData({...formData, avatarUrl: url});
                            setShowAvatarResourcePicker(false);
                        }}
                        onClose={() => setShowAvatarResourcePicker(false)}
                        currentUrl={formData.avatarUrl}
                        token={adminToken}
                        useAdminApi={true}
                    />
                )}

                {showBackgroundResourcePicker && adminToken && (
                    <ResourcePicker
                        category="background"
                        onSelect={(url) => {
                            setFormData({...formData, backgroundUrl: url});
                            setShowBackgroundResourcePicker(false);
                        }}
                        onClose={() => setShowBackgroundResourcePicker(false)}
                        currentUrl={formData.backgroundUrl}
                        token={adminToken}
                        useAdminApi={true}
                    />
                )}

                <div className="flex justify-end gap-3 mt-8">
                    <Button variant="ghost" onClick={switchToList}>取消</Button>
                    <Button onClick={handleSave} className="bg-indigo-600" disabled={!formData.name || !formData.systemEraId || !formData.firstMessage}>
                        保存主线剧情
                    </Button>
                </div>
            </div>
        </div>
    );
};

