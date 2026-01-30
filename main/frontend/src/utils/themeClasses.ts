/**
 * 主题类名工具
 * 提供基于CSS变量的Tailwind类名替代方案
 */

/**
 * 主题背景色类名映射
 * 注意：这些类名需要在Tailwind配置中定义，或者使用内联样式
 */
export const themeClasses = {
  // 背景色
  bg: {
    primary: 'bg-[var(--bg-primary)]',
    secondary: 'bg-[var(--bg-secondary)]',
    card: 'bg-[var(--bg-card)]',
    overlay: 'bg-[var(--bg-overlay)]',
  },
  // 文字颜色
  text: {
    primary: 'text-[var(--text-primary)]',
    secondary: 'text-[var(--text-secondary)]',
    tertiary: 'text-[var(--text-tertiary)]',
    disabled: 'text-[var(--text-disabled)]',
    link: 'text-[var(--text-link)]',
    accent: 'text-[var(--text-accent)]',
  },
  // 主色调
  color: {
    primary: 'text-[var(--color-primary)]',
    secondary: 'text-[var(--color-secondary)]',
  },
  // 边框
  border: {
    primary: 'border-[var(--color-primary)]',
    secondary: 'border-[var(--color-secondary)]',
    card: 'border-[var(--bg-card)]',
  },
};

/**
 * 获取主题背景类名
 */
export function getBgClass(level: 'primary' | 'secondary' | 'card' | 'overlay' = 'primary'): string {
  return themeClasses.bg[level] || themeClasses.bg.primary;
}

/**
 * 获取主题文字类名
 */
export function getTextClass(level: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'link' | 'accent' = 'primary'): string {
  return themeClasses.text[level] || themeClasses.text.primary;
}
