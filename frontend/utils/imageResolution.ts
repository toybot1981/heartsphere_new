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
    return imageUrl;
  }

  // 根据场景选择合适的分辨率
  switch (purpose) {
    case 'thumbnail':
    case 'list':
      // 缩略图/列表：优先使用缩略图
      return variants.thumbnail || imageUrl;
    
    case 'detail':
      // 详情页/对话框：优先使用中等质量图
      return variants.medium || imageUrl;
    
    case 'background':
      // 移动端背景：使用中等质量图
      return variants.medium || imageUrl;
    
    case 'chatBackground':
      // PC ChatWindow背景：优先使用高质量背景图，其次中等质量图
      if (!isMobile) {
        return variants.highQuality || variants.medium || imageUrl;
      } else {
        // 移动端ChatWindow背景使用中等质量图
        return variants.medium || imageUrl;
      }
    
    case 'original':
      // 特殊需求：使用原图
      return variants.original || imageUrl;
    
    default:
      // 默认使用中等质量图
      return variants.medium || imageUrl;
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
