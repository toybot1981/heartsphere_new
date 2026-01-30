/**
 * 科技风格主题定义
 * Tech Style Theme
 */

import { Theme } from '../types/theme';

export const techTheme: Theme = {
  id: 'tech',
  name: '科技风格',
  nameEn: 'Tech Style',
  description: '深色背景，高对比度，科技感强',
  
  colors: {
    bg: {
      primary: '#000000',
      secondary: '#0F172A',      // slate-950
      card: 'rgba(30, 41, 59, 0.8)',  // slate-800/80
      overlay: 'rgba(0, 0, 0, 0.6)',
      hover: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CBD5E1',      // slate-300
      tertiary: '#94A3B8',       // slate-400
      disabled: '#64748B',       // slate-500
      link: '#60A5FA',           // blue-400
      accent: '#9333EA',         // purple-600
    },
    primary: {
      main: '#4F46E5',           // indigo-600
      light: '#6366F1',          // indigo-500
      lighter: '#818CF8',        // indigo-400
      lightest: '#A5B4FC',      // indigo-300
    },
    secondary: {
      main: '#9333EA',           // purple-600
      light: '#A855F7',          // purple-500
    },
    semantic: {
      success: '#22C55E',        // green-500
      warning: '#EAB308',        // yellow-500
      error: '#EF4444',          // red-500
      info: '#3B82F6',           // blue-500
    },
    // 温度感系统变量（适配深色背景）
    warm: {
      pink: '#FFB3B3',           // 提高亮度
      pinkLight: '#FFCCCC',
      pinkLighter: '#FFE5E5',
      pinkLightest: '#FFF0F0',
      beige: '#F5F0E8',
      beigeLight: '#E8DDD4',
      beigeDark: '#D4C4B8',
      orange: '#FFB366',
      orangeLight: '#FFD699',
    },
    calm: {
      blue: '#9FC9E0',           // 提高亮度
      blueLight: '#BFD9E8',
      blueLighter: '#D9E8F0',
      blueLightest: '#E8F4F8',
    },
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    primary: '0 4px 16px rgba(79, 70, 229, 0.4)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
    secondary: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
    button: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
    bg: 'linear-gradient(135deg, #000000 0%, #0F172A 100%)',
  },
};
