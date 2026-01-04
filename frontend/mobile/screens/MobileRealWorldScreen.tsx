import React, { useState, useEffect, KeyboardEvent, memo } from 'react';
import { JournalEntry } from '../../types';
import { aiService } from '../../services/ai';
import { getAllTemplates, JournalTemplate, getTemplateById } from '../../utils/journalTemplates';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';
import { MobileLazyImage } from '../components/MobileLazyImage';
import { MobileLazyBackgroundImage } from '../components/MobileLazyBackgroundImage';
import { showConfirm } from '../../utils/dialog';

interface MobileRealWorldProps {
  entries: JournalEntry[];
  onAddEntry: (title: string, content: string, imageUrl?: string, insight?: string, tags?: string) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onExplore: (entry: JournalEntry) => void;
  onConsultMirror: (content: string, recentContext: string[]) => Promise<string | null>;
  autoGenerateImage: boolean;
  onSwitchToPC: () => void;
  userName?: string;
}

/**
 * Mobile版本现实世界/日记页面组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileRealWorld: React.FC<MobileRealWorldProps> = memo(({ 
    entries, onAddEntry, onUpdateEntry, onDeleteEntry, onExplore, onConsultMirror, autoGenerateImage, onSwitchToPC, userName 
}) => {
  const [view, setView] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  // Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]); // 标签数组
  const [tagInput, setTagInput] = useState(''); // 标签输入框
  const [isGenerating, setIsGenerating] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  
  // Daily Greeting State
  const [dailyGreeting, setDailyGreeting] = useState<{greeting: string, question?: string, prompt?: string} | null>(null);
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const startNew = () => {
      setSelectedEntry(null);
      setTitle('');
      setContent('');
      setNewTags([]);
      setTagInput('');
      setInsight(null);
      setView('edit');
  };

  const openEntry = (entry: JournalEntry) => {
      setSelectedEntry(entry);
      setTitle(entry.title);
      setContent(entry.content);
      setNewTags(entry.tags ? entry.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
      setTagInput('');
      setInsight(entry.insight || null);
      setView('detail');
  };

  const startEdit = () => {
      setView('edit');
  };
  
  // Load daily greeting on mount and when entries change（内存管理优化：添加取消机制）
  useEffect(() => {
      let isCancelled = false; // 内存管理优化：标记是否已取消
      
      const loadDailyGreeting = async () => {
          setIsLoadingGreeting(true);
          try {
              console.log("[MobileRealWorld] 开始生成每日问候");
              const recentEntries = entries.slice(-3);
              const greeting = await aiService.generateDailyGreeting(recentEntries, userName);
              
              // 内存管理优化：检查是否已取消，避免在组件卸载后更新状态
              if (!isCancelled && greeting) {
                  setDailyGreeting(greeting);
                  console.log("[MobileRealWorld] 每日问候生成成功");
              }
          } catch (error) {
              console.error("[MobileRealWorld] 生成每日问候失败:", error);
              
              // 内存管理优化：检查是否已取消
              if (!isCancelled) {
                  // 使用默认问候
                  setDailyGreeting({
                      greeting: entries.length === 0 
                          ? '欢迎来到现实记录。这里是你的内心世界，记录下每一个真实的瞬间。'
                          : '你好，我注意到你最近记录了一些想法。继续探索你的内心世界吧。',
                      question: entries.length === 0
                          ? '今天有什么让你印象深刻的事吗？'
                          : '今天想记录些什么新的想法呢？'
                  });
              }
          } finally {
              // 内存管理优化：检查是否已取消
              if (!isCancelled) {
                  setIsLoadingGreeting(false);
              }
          }
      };

      loadDailyGreeting();
      
      // 内存管理优化：清理函数，标记为已取消
      return () => {
          isCancelled = true;
      };
  }, [entries.length, userName]); // 只在条目数量变化时重新生成
  
  // Handle clicking on greeting question to fill editor
  const handleGreetingQuestionClick = () => {
      if (!dailyGreeting) return;
      const questionText = dailyGreeting.prompt || dailyGreeting.question || '';
      setContent(questionText);
      if (view !== 'edit') {
          setView('edit');
          setSelectedEntry(null);
          setTitle('');
          setNewTags([]);
          setTagInput('');
          setInsight(null);
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
      setTitle(template.title);
      setContent(template.content);
      setNewTags(template.tags.split(',').map(t => t.trim()).filter(Boolean));
      setShowTemplates(false);
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

  const handleSave = async () => {
      if (!title.trim() || !content.trim()) return;

      if (selectedEntry && view === 'edit' && selectedEntry.id) {
          // Update
          const tagsString = newTags.length > 0 ? newTags.join(',') : undefined;
          const updated = { ...selectedEntry, title, content, insight: insight || undefined, tags: tagsString };
          onUpdateEntry(updated);
          setSelectedEntry(updated);
          setView('detail');
      } else {
          // Create
          let img = undefined;
          if (autoGenerateImage && content.trim()) {
              setIsGenerating(true);
              try {
                  const generated = await aiService.generateMoodImage(content);
                  if (generated) {
                      // 如果生成的是base64，直接上传
                      if (generated.startsWith('data:')) {
                          const { imageApi } = await import('../../services/api');
                          const token = localStorage.getItem('auth_token');
                          const uploadResult = await imageApi.uploadBase64Image(generated, 'journal', token || undefined);
                          if (uploadResult.success && uploadResult.url) {
                              img = uploadResult.url;
                          } else {
                              img = generated;
                          }
                      } else {
                          // 如果生成的是外部URL，通过后端代理下载并上传
                          try {
                              const { imageApi } = await import('../../services/api');
                              const proxyResult = await imageApi.proxyDownload(generated);
                              if (proxyResult.success && proxyResult.dataUrl) {
                                  // 将 data URL 转换为 blob
                                  const response = await fetch(proxyResult.dataUrl);
                                  const blob = await response.blob();
                                  const file = new File([blob], `journal-image-${Date.now()}.png`, { type: blob.type || 'image/png' });
                                  
                                  const token = localStorage.getItem('auth_token');
                                  const uploadResult = await imageApi.uploadImage(file, 'journal', token || undefined);
                                  
                                  if (uploadResult.success && uploadResult.url) {
                                      img = uploadResult.url;
                                  } else {
                                      img = generated;
                                  }
                              } else {
                                  img = generated;
                              }
                          } catch (proxyError) {
                              console.error('[MobileRealWorld] 代理下载失败:', proxyError);
                              img = generated;
                          }
                      }
                  }
              } catch(e) {
                  console.error('[MobileRealWorld] 生成图片失败:', e);
              }
              setIsGenerating(false);
          }
          const tagsString = newTags.length > 0 ? newTags.join(',') : undefined;
          onAddEntry(title, content, img, insight || undefined, tagsString);
          setView('list');
      }
  };

  const handleMirror = async () => {
    if (!content.trim()) return;
    const recent = entries.slice(0, 3).map(e => e.content);
    const res = await onConsultMirror(content, recent);
    if (res) setInsight(res);
  };

  // --- LIST VIEW ---
  if (view === 'list') {
      return (
          <div className="h-full bg-slate-950 flex flex-col">
              <MobileSmoothScroll className="flex-1 p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-24">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <div className="flex items-center gap-3">
                          <h1 className="text-3xl font-bold text-white">日记</h1>
                          <MobileTouchableButton
                            onClick={onSwitchToPC}
                            variant="secondary"
                            size="sm"
                            className="bg-slate-800 border border-slate-700"
                          >
                            <span>💻</span> PC端
                          </MobileTouchableButton>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">记录你的现实瞬间</p>
                  </div>
                  <MobileTouchableButton
                    onClick={startNew}
                    variant="primary"
                    size="lg"
                    className="min-w-[48px] w-12 h-12 rounded-full shadow-lg font-bold text-2xl"
                    aria-label="新建日记"
                  >
                    +
                  </MobileTouchableButton>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="检索记忆/#标签"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-base min-h-[44px]"
                      autoComplete="off"
                      inputMode="search"
                  />
              </div>

              {/* Tag Filter Pills */}
              {getAllTags().length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                      {getAllTags().map(tag => (
                          <MobileTouchableButton
                              key={tag}
                              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                              variant={selectedTag === tag ? 'primary' : 'secondary'}
                              size="sm"
                              className={`rounded-full text-xs font-medium ${selectedTag === tag ? 'bg-indigo-600' : 'bg-slate-800 text-slate-300'}`}
                          >
                              {tag}
                          </MobileTouchableButton>
                      ))}
                  </div>
              )}

              {/* Daily Greeting */}
              {dailyGreeting && (
                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-indigo-500/20">
                      <div className="flex items-center gap-2 mb-2 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                          Daily Resonance
                      </div>
                      <h2 className="text-base font-bold text-white/90 mb-1">
                          {dailyGreeting.greeting || "你好，旅人。"}
                      </h2>
                      <div className="flex items-center justify-between">
                          <p className="text-indigo-200/70 text-sm italic flex-1">
                              "{dailyGreeting.prompt || dailyGreeting.question || "今天的风带给你什么感觉？"}"
                          </p>
                          <MobileTouchableButton
                            onClick={handleGreetingQuestionClick}
                            variant="ghost"
                            size="md"
                            className="bg-indigo-600/20 text-indigo-300 ml-2"
                            title="回应"
                            aria-label="回应问候"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                          </MobileTouchableButton>
                      </div>
                  </div>
              )}

              <div className="space-y-4">
                  {filteredEntries.length === 0 && (
                      <MobileEmptyState
                          icon={searchQuery || selectedTag ? '🔍' : '📝'}
                          title={searchQuery || selectedTag ? '没有找到匹配的日记' : '还没有日记，写一篇吧。'}
                          action={!searchQuery && !selectedTag ? {
                              label: '开始记录',
                              onClick: startNew
                          } : undefined}
                      />
                  )}
                  {filteredEntries.sort((a,b) => b.timestamp - a.timestamp).map(entry => (
                      <div 
                        key={entry.id} 
                        onClick={() => openEntry(entry)} 
                        className="bg-slate-900 rounded-xl p-4 border border-slate-800 active:bg-slate-800 active:scale-[0.98] transition-transform touch-manipulation cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                openEntry(entry);
                            }
                        }}
                      >
                          <div className="flex justify-between items-start mb-2">
                              <h3 className="text-white font-bold truncate flex-1">{entry.title}</h3>
                              <span className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-400 text-sm line-clamp-2">{entry.content}</p>
                          {entry.tags && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                  {entry.tags.split(',').map((tag, idx) => {
                                      const trimmedTag = tag.trim();
                                      if (!trimmedTag) return null;
                                      return (
                                          <span
                                              key={idx}
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedTag(trimmedTag);
                                              }}
                                              className="text-[10px] px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded-full border border-indigo-500/30"
                                          >
                                              {trimmedTag}
                                          </span>
                                      );
                                  })}
                              </div>
                          )}
                          {/* Phase 5: CSS背景图片优化 - 使用MobileLazyBackgroundImage替代backgroundImage */}
                          {entry.imageUrl && (
                              <MobileLazyBackgroundImage
                                  imageUrl={entry.imageUrl}
                                  className="mt-3 h-24 w-full rounded-lg opacity-80"
                                  displayWidth={400}
                                  purpose="small"
                                  placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 100'%3E%3Crect fill='%23111' width='400' height='100'/%3E%3Ctext fill='%23666' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E加载中...%3C/text%3E%3C/svg%3E"
                              />
                          )}
                      </div>
                  ))}
              </div>
              </MobileSmoothScroll>
          </div>
      );
  }

  // --- DETAIL VIEW ---
  if (view === 'detail' && selectedEntry) {
      return (
          <div className="h-full bg-slate-950 flex flex-col pb-24">
              <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-10">
                  <MobileTouchableButton
                    onClick={() => setView('list')}
                    variant="ghost"
                    size="md"
                    className="text-slate-400"
                    aria-label="返回"
                  >
                    &larr;
                  </MobileTouchableButton>
                  <h2 className="text-white font-bold truncate flex-1">{selectedEntry.title}</h2>
                  <MobileTouchableButton
                    onClick={startEdit}
                    variant="ghost"
                    size="sm"
                    className="text-indigo-400"
                  >
                    编辑
                  </MobileTouchableButton>
              </div>
              <MobileSmoothScroll className="flex-1 p-4">
                  {selectedEntry.imageUrl && (
                      <MobileLazyImage src={selectedEntry.imageUrl} alt="Mind Projection" className="w-full rounded-xl mb-6 shadow-lg" />
                  )}
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                  
                  {selectedEntry.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                          {selectedEntry.tags.split(',').map((tag, idx) => {
                              const trimmedTag = tag.trim();
                              if (!trimmedTag) return null;
                              return (
                                  <span
                                      key={idx}
                                      onClick={() => {
                                          setSelectedTag(trimmedTag);
                                          setView('list');
                                      }}
                                      className="text-xs px-3 py-2 bg-indigo-600/20 text-indigo-300 rounded-full border border-indigo-500/30 min-h-[44px] active:scale-95 transition-transform touch-manipulation"
                                  >
                                      {trimmedTag}
                                  </span>
                              );
                          })}
                      </div>
                  )}
                  
                  {selectedEntry.insight && (
                      <div className="mt-6 p-4 bg-cyan-900/20 border-l-2 border-cyan-500 rounded-r-lg">
                          <p className="text-xs text-cyan-400 font-bold uppercase mb-1">Mirror of Truth</p>
                          <p className="text-cyan-100 text-sm italic">"{selectedEntry.insight}"</p>
                      </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-slate-800">
                      <MobileTouchableButton
                          onClick={() => onExplore(selectedEntry)}
                          variant="primary"
                          size="lg"
                          fullWidth
                          className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600"
                      >
                          带着问题进入心域
                      </MobileTouchableButton>
                      <MobileTouchableButton
                          onClick={async () => {
                              const confirmed = await showConfirm('确定要删除这篇日记吗？', '删除日记', 'warning');
                              if (confirmed) {
                                  onDeleteEntry(selectedEntry.id);
                                  setView('list');
                              }
                          }}
                          variant="danger"
                          size="md"
                          fullWidth
                      >
                        删除日记
                      </MobileTouchableButton>
                  </div>
              </MobileSmoothScroll>
          </div>
      );
  }

  // --- EDIT VIEW ---
  return (
      <div className="h-full bg-slate-950 flex flex-col pb-20">
           <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-10">
                <MobileTouchableButton
                  onClick={() => setView(selectedEntry ? 'detail' : 'list')}
                  variant="ghost"
                  size="md"
                >
                  取消
                </MobileTouchableButton>
                <h2 className="text-white font-bold">{selectedEntry ? '编辑' : '新建'}</h2>
                <MobileTouchableButton
                  onClick={handleSave}
                  disabled={isGenerating}
                  loading={isGenerating}
                  variant="ghost"
                  size="md"
                  className="text-pink-500"
                >
                  {isGenerating ? '保存中...' : '保存'}
                </MobileTouchableButton>
           </div>
           <MobileSmoothScroll className="flex-1 p-4 flex flex-col gap-4">
               {/* 模板选择 */}
               <div className="flex items-center gap-2 mb-2">
                   <MobileTouchableButton
                       onClick={() => setShowTemplates(!showTemplates)}
                       variant="outline"
                       size="sm"
                       className="text-xs text-indigo-400 border-indigo-800 bg-indigo-900/10"
                   >
                       <span>📝</span> 模板
                   </MobileTouchableButton>
               </div>
               
               {showTemplates && (
                   <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 mb-2">
                       <div className="text-xs text-slate-400 mb-2 font-bold">选择模板</div>
                       <div className="grid grid-cols-2 gap-2">
                           {getAllTemplates().slice(0, 4).map(template => (
                               <MobileTouchableButton
                                   key={template.id}
                                   onClick={() => applyTemplate(template.id)}
                                   variant="secondary"
                                   size="md"
                                   className="p-3 text-left min-h-[80px] justify-start"
                               >
                                   <div className="text-xs font-bold text-white mb-1">{template.icon} {template.name}</div>
                                   <div className="text-[10px] text-slate-400">{template.description}</div>
                               </MobileTouchableButton>
                           ))}
                       </div>
                   </div>
               )}
               
               <input 
                 value={title} 
                 onChange={e => setTitle(e.target.value)} 
                 placeholder="标题..." 
                 className="bg-transparent text-xl font-bold text-white placeholder-slate-600 outline-none min-h-[44px] px-2" 
                 autoFocus={!selectedEntry}
                 inputMode="text"
               />
               <textarea 
                 value={content} 
                 onChange={e => setContent(e.target.value)} 
                 placeholder="写下你的想法..." 
                 className="flex-1 bg-transparent text-slate-300 placeholder-slate-600 outline-none resize-none leading-relaxed min-h-[300px] px-2 text-base" 
                 inputMode="text"
               />
               
               {/* Tags Section */}
               <div className="space-y-2">
                   <div className="text-xs text-slate-400 font-bold">标签</div>
                   {newTags.length > 0 && (
                       <div className="flex flex-wrap gap-2 mb-2">
                           {newTags.map((tag, idx) => (
                               <span
                                   key={idx}
                                   className="text-xs px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded-full border border-indigo-500/30 flex items-center gap-1"
                               >
                                   {tag}
                                   <button
                                       onClick={() => removeTag(tag)}
                                       className="text-indigo-400 active:text-white min-w-[20px] min-h-[20px] flex items-center justify-center active:scale-110 transition-transform touch-manipulation"
                                       aria-label="删除标签"
                                   >
                                       ×
                                   </button>
                               </span>
                           ))}
                       </div>
                   )}
                   <input
                       type="text"
                       value={tagInput}
                       onChange={(e) => setTagInput(e.target.value)}
                       onKeyDown={handleTagInputKeyDown}
                       placeholder="添加标签(Enter)..."
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-base text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[44px]"
                       inputMode="text"
                   />
               </div>
               
               {insight && (
                   <div className="p-3 bg-cyan-900/20 rounded border border-cyan-900 text-cyan-200 text-xs">
                       {insight}
                   </div>
               )}

               <div className="flex justify-end gap-2">
                   <MobileTouchableButton
                     onClick={handleMirror}
                     variant="outline"
                     size="sm"
                     className="text-xs text-cyan-400 border-cyan-800 bg-cyan-900/10"
                     disabled={!content.trim()}
                   >
                       <span>🔮</span> 本我镜像分析
                   </MobileTouchableButton>
               </div>
           </MobileSmoothScroll>
        </div>
    );
});

MobileRealWorld.displayName = 'MobileRealWorld';