/**
 * 表情选择器组件
 */

import React, { useState, useMemo } from 'react';
import { Emoji, EmojiCategory, EmojiPickerConfig, EmojiPickerCallbacks } from '../../services/emoji-system/types/EmojiTypes';
import { useEmojiSystem } from '../../services/emoji-system/hooks/useEmojiSystem';
import { getCategoryIcon } from '../../services/emoji-system/data/EmojiData';

interface EmojiPickerProps extends EmojiPickerConfig, EmojiPickerCallbacks {
  userId: number;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  userId,
  multiSelect = false,
  maxSelection,
  showPreview = true,
  showSearch = true,
  showCategories = true,
  defaultCategory = EmojiCategory.SMILEYS,
  onSelect,
  onClose,
  onMultiSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmojis, setSelectedEmojis] = useState<Emoji[]>([]);
  const [hoveredEmoji, setHoveredEmoji] = useState<Emoji | null>(null);

  const emojiSystem = useEmojiSystem({
    enabled: true,
    userId,
    autoRecord: true,
  });

  // 获取表情列表
  const emojis = useMemo(() => {
    if (searchQuery.trim()) {
      return emojiSystem.searchEmojis(searchQuery);
    }
    return emojiSystem.getEmojis(selectedCategory);
  }, [selectedCategory, searchQuery, emojiSystem.isReady]);

  const handleEmojiClick = async (emoji: Emoji) => {
    if (multiSelect) {
      if (selectedEmojis.find((e) => e.id === emoji.id)) {
        setSelectedEmojis(selectedEmojis.filter((e) => e.id !== emoji.id));
      } else {
        if (maxSelection && selectedEmojis.length >= maxSelection) {
          return; // 达到最大选择数
        }
        setSelectedEmojis([...selectedEmojis, emoji]);
      }
    } else {
      // 记录使用
      await emojiSystem.recordUsage(emoji.id, 'conversation');
      onSelect(emoji);
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (selectedEmojis.length > 0) {
      // 记录使用
      for (const emoji of selectedEmojis) {
        await emojiSystem.recordUsage(emoji.id, 'conversation');
      }
      if (onMultiSelect) {
        onMultiSelect(selectedEmojis);
      }
      onClose();
    }
  };

  const categories = [
    EmojiCategory.RECENT,
    EmojiCategory.FREQUENT,
    EmojiCategory.SMILEYS,
    EmojiCategory.ANIMALS,
    EmojiCategory.FOOD,
    EmojiCategory.ACTIVITIES,
    EmojiCategory.TRAVEL,
    EmojiCategory.OBJECTS,
    EmojiCategory.SYMBOLS,
  ];

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.5))' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md max-h-[600px] flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--bg-modal, #ffffff)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-color-overlay, #e5e7eb)' }}
        >
          <h3 
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            选择表情
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(243, 244, 246, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* 分类标签 */}
        {showCategories && (
          <div 
            className="flex px-4 py-2 border-b gap-2 overflow-x-auto"
            style={{ borderColor: 'var(--border-color-overlay)' }}
          >
            {categories.map((category) => (
              <button
                key={category}
                className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: selectedCategory === category
                    ? 'var(--color-primary, rgba(236, 72, 153, 0.2))'
                    : 'transparent',
                  color: selectedCategory === category
                    ? 'var(--color-primary, #ec4899)'
                    : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(243, 244, 246, 1))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="mr-1">{getCategoryIcon(category)}</span>
                <span>
                  {category === EmojiCategory.RECENT
                    ? '最近'
                    : category === EmojiCategory.FREQUENT
                    ? '常用'
                    : category === EmojiCategory.SMILEYS
                    ? '表情'
                    : category === EmojiCategory.ANIMALS
                    ? '动物'
                    : category === EmojiCategory.FOOD
                    ? '食物'
                    : category === EmojiCategory.ACTIVITIES
                    ? '活动'
                    : category === EmojiCategory.TRAVEL
                    ? '旅行'
                    : category === EmojiCategory.OBJECTS
                    ? '物品'
                    : category === EmojiCategory.SYMBOLS
                    ? '符号'
                    : category}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 搜索框 */}
        {showSearch && (
          <div 
            className="px-4 py-2 border-b"
            style={{ borderColor: 'var(--border-color-overlay)' }}
          >
            <input
              type="text"
              placeholder="搜索表情..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors"
              style={{
                borderColor: 'var(--border-color-overlay, #d1d5db)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #d1d5db)';
              }}
            />
          </div>
        )}

        {/* 表情网格 */}
        <div className="flex-1 overflow-y-auto p-4">
          {emojis.length === 0 ? (
            <div 
              className="text-center py-8"
              style={{ color: 'var(--text-tertiary)' }}
            >
              暂无表情
            </div>
          ) : (
            <div className="grid grid-cols-10 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji.id}
                  className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:scale-125"
                  style={{
                    backgroundColor: selectedEmojis.find((e) => e.id === emoji.id)
                      ? 'var(--color-primary, rgba(236, 72, 153, 0.2))'
                      : 'transparent',
                    border: selectedEmojis.find((e) => e.id === emoji.id)
                      ? '2px solid var(--color-primary, #ec4899)'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedEmojis.find((e2) => e2.id === emoji.id)) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(243, 244, 246, 1))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedEmojis.find((e2) => e2.id === emoji.id)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => handleEmojiClick(emoji)}
                  onMouseEnter={() => setHoveredEmoji(emoji)}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  title={emoji.name}
                >
                  {emoji.code}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 预览区域 */}
        {showPreview && hoveredEmoji && (
          <div 
            className="px-4 py-2 border-t flex items-center gap-3"
            style={{
              borderColor: 'var(--border-color-overlay, #e5e7eb)',
              backgroundColor: 'var(--bg-card, rgba(249, 250, 251, 1))',
            }}
          >
            <span className="text-2xl">{hoveredEmoji.code}</span>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {hoveredEmoji.name}
            </span>
          </div>
        )}

        {/* 底部操作 */}
        {multiSelect && (
          <div 
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{
              borderColor: 'var(--border-color-overlay, #e5e7eb)',
              backgroundColor: 'var(--bg-card, rgba(249, 250, 251, 1))',
            }}
          >
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              已选择 {selectedEmojis.length}
              {maxSelection && ` / ${maxSelection}`}
            </span>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedEmojis.length === 0
                  ? 'var(--bg-disabled, #d1d5db)'
                  : 'var(--color-primary, #ec4899)',
                color: 'var(--text-primary)',
              }}
              onClick={handleConfirm}
              disabled={selectedEmojis.length === 0}
              onMouseEnter={(e) => {
                if (selectedEmojis.length > 0) {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary, #db2777)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedEmojis.length > 0) {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary, #ec4899)';
                }
              }}
            >
              确认使用
            </button>
          </div>
        )}
      </div>
    </div>
  );
};




