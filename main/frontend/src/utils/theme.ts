/**
 * 主题工具函数
 */

import { ThemeId } from '../types/theme';
import { DEFAULT_THEME_ID, isValidThemeId } from '../themes';

/**
 * localStorage键名
 */
export const THEME_STORAGE_KEY = 'heartsphere-theme';

/**
 * 应用主题到文档根元素
 */
export function applyTheme(themeId: ThemeId): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
  
  // 兼容旧的dark主题
  if (themeId === 'tech') {
    root.setAttribute('data-theme', 'tech');
    // 保留dark属性以兼容旧代码
    root.setAttribute('data-theme-legacy', 'dark');
  } else {
    root.removeAttribute('data-theme-legacy');
  }
}

/**
 * 获取当前主题ID
 */
export function getCurrentTheme(): ThemeId {
  const root = document.documentElement;
  const themeAttr = root.getAttribute('data-theme');
  
  if (themeAttr && isValidThemeId(themeAttr)) {
    return themeAttr;
  }
  
  // 兼容旧的dark主题
  if (root.hasAttribute('data-theme-legacy') || root.getAttribute('data-theme') === 'dark') {
    return 'tech';
  }
  
  return DEFAULT_THEME_ID;
}

/**
 * 从localStorage加载主题
 */
export function loadThemeFromStorage(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isValidThemeId(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('[Theme] Failed to load theme from localStorage:', error);
  }
  return DEFAULT_THEME_ID;
}

/**
 * 保存主题到localStorage
 */
export function saveThemeToStorage(themeId: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (error) {
    console.warn('[Theme] Failed to save theme to localStorage:', error);
  }
}

/**
 * 初始化主题（在应用启动时调用）
 */
export function initializeTheme(): ThemeId {
  const themeId = loadThemeFromStorage();
  applyTheme(themeId);
  return themeId;
}
