import React, { useState, useEffect } from 'react';
import { adminApi, imageApi } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/dialog';
import { InputGroup, TextInput } from './AdminUIComponents';
import { getAllTemplatesForCategory } from '../../utils/promptTemplates';

interface ResourcesManagementProps {
    adminToken: string | null;
    onRefresh: () => void;
}

export const ResourcesManagement: React.FC<ResourcesManagementProps> = ({
    adminToken,
    onRefresh
}) => {
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
    
    // 资源匹配更新状态
    const [isMatchingResources, setIsMatchingResources] = useState(false);

    const loadResources = async (category?: string) => {
        if (!adminToken) return;
        try {
            const data = category && category !== 'all'
                ? await adminApi.resources.getAll(category, adminToken)
                : await adminApi.resources.getAll(undefined, adminToken);
            setResources(data);
        } catch (err: any) {
            console.error('加载资源失败:', err);
            setResources([]);
        }
    };

    useEffect(() => {
        if (adminToken) {
            loadResources(resourceCategory === 'all' ? undefined : resourceCategory);
        }
    }, [adminToken]);

    const handleMatchAndUpdateResources = async () => {
        if (!adminToken) {
            showAlert('请先登录', '未登录', 'warning');
            return;
        }

        const confirmed = await showConfirm(
            '确定要执行一键更新吗？\n\n这将根据资源名称自动匹配并更新所有预置场景和角色的图片。',
            '一键更新资源',
            'warning'
        );

        if (!confirmed) return;

        setIsMatchingResources(true);
        try {
            const result = await adminApi.resources.matchAndUpdate(adminToken);
            
            let message = `更新完成！\n\n`;
            message += `场景匹配: ${result.eraMatchedCount}/${result.totalEras}\n`;
            message += `角色头像匹配: ${result.characterAvatarMatchedCount}/${result.totalCharacters}\n`;
            message += `角色背景匹配: ${result.characterBackgroundMatchedCount}/${result.totalCharacters}\n\n`;

            if (result.eraMatched && result.eraMatched.length > 0) {
                message += `✓ 场景匹配成功:\n${result.eraMatched.slice(0, 5).join('\n')}`;
                if (result.eraMatched.length > 5) {
                    message += `\n... 还有 ${result.eraMatched.length - 5} 个`;
                }
                message += '\n\n';
            }

            if (result.characterAvatarMatched && result.characterAvatarMatched.length > 0) {
                message += `✓ 角色头像匹配成功:\n${result.characterAvatarMatched.slice(0, 5).join('\n')}`;
                if (result.characterAvatarMatched.length > 5) {
                    message += `\n... 还有 ${result.characterAvatarMatched.length - 5} 个`;
                }
                message += '\n\n';
            }

            if (result.characterBackgroundMatched && result.characterBackgroundMatched.length > 0) {
                message += `✓ 角色背景匹配成功:\n${result.characterBackgroundMatched.slice(0, 5).join('\n')}`;
                if (result.characterBackgroundMatched.length > 5) {
                    message += `\n... 还有 ${result.characterBackgroundMatched.length - 5} 个`;
                }
            }

            showAlert(message, '更新完成', 'success');
            await onRefresh();
        } catch (err: any) {
            showAlert('更新失败: ' + (err.message || '未知错误'), '更新失败', 'error');
        } finally {
            setIsMatchingResources(false);
        }
    };

    const handleDeleteResource = async (resourceId: number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定要删除这个资源吗？', '删除资源', 'danger');
        if (confirmed) {
            try {
                await adminApi.resources.delete(resourceId, adminToken);
                setResources(resources.filter(r => r.id !== resourceId));
            } catch (err: any) {
                showAlert('删除失败: ' + (err.message || '未知错误'), '删除失败', 'error');
            }
        }
    };

    const handleUpdateResource = async () => {
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
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* 顶部工具栏 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-100">资源管理</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleMatchAndUpdateResources}
                            disabled={isMatchingResources}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                                isMatchingResources
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                            title="根据资源名称自动匹配并更新所有预置场景和角色的图片"
                        >
                            {isMatchingResources ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    更新中...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span>🔄</span>
                                    一键更新场景和角色图片
                                </span>
                            )}
                        </button>
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
                                        onClick={handleUpdateResource}
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
                                                        await handleDeleteResource(resource.id);
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
    );
};

