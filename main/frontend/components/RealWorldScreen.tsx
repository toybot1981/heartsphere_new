
import React, { useState, useRef, useEffect, MouseEvent, ChangeEvent, KeyboardEvent } from 'react';
import { JournalEntry } from '../types';
import { Button } from './Button';
import { aiService } from '../services/ai';
import { imageApi, tokenStorage, type ImageVariants } from '../services/api';
import { LazyImage } from './LazyImage';
import { getAllTemplates, JournalTemplate, getTemplateById } from '../utils/journalTemplates';
import { showAlert, showConfirm } from '../utils/dialog';
import { NoteSyncModal } from './NoteSyncModal';
import { logger } from '../utils/logger';
import { useJournalHandlers } from '../hooks/useJournalHandlers';
import { JournalMemoryModal } from './memory/JournalMemoryModal';
import { useGameState } from '../contexts/GameStateContext';
import { authApi } from '../services/api';
import { JournalPreviewModal } from './JournalPreviewModal';
import { PluginToolbar, PluginSelectorModal, ScenePluginContainer, PluginConfigModal } from './plugin';
import { PhotoAlbumModal } from './PhotoAlbumModal';
import { scenePluginApi, userPluginApi } from '../services/api/plugin';
import type { ScenePluginDTO } from '../services/api/plugin/scenePlugin';
import type { Plugin } from '../services/api/plugin/pluginTypes';

interface RealWorldScreenProps {
  entries: JournalEntry[];
  onExplore: (entry: JournalEntry) => void;
  onChatWithCharacter: (characterName: string) => void;
  onBack: () => void;
  onConsultMirror: (content: string, recentContext: string[]) => Promise<string | null>;
  autoGenerateImage: boolean;
  worldStyle?: string; // 当前世界风格
  userName?: string; // 用户名
  isGuest?: boolean; // 是否为访客模式
  showNoteSync?: boolean; // 是否显示笔记同步按钮
}

