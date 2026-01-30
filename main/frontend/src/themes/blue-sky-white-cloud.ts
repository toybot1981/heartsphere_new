/**
 * 蓝天白云主题定义
 * 清新明亮的蓝天白云风格，心域连接页面布满闪烁的星辰
 */

import { Theme } from '../types/theme';

export const blueSkyWhiteCloudTheme: Theme = {
  id: 'blue-sky-white-cloud',
  name: '蓝天白云',
  nameEn: 'Blue Sky White Cloud',
  description: '清新明亮的蓝天白云风格，心域连接页面布满闪烁的星辰',
  
  colors: {
    bg: {
      primary: '#0369a1',  // 深蓝色（与心域星空统一）
      secondary: '#1e3a8a',  // 更深的蓝色
      tertiary: '#1a1f4f',  // 最深的蓝紫色
      card: 'rgba(30, 58, 138, 0.7)',  // 半透明深蓝色卡片（在深蓝背景上清晰可见）
      overlay: 'rgba(33, 150, 243, 0.15)',  // 稍深的蓝色遮罩
      hover: 'rgba(33, 150, 243, 0.25)',  // 更深的蓝色悬停
    },
    
    text: {
      primary: '#F5F7FA',  // 接近白色（稍微带灰，不刺眼）
      secondary: '#E8EAED',  // 浅灰白
      tertiary: '#D1D5DB',  // 中灰白
      disabled: '#B0B8C1',  // 稍深灰白（禁用状态）
      link: '#FFFFFF',  // 纯白链接（突出显示）
      accent: '#F5F7FA',  // 接近白色强调
    },
    
    primary: {
      main: '#2196F3',  // 标准蓝色
      light: '#42A5F5',  // 浅蓝色
      lighter: '#64B5F6',  // 更浅蓝色
      lightest: '#90CAF9',  // 最浅蓝色
    },
    
    secondary: {
      main: '#1976D2',  // 深蓝色
      light: '#42A5F5',  // 浅蓝色
    },
    
    semantic: {
      success: '#4CAF50',  // 绿色
      warning: '#FF9800',  // 橙色
      error: '#F44336',  // 红色
      info: '#2196F3',  // 蓝色
    },
    
    warm: {
      pink: '#E91E63',
      pinkLight: '#F06292',
      pinkLighter: '#F48FB1',
      pinkLightest: '#F8BBD0',
      beige: '#FFF9E6',
      beigeLight: '#FFFBF0',
      beigeDark: '#F5E6D3',
      orange: '#FF9800',
      orangeLight: '#FFB74D',
    },
    
    calm: {
      blue: '#2196F3',
      blueLight: '#42A5F5',
      blueLighter: '#64B5F6',
      blueLightest: '#90CAF9',
    },
  },
  
  shadows: {
    sm: '0 1px 3px rgba(33, 150, 243, 0.12), 0 1px 2px rgba(33, 150, 243, 0.08)',
    md: '0 2px 6px rgba(33, 150, 243, 0.15), 0 1px 3px rgba(33, 150, 243, 0.10)',
    lg: '0 4px 12px rgba(33, 150, 243, 0.18), 0 2px 6px rgba(33, 150, 243, 0.12)',
    primary: '0 4px 16px rgba(33, 150, 243, 0.25), 0 2px 8px rgba(33, 150, 243, 0.15)',
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
    primary: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    secondary: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 100%)',
    button: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    bg: 'linear-gradient(180deg, #0369a1 0%, #1e3a8a 50%, #1a1f4f 100%)',  // 与背景色统一
    text: 'linear-gradient(135deg, #F5F7FA 0%, #E8EAED 50%, #D1D5DB 100%)',  // 白色渐变
  },
  
  mobile: {
    cloudPattern: 'radial-gradient(ellipse 120% 80% at 15% 25%, rgba(255, 255, 255, 0.9) 0%, transparent 60%), radial-gradient(ellipse 100% 70% at 85% 75%, rgba(255, 255, 255, 0.8) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 45% 80%, rgba(255, 255, 255, 0.7) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 70% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 45%), linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
    starryBg: 'url(/images/starry-connection-bg.jpg)',
    starryOverlay: 'rgba(33, 150, 243, 0.1)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardShadow: '0 4px 12px rgba(33, 150, 243, 0.15), 0 2px 6px rgba(33, 150, 243, 0.10)',
    cardRadius: '24px',
    tabbarBg: 'rgba(255, 255, 255, 0.95)',
    tabbarIconColor: '#64B5F6',
    tabbarIconActive: '#2196F3',
  },
};
