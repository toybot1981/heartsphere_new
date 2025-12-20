import React, { useState, useRef } from 'react';
import { adminApi, imageApi } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/dialog';
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { Button } from '../Button';

interface CharactersManagementProps {
    systemCharacters: any[];
    systemEras: any[];
    adminToken: string | null;
    onRefresh: () => void;
}

export const CharactersManagement: React.FC<CharactersManagementProps> = ({
    systemCharacters,
    systemEras,
    adminToken,
    onRefresh
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'create'>('list');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [characterEraFilter, setCharacterEraFilter] = useState<number | 'all'>('all');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingBackground, setIsUploadingBackground] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const charAvatarInputRef = useRef<HTMLInputElement>(null);
    const charBackgroundInputRef = useRef<HTMLInputElement>(null);

    const switchToCreate = () => {
        setFormData({});
        setEditingId(null);
        setViewMode('create');
    };

    const switchToEdit = (item: any) => {
        setFormData(JSON.parse(JSON.stringify(item)));
        setEditingId(item.id);
        setViewMode('edit');
    };

    const switchToList = () => {
        setViewMode('list');
        setEditingId(null);
        setFormData({});
    };

    const saveCharacter = async () => {
        if (!adminToken) return;
        
        try {
            const systemEraId = formData.systemEraId || (formData.targetSceneId ? parseInt(formData.targetSceneId) : null);
            
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
                await adminApi.characters.update(editingId, dto, adminToken);
            } else {
                await adminApi.characters.create(dto, adminToken);
            }
            
            await onRefresh();
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
            await onRefresh();
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };

    return (
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
    );
};

