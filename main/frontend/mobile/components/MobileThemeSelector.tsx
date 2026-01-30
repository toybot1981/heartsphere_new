/**
 * 移动端主题选择器组件
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ThemeId } from '../../src/types/theme';
import { MobileCardStyles, MobileTypography, MobileColors, MobileSpacing } from './MobileStyleGuide';

/**
 * 移动端主题选择器组件
 */
export const MobileThemeSelector: React.FC = () => {
  const { currentTheme, themes, setTheme, themeId } = useTheme();

  return (
    <div className={`${MobileCardStyles.default} p-4 space-y-3`}>
      <div>
        <h4 
          className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} mb-1`}
          style={{ color: 'var(--text-primary)' }}
        >
          主题风格
        </h4>
        <p 
          className={`${MobileTypography.fontSize.xs}`}
          style={{ color: 'var(--text-secondary)' }}
        >
          选择你喜欢的界面风格
        </p>
      </div>
      
      <div className="space-y-2">
        {themes.map((theme) => {
          const isActive = theme.id === themeId;
          
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`
                w-full p-3 rounded-lg border-2 transition-all
                ${isActive 
                  ? 'border-[var(--color-primary)]' 
                  : 'border-[var(--bg-card)]'
                }
              `}
              style={{
                backgroundColor: 'var(--bg-card)',
              }}
              aria-label={`选择${theme.name}主题`}
              aria-pressed={isActive}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className={`${MobileTypography.fontSize.sm} ${MobileTypography.fontWeight.semibold}`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {theme.name}
                    </span>
                    {isActive && (
                      <span 
                        className={`${MobileTypography.fontSize.xs} px-2 py-0.5 rounded-full`}
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
                    className={`${MobileTypography.fontSize.xs}`}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {theme.description}
                  </p>
                </div>
                
                {/* 主题预览 */}
                <div className="ml-3 flex gap-1.5">
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: theme.colors.bg.primary }}
                    title="主背景色"
                  />
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: theme.colors.primary.main }}
                    title="主色调"
                  />
                  <div
                    className="w-10 h-10 rounded-lg"
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
