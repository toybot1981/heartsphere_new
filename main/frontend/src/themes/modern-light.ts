/**
 * 温馨暖色模式主题定义
 * Warm Cozy Theme
 */

import { Theme } from '../types/theme';

export const modernLightTheme: Theme = {
  id: 'modern-light',
  name: '温馨暖色',
  nameEn: 'Warm Cozy',
  description: '暖色系主题，温馨舒适，适合日常使用',
  
  colors: {
    bg: {
      primary: '#FFF8F0',        // 温暖的米白色（略带奶油色）
      secondary: '#F5EDE0',      // 浅米色
      tertiary: '#EDE4D6',      // 稍深的米色，用于层次区分
      card: 'rgba(255, 251, 245, 0.98)',  // 温暖的白色卡片
      overlay: 'rgba(139, 90, 43, 0.08)',  // 暖棕色遮罩
      hover: 'rgba(139, 90, 43, 0.12)',  // 暖棕色悬停
    },
    text: {
      primary: '#3E2723',         // 深棕色，温暖而清晰
      secondary: '#5D4037',      // 中棕色
      tertiary: '#6D4C41',       // 浅棕色
      disabled: '#A1887F',       // 禁用状态（浅棕色）
      link: '#D84315',           // 温暖的橙红色链接
      accent: '#BF360C',         // 深橙红色强调
    },
    primary: {
      main: '#E65100',           // 温暖的橙色
      light: '#FF6F00',          // 浅橙色
      lighter: '#FF8F00',        // 更浅的橙色
      lightest: '#FFB74D',       // 最浅的橙色
      accent: '#BF360C',         // 深橙红色，用于强调（按钮文字）
    },
    secondary: {
      main: '#D84315',           // 温暖的橙红色
      light: '#FF6F00',          // 浅橙色
    },
    semantic: {
      success: '#558B2F',        // 温暖的绿色
      warning: '#F57C00',        // 橙色警告
      error: '#D84315',          // 温暖的红色
      info: '#BF360C',           // 深橙红色（用于按钮文字，确保对比度）
    },
    // 温度感系统变量（适配暖色背景）
    warm: {
      pink: '#F48FB1',           // 温暖的粉色
      pinkLight: '#F8BBD0',
      pinkLighter: '#FCE4EC',
      pinkLightest: '#FFF0F5',
      beige: '#F5EDE0',           // 米色（与背景色协调）
      beigeLight: '#FAF5ED',
      beigeDark: '#E8DCC8',
      orange: '#FF6F00',          // 橙色
      orangeLight: '#FF8F00',
    },
    calm: {
      blue: '#E65100',           // 温暖的橙色（与主色一致）
      blueLight: '#FF6F00',
      blueLighter: '#FF8F00',
      blueLightest: '#FFB74D',
    },
  },
  shadows: {
    sm: '0 1px 3px rgba(139, 90, 43, 0.15), 0 1px 2px rgba(139, 90, 43, 0.12)',
    md: '0 2px 6px rgba(139, 90, 43, 0.18), 0 1px 3px rgba(139, 90, 43, 0.14)',
    lg: '0 4px 12px rgba(139, 90, 43, 0.20), 0 2px 6px rgba(139, 90, 43, 0.16)',
    primary: '0 4px 16px rgba(230, 81, 0, 0.25), 0 2px 8px rgba(230, 81, 0, 0.18)',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #E65100 0%, #D84315 100%)',
    secondary: 'linear-gradient(135deg, #FF6F00 0%, #FF8F00 100%)',
    button: 'linear-gradient(135deg, #E65100 0%, #D84315 100%)',
    bg: 'linear-gradient(180deg, #FFF8F0 0%, #F5EDE0 50%, #EDE4D6 100%)',
    text: 'linear-gradient(135deg, #BF360C 0%, #E65100 50%, #FF6F00 100%)',
  },
  mobile: {
    // 暖色模式下的云纹背景（使用暖色渐变）
    cloudPattern: `
      radial-gradient(ellipse 120% 80% at 15% 25%, rgba(255, 248, 240, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 70% at 85% 75%, rgba(255, 243, 224, 0.7) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 45% 80%, rgba(255, 235, 205, 0.6) 0%, transparent 50%),
      radial-gradient(ellipse 60% 50% at 70% 20%, rgba(255, 228, 181, 0.5) 0%, transparent 45%),
      linear-gradient(180deg, #FFF8F0 0%, #F5EDE0 50%, #EDE4D6 100%)
    `,
    // 星空背景
    starryBg: 'url(/images/starry-connection-bg.jpg)',
    starryOverlay: 'rgba(139, 90, 43, 0.1)',
    // 卡片样式
    cardBg: 'rgba(255, 251, 245, 0.98)',
    cardShadow: '0 4px 12px rgba(139, 90, 43, 0.18), 0 2px 6px rgba(139, 90, 43, 0.14)',
    cardRadius: '24px',
    // 底部导航
    tabbarBg: 'rgba(255, 251, 245, 0.98)',
    tabbarIconColor: '#A1887F',  // 禁用色（未激活）
    tabbarIconActive: '#E65100',  // 主色（激活）
  },
};
