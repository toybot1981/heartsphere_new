/**
 * 设备检测工具函数
 * 用于检测设备类型、屏幕尺寸等
 */

/**
 * 检测是否为移动设备
 * @returns 如果是移动设备或小屏幕，返回 true
 */
export const checkIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || '';
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth < 768;
  return isMobileDevice || isSmallScreen;
};

/**
 * 检测是否为平板设备
 * @returns 如果是平板设备，返回 true
 */
export const checkIsTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || '';
  return /iPad|Android/i.test(userAgent) && window.innerWidth >= 768 && window.innerWidth < 1024;
};

/**
 * 检测是否为桌面设备
 * @returns 如果是桌面设备，返回 true
 */
export const checkIsDesktop = (): boolean => {
  if (typeof window === 'undefined') return true;
  return !checkIsMobile() && !checkIsTablet();
};

/**
 * 获取设备类型
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (checkIsMobile()) return 'mobile';
  if (checkIsTablet()) return 'tablet';
  return 'desktop';
};

