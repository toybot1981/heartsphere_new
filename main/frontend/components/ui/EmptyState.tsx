import React from 'react';
import { Button } from './Button';

/**
 * 空状态组件
 * 温暖友好的空状态提示
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const defaultIcon = (
    <div className="w-24 h-24 flex items-center justify-center rounded-full bg-warm-pink-lightest/50 animate-float">
      <svg
        className="w-12 h-12 text-warm-pink"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </div>
  );

  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="mb-6 animate-scale-in">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-h4 font-semibold text-text-primary mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-body text-text-secondary mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * 空状态消息模板库
 */
export const EmptyStateMessages = {
  noCharacters: {
    title: '还没有创建角色呢',
    description: '开始创建你的第一个E-SOUL吧，他们会陪伴你度过美好的时光 ✨',
    action: '创建角色',
  },
  noScenes: {
    title: '场景还是空的',
    description: '创建你的第一个场景，为E-SOUL搭建一个温暖的家 💙',
    action: '创建场景',
  },
  noHistory: {
    title: '还没有对话记录',
    description: '开始与E-SOUL对话吧，他们会记住每一个美好的时刻 ⭐',
    action: '开始对话',
  },
  noSearchResults: {
    title: '没有找到相关内容',
    description: '试试其他关键词，或者探索一下其他内容 💭',
    action: '重新搜索',
  },
} as const;

export default EmptyState;