export const RealWorldScreen: React.FC<RealWorldScreenProps> = ({ 
    entries, onExplore, onChatWithCharacter, onBack, onConsultMirror, autoGenerateImage, worldStyle, userName, isGuest, showNoteSync = false
}) => {
  // 使用 useJournalHandlers Hook 处理日记操作
  const { handleAddJournalEntry, handleUpdateJournalEntry, handleDeleteJournalEntry } = useJournalHandlers();
  // 获取gameState以访问userProfile
  const { state: gameState } = useGameState();
  // 日志：从缓存获取的entries
  useEffect(() => {
    logger.debug(`[RealWorldScreen] 加载日记条目，数量: ${entries.length}`);
  }, [entries]);
  // State for View Mode
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]); // 标签数组
  const [tagInput, setTagInput] = useState(''); // 标签输入框
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(undefined);
  const [uploadedImageVariants, setUploadedImageVariants] = useState<ImageVariants | undefined>(undefined);
  const [mirrorInsight, setMirrorInsight] = useState<string | null>(null);
  const [isConsultingMirror, setIsConsultingMirror] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<JournalEntry | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Daily Greeting State
  const [dailyGreeting, setDailyGreeting] = useState<{greeting: string, question?: string, prompt?: string} | null>(null);
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Note Sync State
  const [showNoteSyncModal, setShowNoteSyncModal] = useState(false);
  const [syncButtonEnabled, setSyncButtonEnabled] = useState(showNoteSync); // 从props读取初始值
  
  // Plugin State
  const [scenePlugins, setScenePlugins] = useState<ScenePluginDTO[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPluginSelector, setShowPluginSelector] = useState(false);
  const [showPluginConfig, setShowPluginConfig] = useState(false);
  const [configPlugin, setConfigPlugin] = useState<ScenePluginDTO | null>(null);
  const [loadingPlugins, setLoadingPlugins] = useState(false);
  const [showPhotoAlbum, setShowPhotoAlbum] = useState(false);
  const SCENE_ID = 'real-world'; // 现实世界场景ID
  
  // 当 showNoteSync prop 变化时，更新按钮显示状态
  useEffect(() => {
    setSyncButtonEnabled(showNoteSync);
    logger.debug(`[RealWorldScreen] 笔记同步按钮显示状态: ${showNoteSync}`);
  }, [showNoteSync]);

  // 加载场景插件列表（只在组件挂载时加载一次）
  useEffect(() => {
    // 尝试从后端加载，如果失败则保留空列表（前端模拟数据会在用户添加时更新）
    loadScenePlugins().catch(() => {
      // 静默失败，不影响前端模拟数据
    });
  }, []);
  
  // 调试：监听 scenePlugins 变化（包括调用栈）
  useEffect(() => {
    const stack = new Error().stack;
    console.log('[RealWorldScreen] scenePlugins 状态变化', { 
      count: scenePlugins.length, 
      plugins: scenePlugins.map(p => ({ id: p.pluginInstanceId, name: p.pluginName, visible: p.visible })),
      callStack: stack?.split('\n').slice(2, 6).join('\n') // 显示调用栈
    });
  }, [scenePlugins]);

  const loadScenePlugins = async () => {
    if (isGuest) return; // 访客模式不加载插件
    
    setLoadingPlugins(true);
    try {
      const token = localStorage.getItem('auth_token');
      const plugins = await scenePluginApi.getScenePlugins(SCENE_ID, token || undefined);
      setScenePlugins(plugins || []);
      logger.debug(`[RealWorldScreen] 加载场景插件: ${plugins.length}个`);
    } catch (error) {
      // 如果API不存在（404），静默失败（后端可能还未实现）
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        logger.debug('[RealWorldScreen] 后端API未实现（404），保留本地模拟数据', errorMessage);
        // 404错误时不重置插件列表，保留本地模拟数据
        // setScenePlugins((prev) => prev); // 保持不变
      } else {
        logger.debug('[RealWorldScreen] 加载场景插件失败', error);
        // 其他错误才重置为空
        setScenePlugins([]);
      }
    } finally {
      setLoadingPlugins(false);
    }
  };

  const handleAddPlugin = () => {
    setShowPluginSelector(true);
  };

  const handlePluginSelect = async (plugin: Plugin) => {
    console.log('[RealWorldScreen] handlePluginSelect 被调用', { 
      pluginId: plugin.pluginId, 
      pluginName: plugin.name,
      currentPluginCount: scenePlugins.length
    });
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // 使用函数式更新获取当前插件数量，避免闭包问题
      const currentCount = scenePlugins.length;
      const defaultPosition = {
        positionX: 100 + currentCount * 50,
        positionY: 100 + currentCount * 50,
        width: 200,
        height: 150,
        zIndex: currentCount,
        config: {},
      };
      
      console.log('[RealWorldScreen] 开始添加插件到场景', { 
        pluginId: plugin.pluginId, 
        sceneId: SCENE_ID,
        defaultPosition,
        currentCount
      });
      logger.debug('[RealWorldScreen] 开始添加插件到场景', { pluginId: plugin.pluginId, sceneId: SCENE_ID });
      
      try {
        const addedPlugin = await scenePluginApi.addPluginToScene(SCENE_ID, plugin.pluginId, defaultPosition, token || undefined);
        console.log('[RealWorldScreen] 插件添加成功（后端API）', addedPlugin);
        logger.debug('[RealWorldScreen] 插件添加成功（后端API）', addedPlugin);
        // 重新加载插件列表
        await loadScenePlugins();
        showAlert('插件已添加到现实世界', '成功', 'success');
      } catch (apiError) {
        // 如果后端API还没有实现，使用前端模拟数据
        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
        console.warn('[RealWorldScreen] 后端API可能未实现，使用前端模拟数据', errorMessage, apiError);
        logger.warn('[RealWorldScreen] 后端API可能未实现，使用前端模拟数据', errorMessage);
        
        // 使用函数式更新，避免闭包问题，并且不调用 loadScenePlugins（避免被清空）
        setScenePlugins((prevPlugins) => {
          console.log('[RealWorldScreen] setScenePlugins 函数式更新开始', { 
            previousCount: prevPlugins.length,
            previousPlugins: prevPlugins,
            newPluginId: plugin.pluginId,
            newPluginName: plugin.name
          });
          
          // 检查是否已存在相同的插件
          const existingIndex = prevPlugins.findIndex(p => p.pluginId === plugin.pluginId);
          if (existingIndex >= 0) {
            console.log('[RealWorldScreen] 插件已存在，跳过添加', { pluginId: plugin.pluginId, existingIndex });
            logger.debug('[RealWorldScreen] 插件已存在，跳过添加', { pluginId: plugin.pluginId });
            return prevPlugins;
          }
          
          const newPlugin: ScenePluginDTO = {
            id: Date.now(),
            pluginInstanceId: Date.now(),
            pluginId: plugin.pluginId,
            pluginName: plugin.name,
            sceneId: SCENE_ID,
            positionX: 100 + prevPlugins.length * 50,
            positionY: 100 + prevPlugins.length * 50,
            width: 400,
            height: 300,
            zIndex: prevPlugins.length,
            visible: true,
            config: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const updatedPlugins = [...prevPlugins, newPlugin];
          console.log('[RealWorldScreen] ✅ 插件已添加到本地状态', { 
            pluginId: plugin.pluginId, 
            pluginName: plugin.name,
            previousCount: prevPlugins.length,
            newCount: updatedPlugins.length,
            newPlugin: newPlugin,
            allPlugins: updatedPlugins
          });
          logger.debug('[RealWorldScreen] 插件已添加到本地状态', { 
            pluginId: plugin.pluginId, 
            pluginName: plugin.name,
            previousCount: prevPlugins.length,
            newCount: updatedPlugins.length,
            newPlugin: newPlugin,
            allPlugins: updatedPlugins
          });
          
          // 立即验证状态更新
          setTimeout(() => {
            console.log('[RealWorldScreen] ⏰ 状态更新后验证', { 
              expectedCount: updatedPlugins.length,
              note: '如果这个数量与页面显示不一致，说明状态更新有问题'
            });
          }, 50);
          
          return updatedPlugins;
        });
        showAlert(`插件"${plugin.name}"已添加到现实世界（前端模拟模式）`, '提示', 'info');
      }
    } catch (error) {
      logger.error('[RealWorldScreen] 添加插件失败', error);
      showAlert('添加插件失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
    }
  };

  const handleDeletePlugin = async (pluginInstanceId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      try {
        await scenePluginApi.removePluginFromScene(SCENE_ID, pluginInstanceId, token || undefined);
        await loadScenePlugins();
        showAlert('插件已删除', '成功', 'success');
      } catch (apiError) {
        // 如果后端API还没有实现，使用前端模拟删除
        logger.warn('[RealWorldScreen] 后端API可能未实现，使用前端模拟删除');
        setScenePlugins(scenePlugins.filter(p => p.pluginInstanceId !== pluginInstanceId));
        showAlert('插件已删除（前端模拟模式）', '提示', 'info');
      }
    } catch (error) {
      logger.error('[RealWorldScreen] 删除插件失败', error);
      showAlert('删除插件失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
    }
  };

  const handleUpdatePluginPosition = async (
    pluginInstanceId: number,
    position: { x: number; y: number; width?: number; height?: number }
  ) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // 先更新本地状态，提供即时反馈
      setScenePlugins(prevPlugins =>
        prevPlugins.map(p =>
          p.pluginInstanceId === pluginInstanceId
            ? {
                ...p,
                positionX: position.x,
                positionY: position.y,
                width: position.width || p.width,
                height: position.height || p.height,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      
      try {
        await scenePluginApi.updatePluginPosition(
          SCENE_ID,
          pluginInstanceId,
          {
            positionX: position.x,
            positionY: position.y,
            width: position.width,
            height: position.height,
          },
          token || undefined
        );
        // 成功后重新加载以确保同步
        await loadScenePlugins();
      } catch (apiError) {
        // 如果后端API还没有实现，使用前端模拟（已经更新了本地状态）
        logger.debug('[RealWorldScreen] 后端API可能未实现，使用前端模拟更新位置');
      }
    } catch (error) {
      logger.error('[RealWorldScreen] 更新插件位置失败', error);
    }
  };

  const handlePluginConfig = (pluginInstanceId: number) => {
    const plugin = scenePlugins.find(p => p.pluginInstanceId === pluginInstanceId);
    if (plugin) {
      setConfigPlugin(plugin);
      setShowPluginConfig(true);
    } else {
      showAlert('未找到插件', '错误', 'error');
    }
  };

  const handleConfigUpdated = (pluginInstanceId: number, config: Record<string, any>) => {
    // 更新本地状态中的插件配置
    setScenePlugins((prevPlugins) =>
      prevPlugins.map((p) =>
        p.pluginInstanceId === pluginInstanceId ? { ...p, config } : p
      )
    );
    // 如果后端API可用，会通过 PluginConfigModal 自动保存
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleCreateClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedEntry(null);
    setNewTitle('');
    setNewContent('');
    setNewTags([]);
    setTagInput('');
    setUploadedImageUrl(undefined);
    setUploadedImageVariants(undefined);
    setMirrorInsight(null);
    setIsEditing(false);
    setIsCreating(true);
  };

  const handleEditClick = (entry: JournalEntry, event?: MouseEvent<HTMLElement>): void => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSelectedEntry(entry);
    setNewTitle(entry.title);
    setNewContent(entry.content);
    setNewTags(entry.tags ? entry.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    setTagInput('');
    setUploadedImageUrl(entry.imageUrl);
    setUploadedImageVariants(undefined); // 编辑时重置variants，因为旧数据可能没有variants
    setMirrorInsight(entry.insight || null);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: string, e: MouseEvent<HTMLButtonElement>): Promise<void> => {
      e.stopPropagation();
      const confirmed = await showConfirm('确定要删除这篇日记吗？', '删除日记', 'warning');
      if (confirmed) {
          handleDeleteJournalEntry(id);
          if (selectedEntry?.id === id) {
              setIsCreating(false);
              setSelectedEntry(null);
          }
      }
  };

  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async (): Promise<void> => {
    // 防止重复提交
    if (isSaving) {
      logger.warn("[RealWorldScreen] 正在保存中，跳过重复请求");
      return;
    }
    
    logger.debug("[RealWorldScreen] 开始保存日志");
    
    // 表单验证
    if (!newContent.trim()) {
        logger.warn("[RealWorldScreen] 保存失败: 内容不能为空");
        showAlert("内容不能为空", "提示", "warning");
        return;
    }
    
    setIsSaving(true);
    
    // 如果标题为空，使用日期作为默认值
    const getDateString = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const finalTitle = newTitle.trim() || getDateString();
    
    let finalImageUrl = uploadedImageUrl;

    // 图片处理
    if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        logger.debug("[RealWorldScreen] 上传base64图片");
        setIsGeneratingImage(true);
        try {
            const token = localStorage.getItem('auth_token');
            const result = await imageApi.uploadBase64Image(finalImageUrl, 'journal', token || undefined);
            if (result.success && result.url) {
                finalImageUrl = result.url;
            } else {
                logger.warn("[RealWorldScreen] Base64图片上传失败");
            }
        } catch (error) {
            logger.error("[RealWorldScreen] Base64图片上传异常", error);
        } finally {
            setIsGeneratingImage(false);
        }
    } else if (finalImageUrl && (finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://'))) {
        // 检查是否是本地服务器URL
        const isLocalUrl = finalImageUrl.includes('localhost') || 
                          finalImageUrl.includes('127.0.0.1') || 
                          finalImageUrl.includes('api/images/files') ||
                          finalImageUrl.startsWith('http://localhost') ||
                          finalImageUrl.startsWith('https://localhost') ||
                          finalImageUrl.startsWith('http://127.0.0.1') ||
                          finalImageUrl.startsWith('https://127.0.0.1');
        
        if (!isLocalUrl) {
            logger.debug("[RealWorldScreen] 处理外部URL图片");
            setIsGeneratingImage(true);
            try {
                const proxyResult = await imageApi.proxyDownload(finalImageUrl);
                
                if (proxyResult.success && proxyResult.dataUrl) {
                    const token = localStorage.getItem('auth_token');
                    const uploadResult = await imageApi.uploadBase64Image(proxyResult.dataUrl, 'journal', token || undefined);
                    
                    if (uploadResult.success && uploadResult.url) {
                        finalImageUrl = uploadResult.url;
                        logger.debug("[RealWorldScreen] 外部图片处理成功");
                    } else {
                        logger.error("[RealWorldScreen] 图片上传失败", uploadResult.error);
                        throw new Error(`图片上传失败: ${uploadResult.error || '未知错误'}`);
                    }
                } else {
                    logger.error("[RealWorldScreen] 后端代理下载失败", proxyResult.error);
                    throw new Error(`后端代理下载失败: ${proxyResult.error || '未知错误'}`);
                }
            } catch (proxyError) {
                logger.error("[RealWorldScreen] 代理下载或上传异常", proxyError);
                throw new Error(`无法处理外部图片URL: ${proxyError instanceof Error ? proxyError.message : '未知错误'}`);
            } finally {
                setIsGeneratingImage(false);
            }
        }
    }
    
    // 如果还没有图片且启用了自动生成
    if (!finalImageUrl && autoGenerateImage) {
        logger.debug("[RealWorldScreen] 开始自动生成图片");
        setIsGeneratingImage(true);
        try {
            const generated = await aiService.generateMoodImage(newContent, worldStyle);
            if (generated) {
                if (generated.startsWith('data:')) {
                    const token = localStorage.getItem('auth_token');
                    const uploadResult = await imageApi.uploadBase64Image(generated, 'journal', token || undefined);
                    if (uploadResult.success && uploadResult.url) {
                        finalImageUrl = uploadResult.url;
                    } else {
                        finalImageUrl = generated;
                    }
                } else {
                    // 外部URL需要下载并重新上传
                    try {
                        const proxyResult = await imageApi.proxyDownload(generated);
                        
                        if (proxyResult.success && proxyResult.dataUrl) {
                            const token = localStorage.getItem('auth_token');
                            const uploadResult = await imageApi.uploadBase64Image(proxyResult.dataUrl, 'journal', token || undefined);
                            
                            if (uploadResult.success && uploadResult.url) {
                                finalImageUrl = uploadResult.url;
                            } else {
                                logger.error("[RealWorldScreen] 生成的图片上传失败", uploadResult.error);
                                throw new Error(`图片上传失败: ${uploadResult.error || '未知错误'}`);
                            }
                        } else {
                            logger.error("[RealWorldScreen] 生成的图片下载失败", proxyResult.error);
                            throw new Error(`后端代理下载失败: ${proxyResult.error || '未知错误'}`);
                        }
                    } catch (proxyError) {
                        logger.error("[RealWorldScreen] 生成的图片处理异常", proxyError);
                        throw new Error(`无法处理外部图片URL: ${proxyError instanceof Error ? proxyError.message : '未知错误'}`);
                    }
                }
            }
        } catch (e: unknown) {
            logger.error("[RealWorldScreen] 自动图片生成失败", e);
        } finally {
            setIsGeneratingImage(false);
        }
    }

    // 保存日志
    if (isEditing && selectedEntry) {
        const tagsString = newTags.length > 0 ? newTags.join(',') : undefined;
        // 处理insight字段：如果用户没有修改，保留原有的insight
        let insightValue: string | undefined;
        if (mirrorInsight !== undefined) {
            if (mirrorInsight !== null) {
                insightValue = mirrorInsight;
            } else {
                insightValue = selectedEntry?.insight;
            }
        } else {
            insightValue = selectedEntry?.insight;
        }
        
        const updatedEntry = {
            ...selectedEntry,
            title: finalTitle,
            content: newContent,
            imageUrl: finalImageUrl,
            insight: insightValue,
            tags: tagsString
        };
        
        logger.debug(`[RealWorldScreen] 更新日志条目: ${updatedEntry.id}`);
        try {
          await handleUpdateJournalEntry(updatedEntry);
          
          // 编辑模式下，关闭编辑框
          setIsCreating(false);
          setIsEditing(false);
          setSelectedEntry(null);
          setNewTags([]);
          setTagInput('');
        } catch (error) {
          logger.error("[RealWorldScreen] 更新日志失败", error);
        } finally {
          setIsSaving(false);
        }
    } else {
        const tagsString = newTags.length > 0 ? newTags.join(',') : undefined;
        logger.debug("[RealWorldScreen] 创建新日志条目");
        try {
          await handleAddJournalEntry(finalTitle, newContent, finalImageUrl, mirrorInsight || undefined, tagsString);
          
          // 新建模式下，只清空表单内容，保持编辑框打开
          setNewTitle('');
          setNewContent('');
          setNewTags([]);
          setTagInput('');
          setUploadedImageUrl(undefined);
          setUploadedImageVariants(undefined);
          setIsEditing(false);
          setSelectedEntry(null);
        } catch (error) {
          logger.error("[RealWorldScreen] 创建日志失败", error);
        } finally {
          setIsSaving(false);
        }
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 先显示预览（base64）
    const reader = new FileReader();
    reader.onloadend = () => {
        setUploadedImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 自动上传到服务器
    setIsUploadingImage(true);
    setUploadError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const result = await imageApi.uploadImage(file, 'journal', token || undefined);
      
      if (result.success && result.url) {
        // 使用服务器返回的URL替换base64预览
        setUploadedImageUrl(result.url);
        // 保存多分辨率版本信息
        if (result.variants) {
          setUploadedImageVariants(result.variants);
        }
        logger.debug('图片上传成功，variants:', result.variants);
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (err: any) {
      logger.error('图片上传失败', err);
      setUploadError('图片上传失败: ' + (err.message || '未知错误') + '。将使用本地预览。');
      // 保持base64预览
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleConsultMirrorClick = async (): Promise<void> => {
      if (!newContent.trim()) return;
      setIsConsultingMirror(true);
      
      // Get recent context (last 3 entries) to provide continuity
      const recentContext = entries.slice(-3).map(e => e.content);
      
      try {
          const insight = await onConsultMirror(newContent, recentContext);
          if (insight) {
              setMirrorInsight(insight);
          }
      } catch (e: unknown) {
          showAlert("本我镜像连接失败，请稍后重试。", "错误", "error");
      } finally {
          setIsConsultingMirror(false);
      }
  };

  // Load daily greeting on mount and when entries change
  useEffect(() => {
      const loadDailyGreeting = async () => {
          setIsLoadingGreeting(true);
          try {
              const recentEntries = entries.slice(-3);
              // generateDailyGreeting 现在保证永远不会抛出错误，总是返回默认值
              const greeting = await aiService.generateDailyGreeting(recentEntries, userName);
              if (greeting) {
                  setDailyGreeting(greeting);
              } else {
                  // 兜底：如果返回 null 或 undefined，使用默认问候
                  setDailyGreeting({
                      greeting: entries.length === 0 
                          ? '欢迎来到现实记录。这里是你的内心世界，记录下每一个真实的瞬间。'
                          : '你好，我注意到你最近记录了一些想法。继续探索你的内心世界吧。',
                      question: entries.length === 0
                          ? '今天有什么让你印象深刻的事吗？'
                          : '今天想记录些什么新的想法呢？'
                  });
              }
          } catch (error) {
              // 这个 catch 现在不应该被触发，因为 generateDailyGreeting 不会抛出错误
              // 但为了安全起见，保留这个兜底逻辑
              logger.error("[RealWorldScreen] 生成每日问候异常", error);
              setDailyGreeting({
                  greeting: entries.length === 0 
                      ? '欢迎来到现实记录。这里是你的内心世界，记录下每一个真实的瞬间。'
                      : '你好，我注意到你最近记录了一些想法。继续探索你的内心世界吧。',
                  question: entries.length === 0
                      ? '今天有什么让你印象深刻的事吗？'
                      : '今天想记录些什么新的想法呢？'
              });
          } finally {
              setIsLoadingGreeting(false);
          }
      };

      loadDailyGreeting();
  }, [entries, userName]); // 当 entries 数组或 userName 变化时重新生成（使用 entries 而不是 entries.length 以便在内容变化时也能更新）

  // Handle clicking on greeting question to fill editor
  const handleGreetingQuestionClick = () => {
      if (!dailyGreeting) return;
      const questionText = dailyGreeting.prompt || dailyGreeting.question || '';
      setNewContent(questionText);
      if (!isCreating) {
          setIsCreating(true);
          setIsEditing(false);
          setSelectedEntry(null);
          setNewTitle('');
          setUploadedImageUrl(undefined);
          setUploadedImageVariants(undefined);
          setMirrorInsight(null);
      }
  };

  // Tag management functions
  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
      if (!newTags.includes(tag)) {
        setNewTags([...newTags, tag]);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && tagInput === '' && newTags.length > 0) {
      setNewTags(newTags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setNewTags(newTags.filter(t => t !== tag));
  };

  const applyTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setNewTitle(template.title);
      setNewContent(template.content);
      setNewTags(template.tags.split(',').map(t => t.trim()).filter(Boolean));
    }
  };

  // Get all unique tags from entries
  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.split(',').forEach(tag => {
          const trimmed = tag.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });
    return Array.from(tagSet).sort();
  };

  // Filter entries based on search and tag
  const filteredEntries = entries.filter(entry => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = entry.title.toLowerCase().includes(query);
      const matchesContent = entry.content.toLowerCase().includes(query);
      const matchesTags = entry.tags?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesContent && !matchesTags) return false;
    }
    if (selectedTag) {
      if (!entry.tags || !entry.tags.includes(selectedTag)) return false;
    }
    return true;
  });

  // Sort entries by timestamp descending
  const sortedEntries = [...filteredEntries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <>
      {/* Shimmer Animation Style */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(0); }
          100% { transform: translateX(100%) translateY(0); }
        }
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          animation: shimmer 2s infinite;
        }
      `}</style>
      <div className="h-full flex flex-col p-8 bg-slate-900 text-white relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-white hover:text-cyan-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div>
                  <h1 className="text-2xl font-bold text-white">记忆中枢</h1>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">REALITY DATABASE</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
              {/* Grid Icon */}
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
              </button>
              {/* Search Bar */}
              <div className="relative">
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="检索记忆/#标签"
                      className="bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 pl-8 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none w-48"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                      <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                          ×
                      </button>
                  )}
              </div>
              {/* Note Sync Button - 根据配置显示/隐藏 */}
              {syncButtonEnabled && (
              <Button 
                  onClick={async () => {
                      if (isGuest) {
                          logger.warn('[RealWorldScreen] 访客模式，无法打开同步笔记');
                          showAlert('请先登录', '提示', 'warning');
                          return;
                      }
                      
                      // 检查 token
                      const localStorageToken = localStorage.getItem('auth_token');
                      const sessionStorageToken = sessionStorage.getItem('auth_token');
                      let token = localStorageToken || sessionStorageToken;
                      
                      if (!token) {
                          logger.debug('[RealWorldScreen] 未在存储中找到 token，尝试从 tokenStorage 获取');
                          try {
                              token = await tokenStorage.getToken();
                          } catch (e) {
                              logger.error('[RealWorldScreen] 无法从 tokenStorage 获取 token', e);
                          }
                      }
                      
                      if (!token) {
                          logger.warn('[RealWorldScreen] 未找到 token，但用户已登录，允许打开同步笔记模态框');
                      }
                      
                      setShowNoteSyncModal(true);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg shadow-indigo-900/20"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  笔记同步
              </Button>
              )}
              {/* Memory Button - 查看日记记忆 */}
              {!isGuest && userName && (
              <Button 
                  onClick={async () => {
                      try {
                          // 从多个来源尝试获取用户ID
                          let userId: number | null = null;
                          
                          // 方法1: 从gameState获取（最可靠）
                          if (gameState.userProfile && !gameState.userProfile.isGuest && gameState.userProfile.id) {
                              const profileId = gameState.userProfile.id;
                              // 确保是数字类型
                              if (typeof profileId === 'number') {
                                  userId = profileId;
                              } else if (typeof profileId === 'string' && /^\d+$/.test(profileId)) {
                                  userId = parseInt(profileId, 10);
                              }
                          }
                          
                          // 方法2: 如果gameState中没有，从localStorage的HEARTSPHERE_MEMORY_CORE_V1获取
                          if (!userId || userId === 0) {
                              const stored = localStorage.getItem('HEARTSPHERE_MEMORY_CORE_V1');
                              if (stored) {
                                  try {
                                      const parsed = JSON.parse(stored);
                                      const parsedUserId = parsed?.userProfile?.id;
                                      if (parsedUserId) {
                                          userId = typeof parsedUserId === 'number' ? parsedUserId : parseInt(String(parsedUserId), 10);
                                      }
                                  } catch (e) {
                                      logger.debug('[RealWorldScreen] 解析HEARTSPHERE_MEMORY_CORE_V1失败', e);
                                  }
                              }
                          }
                          
                          // 方法3: 如果还是获取不到，从API获取当前用户信息
                          if (!userId || userId === 0) {
                              const token = localStorage.getItem('auth_token');
                              if (token) {
                                  try {
                                      const userInfo = await authApi.getCurrentUser(token);
                                      if (userInfo && userInfo.id) {
                                          userId = typeof userInfo.id === 'number' ? userInfo.id : parseInt(String(userInfo.id), 10);
                                      }
                                  } catch (e) {
                                      logger.warn('[RealWorldScreen] 从API获取用户信息失败', e);
                                  }
                              }
                          }
                          
                          if (!userId || userId === 0) {
                              showAlert('无法获取用户信息，请重新登录', '提示', 'warning');
                              return;
                          }
                          
                          setShowMemoryModal(true);
                      } catch (error) {
                          logger.error('[RealWorldScreen] 获取用户信息失败', error);
                          showAlert('无法获取用户信息', '提示', 'warning');
                      }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/20"
                  title="查看从日记中提取的记忆"
              >
                  🧠 我的记忆
              </Button>
              )}
              {/* New Record Button */}
              <Button onClick={handleCreateClick} className="bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-purple-900/20">
                  + 新记录
              </Button>
          </div>
      </div>
      
      {/* Tag Filter Pills - Below Header */}
      <div className="flex items-center justify-between mb-4">
          {getAllTags().length > 0 && (
              <div className="flex gap-2 flex-wrap">
                  {getAllTags().map(tag => (
                      <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                              selectedTag === tag
                                  ? 'bg-cyan-500 text-white'
                                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-cyan-300'
                          }`}
                      >
                          {tag}
                      </button>
                  ))}
              </div>
          )}
          
          {/* 插件管理入口 - 与日志功能融合 */}
          {!isGuest && (
            <div className="flex items-center gap-2">
              {scenePlugins.length > 0 && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                    isEditMode
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                  }`}
                  title={isEditMode ? '退出编辑模式' : '编辑插件位置'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditMode ? '退出编辑' : '编辑插件'}
                </button>
              )}
              <button
                onClick={handleAddPlugin}
                className="px-3 py-1 text-xs rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-colors flex items-center gap-1.5"
                title="添加插件到现实世界"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加插件
              </button>
            </div>
          )}
      </div>

      {/* Hero Section: DAILY RESONANCE */}
      {dailyGreeting && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-indigo-500/20 relative overflow-visible group hover:border-indigo-500/40 transition-colors w-full">
              <div className="relative z-10 flex flex-row justify-between items-start gap-4">
                  <div className="flex-1 min-w-0 pr-2" style={{ maxWidth: 'calc(100% - 60px)' }}>
                      {/* 顶部标签与呼吸点 */}
                      <div className="flex items-center gap-2 mb-2 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                          Daily Resonance
                      </div>
                      
                      {/* 问候语 */}
                      <h2 className="text-lg font-bold text-white/90 mb-2 break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {dailyGreeting.greeting || "你好，旅人。"}
                      </h2>
                      
                      {/* 引导问题 */}
                      <p className="text-sm text-indigo-200/70 italic break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          "{dailyGreeting.prompt || dailyGreeting.question || "今天的风带给你什么感觉？"}"
                      </p>
                  </div>
                  
                  {/* 回应按钮 */}
                  <button 
                    onClick={handleGreetingQuestionClick}
                    className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white p-2 rounded-lg transition-all flex-shrink-0"
                    title="回应"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                  </button>
              </div>
          </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex gap-8 overflow-hidden relative" style={{ position: 'relative', minHeight: '600px' }}>
          {/* Plugin Containers */}
          {scenePlugins.length > 0 && (
            <>
              {scenePlugins.map((plugin) => (
                <ScenePluginContainer
                  sceneId={SCENE_ID}
                  key={plugin.pluginInstanceId}
                  plugin={plugin}
                  isEditMode={isEditMode}
                  onDelete={handleDeletePlugin}
                  onUpdatePosition={handleUpdatePluginPosition}
                  onConfig={handlePluginConfig}
                  onOpenJournal={() => {
                    // 打开日志编辑器（新记录）
                    handleCreateClick({ preventDefault: () => {}, stopPropagation: () => {} } as any);
                  }}
                  onOpenAlbum={() => {
                    // 打开相册模态框
                    setShowPhotoAlbum(true);
                  }}
                />
              ))}
            </>
          )}
          
          {/* Debug: 显示插件数量（已隐藏） */}
          {false && process.env.NODE_ENV === 'development' && (
            <div className={`absolute top-4 left-4 rounded-lg p-3 text-xs z-[9999] border-2 ${
              scenePlugins.length > 0 
                ? 'bg-green-500/30 border-green-500/70 text-green-300' 
                : 'bg-yellow-500/30 border-yellow-500/70 text-yellow-300'
            }`}>
              <p className="font-bold mb-1">
                {scenePlugins.length > 0 ? '✅' : '⚠️'} 插件状态
              </p>
              <p>插件数量: {scenePlugins.length}</p>
              {scenePlugins.length > 0 && (
                <>
                  {scenePlugins.map((p, idx) => (
                    <div key={p.pluginInstanceId} className="text-[10px] mt-1 border-t border-current/20 pt-1">
                      <p>{idx + 1}. {p.pluginName}</p>
                      <p className="text-[9px] opacity-75">
                        ID: {p.pluginInstanceId} | 位置: ({p.positionX}, {p.positionY}) | 大小: {p.width}x{p.height} | 可见: {p.visible ? '是' : '否'}
                      </p>
                    </div>
                  ))}
                </>
              )}
              {scenePlugins.length === 0 && (
                <p className="text-[10px] mt-1">请点击"添加插件"按钮添加插件</p>
              )}
            </div>
          )}
          
          {/* Left: Entries Grid */}
          <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ${isCreating ? 'w-1/2 hidden md:block' : 'w-full'}`}>
              {sortedEntries.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-600/50 rounded-xl bg-slate-800/30">
                      <div className="text-3xl mb-3">📓</div>
                      <p className="text-slate-400">暂无记录</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                      {sortedEntries.map(entry => (
                          <div 
                            key={entry.id} 
                            onClick={(event: MouseEvent<HTMLDivElement>) => {
                              // 点击卡片时打开预览，而不是直接编辑
                              setPreviewEntry(entry);
                              setShowPreview(true);
                            }}
                            className="group relative bg-slate-800/80 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                            style={{
                                border: '1px solid transparent',
                                backgroundImage: 'linear-gradient(slate-800, slate-800), linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3))',
                                backgroundOrigin: 'border-box',
                                backgroundClip: 'padding-box, border-box',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderImage = 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.5), rgba(6, 182, 212, 0.5)) 1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderImage = 'none';
                            }}
                          >
                              {/* Memory Slice Effect - Gradient Border */}
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                              
                              {entry.imageUrl ? (
                                  <div className="h-40 w-full overflow-hidden relative">
                                      <img src={entry.imageUrl} alt="Visual" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent" />
                                  </div>
                              ) : (
                                  <div className="h-40 w-full bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 flex items-center justify-center relative overflow-hidden">
                                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.2),transparent_70%)] opacity-50" />
                                      <div className="text-4xl opacity-40 group-hover:opacity-60 transition-opacity">📝</div>
                                  </div>
                              )}
                              
                              <div className="p-5 flex-1 flex flex-col relative z-10">
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-bold text-lg text-slate-100 line-clamp-1 group-hover:text-cyan-200 transition-colors">{entry.title}</h3>
                                      {entry.insight && (
                                          <span className="text-[10px] bg-cyan-900/40 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/50 shadow-lg shadow-cyan-500/20">
                                              🔮 已解析
                                          </span>
                                      )}
                                  </div>
                                  <p className="text-slate-300 text-sm line-clamp-3 mb-3 flex-1 leading-relaxed group-hover:text-slate-200 transition-colors">
                                      {entry.content}
                                  </p>
                                  
                                  {/* Mirror Insight Display */}
                                  {entry.insight && (
                                      <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800/50 rounded-lg p-3 mb-3">
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="text-sm">🔮</span>
                                              <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Mirror of Truth</h4>
                                          </div>
                                          <p className="text-cyan-100 text-xs italic leading-relaxed">"{entry.insight}"</p>
                                      </div>
                                  )}
                                  
                                  {/* Tags Display */}
                                  {entry.tags && (
                                      <div className="flex flex-wrap gap-1 mb-3">
                                          {entry.tags.split(',').map((tag, idx) => {
                                              const trimmedTag = tag.trim();
                                              if (!trimmedTag) return null;
                                              return (
                                                  <span
                                                      key={idx}
                                                      onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedTag(trimmedTag);
                                                          setIsCreating(false);
                                                      }}
                                                      className="text-[10px] px-2 py-0.5 bg-cyan-900/20 text-cyan-400 rounded-full border border-cyan-700/30 hover:bg-cyan-900/30 cursor-pointer transition-colors"
                                                  >
                                                      {trimmedTag}
                                                  </span>
                                              );
                                          })}
                                      </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
                                      <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                          {new Date(entry.timestamp).toLocaleDateString('zh-CN', { 
                                              year: 'numeric', 
                                              month: 'long', 
                                              day: 'numeric' 
                                          })}
                                      </span>
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                            onClick={(e: MouseEvent<HTMLButtonElement>) => { 
                                              e.stopPropagation(); 
                                              setPreviewEntry(entry);
                                              setShowPreview(true);
                                            }} 
                                            className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
                                            title="预览详情"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                          </button>
                                          {/* 插件入口 - 与日志融合 */}
                                          {!isGuest && scenePlugins.length > 0 && (
                                            <button 
                                              onClick={(e: MouseEvent<HTMLButtonElement>) => { 
                                                e.stopPropagation(); 
                                                // 可以传递日志内容给插件使用
                                                showAlert(`可以使用插件处理这篇日志: ${entry.title}`, '提示', 'info');
                                              }} 
                                              className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
                                              title="使用插件处理此日志"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                              </svg>
                                            </button>
                                          )}
                                          <button 
                                            onClick={(e: MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onExplore(entry); }} 
                                            className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                                            title="带着问题进入心域"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                          </button>
                                          <button 
                                            onClick={(e: MouseEvent<HTMLButtonElement>) => handleDeleteClick(entry.id, e)} 
                                            className="p-2 bg-slate-700/80 rounded-full hover:bg-red-900/60 hover:text-red-300 text-slate-400 transition-all"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Shimmer Effect on Hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
                                   style={{
                                       transform: 'translateX(-100%)',
                                       animation: 'shimmer 2s infinite'
                                   }}
                              />
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Right: Editor Panel (Slide in) */}
          {isCreating && (
              <div className="w-full md:w-[450px] bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col shadow-2xl animate-fade-in shrink-0 h-full max-h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                      <div className="flex items-center gap-3">
                          <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white text-xl">&times;</button>
                          <h2 className="text-base font-bold text-white">{isEditing ? '编辑日记' : '新思维'}</h2>
                      </div>
                      <div className="flex gap-2">
                          {/* 星星图标 - 晨间意图 */}
                          <button 
                              onClick={() => applyTemplate('morning-intention')}
                              className="p-1.5 text-yellow-400 hover:text-yellow-300 transition-colors"
                              title="晨间意图"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          </button>
                          {/* 方块图标 - 晚间回顾 */}
                          <button 
                              onClick={() => applyTemplate('evening-review')}
                              className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                              title="晚间回顾"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" /></svg>
                          </button>
                          {/* 闪电图标 - 灵感闪念 */}
                          <button 
                              onClick={() => applyTemplate('inspiration-flash')}
                              className="p-1.5 text-yellow-400 hover:text-yellow-300 transition-colors"
                              title="灵感闪念"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                          </button>
                          {/* 人物图标 - 情绪追踪 */}
                          <button 
                              onClick={() => applyTemplate('emotion-tracking')}
                              className="p-1.5 text-pink-400 hover:text-pink-300 transition-colors"
                              title="情绪追踪"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                          </button>
                          {/* 插件图标 - 添加插件到场景 */}
                          {!isGuest && (
                            <button 
                                onClick={handleAddPlugin}
                                className="p-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
                                title="添加插件到现实世界"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </button>
                          )}
                      </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                      {/* Title - 始终可编辑，标题可选，默认为日期 */}
                      <input 
                          value={newTitle} 
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)} 
                          placeholder="标题（可选，默认为日期）"
                          className="w-full bg-transparent border-none outline-none text-lg font-bold text-white placeholder-slate-500 focus:placeholder-slate-600"
                      />
                      
                      {/* Tags Section - 在标题下方 */}
                      <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-slate-900/30 border border-slate-600/50 rounded-lg">
                          {newTags.map((tag, idx) => (
                              <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-900/20 text-cyan-300 text-xs rounded border border-cyan-700/30"
                              >
                                  {tag}
                                  <button
                                      onClick={() => removeTag(tag)}
                                      className="hover:text-red-400 transition-colors text-xs"
                                  >
                                      ×
                                  </button>
                              </span>
                          ))}
                          <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={handleTagInputKeyDown}
                              placeholder="添加标签(Enter)..."
                              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-500"
                          />
                      </div>
                      
                      {/* Content Textarea */}
                      <textarea 
                          value={newContent} 
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)} 
                          placeholder={newTitle === '晨间意图' || (!newTitle && !isEditing) ? "今天,我想要专注于...\n\n我期待..." : "在这里写下你的想法、困惑或梦境..."}
                          className="w-full min-h-[180px] max-h-[300px] bg-slate-900/30 border border-slate-600/50 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 outline-none resize-y leading-relaxed text-sm"
                      />

                      {/* Mirror Insight Section */}
                      {mirrorInsight && (
                          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800/50 rounded-xl p-4 relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">🔮</span>
                                  <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Mirror of Truth</h4>
                              </div>
                              <p className="text-cyan-100 text-sm italic leading-relaxed">"{mirrorInsight}"</p>
                          </div>
                      )}

                      {/* Tools Bar */}
                      <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={handleConsultMirrorClick}
                            disabled={isConsultingMirror || !newContent.trim()}
                            className="flex-1 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-700 text-cyan-300 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                          >
                              {isConsultingMirror ? (
                                  <span className="animate-pulse">Analyzing...</span>
                              ) : (
                                  <><span>🔮</span> 咨询本我镜像</>
                              )}
                          </button>
                          
                          <div className="relative flex-1 min-w-[120px]">
                              <button 
                                onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                                className="w-full bg-transparent hover:bg-slate-700/20 border-none text-slate-400 text-xs py-2 rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                              >
                                  {isUploadingImage ? (
                                      <>
                                          <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                                          <span>上传中...</span>
                                      </>
                                  ) : (
                                      <>
                                          <span className="text-slate-500">+</span> <span>添加图片(或根据内容自动生成)</span>
                                      </>
                                  )}
                              </button>
                              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" disabled={isUploadingImage} />
                          </div>
                          
                          {/* 插件快捷入口 - 与日志功能融合 */}
                          {!isGuest && scenePlugins.length > 0 && (
                            <div className="flex gap-1 items-center">
                              <span className="text-xs text-slate-500">插件:</span>
                              {scenePlugins.slice(0, 3).map((plugin) => (
                                <button
                                  key={plugin.pluginInstanceId}
                                  onClick={() => {
                                    // TODO: 可以传递当前日志内容给插件
                                    showAlert(`打开插件: ${plugin.pluginName}`, '提示', 'info');
                                  }}
                                  className="px-2 py-1 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-700 text-indigo-300 text-xs rounded transition-colors"
                                  title={plugin.pluginName}
                                >
                                  {plugin.pluginName.length > 6 ? plugin.pluginName.substring(0, 6) + '...' : plugin.pluginName}
                                </button>
                              ))}
                              {scenePlugins.length > 3 && (
                                <button
                                  onClick={handleAddPlugin}
                                  className="px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs rounded transition-colors"
                                  title="查看更多插件"
                                >
                                  +{scenePlugins.length - 3}
                                </button>
                              )}
                            </div>
                          )}
                      </div>

                      {uploadedImageUrl && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                              <LazyImage 
                                  src={uploadedImageUrl} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                  variants={uploadedImageVariants}
                                  purpose="detail"
                              />
                              <button 
                                  onClick={() => {
                                      setUploadedImageUrl(undefined);
                                      setUploadedImageVariants(undefined);
                                  }} 
                                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors z-10"
                              >
                                  ×
                              </button>
                          </div>
                      )}
                      {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-700 flex justify-between items-center shrink-0">
                      <div className="flex gap-2">
                          {isEditing && (
                              <button 
                                onClick={(e) => { if(selectedEntry) handleDeleteClick(selectedEntry.id, e); }}
                                className="text-red-400 text-sm hover:underline px-2 py-1"
                              >
                                  删除
                              </button>
                          )}
                          <button 
                              onClick={() => setIsCreating(false)} 
                              className="px-3 py-1.5 text-slate-300 hover:text-white text-sm transition-colors"
                          >
                              取消
                          </button>
                          <button 
                              onClick={handleSave} 
                              disabled={isGeneratingImage || isSaving}
                              className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm rounded-lg hover:from-pink-500 hover:to-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              type="button"
                          >
                              {isGeneratingImage ? '生成配图中...' : isSaving ? '保存中...' : '保存'}
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
      
      {/* Note Sync Modal */}
      {showNoteSyncModal && (() => {
          const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
          logger.debug('[RealWorldScreen] 打开 NoteSyncModal');
          return (
              <NoteSyncModal
                  token={token}
                  onClose={() => {
                      logger.debug('[RealWorldScreen] 关闭 NoteSyncModal');
                      setShowNoteSyncModal(false);
                  }}
              />
          );
      })()}
      
      {/* 日记记忆查看模态框 */}
      {showMemoryModal && !isGuest && userName && (
          <JournalMemoryModal
              userId={(() => {
                  try {
                      // 方法1: 从gameState获取
                      if (gameState.userProfile && !gameState.userProfile.isGuest && gameState.userProfile.id) {
                          const profileId = gameState.userProfile.id;
                          if (typeof profileId === 'number') {
                              return profileId;
                          } else if (typeof profileId === 'string' && /^\d+$/.test(profileId)) {
                              return parseInt(profileId, 10);
                          }
                      }
                      
                      // 方法2: 从localStorage获取
                      const stored = localStorage.getItem('HEARTSPHERE_MEMORY_CORE_V1');
                      if (stored) {
                          const parsed = JSON.parse(stored);
                          const parsedUserId = parsed?.userProfile?.id;
                          if (parsedUserId) {
                              return typeof parsedUserId === 'number' ? parsedUserId : parseInt(String(parsedUserId), 10);
                          }
                      }
                      return 0;
                  } catch (e) {
                      logger.error('[RealWorldScreen] 获取用户ID失败', e);
                      return 0;
                  }
              })()}
              isOpen={showMemoryModal}
              onClose={() => setShowMemoryModal(false)}
          />
      )}

      {/* 插件选择器模态框 */}
      {showPluginSelector && !isGuest && (
        <PluginSelectorModal
          isOpen={showPluginSelector}
          onClose={() => setShowPluginSelector(false)}
          onSelect={handlePluginSelect}
          token={localStorage.getItem('auth_token') || undefined}
        />
      )}

      {/* 插件配置弹窗 */}
      {showPluginConfig && !isGuest && configPlugin && (
        <PluginConfigModal
          isOpen={showPluginConfig}
          onClose={() => {
            setShowPluginConfig(false);
            setConfigPlugin(null);
          }}
          plugin={configPlugin}
          sceneId={SCENE_ID}
          token={localStorage.getItem('auth_token') || undefined}
          onConfigUpdated={handleConfigUpdated}
        />
      )}

      {/* 相册模态框 */}
      {showPhotoAlbum && !isGuest && (
        <PhotoAlbumModal
          isOpen={showPhotoAlbum}
          onClose={() => setShowPhotoAlbum(false)}
          token={localStorage.getItem('auth_token') || undefined}
        />
      )}

      {/* 日志预览模态框 */}
      {showPreview && previewEntry && !isGuest && userName && (
          <JournalPreviewModal
              entry={previewEntry}
              isOpen={showPreview}
              onClose={() => {
                  setShowPreview(false);
                  setPreviewEntry(null);
              }}
              onEdit={(entry) => {
                  handleEditClick(entry);
                  setShowPreview(false);
                  setPreviewEntry(null);
              }}
              onDelete={(entryId) => {
                  handleDeleteJournalEntry(entryId);
                  setShowPreview(false);
                  setPreviewEntry(null);
              }}
              userId={(() => {
                  try {
                      // 方法1: 从gameState获取
                      if (gameState.userProfile && !gameState.userProfile.isGuest && gameState.userProfile.id) {
                          const profileId = gameState.userProfile.id;
                          if (typeof profileId === 'number') {
                              return profileId;
                          } else if (typeof profileId === 'string' && /^\d+$/.test(profileId)) {
                              return parseInt(profileId, 10);
                          }
                      }
                      
                      // 方法2: 从localStorage获取
                      const stored = localStorage.getItem('HEARTSPHERE_MEMORY_CORE_V1');
                      if (stored) {
                          const parsed = JSON.parse(stored);
                          const parsedUserId = parsed?.userProfile?.id;
                          if (parsedUserId) {
                              return typeof parsedUserId === 'number' ? parsedUserId : parseInt(String(parsedUserId), 10);
                          }
                      }
                      return 0;
                  } catch (e) {
                      logger.error('[RealWorldScreen] 获取用户ID失败', e);
                      return 0;
                  }
              })()}
          />
      )}
    </div>
    </>
  );
};
