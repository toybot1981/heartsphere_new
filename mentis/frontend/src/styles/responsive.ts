/**
 * 响应式设计工具函数
 */

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

/**
 * 媒体查询 Hook（简化版）
 * 注意：实际使用中应该使用 Material-UI 的 useMediaQuery Hook
 */
export const useBreakpoint = () => {
  if (typeof window === 'undefined') {
    return 'lg';
  }

  const width = window.innerWidth;
  
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * 判断是否为移动设备
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
};

/**
 * 判断是否为平板设备
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= breakpoints.sm && width < breakpoints.lg;
};

/**
 * 判断是否为桌面设备
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= breakpoints.lg;
};
