/**
 * 主题选择器组件
 */

import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeId } from '../src/types/theme';

/**
 * 主题选择器Props
 */
interface ThemeSelectorProps {
  className?: string;
}

/**
 * 主题选择器组件
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { currentTheme, themes, setTheme, themeId } = useTheme();

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          主题风格
        </h4>
        <p className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>
          选择你喜欢的界面风格
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {themes.map((theme) => {
          const isActive = theme.id === themeId;
          
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${isActive 
                  ? 'border-[var(--color-primary)] shadow-lg' 
                  : 'border-[var(--bg-card)] hover:border-[var(--color-primary-light)]'
                }
              `}
              style={{
                backgroundColor: 'var(--bg-card)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {theme.name}
                    </h5>
                    {isActive && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: 'var(--color-primary)',
                          color: 'white'
                        }}
                      >
                        当前
                      </span>
                    )}
                  </div>
                  <p 
                    className="text-xs opacity-70"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {theme.description}
                  </p>
                </div>
                
                {/* 主题预览 */}
                <div className="ml-4 flex gap-1">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: theme.colors.bg.primary }}
                    title="主背景色"
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: theme.colors.primary.main }}
                    title="主色调"
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: theme.colors.bg.card }}
                    title="卡片背景"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
