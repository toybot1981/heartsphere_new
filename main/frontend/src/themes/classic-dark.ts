/**
 * 经典深色模式主题定义
 * Classic Dark Theme
 */

import { Theme } from '../types/theme';

export const classicDarkTheme: Theme = {
  id: 'classic-dark',
  name: '经典深色',
  nameEn: 'Classic Dark',
  description: '传统深色主题，适合夜间使用，高对比度护眼',
  
  colors: {
    bg: {
      primary: '#121212',        // 接近黑色，但不是纯黑（Material Design Dark Theme标准）
      secondary: '#1E1E1E',      // 稍亮的深灰色
      tertiary: '#2D2D2D',      // 用于层次区分
      card: 'rgba(30, 30, 30, 0.9)',  // 卡片背景
      overlay: 'rgba(0, 0, 0, 0.7)',
      hover: 'rgba(255, 255, 255, 0.08)',
    },
    text: {
      primary: '#FFFFFF',         // 纯白色，高对比度
      secondary: '#E0E0E0',      // 浅灰色
      tertiary: '#B0B0B0',       // 中灰色
      disabled: '#757575',       // 禁用状态
      link: '#64B5F6',           // 柔和的蓝色链接
      accent: '#81C784',         // 柔和的绿色强调
    },
    primary: {
      main: '#64B5F6',           // 柔和的蓝色（避免刺眼）
      light: '#90CAF9',          // 浅蓝色
      lighter: '#BBDEFB',        // 更浅的蓝色
      lightest: '#E3F2FD',       // 最浅的蓝色
      accent: '#42A5F5',         // 深一点的蓝色，用于强调
    },
    secondary: {
      main: '#81C784',           // 柔和的绿色
      light: '#A5D6A7',          // 浅绿色
    },
    semantic: {
      success: '#66BB6A',        // 柔和的绿色
      warning: '#FFB74D',        // 柔和的橙色
      error: '#E57373',          // 柔和的红色
      info: '#64B5F6',           // 柔和的蓝色
    },
    // 温度感系统变量（适配深色背景）
    warm: {
      pink: '#F48FB1',           // 柔和的粉色
      pinkLight: '#F8BBD0',
      pinkLighter: '#FCE4EC',
      pinkLightest: '#FFF0F5',
      beige: '#D7CCC8',          // 米色
      beigeLight: '#E0D5D0',
      beigeDark: '#BCAAA4',
      orange: '#FFB74D',         // 柔和的橙色
      orangeLight: '#FFCC80',
    },
    calm: {
      blue: '#64B5F6',           // 柔和的蓝色
      blueLight: '#90CAF9',
      blueLighter: '#BBDEFB',
      blueLightest: '#E3F2FD',
    },
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
    md: '0 4px 12px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.6)',
    primary: '0 4px 16px rgba(100, 181, 246, 0.3)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '32px',
    full: '9999px',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #64B5F6 0%, #81C784 100%)',
    secondary: 'linear-gradient(135deg, #90CAF9 0%, #A5D6A7 100%)',
    button: 'linear-gradient(135deg, #64B5F6 0%, #81C784 100%)',
    bg: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
    text: 'linear-gradient(135deg, #64B5F6 0%, #90CAF9 100%)',
  },
  mobile: {
    // 深色模式下的云纹背景（使用深色渐变）
    cloudPattern: `
      radial-gradient(ellipse 120% 80% at 15% 25%, rgba(100, 181, 246, 0.1) 0%, transparent 60%),
      radial-gradient(ellipse 100% 70% at 85% 75%, rgba(129, 199, 132, 0.08) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 45% 80%, rgba(100, 181, 246, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse 60% 50% at 70% 20%, rgba(129, 199, 132, 0.05) 0%, transparent 45%),
      linear-gradient(180deg, #121212 0%, #1E1E1E 50%, #2D2D2D 100%)
    `,
    // 星空背景
    starryBg: 'url(/images/starry-connection-bg.jpg)',
    starryOverlay: 'rgba(0, 0, 0, 0.3)',
    // 卡片样式
    cardBg: 'rgba(30, 30, 30, 0.95)',
    cardShadow: '0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3)',
    cardRadius: '24px',
    // 底部导航
    tabbarBg: 'rgba(30, 30, 30, 0.95)',
    tabbarIconColor: '#757575',  // 禁用色（未激活）
    tabbarIconActive: '#64B5F6',  // 主色（激活）
  },
};
