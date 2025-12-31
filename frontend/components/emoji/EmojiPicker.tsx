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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[600px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">选择表情</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            ×
          </button>
        </div>

        {/* 分类标签 */}
        {showCategories && (
          <div className="flex px-4 py-2 border-b border-gray-200 gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
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
          <div className="px-4 py-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="搜索表情..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-pink-400 transition-colors"
            />
          </div>
        )}

        {/* 表情网格 */}
        <div className="flex-1 overflow-y-auto p-4">
          {emojis.length === 0 ? (
            <div className="text-center py-8 text-gray-400">暂无表情</div>
          ) : (
            <div className="grid grid-cols-10 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji.id}
                  className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:scale-125 hover:bg-gray-100 ${
                    selectedEmojis.find((e) => e.id === emoji.id) ? 'bg-pink-100 border-2 border-pink-400' : ''
                  }`}
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
          <div className="px-4 py-2 border-t border-gray-200 flex items-center gap-3 bg-gray-50">
            <span className="text-2xl">{hoveredEmoji.code}</span>
            <span className="text-sm text-gray-600">{hoveredEmoji.name}</span>
          </div>
        )}

        {/* 底部操作 */}
        {multiSelect && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-600">
              已选择 {selectedEmojis.length}
              {maxSelection && ` / ${maxSelection}`}
            </span>
            <button
              className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={selectedEmojis.length === 0}
            >
              确认使用
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



