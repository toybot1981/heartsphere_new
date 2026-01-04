/**
 * WebP格式支持检测工具
 * Phase 5优化: 检测浏览器WebP支持，自动选择最佳图片格式
 */

/**
 * 检测浏览器是否支持WebP格式
 */
export const checkWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    // 1x1像素的WebP测试图片（base64编码）
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * 缓存WebP支持检测结果
 */
let webPSupportCache: boolean | null = null;
let webPSupportCheckPromise: Promise<boolean> | null = null;

/**
 * 获取WebP支持状态（带缓存）
 */
export const getWebPSupport = async (): Promise<boolean> => {
  if (webPSupportCache !== null) {
    return webPSupportCache;
  }

  if (webPSupportCheckPromise) {
    return webPSupportCheckPromise;
  }

  webPSupportCheckPromise = checkWebPSupport();
  webPSupportCache = await webPSupportCheckPromise;
  return webPSupportCache;
};

/**
 * 将图片URL转换为WebP格式
 * 如果URL已经是WebP格式或外部URL，直接返回原URL
 * 
 * @param url 原始图片URL
 * @returns WebP格式的URL或原URL
 */
export const convertToWebP = (url: string): string => {
  if (!url) return url;

  // 如果已经是WebP格式，直接返回
  if (url.toLowerCase().includes('.webp')) {
    return url;
  }

  // 如果是外部URL（http://或https://开头），尝试转换为WebP
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // 检查是否是外部图片服务（如picsum.photos），如果是则不转换
    if (url.includes('picsum.photos') || url.includes('placeholder')) {
      return url;
    }
    
    // 对于内部图片，尝试添加.webp扩展名或替换扩展名
    // 注意：这需要后端支持WebP格式的图片
    const urlWithoutQuery = url.split('?')[0];
    const extension = urlWithoutQuery.match(/\.(jpg|jpeg|png|gif)$/i);
    
    if (extension) {
      // 替换扩展名为.webp
      return urlWithoutQuery.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp') + (url.includes('?') ? url.substring(url.indexOf('?')) : '');
    }
    
    // 如果没有扩展名，尝试添加.webp
    return url + (url.includes('?') ? '&' : '?') + 'format=webp';
  }

  // 对于相对路径，尝试添加.webp扩展名
  const urlWithoutQuery = url.split('?')[0];
  const extension = urlWithoutQuery.match(/\.(jpg|jpeg|png|gif)$/i);
  
  if (extension) {
    return urlWithoutQuery.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp') + (url.includes('?') ? url.substring(url.indexOf('?')) : '');
  }

  return url;
};

/**
 * 获取最佳图片URL（根据浏览器支持自动选择WebP或原格式）
 * 
 * @param originalUrl 原始图片URL
 * @param preferWebP 是否优先使用WebP（默认true）
 * @returns 最佳图片URL
 */
export const getOptimalImageUrl = async (
  originalUrl: string,
  preferWebP: boolean = true
): Promise<string> => {
  if (!originalUrl) return originalUrl;

  // 如果已经是WebP格式，直接返回
  if (originalUrl.toLowerCase().includes('.webp')) {
    return originalUrl;
  }

  // 如果不优先使用WebP，直接返回原URL
  if (!preferWebP) {
    return originalUrl;
  }

  // 检查WebP支持
  const supportsWebP = await getWebPSupport();
  
  if (supportsWebP) {
    return convertToWebP(originalUrl);
  }

  return originalUrl;
};
