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
import { MobileInputStyles } from '../components/MobileStyleGuide';
import { showConfirm } from '../../utils/dialog';
import { 
  filterEntriesByDateRange, 
  groupEntriesByDate, 
  sortEntries, 
  type DateRange, 
  type SortBy,
  type GroupBy,
  getTodayDateString
} from '../../utils/journalFilters';

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
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [groupBy, setGroupBy] = useState<GroupBy>(null);
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

  // 写今日：快速创建今天的日记
  const startWriteToday = () => {
      setSelectedEntry(null);
      setTitle('今日');
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
              const recentEntries = entries.slice(-3);
              const greeting = await aiService.generateDailyGreeting(recentEntries, userName);
              
              // 内存管理优化：检查是否已取消，避免在组件卸载后更新状态
              if (!isCancelled) {
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
  let filteredEntries = entries.filter(entry => {
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

  // Apply date range filter
  if (dateRange) {
    filteredEntries = filterEntriesByDateRange(filteredEntries, { range: dateRange });
  }

  // Sort entries
  const sortedEntries = sortEntries(filteredEntries, sortBy);

  // 提取条目卡片渲染逻辑
  const renderEntryCard = (entry: JournalEntry) => (
      <div 
          onClick={() => openEntry(entry)} 
          className="rounded-xl p-4 border active:scale-[0.98] transition-transform touch-manipulation cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color-overlay)',
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
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
                style={{ color: 'var(--text-tertiary)' }}
              >
                {new Date(entry.timestamp).toLocaleDateString()}
              </span>
          </div>
          <p
            className="text-sm line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
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
                                backgroundColor: 'var(--bg-info-alpha)',
                                color: 'var(--color-info)',
                                borderColor: 'var(--border-info-alpha)',
                              }}
                          >
                              {trimmedTag}
                          </span>
                      );
                  })}
              </div>
          )}
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
  );

  const handleSave = async () => {
      if (!title.trim() || !content.trim()) return;

      if (selectedEntry && view === 'edit' && selectedEntry.id) {
          // Update
          // 验证 ID 是否为有效（不是临时ID）
          const isTemporaryId = selectedEntry.id.startsWith('entry_') || selectedEntry.id.startsWith('e_');
          if (isTemporaryId) {
              // 临时ID无法更新，应该创建新条目
              // 这里可以选择创建新条目或显示错误提示
              return;
          }

          // 验证 ID 是否为非空字符串（后端接受String类型的ID，包括UUID）
          if (!selectedEntry.id || selectedEntry.id.trim() === '') {
              console.error('[MobileRealWorldScreen] 无效的日记ID: 空字符串');
              return;
          }

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
          <div 
            className="h-full flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary, #020617)' }}
          >
              <MobileSmoothScroll className="flex-1 p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))]">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <div className="flex items-center gap-3">
                          <h1 
                            className="text-3xl font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            日记
                          </h1>
                          <MobileTouchableButton
                            onClick={onSwitchToPC}
                            variant="secondary"
                            size="sm"
                            className="border"
                            style={{
                              backgroundColor: 'var(--bg-secondary-alpha)',
                              borderColor: 'var(--border-color-overlay)',
                              color: 'var(--text-primary)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
                            }}
                          >
                            <span>💻</span> PC端
                          </MobileTouchableButton>
                      </div>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        记录你的现实瞬间
                      </p>
                  </div>
                  <div className="flex gap-2">
                      <MobileTouchableButton
                        onClick={startWriteToday}
                        variant="primary"
                        size="md"
                        className="rounded-lg shadow-lg font-medium text-sm px-3"
                        aria-label="写今日"
                      >
                        ✍️ 写今日
                      </MobileTouchableButton>
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
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="检索记忆/#标签"
                      className="w-full min-h-[44px] px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color-overlay)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px var(--bg-info-alpha)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      autoComplete="off"
                      inputMode="search"
                      aria-label="搜索日记"
                  />
              </div>

              {/* Date Range Filters & Sort/Group Controls */}
              <div className="mb-4 flex flex-col gap-2">
                  {/* Date Range Filters - Horizontal Scroll */}
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                      <MobileTouchableButton
                          onClick={() => setDateRange(dateRange === 'today' ? null : 'today')}
                          variant={dateRange === 'today' ? 'primary' : 'secondary'}
                          size="sm"
                          className="rounded-lg text-xs font-medium border whitespace-nowrap"
                          style={{
                            backgroundColor: dateRange === 'today' ? 'var(--color-primary)' : 'var(--bg-card)',
                            color: dateRange === 'today' ? 'white' : 'var(--text-secondary)',
                            borderColor: dateRange === 'today' ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                          }}
                      >
                          今日
                      </MobileTouchableButton>
                      <MobileTouchableButton
                          onClick={() => setDateRange(dateRange === 'week' ? null : 'week')}
                          variant={dateRange === 'week' ? 'primary' : 'secondary'}
                          size="sm"
                          className="rounded-lg text-xs font-medium border whitespace-nowrap"
                          style={{
                            backgroundColor: dateRange === 'week' ? 'var(--color-primary)' : 'var(--bg-card)',
                            color: dateRange === 'week' ? 'white' : 'var(--text-secondary)',
                            borderColor: dateRange === 'week' ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                          }}
                      >
                          本周
                      </MobileTouchableButton>
                      <MobileTouchableButton
                          onClick={() => setDateRange(dateRange === 'month' ? null : 'month')}
                          variant={dateRange === 'month' ? 'primary' : 'secondary'}
                          size="sm"
                          className="rounded-lg text-xs font-medium border whitespace-nowrap"
                          style={{
                            backgroundColor: dateRange === 'month' ? 'var(--color-primary)' : 'var(--bg-card)',
                            color: dateRange === 'month' ? 'white' : 'var(--text-secondary)',
                            borderColor: dateRange === 'month' ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                          }}
                      >
                          本月
                      </MobileTouchableButton>
                  </div>
                  {/* Sort & Group Controls */}
                  <div className="flex gap-2 items-center">
                      <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortBy)}
                          className="flex-1 min-h-[44px] px-3 py-2 text-sm rounded-lg border touch-manipulation"
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color-overlay)',
                          }}
                      >
                          <option value="date">按日期</option>
                          <option value="updated">按更新</option>
                      </select>
                      <MobileTouchableButton
                          onClick={() => setGroupBy(groupBy === 'day' ? null : 'day')}
                          variant={groupBy === 'day' ? 'primary' : 'secondary'}
                          size="sm"
                          className="rounded-lg text-xs font-medium border min-w-[60px]"
                          style={{
                            backgroundColor: groupBy === 'day' ? 'var(--color-primary)' : 'var(--bg-card)',
                            color: groupBy === 'day' ? 'white' : 'var(--text-secondary)',
                            borderColor: groupBy === 'day' ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                          }}
                      >
                          分组
                      </MobileTouchableButton>
                  </div>
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
                              className="rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: selectedTag === tag ? 'var(--bg-info-alpha)' : 'var(--bg-card)',
                                color: selectedTag === tag ? 'var(--color-info)' : 'var(--text-secondary)',
                                borderColor: selectedTag === tag ? 'var(--border-info-alpha)' : 'var(--border-color-overlay)',
                              }}
                          >
                              {tag}
                          </MobileTouchableButton>
                      ))}
                  </div>
              )}

              {/* Daily Greeting */}
              {dailyGreeting && (
                  <div
                    className="mb-4 p-4 rounded-xl border w-full overflow-visible"
                    style={{
                      background: 'var(--gradient-card, linear-gradient(to right, var(--bg-card), var(--bg-secondary)))',
                      borderColor: 'var(--border-color-overlay)',
                    }}
                  >
                      <div
                        className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--color-primary)' }}
                      >
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          ></span>
                          Daily Resonance
                      </div>
                      <h2 
                        className="text-base font-bold mb-2 break-words whitespace-normal" 
                        style={{ 
                          color: 'var(--text-primary)',
                          wordBreak: 'break-word', 
                          overflowWrap: 'break-word' 
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
                              color: 'var(--text-secondary)',
                            }}
                          >
                              "{dailyGreeting.prompt || dailyGreeting.question || "今天的风带给你什么感觉？"}"
                          </p>
                          <MobileTouchableButton
                            onClick={handleGreetingQuestionClick}
                            variant="ghost"
                            size="md"
                            className="flex-shrink-0"
                            style={{
                              backgroundColor: 'var(--bg-info-alpha)',
                              color: 'var(--color-info)',
                            }}
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
                  {sortedEntries.length === 0 && (
                      <MobileEmptyState
                          icon={searchQuery || selectedTag || dateRange ? '🔍' : '📝'}
                          title={searchQuery || selectedTag || dateRange ? '没有找到匹配的日记' : '还没有日记，写一篇吧。'}
                          action={!searchQuery && !selectedTag && !dateRange ? {
                              label: '开始记录',
                              onClick: startNew
                          } : undefined}
                      />
                  )}
                  {(() => {
                      if (groupBy) {
                          const grouped = groupEntriesByDate(sortedEntries, groupBy);
                          const groupKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
                          return groupKeys.map(groupKey => (
                              <div key={groupKey} className="mb-6">
                                  <h3 
                                      className="text-sm font-bold mb-3 uppercase tracking-wider px-2"
                                      style={{ color: 'var(--color-primary)' }}
                                  >
                                      {groupBy === 'day' 
                                          ? new Date(groupKey).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
                                          : `第 ${groupKey.split('-W')[1]} 周 (${groupKey.split('-')[0]})`
                                      }
                                  </h3>
                                  {grouped[groupKey].map(entry => (
                                      <div key={entry.id} className="mb-3">
                                          {renderEntryCard(entry)}
                                      </div>
                                  ))}
                              </div>
                          ));
                      } else {
                          return sortedEntries.map(entry => (
                              <div key={entry.id} className="mb-3">
                                  {renderEntryCard(entry)}
                              </div>
                          ));
                      }
                  })()}
              </div>
              </MobileSmoothScroll>
          </div>
      );
  }

  // --- DETAIL VIEW ---
  if (view === 'detail' && selectedEntry) {
      return (
          <div 
            className="h-full flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]"
            style={{ backgroundColor: 'var(--bg-primary, #020617)' }}
          >
              <div 
                className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 border-b backdrop-blur-md sticky top-0 z-10"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(2, 6, 23, 0.9))',
                  borderColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))',
                }}
              >
                  <MobileTouchableButton
                    onClick={() => setView('list')}
                    variant="ghost"
                    size="md"
                    style={{ color: 'var(--text-tertiary)' }}
                    aria-label="返回"
                  >
                    &larr;
                  </MobileTouchableButton>
                  <h2 
                    className="font-bold truncate flex-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedEntry.title}
                  </h2>
                  <MobileTouchableButton
                    onClick={startEdit}
                    variant="ghost"
                    size="sm"
                    style={{ color: 'var(--color-info)' }}
                  >
                    编辑
                  </MobileTouchableButton>
              </div>
              <MobileSmoothScroll className="flex-1 p-4">
                  {selectedEntry.imageUrl && (
                      <MobileLazyImage src={selectedEntry.imageUrl} alt="Mind Projection" className="w-full rounded-xl mb-6 shadow-lg" />
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
                                        backgroundColor: 'var(--bg-info-alpha)',
                                        color: 'var(--color-info)',
                                        borderColor: 'var(--border-info-alpha)',
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
                          backgroundColor: 'var(--bg-info-alpha)',
                          borderColor: 'var(--color-info)',
                        }}
                      >
                          <p 
                            className="text-xs font-bold uppercase mb-1"
                            style={{ color: 'var(--color-info)' }}
                          >
                            Mirror of Truth
                          </p>
                          <p 
                            className="text-sm italic"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            "{selectedEntry.insight}"
                          </p>
                      </div>
                  )}

                  <div
                    className="mt-8 pt-8 border-t"
                    style={{ borderColor: 'var(--border-color-overlay)' }}
                  >
                      <MobileTouchableButton
                          onClick={() => onExplore(selectedEntry)}
                          variant="primary"
                          size="lg"
                          fullWidth
                          className="mb-4"
                          style={{
                            background: 'var(--gradient-primary-button, linear-gradient(to right, var(--color-primary, #6366f1), var(--color-primary, #9333ea)))',
                          }}
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
      <div 
        className="h-full flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]"
        style={{ backgroundColor: 'var(--bg-primary, #020617)' }}
      >
           <div 
             className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-10"
             style={{
               backgroundColor: 'var(--bg-overlay, rgba(2, 6, 23, 0.9))',
               borderColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))',
             }}
           >
                <MobileTouchableButton
                  onClick={() => setView(selectedEntry ? 'detail' : 'list')}
                  variant="ghost"
                  size="md"
                >
                  取消
                </MobileTouchableButton>
                <h2 
                  className="font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedEntry ? '编辑' : '新建'}
                </h2>
                <MobileTouchableButton
                  onClick={handleSave}
                  disabled={isGenerating}
                  loading={isGenerating}
                  variant="ghost"
                  size="md"
                  style={{ color: 'var(--color-primary)' }}
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
                       className="text-xs border"
                       style={{
                         color: 'var(--color-info)',
                         borderColor: 'var(--border-info-alpha)',
                         backgroundColor: 'var(--bg-info-alpha)',
                       }}
                   >
                       <span>📝</span> 模板
                   </MobileTouchableButton>
               </div>
               
               {showTemplates && (
                   <div 
                     className="rounded-lg p-3 mb-2"
                     style={{
                       backgroundColor: 'var(--bg-secondary, #0f172a)',
                       borderColor: 'var(--bg-overlay, rgba(51, 65, 85, 1))',
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
                               <MobileTouchableButton
                                   key={template.id}
                                   onClick={() => applyTemplate(template.id)}
                                   variant="secondary"
                                   size="md"
                                   className="p-3 text-left min-h-[80px] justify-start"
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
                               </MobileTouchableButton>
                           ))}
                       </div>
                   </div>
               )}
               
               <input 
                 value={title} 
                 onChange={e => setTitle(e.target.value)} 
                 placeholder="标题..." 
                 className="bg-transparent text-xl font-bold focus:outline-none min-h-[44px] px-2 touch-manipulation" 
                 style={{
                   color: 'var(--text-primary)',
                 }}
                 onFocus={(e) => {
                   e.currentTarget.style.color = 'var(--text-primary)';
                 }}
                 autoFocus={!selectedEntry}
                 inputMode="text"
                 aria-label="日记标题"
               />
               <textarea 
                 value={content} 
                 onChange={e => setContent(e.target.value)} 
                 placeholder="写下你的想法..." 
                 className="flex-1 bg-transparent focus:outline-none resize-none leading-relaxed min-h-[300px] px-2 text-base touch-manipulation" 
                 style={{
                   color: 'var(--text-secondary)',
                 }}
                 inputMode="text"
                 aria-label="日记内容"
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
                                     backgroundColor: 'var(--bg-info-alpha)',
                                     color: 'var(--color-info)',
                                     borderColor: 'var(--border-info-alpha)',
                                   }}
                               >
                                   {tag}
                                   <button
                                       onClick={() => removeTag(tag)}
                                       className="min-w-[20px] min-h-[20px] flex items-center justify-center active:scale-110 transition-transform touch-manipulation"
                                       style={{ color: 'var(--color-info)' }}
                                       onMouseEnter={(e) => {
                                         e.currentTarget.style.color = 'var(--color-error)';
                                       }}
                                       onMouseLeave={(e) => {
                                         e.currentTarget.style.color = 'var(--color-info)';
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
                       className={`${MobileInputStyles} text-base`}
                       inputMode="text"
                       aria-label="添加标签"
                   />
               </div>
               
               {insight && (
                   <div 
                     className="p-3 rounded border text-xs"
                     style={{
                       backgroundColor: 'var(--bg-info-alpha)',
                       borderColor: 'var(--border-info-alpha)',
                       color: 'var(--text-secondary)',
                     }}
                   >
                       {insight}
                   </div>
               )}

               <div className="flex justify-end gap-2">
                   <MobileTouchableButton
                     onClick={handleMirror}
                     variant="outline"
                     size="sm"
                     className="text-xs border rounded px-2 py-1"
                     style={{
                       color: 'var(--color-info)',
                       borderColor: 'var(--border-info-alpha)',
                       backgroundColor: 'var(--bg-info-alpha)',
                     }}
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