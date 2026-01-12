/**
 * 平台检测和兼容工具
 * 支持浏览器和微信小程序环境
 */

/**
 * 平台类型
 */
export type Platform = 'browser' | 'wechat-miniprogram' | 'unknown';

/**
 * 检测当前运行平台
 */
export const detectPlatform = (): Platform => {
  // 检测微信小程序环境
  if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
    return 'wechat-miniprogram';
  }
  
  // 检测浏览器环境
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'browser';
  }
  
  return 'unknown';
};

/**
 * 当前平台
 */
export const currentPlatform = detectPlatform();

/**
 * 是否为浏览器环境
 */
export const isBrowser = currentPlatform === 'browser';

/**
 * 是否为微信小程序环境
 */
export const isWeChatMiniProgram = currentPlatform === 'wechat-miniprogram';

/**
 * 安全访问window对象
 */
export const safeWindow = (): Window | undefined => {
  if (isBrowser) {
    return window;
  }
  return undefined;
};

/**
 * 安全访问document对象
 */
export const safeDocument = (): Document | undefined => {
  if (isBrowser) {
    return document;
  }
  return undefined;
};

/**
 * 安全访问localStorage
 */
export const safeLocalStorage = (): Storage | null => {
  if (isBrowser && typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

/**
 * 安全访问navigator对象
 */
export const safeNavigator = (): Navigator | undefined => {
  if (isBrowser && typeof navigator !== 'undefined') {
    return navigator;
  }
  return undefined;
};

/**
 * 获取系统信息（兼容浏览器和微信小程序）
 */
export interface SystemInfo {
  platform: string;
  system: string;
  version: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  safeArea?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  };
}

export const getSystemInfo = (): SystemInfo => {
  if (isWeChatMiniProgram && typeof wx !== 'undefined') {
    const info = wx.getSystemInfoSync();
    return {
      platform: 'wechat-miniprogram',
      system: info.system || '',
      version: info.version || '',
      screenWidth: info.screenWidth || 375,
      screenHeight: info.screenHeight || 667,
      pixelRatio: info.pixelRatio || 2,
      safeArea: info.safeArea ? {
        top: info.safeArea.top || 0,
        bottom: info.safeArea.bottom || 0,
        left: info.safeArea.left || 0,
        right: info.safeArea.right || 0,
        width: info.safeArea.width || info.screenWidth || 375,
        height: info.safeArea.height || info.screenHeight || 667,
      } : undefined,
    };
  }
  
  if (isBrowser && typeof window !== 'undefined') {
    return {
      platform: 'browser',
      system: navigator.platform || '',
      version: navigator.userAgent || '',
      screenWidth: window.innerWidth || 375,
      screenHeight: window.innerHeight || 667,
      pixelRatio: window.devicePixelRatio || 1,
      safeArea: undefined, // 浏览器不支持safeArea
    };
  }
  
  // 默认值
  return {
    platform: 'unknown',
    system: '',
    version: '',
    screenWidth: 375,
    screenHeight: 667,
    pixelRatio: 1,
  };
};

/**
 * 转换px到rpx（微信小程序单位）
 * 在浏览器中返回px值
 */
export const pxToRpx = (px: number): string => {
  if (isWeChatMiniProgram) {
    const rpx = (px / 375) * 750; // 基于375px设计稿
    return `${rpx}rpx`;
  }
  return `${px}px`;
};

/**
 * 转换rpx到px（用于浏览器）
 */
export const rpxToPx = (rpx: number): number => {
  if (isBrowser) {
    const systemInfo = getSystemInfo();
    return (rpx / 750) * systemInfo.screenWidth;
  }
  return rpx;
};
