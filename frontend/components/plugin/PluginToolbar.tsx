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
        className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
        title="添加插件"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">添加插件</span>
      </button>
      
      <button
        onClick={onToggleEditMode}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
          isEditMode
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
        }`}
        title={isEditMode ? '退出编辑模式' : '进入编辑模式'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="hidden sm:inline">{isEditMode ? '退出编辑' : '编辑'}</span>
      </button>
      
      {pluginCount > 0 && (
        <span className="text-xs text-slate-400 px-2">
          {pluginCount} 个插件
        </span>
      )}
    </div>
  );
};
