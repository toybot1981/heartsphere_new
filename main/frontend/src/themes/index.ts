/**
 * 主题注册表
 */

import { Theme, ThemeId } from '../types/theme';
import { techTheme } from './tech';
import { sereneHorizonTheme } from './serene-horizon';
import { classicDarkTheme } from './classic-dark';
import { modernLightTheme } from './modern-light';
import { blueSkyWhiteCloudTheme } from './blue-sky-white-cloud';

/**
 * 所有可用主题
 */
export const themes: Record<ThemeId, Theme> = {
  tech: techTheme,
  'serene-horizon': sereneHorizonTheme,
  'classic-dark': classicDarkTheme,
  'modern-light': modernLightTheme,
  'blue-sky-white-cloud': blueSkyWhiteCloudTheme,
};

/**
 * 获取主题
 */
export function getTheme(themeId: ThemeId): Theme {
  return themes[themeId];
}

/**
 * 获取所有主题列表
 */
export function getAllThemes(): Theme[] {
  return Object.values(themes);
}

/**
 * 检查主题ID是否有效
 */
export function isValidThemeId(themeId: string): themeId is ThemeId {
  return themeId in themes;
}

/**
 * 默认主题ID
 */
export const DEFAULT_THEME_ID: ThemeId = 'tech';
