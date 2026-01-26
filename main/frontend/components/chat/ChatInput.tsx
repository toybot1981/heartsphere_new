/**
 * 聊天输入组件
 * 可复用的聊天输入区域组件，与ChatWindow样式保持一致
 */

import React, { memo } from 'react';
import { Button } from '../Button';
import { EmojiPicker } from '../emoji/EmojiPicker';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
  placeholder?: string;
  showEmojiPicker?: boolean;
  onToggleEmojiPicker?: () => void;
  onEmojiSelect?: (emoji: { code: string }) => void;
  userId?: number;
  disabled?: boolean;
}

/**
 * 聊天输入组件
 * 复用ChatWindow的输入区域样式和逻辑
 */
export const ChatInput = memo<ChatInputProps>(({
  input,
  onInputChange,
  onSend,
  onKeyDown,
  isLoading = false,
  placeholder = '输入你的消息...',
  showEmojiPicker = false,
  onToggleEmojiPicker,
  onEmojiSelect,
  userId,
  disabled = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div 
      className="relative flex items-center rounded-2xl p-2 border animate-fade-in w-full"
      style={{
        backgroundColor: 'var(--bg-card, rgba(0, 0, 0, 0.9))',
        borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
      }}
    >
      {/* 表情按钮 */}
      {onToggleEmojiPicker && (
        <button
          onClick={onToggleEmojiPicker}
          disabled={isLoading || disabled}
          className="mr-2 p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !disabled) {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !disabled) {
              e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
          title="选择表情"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}

      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-24 py-3 px-3 scrollbar-hide text-base"
        style={{
          color: 'var(--text-primary)',
        }}
        placeholder={placeholder}
        rows={1}
        disabled={isLoading || disabled}
      />

      <Button
        onClick={onSend}
        disabled={!input.trim() || isLoading || disabled}
        className="ml-2 px-6 py-3"
      >
        {isLoading ? '发送中...' : '发送'}
      </Button>

      {/* 表情选择器 */}
      {showEmojiPicker && onEmojiSelect && userId !== undefined && (
        <EmojiPicker
          userId={userId}
          onSelect={(emoji) => {
            onEmojiSelect(emoji);
            if (onToggleEmojiPicker) {
              onToggleEmojiPicker();
            }
          }}
          onClose={onToggleEmojiPicker}
        />
      )}
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
