import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageApi } from '../../services/api';
import { InputGroup, TextInput } from './AdminUIComponents';
import { useAdminState } from '../contexts/AdminStateContext';
import { showAlert } from '../../utils/dialog';
import { LazyImage } from '../../components/LazyImage';
import { getApiBaseUrl } from '../../services/api/config';
import { logger } from '../../utils/logger';

// 将相对路径转换为完整URL
const getFullImageUrl = (url: string | null | undefined, resourceName?: string): string => {
  if (!url) {
    logger.debug('[ResourcesManagement] getFullImageUrl: URL为空，使用占位符', { resourceName });
    return 'https://via.placeholder.com/300';
  }
  
  // 处理以 :8081 开头的错误URL格式
  if (url.startsWith(':8081') || url.startsWith('://:8081')) {
    console.warn('[ResourcesManagement] 检测到错误的URL格式（缺少协议）', { resourceName, originalUrl: url });
    url = url.replace(/^:?\/?\/?:8081/, ''); // 移除错误的 :8081 前缀
  }
  
  // 如果已经是完整URL（包含 http:// 或 https://），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    logger.debug('[ResourcesManagement] getFullImageUrl: 完整URL', { 
      resourceName, 
      originalUrl: url,
      finalUrl: url 
    });
    return url;
  }
  
  // 如果是相对路径，拼接基础URL
  let baseUrl = getApiBaseUrl();
  console.log('[ResourcesManagement] getFullImageUrl: getApiBaseUrl() 返回', { baseUrl, resourceName });
  
  if (!baseUrl && typeof window !== 'undefined') {
    // 从当前页面URL推断API基础URL
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    console.log('[ResourcesManagement] getFullImageUrl: 从 window.location 推断', { 
      protocol, 
      hostname, 
      port, 
      location: window.location.href 
    });
    
    // 如果端口是3000（前端开发端口），API通常在8081
    if (port === '3000' || !port) {
      baseUrl = `${protocol}//${hostname}:8081`;
    } else {
      baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    }
  }
  
  // 确保 baseUrl 有协议
  if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    console.warn('[ResourcesManagement] getFullImageUrl: baseUrl 缺少协议，添加 http://', { baseUrl, resourceName });
    baseUrl = `http://${baseUrl}`;
  }
  
  if (!baseUrl) {
    baseUrl = 'http://localhost:8081';
  }
  
  // 确保路径以 / 开头
  const path = url.startsWith('/') ? url : `/${url}`;
  const finalUrl = `${baseUrl}${path}`;
  
  // 验证最终URL格式
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    console.error('[ResourcesManagement] getFullImageUrl: 最终URL缺少协议！', { 
      resourceName,
      originalUrl: url,
      baseUrl,
      path,
      finalUrl 
    });
    // 修复：添加协议
    return `http://${finalUrl}`;
  }
  
  logger.debug('[ResourcesManagement] getFullImageUrl: 相对路径转换', { 
    resourceName,
    originalUrl: url,
    baseUrl,
    path,
    finalUrl 
  });
  
  return finalUrl;
};

