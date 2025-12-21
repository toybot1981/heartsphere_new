
import React, { useState, useRef, useEffect, MouseEvent, ChangeEvent, KeyboardEvent } from 'react';
import { JournalEntry } from '../types';
import { Button } from './Button';
import { geminiService } from '../services/gemini';
import { imageApi, tokenStorage } from '../services/api';
import { getAllTemplates, JournalTemplate, getTemplateById } from '../utils/journalTemplates';
import { showAlert, showConfirm } from '../utils/dialog';
import { NoteSyncModal } from './NoteSyncModal';

interface RealWorldScreenProps {
  entries: JournalEntry[];
  onAddEntry: (title: string, content: string, imageUrl?: string, insight?: string, tags?: string) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
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
    entries, onAddEntry, onUpdateEntry, onDeleteEntry, onExplore, onChatWithCharacter, onBack, onConsultMirror, autoGenerateImage, worldStyle, userName, isGuest, showNoteSync = false
}) => {
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
  const [mirrorInsight, setMirrorInsight] = useState<string | null>(null);
  const [isConsultingMirror, setIsConsultingMirror] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Daily Greeting State
  const [dailyGreeting, setDailyGreeting] = useState<{greeting: string, question?: string, prompt?: string} | null>(null);
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Note Sync State
  const [showNoteSyncModal, setShowNoteSyncModal] = useState(false);
  const [syncButtonEnabled, setSyncButtonEnabled] = useState(showNoteSync); // 从props读取初始值
  
  // 当 showNoteSync prop 变化时，更新按钮显示状态
  useEffect(() => {
    setSyncButtonEnabled(showNoteSync);
    console.log('[RealWorldScreen] 笔记同步按钮显示状态更新:', showNoteSync);
  }, [showNoteSync]);
  
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
    setMirrorInsight(entry.insight || null);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: string, e: MouseEvent<HTMLButtonElement>): Promise<void> => {
      e.stopPropagation();
      const confirmed = await showConfirm('确定要删除这篇日记吗？', '删除日记', 'warning');
      if (confirmed) {
          onDeleteEntry(id);
          if (selectedEntry?.id === id) {
              setIsCreating(false);
              setSelectedEntry(null);
          }
      }
  };

  const handleSave = async (): Promise<void> => {
    console.log("=== [RealWorldScreen] 开始保存日志 ===");
    
    // 1. 记录保存开始时的状态
    console.log("[步骤1/6] 保存日志初始参数:", {
      timestamp: new Date().toISOString(),
      newTitle: newTitle.trim(),
      newContent: newContent.trim(),
      uploadedImageUrl: uploadedImageUrl ? "[存在图片URL]" : "无图片",
      autoGenerateImage: autoGenerateImage,
      isEditing: isEditing,
      hasSelectedEntry: !!selectedEntry,
      selectedEntryId: selectedEntry?.id,
      mirrorInsight: mirrorInsight ? "[存在镜像洞察]" : "无镜像洞察"
    });
    
    // 2. 表单验证分支
    console.log("[步骤2/6] 开始表单验证");
    if (!newContent.trim()) {
        console.error("[步骤2/6] 表单验证失败: 内容不能为空");
        showAlert("内容不能为空", "提示", "warning");
        console.log("=== [RealWorldScreen] 保存日志失败: 表单验证不通过 ===");
        return;
    }
    
    // 如果标题为空，使用日期作为默认值
    const getDateString = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const finalTitle = newTitle.trim() || getDateString();
    
    console.log("[步骤2/6] 表单验证通过，继续处理");
    console.log("[步骤2/6] 最终标题:", finalTitle);
    
    let finalImageUrl = uploadedImageUrl;

    // 3. 图片处理分支
    console.log("[步骤3/6] 检查图片状态");
    // 如果uploadedImageUrl是base64，先上传
    if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        console.log("[步骤3/6] 检测到base64图片，先上传到服务器");
        setIsGeneratingImage(true);
        try {
            const token = localStorage.getItem('auth_token');
            const result = await imageApi.uploadBase64Image(finalImageUrl, 'journal', token || undefined);
            if (result.success && result.url) {
                finalImageUrl = result.url;
                console.log("[步骤3/6] Base64图片上传成功:", finalImageUrl);
            } else {
                console.warn("[步骤3/6] Base64图片上传失败，使用base64");
            }
        } catch (error) {
            console.error("[步骤3/6] Base64图片上传异常:", error);
        } finally {
            setIsGeneratingImage(false);
        }
    }
    
    // 如果还没有图片且启用了自动生成
    if (!finalImageUrl && autoGenerateImage) {
        console.log("[步骤3/6] 开始自动生成图片");
        setIsGeneratingImage(true);
        try {
            console.log("[步骤3/6] 调用geminiService.generateMoodImage生成图片");
            const generated = await geminiService.generateMoodImage(newContent, worldStyle);
            console.log("[步骤3/6] 图片生成结果:", generated ? "[生成成功]" : "[生成失败]");
            if (generated) {
                // 如果生成的是base64，也上传
                if (generated.startsWith('data:')) {
                    const token = localStorage.getItem('auth_token');
                    const uploadResult = await imageApi.uploadBase64Image(generated, 'journal', token || undefined);
                    if (uploadResult.success && uploadResult.url) {
                        finalImageUrl = uploadResult.url;
                        console.log("[步骤3/6] 生成的base64图片上传成功");
                    } else {
                        finalImageUrl = generated;
                        console.log("[步骤3/6] 生成的base64图片上传失败，使用base64");
                    }
                } else {
                    finalImageUrl = generated;
                    console.log("[步骤3/6] 图片生成成功，使用生成的图片URL");
                }
            } else {
                console.log("[步骤3/6] 图片生成成功，但返回为空");
            }
        } catch (e: unknown) {
            console.error("[步骤3/6] 自动图片生成失败:", e);
        } finally {
            setIsGeneratingImage(false);
            console.log("[步骤3/6] 图片生成流程结束，最终imageUrl:", finalImageUrl ? "[存在图片URL]" : "无图片");
        }
    } else {
        console.log("[步骤3/6] 跳过图片生成，使用已上传图片或不使用图片");
    }

    // 4. 保存日志分支
    console.log("[步骤4/6] 开始保存日志到应用状态");
    if (isEditing && selectedEntry) {
        console.log("[步骤4/6] 进入编辑模式保存分支");
        console.log("[步骤4/6] 要更新的日志ID:", selectedEntry.id);
        
        const tagsString = newTags.length > 0 ? newTags.join(',') : undefined;
        const updatedEntry = {
            ...selectedEntry,
            title: finalTitle,
            content: newContent,
            imageUrl: finalImageUrl,
            insight: mirrorInsight || undefined,
            tags: tagsString
        };
        
        console.log("[步骤4/6] 准备更新的日志内容:", {
            id: updatedEntry.id,
            title: updatedEntry.title,
            contentLength: updatedEntry.content.length,
            hasImage: !!updatedEntry.imageUrl,
            hasInsight: !!updatedEntry.insight
        });
        
        console.log("[步骤4/6] 调用App.tsx中的onUpdateEntry方法");
        onUpdateEntry(updatedEntry);
        console.log("[步骤4/6] onUpdateEntry调用完成");
        
        // 5. 编辑模式下，关闭编辑框
        console.log("[步骤5/6] 开始清理表单状态（编辑模式：关闭编辑框）");
        setIsCreating(false);
        setIsEditing(false);
        setSelectedEntry(null);
        setNewTags([]);
        setTagInput('');
        console.log("[步骤5/6] 表单状态清理完成");
    } else {
        console.log("[步骤4/6] 进入新建模式保存分支");
        
        console.log("[步骤4/6] 准备创建的日志内容:", {
            title: finalTitle,
            contentLength: newContent.length,
            hasImage: !!finalImageUrl,
            hasInsight: !!mirrorInsight
        });
        
        console.log("[步骤4/6] 调用App.tsx中的onAddEntry方法");
        const tagsString = newTags.length > 0 ? newTags.join(',') : undefined;
        onAddEntry(finalTitle, newContent, finalImageUrl, mirrorInsight || undefined, tagsString);
        console.log("[步骤4/6] onAddEntry调用完成");
        
        // 5. 新建模式下，只清空表单内容，保持编辑框打开
        console.log("[步骤5/6] 开始清理表单状态（新建模式：保持编辑框打开）");
        setNewTitle('');
        setNewContent('');
        setNewTags([]);
        setTagInput('');
        setUploadedImageUrl(undefined);
        setMirrorInsight(null);
        // 保持 isCreating = true，不关闭编辑框
        setIsEditing(false);
        setSelectedEntry(null);
        console.log("[步骤5/6] 表单内容已清空，编辑框保持打开");
    }
    
    // 6. 保存完成
    console.log("[步骤6/6] 日志保存流程全部完成");
    console.log("=== [RealWorldScreen] 保存日志结束 ===");
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
        console.log('图片上传成功:', result.url);
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (err: any) {
      console.error('图片上传失败:', err);
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
              const greeting = await geminiService.generateDailyGreeting(recentEntries, userName);
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
              console.error("[RealWorldScreen] 生成每日问候异常（不应发生）:", error);
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
                  onClick={() => {
                      console.log('========== [RealWorldScreen] 点击笔记同步按钮 ==========');
                      console.log('[RealWorldScreen] isGuest prop:', isGuest);
                      console.log('[RealWorldScreen] userName prop:', userName);
                      
                      // 检查登录状态：优先检查是否为访客模式
                      if (isGuest) {
                          console.log('[RealWorldScreen] ❌ 检测到访客模式，阻止打开同步笔记');
                          showAlert('请先登录', '提示', 'warning');
                          return;
                      }
                      
                      // 检查 localStorage 和 sessionStorage 中的 token
                      const localStorageToken = localStorage.getItem('auth_token');
                      const sessionStorageToken = sessionStorage.getItem('auth_token');
                      
                      console.log('[RealWorldScreen] localStorage.getItem("auth_token"):', localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'null');
                      console.log('[RealWorldScreen] sessionStorage.getItem("auth_token"):', sessionStorageToken ? `${sessionStorageToken.substring(0, 20)}...` : 'null');
                      
                      // 检查所有 localStorage 和 sessionStorage 的键
                      console.log('[RealWorldScreen] localStorage 所有键:', Object.keys(localStorage));
                      console.log('[RealWorldScreen] sessionStorage 所有键:', Object.keys(sessionStorage));
                      
                      let token = localStorageToken || sessionStorageToken;
                      
                      // 如果用户已登录（非访客）但没有 token，尝试从 tokenStorage 工具中获取
                      if (!token) {
                          console.warn('[RealWorldScreen] ⚠️ 未在存储中找到 token，尝试从 tokenStorage 获取...');
                          try {
                              token = tokenStorage.getToken();
                              console.log('[RealWorldScreen] 从 tokenStorage.getToken() 获取到 token:', token ? `${token.substring(0, 20)}...` : 'null');
                          } catch (e) {
                              console.error('[RealWorldScreen] ❌ 无法从 tokenStorage 获取 token:', e);
                          }
                      }
                      
                      // 如果仍然没有 token，但用户已登录，允许打开模态框（让模态框内部处理 token 缺失）
                      if (!token) {
                          console.error('[RealWorldScreen] ❌❌❌ 未找到 token，但用户已登录（isGuest=false）');
                          console.error('[RealWorldScreen] 这可能是因为：');
                          console.error('[RealWorldScreen] 1. token 被清除或过期');
                          console.error('[RealWorldScreen] 2. token 未正确保存到 localStorage');
                          console.error('[RealWorldScreen] 3. 浏览器隐私模式或存储被禁用');
                          console.error('[RealWorldScreen] 允许打开同步笔记模态框，让模态框内部处理 token 缺失的情况');
                          // 不阻止，让 NoteSyncModal 内部处理 token 缺失的情况
                      } else {
                          console.log('[RealWorldScreen] ✅ 找到 token，准备打开同步笔记模态框');
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
              {/* New Record Button */}
              <Button onClick={handleCreateClick} className="bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-purple-900/20">
                  + 新记录
              </Button>
          </div>
      </div>
      
      {/* Tag Filter Pills - Below Header */}
      {getAllTags().length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
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

      {/* Hero Section: DAILY RESONANCE */}
      {dailyGreeting && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-indigo-500/20 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
              <div className="relative z-10 flex justify-between items-start">
                  <div>
                      {/* 顶部标签与呼吸点 */}
                      <div className="flex items-center gap-2 mb-2 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                          Daily Resonance
                      </div>
                      
                      {/* 问候语 */}
                      <h2 className="text-lg font-bold text-white/90 mb-1">
                          {dailyGreeting.greeting || "你好，旅人。"}
                      </h2>
                      
                      {/* 引导问题 */}
                      <p className="text-indigo-200/70 text-sm italic">
                          "{dailyGreeting.prompt || dailyGreeting.question || "今天的风带给你什么感觉？"}"
                      </p>
                  </div>
                  
                  {/* 回应按钮 */}
                  <button 
                    onClick={handleGreetingQuestionClick}
                    className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white p-2 rounded-lg transition-all"
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
      <div className="flex-1 flex gap-8 overflow-hidden">
          
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
                            onClick={(event: MouseEvent<HTMLDivElement>) => handleEditClick(entry, event)}
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
              <div className="w-full md:w-[450px] bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col shadow-2xl animate-fade-in shrink-0">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white text-xl">&times;</button>
                          <h2 className="text-lg font-bold text-white">{isEditing ? '编辑日记' : '新思维'}</h2>
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
                      </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
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
                          className="w-full flex-1 min-h-[200px] bg-slate-900/30 border border-slate-600/50 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 outline-none resize-none leading-relaxed text-sm"
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
                      <div className="flex gap-2">
                          <button 
                            onClick={handleConsultMirrorClick}
                            disabled={isConsultingMirror || !newContent.trim()}
                            className="flex-1 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-700 text-cyan-300 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                              {isConsultingMirror ? (
                                  <span className="animate-pulse">Analyzing...</span>
                              ) : (
                                  <><span>🔮</span> 咨询本我镜像</>
                              )}
                          </button>
                          
                          <div className="relative flex-1">
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
                      </div>

                      {uploadedImageUrl && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                              <img src={uploadedImageUrl} className="w-full h-full object-cover" alt="Preview" />
                              <button 
                                  onClick={() => setUploadedImageUrl(undefined)} 
                                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                              >
                                  ×
                              </button>
                          </div>
                      )}
                      {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>本我镜像</span>
                      </div>
                      <div className="flex gap-3">
                          {isEditing && (
                              <button 
                                onClick={(e) => { if(selectedEntry) handleDeleteClick(selectedEntry.id, e); }}
                                className="text-red-400 text-sm hover:underline"
                              >
                                  删除
                              </button>
                          )}
                          <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-slate-300">取消</Button>
                          <Button onClick={handleSave} disabled={isGeneratingImage} className="bg-gradient-to-r from-pink-600 to-purple-600">
                              {isGeneratingImage ? '生成配图中...' : '保存'}
                          </Button>
                      </div>
                  </div>
              </div>
          )}
      </div>
      
      {/* Note Sync Modal */}
      {showNoteSyncModal && (() => {
          const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
          console.log('[RealWorldScreen] 打开 NoteSyncModal，token:', token ? `${token.substring(0, 20)}...` : 'empty');
          return (
              <NoteSyncModal
                  token={token}
                  onClose={() => {
                      console.log('[RealWorldScreen] 关闭 NoteSyncModal');
                      setShowNoteSyncModal(false);
                  }}
              />
          );
      })()}
    </div>
    </>
  );
};
