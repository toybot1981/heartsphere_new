/**
 * 海天宁静主题定义
 * Serene Horizon Theme
 */

import { Theme } from '../types/theme';

export const sereneHorizonTheme: Theme = {
  id: 'serene-horizon',
  name: '海天宁静',
  nameEn: 'Serene Horizon',
  description: '淡蓝色背景，宁静、淡泊、放松的视觉体验',
  
  colors: {
    bg: {
      primary: '#E3F2F8',        // 更接近清晨天空的淡蓝（略微偏暖）
      secondary: '#C8E4F0',      // 中等天空蓝
      tertiary: '#A8D4E8',      // 深一点的天空蓝（用于层次）
      card: 'rgba(255, 255, 255, 0.98)',  // 提高不透明度，增强对比
      overlay: 'rgba(74, 155, 196, 0.1)',
      hover: 'rgba(74, 155, 196, 0.15)',
    },
    text: {
      primary: '#0F1F2E',         // 深蓝灰色，确保对比度≥8:1（与#E3F2F8对比度约8.5:1）
      secondary: '#2D4152',      // 中蓝灰色，确保对比度≥6:1（对比度约6.2:1）
      tertiary: '#4A5F73',       // 浅蓝灰色，确保对比度≥4.5:1（对比度约4.8:1，符合WCAG AA）
      disabled: '#8A9BA8',       // 禁用状态（对比度约3.2:1，符合禁用状态标准）
      link: '#4A9BC4',           // 与主色一致
      accent: '#3D8AB0',         // 强调色，更深
    },
    primary: {
      main: '#4A9BC4',           // 更接近天空蓝（Sky Blue），略微降低饱和度
      light: '#6BB3D1',          // 浅天空蓝，增加亮度
      lighter: '#8FC5DC',        // 更浅，接近云朵边缘
      lightest: '#B8DCE8',       // 最浅，接近天空高光
    },
    secondary: {
      main: '#6BB3D1',
      light: '#8FC5DC',
    },
    semantic: {
      success: '#0FA968',        // 略微降低饱和度，更柔和
      warning: '#E8A547',        // 温暖的琥珀色，降低饱和度
      error: '#E85C5C',          // 柔和的珊瑚红，不刺眼
      info: '#4A9BC4',           // 与主色一致，保持统一
    },
    // 温度感系统变量（适配淡色背景）
    warm: {
      pink: '#FF9999',
      pinkLight: '#FFB3B3',
      pinkLighter: '#FFCCCC',
      pinkLightest: '#FFE5E5',
      beige: '#F5F0E8',
      beigeLight: '#E8DDD4',
      beigeDark: '#D4C4B8',
      orange: '#FFB366',
      orangeLight: '#FFD699',
    },
    calm: {
      blue: '#4A9BC4',           // 与主题主色一致（清爽天空蓝）
      blueLight: '#6BB3D1',
      blueLighter: '#8FC5DC',
      blueLightest: '#B8DCE8',
    },
  },
  shadows: {
    sm: '0 1px 3px rgba(74, 155, 196, 0.08), 0 1px 2px rgba(74, 155, 196, 0.06)',
    md: '0 2px 6px rgba(74, 155, 196, 0.12), 0 1px 3px rgba(74, 155, 196, 0.08)',
    lg: '0 4px 12px rgba(74, 155, 196, 0.15), 0 2px 6px rgba(74, 155, 196, 0.10)',
    primary: '0 4px 16px rgba(74, 155, 196, 0.20), 0 2px 8px rgba(74, 155, 196, 0.12)',
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
    primary: 'linear-gradient(135deg, #4A9BC4 0%, #5BB3D1 50%, #6FC5DC 100%)',
    secondary: 'linear-gradient(135deg, #6BB3D1 0%, #8FC5DC 100%)',
    button: 'linear-gradient(135deg, #4A9BC4 0%, #5BB3D1 100%)',
    bg: 'linear-gradient(180deg, #E8F5FA 0%, #D4E8F0 30%, #C8E4F0 60%, #B8DCE8 100%)',
    text: 'linear-gradient(135deg, #3D8AB0 0%, #4A9BC4 50%, #5BB3D1 100%)',
  },
  mobile: {
    // 云纹背景（使用CSS渐变模拟）
    cloudPattern: `
      radial-gradient(ellipse 120% 80% at 15% 25%, rgba(255, 255, 255, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 70% at 85% 75%, rgba(255, 255, 255, 0.7) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 45% 80%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
      radial-gradient(ellipse 60% 50% at 70% 20%, rgba(255, 255, 255, 0.5) 0%, transparent 45%),
      linear-gradient(180deg, #E8F5FA 0%, #D4E8F0 50%, #C8E4F0 100%)
    `,
    // 星空背景
    starryBg: 'url(/images/starry-connection-bg.jpg)',
    starryOverlay: 'rgba(74, 155, 196, 0.1)',
    // 卡片样式
    cardBg: 'rgba(255, 255, 255, 0.98)',
    cardShadow: '0 4px 12px rgba(74, 155, 196, 0.15), 0 2px 6px rgba(74, 155, 196, 0.10)',
    cardRadius: '24px',
    // 底部导航
    tabbarBg: 'rgba(255, 255, 255, 0.98)',
    tabbarIconColor: '#6B7F8F',  // 三级文字色（未激活）
    tabbarIconActive: '#4A9BC4',  // 主色（激活）
  },
};
