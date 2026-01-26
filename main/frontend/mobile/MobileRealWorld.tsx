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
          <div 
            className="h-full p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-24 overflow-y-auto overscroll-behavior-contain" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              backgroundColor: 'var(--bg-primary-dark, #020617)',
            }}
          >
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <div className="flex items-center gap-3">
                          <h1 
                            className="text-3xl font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            日记
                          </h1>
                          <button 
                            onClick={onSwitchToPC}
                            className="px-3 py-2 rounded-full text-xs border transition-all active:scale-95 touch-manipulation min-h-[44px] flex items-center gap-1"
                            style={{
                              backgroundColor: 'var(--bg-secondary-alpha)',
                              color: 'var(--text-primary)',
                              borderColor: 'var(--border-color-overlay)',
                            }}
                            onMouseDown={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseUp={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                          >
                             <span>💻</span> PC端
                          </button>
                      </div>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        记录你的现实瞬间
                      </p>
                  </div>
                  <button 
                    onClick={startNew} 
                    className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-full flex items-center justify-center shadow-lg font-bold text-2xl active:scale-90 transition-transform touch-manipulation"
                    style={{
                      background: 'var(--gradient-primary-button, linear-gradient(to right, var(--color-pink, #db2777), var(--color-primary, #9333ea)))',
                      color: 'var(--text-primary)',
                    }}
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
                      className="w-full rounded-lg px-4 py-3 focus:ring-2 outline-none text-base min-h-[44px]"
                      style={{
                        backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 1))',
                        borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                        color: 'var(--text-primary)',
                        '--placeholder-color': 'var(--text-disabled)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-info, #6366f1)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-info-alpha, rgba(99, 102, 241, 0.2))';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(51, 65, 85, 1))';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
                              className="px-3 py-2 rounded-full text-xs font-medium transition-all min-h-[44px] active:scale-95 touch-manipulation"
                              style={{
                                backgroundColor: selectedTag === tag
                                  ? 'var(--color-info, #6366f1)'
                                  : 'var(--bg-card, rgba(30, 41, 59, 1))',
                                color: selectedTag === tag
                                  ? 'var(--text-primary)'
                                  : 'var(--text-secondary)',
                              }}
                              onMouseDown={(e) => {
                                if (selectedTag !== tag) {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 1))';
                                }
                              }}
                              onMouseUp={(e) => {
                                if (selectedTag !== tag) {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(30, 41, 59, 1))';
                                }
                              }}
                          >
                              {tag}
                          </button>
                      ))}
                  </div>
              )}

              {/* Daily Greeting */}
              {dailyGreeting && (
                  <div 
                    className="mb-4 p-4 rounded-xl border w-full overflow-visible"
                    style={{
                      background: 'linear-gradient(to right, var(--bg-card, rgba(15, 23, 42, 1)), var(--bg-info-alpha, rgba(30, 58, 138, 0.3)))',
                      borderColor: 'var(--border-info-alpha, rgba(99, 102, 241, 0.2))',
                    }}
                  >
                      <div 
                        className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--color-info, #818cf8)' }}
                      >
                          <span 
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: 'var(--color-info, #818cf8)' }}
                          />
                          Daily Resonance
                      </div>
                      <h2 
                        className="text-base font-bold mb-2 break-words whitespace-normal" 
                        style={{ 
                          wordBreak: 'break-word', 
                          overflowWrap: 'break-word',
                          color: 'var(--text-primary, rgba(255, 255, 255, 0.9))',
                        }}
                      >
                          {dailyGreeting.greeting || "你好，旅人。"}
                      </h2>
                      <div className="flex flex-row items-start justify-between gap-2">
                          <p 
                            className="text-sm italic flex-1 min-w-0 break-words whitespace-normal pr-2" 
                            style={{ 
                              wordBreak: 'break-word', 
                              overflowWrap: 'break-word', 
                              maxWidth: 'calc(100% - 50px)',
                              color: 'var(--text-info-light, rgba(191, 219, 254, 0.7))',
                            }}
                          >
                              "{dailyGreeting.prompt || dailyGreeting.question || "今天的风带给你什么感觉？"}"
                          </p>
                          <button 
                            onClick={handleGreetingQuestionClick}
                            className="min-w-[44px] min-h-[44px] p-2 rounded-lg transition-all active:scale-95 touch-manipulation flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: 'var(--bg-info-alpha, rgba(99, 102, 241, 0.2))',
                              color: 'var(--text-info, #a5b4fc)',
                            }}
                            onMouseDown={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-info, #6366f1)';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseUp={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-info-alpha, rgba(99, 102, 241, 0.2))';
                              e.currentTarget.style.color = 'var(--text-info, #a5b4fc)';
                            }}
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
                          <p 
                            className="text-center text-base mb-4"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                              {searchQuery || selectedTag ? '没有找到匹配的日记' : '还没有日记，写一篇吧。'}
                          </p>
                          {!searchQuery && !selectedTag && (
                              <button
                                  onClick={startNew}
                                  className="px-6 py-3 font-bold rounded-xl active:scale-95 transition-transform touch-manipulation"
                                  style={{
                                    background: 'var(--gradient-primary-button, linear-gradient(to right, var(--color-pink, #db2777), var(--color-primary, #9333ea)))',
                                    color: 'var(--text-primary)',
                                  }}
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
                        className="rounded-xl p-4 border active:scale-[0.98] transition-transform touch-manipulation cursor-pointer"
                        style={{
                          backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 1))',
                          borderColor: 'var(--border-color-overlay, rgba(30, 41, 59, 1))',
                          '--active-bg': 'var(--bg-hover, rgba(30, 41, 59, 1))',
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--active-bg)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(15, 23, 42, 1))';
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                openEntry(entry);
                            }
                        }}
                      >
                          <div className="flex justify-between items-start mb-2">
                              <h3 
                                className="font-bold truncate flex-1"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {entry.title}
                              </h3>
                              <span 
                                className="text-[10px]"
                                style={{ color: 'var(--text-disabled)' }}
                              >
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </span>
                          </div>
                          <p 
                            className="text-sm line-clamp-2"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {entry.content}
                          </p>
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
                                              className="text-[10px] px-2 py-0.5 rounded-full border"
                                              style={{
                                                backgroundColor: 'var(--bg-info-alpha, rgba(99, 102, 241, 0.2))',
                                                color: 'var(--text-info, #a5b4fc)',
                                                borderColor: 'var(--border-info-alpha, rgba(99, 102, 241, 0.3))',
                                              }}
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
          <div 
            className="h-full flex flex-col pb-24"
            style={{ backgroundColor: 'var(--bg-primary-dark, #020617)' }}
          >
              <div 
                className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 border-b backdrop-blur-md sticky top-0 z-10"
                style={{
                  borderColor: 'var(--border-color-overlay, rgba(30, 41, 59, 1))',
                  backgroundColor: 'var(--bg-primary-dark, rgba(2, 6, 23, 0.9))',
                }}
              >
                  <button 
                    onClick={() => setView('list')} 
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
                    style={{ color: 'var(--text-tertiary)' }}
                    aria-label="返回"
                  >
                    &larr;
                  </button>
                  <h2 
                    className="font-bold truncate flex-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedEntry.title}
                  </h2>
                  <button 
                    onClick={startEdit} 
                    className="text-sm min-w-[44px] min-h-[44px] px-3 active:scale-95 transition-transform touch-manipulation"
                    style={{ color: 'var(--color-info, #818cf8)' }}
                  >
                    编辑
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 overscroll-behavior-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {selectedEntry.imageUrl && (
                      <img src={selectedEntry.imageUrl} className="w-full rounded-xl mb-6 shadow-lg" alt="Mind Projection" />
                  )}
                  <p 
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {selectedEntry.content}
                  </p>
                  
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
                                      className="text-xs px-3 py-2 rounded-full border min-h-[44px] active:scale-95 transition-transform touch-manipulation"
                                      style={{
                                        backgroundColor: 'var(--bg-info-alpha, rgba(99, 102, 241, 0.2))',
                                        color: 'var(--text-info, #a5b4fc)',
                                        borderColor: 'var(--border-info-alpha, rgba(99, 102, 241, 0.3))',
                                      }}
                                  >
                                      {trimmedTag}
                                  </span>
                              );
                          })}
                      </div>
                  )}
                  
                  {selectedEntry.insight && (
                      <div 
                        className="mt-6 p-4 border-l-2 rounded-r-lg"
                        style={{
                          backgroundColor: 'var(--bg-info-alpha, rgba(6, 182, 212, 0.2))',
                          borderLeftColor: 'var(--color-info, #06b6d4)',
                        }}
                      >
                          <p 
                            className="text-xs font-bold uppercase mb-1"
                            style={{ color: 'var(--color-info, #06b6d4)' }}
                          >
                            Mirror of Truth
                          </p>
                          <p 
                            className="text-sm italic"
                            style={{ color: 'var(--text-info-light, #cffafe)' }}
                          >
                            "{selectedEntry.insight}"
                          </p>
                      </div>
                  )}

                  <div 
                    className="mt-8 pt-8 border-t"
                    style={{ borderTopColor: 'var(--border-color-overlay, rgba(30, 41, 59, 1))' }}
                  >
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
                        className="w-full text-center text-sm py-3 min-h-[44px] active:scale-95 transition-transform touch-manipulation rounded-lg"
                        style={{
                          color: 'var(--color-error, #f87171)',
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-error-alpha, rgba(239, 68, 68, 0.1))';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
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
      <div 
        className="h-full flex flex-col pb-20"
        style={{ backgroundColor: 'var(--bg-primary-dark, #020617)' }}
      >
           <div 
             className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-10"
             style={{
               borderColor: 'var(--border-color-overlay, rgba(30, 41, 59, 1))',
               backgroundColor: 'var(--bg-primary-dark, rgba(2, 6, 23, 0.9))',
             }}
           >
                <button 
                  onClick={() => setView(selectedEntry ? 'detail' : 'list')} 
                  className="min-w-[44px] min-h-[44px] px-3 active:scale-95 transition-transform touch-manipulation"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  取消
                </button>
                <h2 
                  className="font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedEntry ? '编辑' : '新建'}
                </h2>
                <button 
                  onClick={handleSave} 
                  disabled={isGenerating} 
                  className="font-bold disabled:opacity-50 min-w-[44px] min-h-[44px] px-3 active:scale-95 transition-transform touch-manipulation disabled:active:scale-100"
                  style={{ color: 'var(--color-pink, #ec4899)' }}
                >
                    {isGenerating ? '保存中...' : '保存'}
                </button>
           </div>
           <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto overscroll-behavior-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
               {/* 模板选择 */}
               <div className="flex items-center gap-2 mb-2">
                   <button
                       onClick={() => setShowTemplates(!showTemplates)}
                       className="text-xs flex items-center gap-1 border rounded-full px-3 py-2 min-h-[44px] active:scale-95 transition-transform touch-manipulation"
                       style={{
                         color: 'var(--color-info, #818cf8)',
                         borderColor: 'var(--border-info-alpha, rgba(30, 58, 138, 1))',
                         backgroundColor: 'var(--bg-info-alpha, rgba(30, 58, 138, 0.1))',
                       }}
                   >
                       <span>📝</span> 模板
                   </button>
               </div>
               
               {showTemplates && (
                   <div 
                     className="rounded-lg p-3 border mb-2"
                     style={{
                       backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 1))',
                       borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                     }}
                   >
                       <div 
                         className="text-xs mb-2 font-bold"
                         style={{ color: 'var(--text-tertiary)' }}
                       >
                         选择模板
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                           {getAllTemplates().slice(0, 4).map(template => (
                               <button
                                   key={template.id}
                                   onClick={() => applyTemplate(template.id)}
                                   className="p-3 rounded-lg text-left transition-all active:scale-95 touch-manipulation min-h-[80px]"
                                   style={{
                                     backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                   }}
                                   onMouseDown={(e) => {
                                     e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 1))';
                                   }}
                                   onMouseUp={(e) => {
                                     e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(30, 41, 59, 1))';
                                   }}
                               >
                                   <div 
                                     className="text-xs font-bold mb-1"
                                     style={{ color: 'var(--text-primary)' }}
                                   >
                                     {template.icon} {template.name}
                                   </div>
                                   <div 
                                     className="text-[10px]"
                                     style={{ color: 'var(--text-tertiary)' }}
                                   >
                                     {template.description}
                                   </div>
                               </button>
                           ))}
                       </div>
                   </div>
               )}
               
               <input 
                 value={title} 
                 onChange={e => setTitle(e.target.value)} 
                 placeholder="标题..." 
                 className="bg-transparent text-xl font-bold outline-none min-h-[44px] px-2" 
                 style={{
                   color: 'var(--text-primary)',
                   '--placeholder-color': 'var(--text-disabled)',
                 }}
                 autoFocus={!selectedEntry}
                 inputMode="text"
               />
               <textarea 
                 value={content} 
                 onChange={e => setContent(e.target.value)} 
                 placeholder="写下你的想法..." 
                 className="flex-1 bg-transparent outline-none resize-none leading-relaxed min-h-[300px] px-2 text-base" 
                 style={{
                   color: 'var(--text-secondary)',
                   '--placeholder-color': 'var(--text-disabled)',
                 }}
                 inputMode="text"
               />
               
               {/* Tags Section */}
               <div className="space-y-2">
                   <div 
                     className="text-xs font-bold"
                     style={{ color: 'var(--text-tertiary)' }}
                   >
                     标签
                   </div>
                   {newTags.length > 0 && (
                       <div className="flex flex-wrap gap-2 mb-2">
                           {newTags.map((tag, idx) => (
                               <span
                                   key={idx}
                                   className="text-xs px-2 py-1 rounded-full border flex items-center gap-1"
                                   style={{
                                     backgroundColor: 'var(--bg-info-alpha, rgba(99, 102, 241, 0.2))',
                                     color: 'var(--text-info, #a5b4fc)',
                                     borderColor: 'var(--border-info-alpha, rgba(99, 102, 241, 0.3))',
                                   }}
                               >
                                   {tag}
                                   <button
                                       onClick={() => removeTag(tag)}
                                       className="min-w-[20px] min-h-[20px] flex items-center justify-center active:scale-110 transition-transform touch-manipulation"
                                       style={{ color: 'var(--color-info, #818cf8)' }}
                                       onMouseDown={(e) => {
                                         e.currentTarget.style.color = 'var(--text-primary)';
                                       }}
                                       onMouseUp={(e) => {
                                         e.currentTarget.style.color = 'var(--color-info, #818cf8)';
                                       }}
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
                       className="w-full rounded-lg px-4 py-3 text-base outline-none min-h-[44px]"
                       style={{
                         backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 1))',
                         borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                         color: 'var(--text-primary)',
                         '--placeholder-color': 'var(--text-disabled)',
                       }}
                       onFocus={(e) => {
                         e.currentTarget.style.borderColor = 'var(--color-info, #6366f1)';
                         e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-info-alpha, rgba(99, 102, 241, 0.2))';
                       }}
                       onBlur={(e) => {
                         e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(51, 65, 85, 1))';
                         e.currentTarget.style.boxShadow = 'none';
                       }}
                       inputMode="text"
                   />
               </div>
               
               {insight && (
                   <div 
                     className="p-3 rounded border text-xs"
                     style={{
                       backgroundColor: 'var(--bg-info-alpha, rgba(6, 182, 212, 0.2))',
                       borderColor: 'var(--border-info-alpha, rgba(6, 182, 212, 1))',
                       color: 'var(--text-info-light, #cffafe)',
                     }}
                   >
                       {insight}
                   </div>
               )}

               <div className="flex justify-end gap-2">
                   <button 
                     onClick={handleMirror} 
                     className="text-xs flex items-center gap-1 border rounded-full px-3 py-2 min-h-[44px] active:scale-95 transition-transform touch-manipulation"
                     style={{
                       color: 'var(--color-info, #06b6d4)',
                       borderColor: 'var(--border-info-alpha, rgba(6, 182, 212, 1))',
                       backgroundColor: 'var(--bg-info-alpha, rgba(6, 182, 212, 0.1))',
                     }}
                     disabled={!content.trim()}
                   >
                       <span>🔮</span> 本我镜像分析
                   </button>
               </div>
           </div>
      </div>
  );
};