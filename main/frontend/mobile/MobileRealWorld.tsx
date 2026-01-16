import React, { useState, useEffect, KeyboardEvent } from 'react';
import { JournalEntry } from '../types';
import { MobileTouchableButton } from './components/MobileTouchableButton';
import { aiService } from '../services/ai';
import { getAllTemplates, JournalTemplate, getTemplateById } from '../utils/journalTemplates';

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

export const MobileRealWorld: React.FC<MobileRealWorldProps> = ({ 
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
  
  // Load daily greeting on mount and when entries change
  useEffect(() => {
      const loadDailyGreeting = async () => {
          setIsLoadingGreeting(true);
          try {
              const recentEntries = entries.slice(-3);
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
              console.error("[MobileRealWorld] 生成每日问候失败:", error);
              // 使用默认问候
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
                          const { imageApi } = await import('../services/api');
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
                              const { imageApi } = await import('../services/api');
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
          <div className="h-full bg-slate-950 p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-24 overflow-y-auto overscroll-behavior-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <div className="flex items-center gap-3">
                          <h1 className="text-3xl font-bold text-white">日记</h1>
                          <button 
                            onClick={onSwitchToPC}
                            className="bg-slate-800 active:bg-slate-700 text-slate-300 active:text-white px-3 py-2 rounded-full text-xs border border-slate-700 transition-all active:scale-95 touch-manipulation min-h-[44px] flex items-center gap-1"
                          >
                             <span>💻</span> PC端
                          </button>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">记录你的现实瞬间</p>
                  </div>
                  <button 
                    onClick={startNew} 
                    className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-lg font-bold text-2xl active:scale-90 transition-transform touch-manipulation"
                    aria-label="新建日记"
                  >
                    +
                  </button>
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
                          <button
                              key={tag}
                              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                              className={`px-3 py-2 rounded-full text-xs font-medium transition-all min-h-[44px] active:scale-95 touch-manipulation ${
                                  selectedTag === tag
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-800 text-slate-300 active:bg-slate-700'
                              }`}
                          >
                              {tag}
                          </button>
                      ))}
                  </div>
              )}

              {/* Daily Greeting */}
              {dailyGreeting && (
                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-indigo-500/20 w-full overflow-visible">
                      <div className="flex items-center gap-2 mb-2 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                          Daily Resonance
                      </div>
                      <h2 className="text-base font-bold text-white/90 mb-2 break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {dailyGreeting.greeting || "你好，旅人。"}
                      </h2>
                      <div className="flex flex-row items-start justify-between gap-2">
                          <p className="text-sm text-indigo-200/70 italic flex-1 min-w-0 break-words whitespace-normal pr-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: 'calc(100% - 50px)' }}>
                              "{dailyGreeting.prompt || dailyGreeting.question || "今天的风带给你什么感觉？"}"
                          </p>
                          <button 
                            onClick={handleGreetingQuestionClick}
                            className="bg-indigo-600/20 active:bg-indigo-600 text-indigo-300 active:text-white min-w-[44px] min-h-[44px] p-2 rounded-lg transition-all active:scale-95 touch-manipulation flex items-center justify-center flex-shrink-0"
                            title="回应"
                            aria-label="回应问候"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                          </button>
                      </div>
                  </div>
              )}

              <div className="space-y-4">
                  {filteredEntries.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 px-4 mt-10">
                          <div className="text-6xl mb-4 opacity-50">
                              {searchQuery || selectedTag ? '🔍' : '📝'}
                          </div>
                          <p className="text-center text-slate-400 text-base mb-4">
                              {searchQuery || selectedTag ? '没有找到匹配的日记' : '还没有日记，写一篇吧。'}
                          </p>
                          {!searchQuery && !selectedTag && (
                              <button
                                  onClick={startNew}
                                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl active:scale-95 transition-transform touch-manipulation"
                              >
                                  开始记录
                              </button>
                          )}
                      </div>
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
                          {entry.imageUrl && <div className="mt-3 h-24 w-full rounded-lg bg-cover bg-center opacity-80" style={{backgroundImage: `url(${entry.imageUrl})`}} />}
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  // --- DETAIL VIEW ---
  if (view === 'detail' && selectedEntry) {
      return (
          <div className="h-full bg-slate-950 flex flex-col pb-24">
              <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-10">
                  <button 
                    onClick={() => setView('list')} 
                    className="text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
                    aria-label="返回"
                  >
                    &larr;
                  </button>
                  <h2 className="text-white font-bold truncate flex-1">{selectedEntry.title}</h2>
                  <button 
                    onClick={startEdit} 
                    className="text-indigo-400 text-sm min-w-[44px] min-h-[44px] px-3 active:scale-95 transition-transform touch-manipulation"
                  >
                    编辑
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 overscroll-behavior-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {selectedEntry.imageUrl && (
                      <img src={selectedEntry.imageUrl} className="w-full rounded-xl mb-6 shadow-lg" alt="Mind Projection" />
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
                        variant="primary" 
                        size="lg" 
                        fullWidth 
                        onClick={() => onExplore(selectedEntry)} 
                        className="mb-4"
                      >
                        带着问题进入心域
                      </MobileTouchableButton>
                      <button 
                        onClick={() => { 
                          if (confirm('确定要删除这篇日记吗？')) {
                            onDeleteEntry(selectedEntry.id); 
                            setView('list');
                          }
                        }} 
                        className="w-full text-center text-red-400 text-sm py-3 min-h-[44px] active:scale-95 transition-transform touch-manipulation rounded-lg active:bg-red-500/10"
                      >
                        删除日记
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- EDIT VIEW ---
  return (
      <div className="h-full bg-slate-950 flex flex-col pb-20">
           <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-10">
                <button 
                  onClick={() => setView(selectedEntry ? 'detail' : 'list')} 
                  className="text-slate-400 min-w-[44px] min-h-[44px] px-3 active:scale-95 transition-transform touch-manipulation"
                >
                  取消
                </button>
                <h2 className="text-white font-bold">{selectedEntry ? '编辑' : '新建'}</h2>
                <button 
                  onClick={handleSave} 
                  disabled={isGenerating} 
                  className="text-pink-500 font-bold disabled:opacity-50 min-w-[44px] min-h-[44px] px-3 active:scale-95 transition-transform touch-manipulation disabled:active:scale-100"
                >
                    {isGenerating ? '保存中...' : '保存'}
                </button>
           </div>
           <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto overscroll-behavior-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
               {/* 模板选择 */}
               <div className="flex items-center gap-2 mb-2">
                   <button
                       onClick={() => setShowTemplates(!showTemplates)}
                       className="text-xs flex items-center gap-1 text-indigo-400 border border-indigo-800 rounded-full px-3 py-2 bg-indigo-900/10 min-h-[44px] active:scale-95 transition-transform touch-manipulation"
                   >
                       <span>📝</span> 模板
                   </button>
               </div>
               
               {showTemplates && (
                   <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 mb-2">
                       <div className="text-xs text-slate-400 mb-2 font-bold">选择模板</div>
                       <div className="grid grid-cols-2 gap-2">
                           {getAllTemplates().slice(0, 4).map(template => (
                               <button
                                   key={template.id}
                                   onClick={() => applyTemplate(template.id)}
                                   className="p-3 bg-slate-800 active:bg-slate-700 rounded-lg text-left transition-all active:scale-95 touch-manipulation min-h-[80px]"
                               >
                                   <div className="text-xs font-bold text-white mb-1">{template.icon} {template.name}</div>
                                   <div className="text-[10px] text-slate-400">{template.description}</div>
                               </button>
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
                   <button 
                     onClick={handleMirror} 
                     className="text-xs flex items-center gap-1 text-cyan-400 border border-cyan-800 rounded-full px-3 py-2 bg-cyan-900/10 min-h-[44px] active:scale-95 transition-transform touch-manipulation"
                     disabled={!content.trim()}
                   >
                       <span>🔮</span> 本我镜像分析
                   </button>
               </div>
           </div>
      </div>
  );
};