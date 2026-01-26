// 插件工具栏组件
import React from 'react';
import { Button } from '../Button';

interface PluginToolbarProps {
  onAddPlugin: () => void;
  onToggleEditMode: () => void;
  isEditMode: boolean;
  pluginCount: number;
}

export const PluginToolbar: React.FC<PluginToolbarProps> = ({
  onAddPlugin,
  onToggleEditMode,
  isEditMode,
  pluginCount,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onAddPlugin}
        className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5"
        style={{
          background: 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))',
          color: 'var(--text-primary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #6366f1, #a855f7))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))';
        }}
        title="添加插件"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">添加插件</span>
      </button>
      
      <button
        onClick={onToggleEditMode}
        className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5"
        style={{
          background: isEditMode
            ? 'var(--gradient-primary, linear-gradient(to right, #06b6d4, #3b82f6))'
            : 'var(--bg-secondary, #334155)',
          color: isEditMode
            ? 'var(--text-primary)'
            : 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          if (isEditMode) {
            e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #22d3ee, #60a5fa))';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover, #475569)';
          }
        }}
        onMouseLeave={(e) => {
          if (isEditMode) {
            e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #06b6d4, #3b82f6))';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #334155)';
          }
        }}
        title={isEditMode ? '退出编辑模式' : '进入编辑模式'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="hidden sm:inline">{isEditMode ? '退出编辑' : '编辑'}</span>
      </button>
      
      {pluginCount > 0 && (
        <span 
          className="text-xs px-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {pluginCount} 个插件
        </span>
      )}
    </div>
  );
};
