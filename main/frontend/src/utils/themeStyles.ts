/**
 * 主题样式工具函数
 * 帮助组件使用主题系统的CSS变量
 */

/**
 * 获取主题背景色样式
 */
export function getThemeBgStyle(level: 'primary' | 'secondary' | 'card' | 'overlay' = 'primary'): React.CSSProperties {
  return {
    backgroundColor: `var(--bg-${level})`,
  };
}

/**
 * 获取主题文字颜色样式
 */
export function getThemeTextStyle(level: 'primary' | 'secondary' | 'tertiary' | 'disabled' = 'primary'): React.CSSProperties {
  return {
    color: `var(--text-${level})`,
  };
}

/**
 * 获取主题主色调样式
 */
export function getThemePrimaryStyle(level: 'main' | 'light' | 'lighter' | 'lightest' = 'main'): React.CSSProperties {
  return {
    color: `var(--color-primary${level !== 'main' ? `-${level}` : ''})`,
  };
}

/**
 * 获取主题背景色类名（用于Tailwind）
 */
export function getThemeBgClass(level: 'primary' | 'secondary' | 'card' = 'primary'): string {
  // 返回一个类名，组件可以使用内联样式或CSS变量
  return '';
}

/**
 * 获取主题文字颜色类名（用于Tailwind）
 */
export function getThemeTextClass(level: 'primary' | 'secondary' | 'tertiary' = 'primary'): string {
  return '';
}

/**
 * 获取主题边框样式
 */
export function getThemeBorderStyle(color?: 'primary' | 'secondary'): React.CSSProperties {
  if (color) {
    return {
      borderColor: `var(--color-${color})`,
    };
  }
  return {
    borderColor: 'var(--bg-card)',
  };
}

/**
 * 获取主题阴影样式
 */
export function getThemeShadowStyle(size: 'sm' | 'md' | 'lg' | 'primary' = 'md'): React.CSSProperties {
  return {
    boxShadow: `var(--shadow-${size})`,
  };
}

/**
 * 获取主题圆角样式
 */
export function getThemeRadiusStyle(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): React.CSSProperties {
  return {
    borderRadius: `var(--radius-${size})`,
  };
}

/**
 * 组合主题样式
 */
export function combineThemeStyles(...styles: React.CSSProperties[]): React.CSSProperties {
  return Object.assign({}, ...styles);
}
