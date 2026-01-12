/**
 * 响应式图片工具
 * Phase 5: 实现srcset支持，根据设备像素比选择尺寸
 */

/**
 * 获取设备像素比（Device Pixel Ratio）
 */
export const getDevicePixelRatio = (): number => {
  if (typeof window === 'undefined') {
    return 1;
  }
  return window.devicePixelRatio || 1;
};

/**
 * 获取屏幕宽度（逻辑像素）
 */
export const getScreenWidth = (): number => {
  if (typeof window === 'undefined') {
    return 375; // 默认iPhone宽度
  }
  return window.innerWidth || window.screen.width || 375;
};

/**
 * 获取屏幕高度（逻辑像素）
 */
export const getScreenHeight = (): number => {
  if (typeof window === 'undefined') {
    return 667; // 默认iPhone高度
  }
  return window.innerHeight || window.screen.height || 667;
};

/**
 * 图片尺寸配置
 * 根据设备类型和用途定义不同的尺寸
 */
export interface ImageSizeConfig {
  // 移动端尺寸（逻辑像素）
  mobile: {
    thumbnail: number;    // 缩略图: 100x100
    small: number;        // 小图: 200x200
    medium: number;       // 中图: 400x400
    large: number;        // 大图: 800x800
    xlarge: number;       // 超大图: 1200x1200
  };
  // 平板尺寸（逻辑像素）
  tablet: {
    thumbnail: number;
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

/**
 * 默认图片尺寸配置
 */
const DEFAULT_IMAGE_SIZES: ImageSizeConfig = {
  mobile: {
    thumbnail: 100,
    small: 200,
    medium: 400,
    large: 800,
    xlarge: 1200,
  },
  tablet: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
    xlarge: 1920,
  },
};

/**
 * 检测设备类型
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') {
    return 'mobile';
  }

  const width = getScreenWidth();
  
  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * 生成响应式图片URL
 * 根据设备像素比和屏幕尺寸生成合适尺寸的图片URL
 * 
 * @param originalUrl 原始图片URL
 * @param size 目标尺寸（逻辑像素）
 * @param dpr 设备像素比（可选，自动检测）
 * @returns 响应式图片URL
 */
export const generateResponsiveImageUrl = (
  originalUrl: string,
  size: number,
  dpr?: number
): string => {
  if (!originalUrl) return originalUrl;

  // 如果已经是data URI或SVG，直接返回
  if (originalUrl.startsWith('data:') || originalUrl.endsWith('.svg')) {
    return originalUrl;
  }

  const devicePixelRatio = dpr || getDevicePixelRatio();
  // 实际需要的物理像素 = 逻辑像素 × 设备像素比
  const physicalSize = Math.ceil(size * devicePixelRatio);

  // 处理URL（支持绝对路径和相对路径）
  try {
    let url: URL;
    let isAbsolute = false;

    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      // 绝对路径
      url = new URL(originalUrl);
      isAbsolute = true;
    } else {
      // 相对路径，使用当前页面作为base
      if (typeof window !== 'undefined') {
        url = new URL(originalUrl, window.location.origin);
      } else {
        // SSR环境，直接添加查询参数
        const separator = originalUrl.includes('?') ? '&' : '?';
        return `${originalUrl}${separator}w=${physicalSize}`;
      }
    }

    // 检查是否已有尺寸参数
    if (url.searchParams.has('w') || url.searchParams.has('width')) {
      // 如果已有尺寸参数，更新它
      url.searchParams.set('w', physicalSize.toString());
    } else {
      // 添加尺寸参数
      url.searchParams.set('w', physicalSize.toString());
    }

    // 返回完整URL
    if (isAbsolute) {
      return url.toString();
    } else {
      // 相对路径，只返回路径和查询字符串部分
      return url.pathname + url.search;
    }
  } catch (error) {
    // URL解析失败，直接添加查询参数
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}w=${physicalSize}`;
  }
};

/**
 * 生成srcset字符串
 * 为不同设备像素比生成多个尺寸的图片URL
 * 
 * @param originalUrl 原始图片URL
 * @param baseSize 基础尺寸（逻辑像素）
 * @param sizes 要生成的尺寸列表（设备像素比）
 * @returns srcset字符串
 */
export const generateSrcSet = (
  originalUrl: string,
  baseSize: number,
  sizes: number[] = [1, 2, 3]
): string => {
  if (!originalUrl) return '';

  // 如果已经是data URI或SVG，直接返回
  if (originalUrl.startsWith('data:') || originalUrl.endsWith('.svg')) {
    return '';
  }

  const srcSetEntries = sizes.map(dpr => {
    const url = generateResponsiveImageUrl(originalUrl, baseSize, dpr);
    return `${url} ${dpr}x`;
  });

  return srcSetEntries.join(', ');
};

/**
 * 根据用途获取推荐尺寸
 * 
 * @param purpose 图片用途
 * @param deviceType 设备类型（可选，自动检测）
 * @returns 推荐尺寸（逻辑像素）
 */
export const getRecommendedSize = (
  purpose: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge',
  deviceType?: 'mobile' | 'tablet' | 'desktop'
): number => {
  const device = deviceType || getDeviceType();
  const sizes = device === 'mobile' 
    ? DEFAULT_IMAGE_SIZES.mobile 
    : DEFAULT_IMAGE_SIZES.tablet;
  
  return sizes[purpose];
};

/**
 * 生成完整的响应式图片配置
 * 包括src、srcset、sizes属性
 * 
 * @param originalUrl 原始图片URL
 * @param purpose 图片用途
 * @param deviceType 设备类型（可选）
 * @returns 响应式图片配置
 */
export const generateResponsiveImageConfig = (
  originalUrl: string,
  purpose: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' = 'medium',
  deviceType?: 'mobile' | 'tablet' | 'desktop'
) => {
  const recommendedSize = getRecommendedSize(purpose, deviceType);
  const devicePixelRatio = getDevicePixelRatio();
  
  // 生成默认src（1x设备像素比）
  const src = generateResponsiveImageUrl(originalUrl, recommendedSize, 1);
  
  // 生成srcset（支持1x, 2x, 3x）
  const srcSet = generateSrcSet(originalUrl, recommendedSize, [1, 2, 3]);
  
  // 生成sizes属性（根据设备类型）
  const device = deviceType || getDeviceType();
  let sizes: string;
  
  if (device === 'mobile') {
    // 移动端：图片通常占满容器宽度
    sizes = '100vw';
  } else if (device === 'tablet') {
    // 平板：图片可能占50-100%宽度
    sizes = '(max-width: 768px) 100vw, 50vw';
  } else {
    // 桌面端：图片可能占25-50%宽度
    sizes = '(max-width: 1024px) 50vw, 25vw';
  }

  return {
    src,
    srcSet,
    sizes,
    recommendedSize,
    devicePixelRatio,
  };
};

/**
 * 优化移动端图片尺寸
 * 根据实际显示尺寸和用途，选择最合适的图片尺寸
 * 
 * @param originalUrl 原始图片URL
 * @param displayWidth 显示宽度（逻辑像素）
 * @param displayHeight 显示高度（逻辑像素，可选）
 * @param purpose 图片用途（可选）
 * @returns 优化后的图片URL
 */
export const optimizeMobileImageSize = (
  originalUrl: string,
  displayWidth: number,
  displayHeight?: number,
  purpose?: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge'
): string => {
  if (!originalUrl) return originalUrl;

  // 如果指定了用途，使用推荐尺寸
  if (purpose) {
    const recommendedSize = getRecommendedSize(purpose, 'mobile');
    return generateResponsiveImageUrl(originalUrl, recommendedSize);
  }

  // 否则根据显示尺寸计算
  const maxDimension = displayHeight 
    ? Math.max(displayWidth, displayHeight)
    : displayWidth;
  
  // 根据设备像素比调整
  const devicePixelRatio = getDevicePixelRatio();
  const physicalSize = Math.ceil(maxDimension * devicePixelRatio);
  
  // 选择最接近的尺寸档位
  const sizes = DEFAULT_IMAGE_SIZES.mobile;
  let targetSize: number;
  
  if (physicalSize <= sizes.thumbnail) {
    targetSize = sizes.thumbnail;
  } else if (physicalSize <= sizes.small) {
    targetSize = sizes.small;
  } else if (physicalSize <= sizes.medium) {
    targetSize = sizes.medium;
  } else if (physicalSize <= sizes.large) {
    targetSize = sizes.large;
  } else {
    targetSize = sizes.xlarge;
  }

  return generateResponsiveImageUrl(originalUrl, targetSize);
};
