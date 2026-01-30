/**
 * 主题系统类型定义
 */

/**
 * 主题ID枚举
 */
export type ThemeId = 'tech' | 'serene-horizon' | 'classic-dark' | 'modern-light' | 'blue-sky-white-cloud';

/**
 * 主题数据结构
 */
export interface Theme {
  id: ThemeId;
  name: string;                  // 主题名称（中文）
  nameEn: string;                // 主题名称（英文）
  description: string;           // 主题描述
  
  colors: {
    // 背景色
    bg: {
      primary: string;           // 主背景色
      secondary: string;         // 次要背景色
      tertiary?: string;         // 第三级背景色（用于层次）
      card: string;              // 卡片背景色
      overlay: string;           // 遮罩背景色
      hover?: string;            // 悬停背景色
    };
    
    // 文字颜色
    text: {
      primary: string;           // 主文字色
      secondary: string;         // 次要文字色
      tertiary: string;          // 第三级文字色
      disabled: string;          // 禁用文字色
      link: string;              // 链接文字色
      accent: string;            // 强调文字色
    };
    
    // 主色调
    primary: {
      main: string;              // 主色
      light: string;             // 浅色
      lighter: string;            // 更浅色
      lightest: string;           // 最浅色
      accent?: string;            // 深色变体，用于强调
    };
    
    // 辅助色
    secondary?: {
      main: string;
      light: string;
    };
    
    // 语义色
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    
    // 温度感系统变量（保留兼容性）
    warm?: {
      pink: string;
      pinkLight: string;
      pinkLighter: string;
      pinkLightest: string;
      beige: string;
      beigeLight: string;
      beigeDark: string;
      orange: string;
      orangeLight: string;
    };
    calm?: {
      blue: string;
      blueLight: string;
      blueLighter: string;
      blueLightest: string;
    };
  };
  
  // 阴影
  shadows: {
    sm: string;
    md: string;
    lg: string;
    primary: string;
  };
  
  // 圆角
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl'?: string;              // 超大圆角（特殊场景）
    full: string;
  };
  
  // 渐变
  gradients?: {
    primary: string;
    secondary: string;
    button: string;
    bg: string;
    text?: string;               // 文字渐变
  };
  
  // 移动端特殊变量
  mobile?: {
    cloudPattern?: string;
    starryBg?: string;
    starryOverlay?: string;
    cardBg?: string;
    cardShadow?: string;
    cardRadius?: string;
    tabbarBg?: string;
    tabbarIconColor?: string;
    tabbarIconActive?: string;
  };
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  defaultTheme: ThemeId;
  storageKey: string;
  transitionDuration: number;
}
