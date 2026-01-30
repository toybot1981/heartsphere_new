/**
 * 图像分辨率选择工具
 * 根据展示场景自动选择合适的分辨率版本
 */

/**
 * 图像展示场景
 */
export type ImageDisplayPurpose = 
  | 'thumbnail'      // 缩略图（列表、卡片等）
  | 'list'           // 列表项
  | 'detail'         // 详情页、对话框
  | 'background'     // 移动端背景
  | 'chatBackground' // PC ChatWindow背景
  | 'original';      // 原图（特殊需求，不推荐）

/**
 * 图像多分辨率版本
 */
export interface ImageVariants {
  original?: string;  // 原图URL
  thumbnail?: string; // 缩略图URL (200x200)
  medium?: string;    // 中等质量图URL (800x600)
  highQuality?: string; // 高质量背景图URL (1920x1080)
}

/**
 * 根据展示场景选择合适的分辨率版本
 * 遵循统一的映射规则和回退策略
 * @param imageUrl 原图URL或已选择的URL
 * @param variants 多分辨率版本URL（可选）
 * @param purpose 展示场景
 * @param isMobile 是否为移动端（可选，默认false）
 * @returns 选择的分辨率版本URL
 */
export function selectImageResolution(
  imageUrl: string,
  variants?: ImageVariants,
  purpose: ImageDisplayPurpose = 'detail',
  isMobile: boolean = false
): string {
  // 如果没有多分辨率版本，直接返回原图
  if (!variants) {
    console.log('[ImageResolution] 无多分辨率版本，使用原图', {
      imageUrl,
      purpose,
      isMobile
    });
    return imageUrl;
  }

  // 记录选择过程
  console.log('[ImageResolution] 开始选择图片分辨率', {
    imageUrl,
    variants: {
      original: variants.original,
      thumbnail: variants.thumbnail,
      medium: variants.medium,
      highQuality: variants.highQuality
    },
    purpose,
    isMobile
  });

  // 根据场景选择合适的分辨率，遵循统一的映射规则和回退策略
  let selectedUrl: string;
  
  switch (purpose) {
    case 'thumbnail':
    case 'list':
      // 缩略图/列表场景：优先使用 200×200 小缩略图
      // 回退策略：小缩略图不存在 → 原图
      selectedUrl = variants.thumbnail || imageUrl;
      console.log('[ImageResolution] 选择结果 (thumbnail/list)', {
        purpose,
        selectedUrl,
        usedVariant: variants.thumbnail ? 'thumbnail' : 'original',
        fallback: !variants.thumbnail
      });
      return selectedUrl;
    
    case 'detail':
      // 详情页/对话框场景：优先使用 800×600 中等质量图
      // 回退策略：中等质量图不存在 → 小缩略图 → 原图
      selectedUrl = variants.medium || variants.thumbnail || imageUrl;
      console.log('[ImageResolution] 选择结果 (detail)', {
        purpose,
        selectedUrl,
        usedVariant: variants.medium ? 'medium' : (variants.thumbnail ? 'thumbnail' : 'original'),
        fallback: !variants.medium && !variants.thumbnail
      });
      return selectedUrl;
    
    case 'background':
      // 移动端背景场景：使用 800×600 中等质量图
      // 回退策略：中等质量图不存在 → 小缩略图 → 原图
      selectedUrl = variants.medium || variants.thumbnail || imageUrl;
      console.log('[ImageResolution] 选择结果 (background)', {
        purpose,
        selectedUrl,
        usedVariant: variants.medium ? 'medium' : (variants.thumbnail ? 'thumbnail' : 'original'),
        fallback: !variants.medium && !variants.thumbnail
      });
      return selectedUrl;
    
    case 'chatBackground':
      // ChatWindow背景场景：
      // - PC端：优先使用 1920×1080 高质量图
      // - 移动端：使用 800×600 中等质量图
      // 回退策略（PC）：高质量图不存在 → 中等质量图 → 小缩略图 → 原图
      // 回退策略（移动端）：中等质量图不存在 → 小缩略图 → 原图
      if (!isMobile) {
        selectedUrl = variants.highQuality || variants.medium || variants.thumbnail || imageUrl;
        console.log('[ImageResolution] 选择结果 (chatBackground - PC)', {
          purpose,
          isMobile: false,
          selectedUrl,
          usedVariant: variants.highQuality ? 'highQuality' : (variants.medium ? 'medium' : (variants.thumbnail ? 'thumbnail' : 'original')),
          fallback: !variants.highQuality && !variants.medium && !variants.thumbnail
        });
      } else {
        selectedUrl = variants.medium || variants.thumbnail || imageUrl;
        console.log('[ImageResolution] 选择结果 (chatBackground - Mobile)', {
          purpose,
          isMobile: true,
          selectedUrl,
          usedVariant: variants.medium ? 'medium' : (variants.thumbnail ? 'thumbnail' : 'original'),
          fallback: !variants.medium && !variants.thumbnail
        });
      }
      return selectedUrl;
    
    case 'original':
      // 特殊需求场景：使用原图（不推荐，仅在特殊需求时使用）
      selectedUrl = variants.original || imageUrl;
      console.log('[ImageResolution] 选择结果 (original)', {
        purpose,
        selectedUrl,
        usedVariant: variants.original ? 'original' : 'fallback',
        fallback: !variants.original
      });
      return selectedUrl;
    
    default:
      // 默认场景：使用中等质量图
      // 回退策略：中等质量图不存在 → 小缩略图 → 原图
      selectedUrl = variants.medium || variants.thumbnail || imageUrl;
      console.log('[ImageResolution] 选择结果 (default)', {
        purpose,
        selectedUrl,
        usedVariant: variants.medium ? 'medium' : (variants.thumbnail ? 'thumbnail' : 'original'),
        fallback: !variants.medium && !variants.thumbnail
      });
      return selectedUrl;
  }
}

/**
 * 从原图URL生成多分辨率版本URL（如果已知命名规则）
 * 注意：这只是一个辅助函数，实际应该使用后端返回的variants
 * @param originalUrl 原图URL
 * @param width 目标宽度
 * @param height 目标高度
 * @returns 多分辨率版本URL
 */
export function generateVariantUrl(
  originalUrl: string,
  width: number,
  height: number
): string {
  if (!originalUrl) return originalUrl;
  
  // 如果已经是绝对URL，提取路径部分
  let path = originalUrl;
  try {
    const url = new URL(originalUrl);
    path = url.pathname;
  } catch {
    // 不是有效的URL，可能是相对路径
    path = originalUrl;
  }
  
  // 提取文件名和扩展名
  const lastSlashIndex = path.lastIndexOf('/');
  if (lastSlashIndex < 0) return originalUrl;
  
  const dirPath = path.substring(0, lastSlashIndex + 1);
  const filename = path.substring(lastSlashIndex + 1);
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex < 0) return originalUrl;
  
  const nameWithoutExt = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);
  const variantFilename = `${nameWithoutExt}_${width}*${height}${extension}`;
  
  // 如果是绝对URL，重建完整URL
  if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
    try {
      const url = new URL(originalUrl);
      return `${url.protocol}//${url.host}${dirPath}${variantFilename}`;
    } catch {
      return originalUrl;
    }
  }
  
  // 相对路径
  return dirPath + variantFilename;
}

/**
 * 检测是否为移动端
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
}
