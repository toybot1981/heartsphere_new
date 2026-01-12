import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../components/Button";
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { imageApi } from '../services/api';
import { ResourcePicker } from '../components/ResourcePicker';
import { showConfirm, showAlert } from "../utils/dialog";
import { aiService } from '../services/ai';
import { constructEraCoverPrompt } from '../utils/promptConstructors';
import { storageService } from '../services/storage';

// AppSettings 类型定义（简化版）
interface AppSettings {
  aiModel?: string;
  aiProvider?: string;
  imageModel?: string;
  worldStyle?: string;
  [key: string]: any;
}

interface Era {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    [key: string]: any;
}

interface ErasManagementProps {
    eras: Era[];
    adminToken: string | null;
    onSave: (data: any, editingId: number | null) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onReload: () => Promise<void>;
}

export const ErasManagement: React.FC<ErasManagementProps> = ({ eras, adminToken, onSave, onDelete, onReload }) => {
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'create'>('list');
    const [formData, setFormData] = useState<any>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [showResourcePicker, setShowResourcePicker] = useState(false);
    const eraImageInputRef = useRef<HTMLInputElement>(null);

    // 初始化 aiService 配置
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const loadedState = await storageService.loadState();
                if (loadedState && loadedState.settings) {
                    aiService.updateConfigFromAppSettings(loadedState.settings);
                    return;
                }
                
                const savedState = localStorage.getItem('heartsphere_game_state');
                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    if (parsed.settings) {
                        aiService.updateConfigFromAppSettings(parsed.settings);
                        return;
                    }
                }
                
                const defaultSettings: AppSettings = {
                    autoGenerateAvatars: false,
                    autoGenerateStoryScenes: false,
                    autoGenerateJournalImages: true,
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
                console.error('[ErasManagement] 初始化 aiService 配置失败:', e);
            }
        };
        
        loadSettings();
    }, []);

    const switchToCreate = () => {
        setFormData({});
        setEditingId(null);
        setViewMode('create');
    };

    const switchToEdit = (era: Era) => {
        setFormData(JSON.parse(JSON.stringify(era)));
        setEditingId(era.id);
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
        const confirmed = await showConfirm('确定要删除这个系统场景吗？', '删除场景', 'danger');
        if (!confirmed) return;
        await onDelete(id);
        await onReload();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !adminToken) return;
        
        setIsUploadingImage(true);
        setUploadError('');
        
        try {
            const result = await imageApi.uploadImage(file, 'era', adminToken);
            if (result.success && result.url) {
                setFormData({...formData, imageUrl: result.url});
            } else {
                throw new Error(result.error || '上传失败');
            }
        } catch (err: any) {
            setUploadError('图片上传失败: ' + (err.message || '未知错误'));
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSelectPresetResource = (url: string) => {
        setFormData({...formData, imageUrl: url});
        setUploadError('');
    };

    const handleGenerateImage = async () => {
        if (!formData.name || !formData.description) {
            setUploadError('请先填写场景名称和简介。');
            return;
        }

        setIsGeneratingImage(true);
        setUploadError('');

        try {
            // 构建提示词（后台管理没有worldStyle，使用默认风格）
            const prompt = constructEraCoverPrompt(formData.name, formData.description);
            
            // 调用AI生成图片（3:4比例，适合场景封面）
            // aiService.generateImage 返回 { url: string }
            const response = await aiService.generateImage({
                prompt: prompt,
                size: '1024x1366',  // 3:4 比例 (1024x1366 ≈ 3:4)
                quality: 'standard',
                token: adminToken || undefined
            });

            if (response && response.url) {
                // 直接使用返回的URL作为封面图片
                setFormData({...formData, imageUrl: response.url});
                showAlert('图片生成成功！', '成功', 'success');
            } else {
                throw new Error('未获取到图片URL');
            }
        } catch (err: any) {
            console.error('AI生成图片失败:', err);
            const errorMsg = err.message || '未知错误';
            if (errorMsg.includes('API key') || errorMsg.includes('配置')) {
                setUploadError('AI生成失败：请检查设置中的图片生成API Key配置');
            } else {
                setUploadError('AI生成图片失败: ' + errorMsg);
            }
        } finally {
            setIsGeneratingImage(false);
        }
    };

    if (viewMode === 'list') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-slate-400 text-sm">管理世界观和场景。编辑内置场景会自动创建自定义副本。</p>
                    <Button onClick={switchToCreate} className="bg-indigo-600 hover:bg-indigo-500 text-sm">+ 新增场景</Button>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">预览</th>
                                <th className="p-4">名称</th>
                                <th className="p-4">简介</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {eras.map(era => (
                                <tr key={era.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        {era.imageUrl ? (
                                            <img src={era.imageUrl} className="w-12 h-16 object-cover rounded" alt="" />
                                        ) : (
                                            <div className="w-12 h-16 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded flex items-center justify-center text-xs opacity-50">无图</div>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-white">
                                        {era.name}
                                        <span className="ml-2 text-[10px] bg-indigo-800 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700">SYSTEM</span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400 max-w-xs truncate">{era.description || ''}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => switchToEdit(era)} className="text-indigo-400 hover:text-white text-sm font-medium">
                                            编辑
                                        </button>
                                        <button onClick={() => handleDelete(era.id)} className="text-red-400 hover:text-white text-sm font-medium">删除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6">{viewMode === 'create' ? '新建场景' : '编辑场景'}</h3>
            <InputGroup label="场景名称">
                <TextInput value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            </InputGroup>
            <InputGroup label="背景简介">
                <TextArea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} />
            </InputGroup>
            <InputGroup label="封面图片">
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <TextInput 
                            value={formData.imageUrl || ''} 
                            onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                            placeholder="图片URL或点击上传"
                        />
                        <button 
                            onClick={() => eraImageInputRef.current?.click()} 
                            disabled={isUploadingImage || isGeneratingImage}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded disabled:opacity-50"
                        >
                            {isUploadingImage ? '上传中...' : '上传'}
                        </button>
                        <button 
                            onClick={handleGenerateImage}
                            disabled={!formData.name || !formData.description || isGeneratingImage || isUploadingImage}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm rounded disabled:opacity-50"
                        >
                            {isGeneratingImage ? '生成中...' : '🤖 AI生成'}
                        </button>
                        <button 
                            onClick={() => setShowResourcePicker(true)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded"
                        >
                            选择预置资源
                        </button>
                    </div>
                    <input 
                        type="file" 
                        ref={eraImageInputRef} 
                        onChange={handleImageUpload}
                        accept="image/*" 
                        className="hidden" 
                    />
                    {formData.imageUrl && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => setFormData({...formData, imageUrl: ''})} 
                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
                </div>
            </InputGroup>
            {showResourcePicker && adminToken && (
                <ResourcePicker
                    category="era"
                    onSelect={handleSelectPresetResource}
                    onClose={() => setShowResourcePicker(false)}
                    currentUrl={formData.imageUrl}
                    token={adminToken}
                    useAdminApi={true}
                />
            )}
            <div className="flex justify-end gap-3 mt-8">
                <Button variant="ghost" onClick={switchToList}>取消</Button>
                <Button onClick={handleSave} className="bg-indigo-600">保存场景</Button>
            </div>
        </div>
    );
};