interface ResourcesManagementProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const ResourcesManagement: React.FC<ResourcesManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const { resourceCategory, setResourceCategory } = useAdminState();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingResource, setEditingResource] = useState<any | null>(null);
    const [newResourceName, setNewResourceName] = useState('');
    const [newResourceDescription, setNewResourceDescription] = useState('');
    const [newResourcePrompt, setNewResourcePrompt] = useState('');
    const [newResourceTags, setNewResourceTags] = useState('');
    const [editResourceName, setEditResourceName] = useState('');
    const [editResourceDescription, setEditResourceDescription] = useState('');
    const [editResourcePrompt, setEditResourcePrompt] = useState('');
    const [editResourceTags, setEditResourceTags] = useState('');
    const [editResourceUrl, setEditResourceUrl] = useState('');
    const [isMatchingResources, setIsMatchingResources] = useState(false);
    const listContainerRef = useRef<HTMLDivElement>(null);

    const loadResources = async (category?: string) => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const data = await adminApi.resources.getAll(adminToken, category);
            setResources(data);
        } catch (error: any) {
            showAlert('加载资源失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminToken) {
            loadResources(resourceCategory === 'all' ? undefined : resourceCategory);
        }
    }, [adminToken]);

    const handleCategoryChange = async (category: string) => {
        setResourceCategory(category);
        await loadResources(category === 'all' ? undefined : category);
    };

    const handleEdit = (resource: any) => {
        // 打印资源卡片的图片地址信息
        const cardImageUrl = getFullImageUrl(resource.url, resource.name);
        console.log('========== 点击编辑资源 ==========');
        console.log('资源名称:', resource.name);
        console.log('资源ID:', resource.id);
        console.log('卡片原始URL (resource.url):', resource.url);
        console.log('卡片转换后URL (用于显示):', cardImageUrl);
        console.log('编辑框中设置的URL (editResourceUrl):', resource.url || '');
        console.log('====================================');
        
        setEditingResource(resource);
        setEditResourceName(resource.name || '');
        setEditResourceDescription(resource.description || '');
        setEditResourcePrompt(resource.prompt || '');
        setEditResourceTags(resource.tags || '');
        setEditResourceUrl(resource.url || '');
    };

    const handleCancelEdit = () => {
        setEditingResource(null);
        setEditResourceName('');
        setEditResourceDescription('');
        setEditResourcePrompt('');
        setEditResourceTags('');
        setEditResourceUrl('');
    };

    const handleSaveEdit = async () => {
        if (!adminToken || !editingResource) return;
        
        // 保存当前滚动位置（列表容器和窗口滚动位置）
        const listScrollPosition = listContainerRef.current?.scrollTop || 0;
        const windowScrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
        
        try {
            const updatedResource = await adminApi.resources.update(
                editingResource.id,
                {
                    name: editResourceName,
                    description: editResourceDescription,
                    prompt: editResourcePrompt,
                    tags: editResourceTags,
                    url: editResourceUrl,
                },
                adminToken
            );
            
            // 局部更新：只更新列表中对应的资源项，不重新加载整个列表
            setResources(prevResources => 
                prevResources.map(resource => 
                    resource.id === editingResource.id 
                        ? { ...resource, ...updatedResource }
                        : resource
                )
            );
            
            handleCancelEdit();
            // 保存成功后，右侧列表会更新显示新的图片，无需提示框
            
            // 恢复滚动位置（使用 requestAnimationFrame 确保 DOM 更新完成）
            requestAnimationFrame(() => {
                if (listContainerRef.current) {
                    listContainerRef.current.scrollTop = listScrollPosition;
                }
                window.scrollTo(0, windowScrollPosition);
            });
        } catch (error: any) {
            showAlert('更新失败: ' + (error.message || '未知错误'), '更新失败', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!adminToken) return;
        if (!confirm('确定要删除这个资源吗？')) return;
        try {
            await adminApi.resources.delete(id, adminToken);
            await loadResources(resourceCategory === 'all' ? undefined : resourceCategory);
            showAlert('删除成功', '成功', 'success');
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };

    const handleUpload = async (file: File) => {
        if (!adminToken || !resourceCategory || resourceCategory === 'all') {
            showAlert('请先选择分类', '缺少参数', 'warning');
            return;
        }
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
            await loadResources(resourceCategory);
            showAlert('资源上传成功', '上传成功', 'success');
        } catch (error: any) {
            showAlert('上传失败: ' + (error.message || '未知错误'), '上传失败', 'error');
        }
    };

    const handleMatchAndUpdateResources = async () => {
        if (!adminToken) return;
        setIsMatchingResources(true);
        try {
            const result = await adminApi.resources.matchAndUpdate(adminToken);
            
            // 构建结果消息
            let message = `资源匹配和更新完成！\n\n`;
            message += `场景匹配: ${result.eraMatchedCount}/${result.totalEras}\n`;
            message += `角色头像匹配: ${result.characterAvatarMatchedCount}/${result.totalCharacters}\n`;
            message += `角色背景匹配: ${result.characterBackgroundMatchedCount}/${result.totalCharacters}\n\n`;
            
            if (result.eraMatched.length > 0) {
                message += `已更新场景:\n${result.eraMatched.slice(0, 5).join('\n')}`;
                if (result.eraMatched.length > 5) {
                    message += `\n... 还有 ${result.eraMatched.length - 5} 个场景已更新`;
                }
                message += '\n\n';
            }
            
            if (result.characterMatched.length > 0) {
                message += `已更新角色头像:\n${result.characterMatched.slice(0, 5).join('\n')}`;
                if (result.characterMatched.length > 5) {
                    message += `\n... 还有 ${result.characterMatched.length - 5} 个角色已更新`;
                }
                message += '\n\n';
            }
            
            if (result.eraNotFound.length > 0 || result.characterNotFound.length > 0) {
                message += `未找到匹配的资源:\n`;
                if (result.eraNotFound.length > 0) {
                    message += `场景: ${result.eraNotFound.length} 个\n`;
                }
                if (result.characterNotFound.length > 0) {
                    message += `角色: ${result.characterNotFound.length} 个\n`;
                }
            }
            
            showAlert(message, '更新完成', 'success');
        } catch (error: any) {
            showAlert('更新失败: ' + (error.message || '未知错误'), '更新失败', 'error');
        } finally {
            setIsMatchingResources(false);
        }
    };

    const categories = [
        { value: 'all', label: '全部分类' },
        { value: 'avatar', label: '头像' },
        { value: 'character', label: '角色' },
        { value: 'era', label: '场景' },
        { value: 'scenario', label: '剧本' },
        { value: 'journal', label: '日记' },
        { value: 'item', label: '物品' },
        { value: 'event', label: '事件' },
        { value: 'general', label: '通用' },
    ];

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
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white text-sm focus:border-indigo-500 outline-none"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label} {cat.value === 'all' ? `(${resources.length})` : ''}
                                </option>
                            ))}
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
                                        onClick={handleCancelEdit}
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
                                    <InputGroup label="图片URL">
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <TextInput
                                                    value={editResourceUrl}
                                                    onChange={e => setEditResourceUrl(e.target.value)}
                                                    placeholder="输入图片URL或点击上传"
                                                    className="flex-1"
                                                />
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file || !adminToken) return;
                                                    try {
                                                        // 系统资源上传，不包含userId
                                                        // 优先使用资源的实际 category，如果不存在则使用当前选择的 category（排除 'all'），最后使用 'general'
                                                        // 注意：system_resources 的图片存储直接使用 category，不使用 resource_ 前缀
                                                        const category = editingResource?.category || 
                                                                         (resourceCategory && resourceCategory !== 'all' ? resourceCategory : null) || 
                                                                         'general';
                                                        console.log('[ResourcesManagement] 上传图片，使用的 category:', category, 'baseCategory:', baseCategory, 'editingResource:', editingResource);
                                                        const url = await imageApi.uploadImage(file, category, adminToken, true);
                                                        if (url && url.success && url.url) {
                                                            setEditResourceUrl(url.url);
                                                            // 上传成功后，图片会在预览框中显示，无需提示框
                                                        } else {
                                                            showAlert('图片上传失败：未返回URL', '上传失败', 'error');
                                                        }
                                                    } catch (err: any) {
                                                        showAlert('上传失败: ' + (err.message || '未知错误'), '上传失败', 'error');
                                                    }
                                                }}
                                                className="hidden"
                                                id="edit-resource-upload"
                                            />
                                            <label
                                                htmlFor="edit-resource-upload"
                                                className="block w-full text-center px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors cursor-pointer text-sm"
                                            >
                                                📁 上传新图片
                                            </label>
                                            {editResourceUrl && (
                                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                                                    <img src={editResourceUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setEditResourceUrl('')}
                                                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </InputGroup>
                                    <button
                                        onClick={handleSaveEdit}
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
                                            {categories.filter(c => c.value !== 'all').map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
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
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleUpload(file);
                                                }
                                            }}
                                            className="hidden"
                                            id="resource-upload"
                                        />
                                        <label
                                            htmlFor="resource-upload"
                                            className="block w-full text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-sm"
                                        >
                                            📁 选择并上传图片
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
                        <h3 className="text-lg font-bold text-slate-100 mb-4">资源列表 ({resources.length})</h3>
                        {loading ? (
                            <div className="text-center text-slate-400 py-8">加载中...</div>
                        ) : resources.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">暂无资源</div>
                        ) : (
                            <div 
                                ref={listContainerRef} 
                                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                                style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
                            >
                                {resources.map((resource) => (
                                    <div
                                        key={resource.id}
                                        className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-colors"
                                    >
                                        <div className="aspect-square relative">
                                            <LazyImage
                                                src={getFullImageUrl(resource.url, resource.name)}
                                                alt={resource.name}
                                                className="w-full h-full object-cover"
                                                purpose="thumbnail"
                                                onError={(e) => {
                                                    const imgUrl = getFullImageUrl(resource.url, resource.name);
                                                    console.error('[ResourcesManagement] 图片加载失败', {
                                                        resourceName: resource.name,
                                                        resourceId: resource.id,
                                                        originalUrl: resource.url,
                                                        finalUrl: imgUrl,
                                                        error: e
                                                    });
                                                }}
                                                onLoad={() => {
                                                    const imgUrl = getFullImageUrl(resource.url, resource.name);
                                                    console.log('[ResourcesManagement] 图片加载成功', {
                                                        resourceName: resource.name,
                                                        resourceId: resource.id,
                                                        finalUrl: imgUrl
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h4 className="text-sm font-bold text-white mb-1 truncate">{resource.name}</h4>
                                            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{resource.description}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(resource)}
                                                    className="flex-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resource.id)}
                                                    className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
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
                </div>
            </div>
        </div>
    );
};

