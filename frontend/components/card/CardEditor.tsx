/**
 * 卡片编辑器组件
 */

import React from 'react';
import { Card, CardTemplate } from '../../services/card-system/types/CardTypes';
import { EmojiPicker } from '../emoji/EmojiPicker';

interface CardEditorProps {
  card: Partial<Card>;
  onChange: (card: Partial<Card>) => void;
  selectedTemplate?: CardTemplate | null;
  userId: number;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  card,
  onChange,
  selectedTemplate,
  userId,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  const handleAddEmoji = (emoji: { code: string }) => {
    const emojis = card.decorations?.emojis || [];
    onChange({
      ...card,
      decorations: {
        ...card.decorations,
        emojis: [...emojis, emoji.code],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 标题输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
        <input
          type="text"
          value={card.title || ''}
          onChange={(e) => onChange({ ...card, title: e.target.value })}
          placeholder="输入卡片标题..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400 transition-colors"
        />
      </div>

      {/* 内容输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
        <textarea
          value={card.content || ''}
          onChange={(e) => onChange({ ...card, content: e.target.value })}
          placeholder="输入卡片内容..."
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400 transition-colors resize-none"
        />
      </div>

      {/* 样式设置 */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-gray-800">样式设置</h4>

        {/* 背景设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">背景颜色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={
                card.background?.type === 'color'
                  ? card.background.value
                  : card.background?.value || '#FFE5E5'
              }
              onChange={(e) =>
                onChange({
                  ...card,
                  background: { type: 'color', value: e.target.value },
                })
              }
              className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <span className="text-sm text-gray-600">
              {card.background?.type === 'color' ? card.background.value : '#FFE5E5'}
            </span>
          </div>
        </div>

        {/* 标题样式 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题字体</label>
            <select
              value={card.style?.titleFont || 'Arial'}
              onChange={(e) =>
                onChange({
                  ...card,
                  style: { ...card.style!, titleFont: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            >
              <option value="Arial">Arial</option>
              <option value="Microsoft YaHei">微软雅黑</option>
              <option value="SimSun">宋体</option>
              <option value="KaiTi">楷体</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题颜色</label>
            <input
              type="color"
              value={card.style?.titleColor || '#333'}
              onChange={(e) =>
                onChange({
                  ...card,
                  style: { ...card.style!, titleColor: e.target.value },
                })
              }
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题大小</label>
            <input
              type="number"
              value={card.style?.titleSize || 24}
              onChange={(e) =>
                onChange({
                  ...card,
                  style: { ...card.style!, titleSize: parseInt(e.target.value) || 24 },
                })
              }
              min={12}
              max={72}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>

        {/* 内容样式 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容字体</label>
            <select
              value={card.style?.contentFont || 'Arial'}
              onChange={(e) =>
                onChange({
                  ...card,
                  style: { ...card.style!, contentFont: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            >
              <option value="Arial">Arial</option>
              <option value="Microsoft YaHei">微软雅黑</option>
              <option value="SimSun">宋体</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容颜色</label>
            <input
              type="color"
              value={card.style?.contentColor || '#666'}
              onChange={(e) =>
                onChange({
                  ...card,
                  style: { ...card.style!, contentColor: e.target.value },
                })
              }
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容大小</label>
            <input
              type="number"
              value={card.style?.contentSize || 16}
              onChange={(e) =>
                onChange({
                  ...card,
                  style: { ...card.style!, contentSize: parseInt(e.target.value) || 16 },
                })
              }
              min={12}
              max={36}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>
      </div>

      {/* 装饰元素 */}
      <div>
        <h4 className="text-base font-semibold text-gray-800 mb-2">装饰</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
          >
            添加表情
          </button>
          {card.decorations?.emojis && card.decorations.emojis.length > 0 && (
            <div className="flex gap-2">
              {card.decorations.emojis.map((emoji, index) => (
                <span key={index} className="text-2xl">
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 表情选择器 */}
      {showEmojiPicker && (
        <EmojiPicker
          userId={userId}
          onSelect={(emoji) => {
            handleAddEmoji(emoji);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};



