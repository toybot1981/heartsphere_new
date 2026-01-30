/**
 * Theme Context
 */

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Theme, ThemeId } from '../types/theme';
import { getAllThemes, getTheme, DEFAULT_THEME_ID } from '../themes';
import { applyTheme, loadThemeFromStorage, saveThemeToStorage, initializeTheme } from '../utils/theme';

/**
 * Theme Context值
 */
export interface ThemeContextValue {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: ThemeId) => void;
  themeId: ThemeId;
}

/**
 * 创建Theme Context
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider Props
 */
export interface ThemeProviderProps {
  children: ReactNode;
  defaultThemeId?: ThemeId;
}

/**
 * ThemeProvider组件
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultThemeId = DEFAULT_THEME_ID,
}) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    // 初始化时从localStorage加载或使用默认主题
    const loaded = loadThemeFromStorage();
    if (loaded) {
      return loaded;
    }
    return defaultThemeId;
  });
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme(themeId));
  
  // 初始化主题（应用启动时）
  useEffect(() => {
    const initialThemeId = initializeTheme();
    if (initialThemeId !== themeId) {
      setThemeIdState(initialThemeId);
      setCurrentTheme(getTheme(initialThemeId));
    }
  }, []);
  
  // 设置主题
  const setTheme = useCallback((newThemeId: ThemeId) => {
    setThemeIdState(newThemeId);
    setCurrentTheme(getTheme(newThemeId));
    applyTheme(newThemeId);
    saveThemeToStorage(newThemeId);
  }, []);
  
  // 当themeId变化时，更新currentTheme
  useEffect(() => {
    setCurrentTheme(getTheme(themeId));
  }, [themeId]);
  
  const value: ThemeContextValue = {
    currentTheme,
    themes: getAllThemes(),
    setTheme,
    themeId,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
