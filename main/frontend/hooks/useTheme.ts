/**
 * useTheme Hook
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Theme, ThemeId } from '../src/types/theme';

/**
 * 使用主题的Hook
 */
export function useTheme(): {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: ThemeId) => void;
  themeId: ThemeId;
} {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
