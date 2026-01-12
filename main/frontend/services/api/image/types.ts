// 图片API类型定义

/**
 * 代理下载图片响应
 */
export interface ProxyDownloadResponse {
  success: boolean;
  dataUrl?: string;
  error?: string;
  size?: number;
}

/**
 * 图片上传响应
 */
export interface ImageUploadResponse {
  success: boolean;
  url: string;
  message: string;
  error?: string;
}

/**
 * 图片删除响应
 */
export interface ImageDeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * 图片处理响应
 */
export interface ImageProcessingResponse {
  success: boolean;
  url?: string;
  relativePath?: string;
  originalSize?: number;
  processedSize?: number;
  width?: number;
  height?: number;
  message?: string;
  error?: string;
}

/**
 * 图片列表项
 */
export interface ImageListItem {
  id: string;
  url: string;
  relativePath: string;
  category: string;
  isSystemResource: boolean;
  createdAt: string;
  updatedAt: string;
  width?: number;
  height?: number;
  size?: number;
  userId?: string;
}

/**
 * 图片列表响应
 */
export interface ImageListResponse {
  success: boolean;
  data: ImageListItem[];
  total: number;
  message?: string;
}

/**
 * 图片变体
 */
export interface ImageVariants {
  original: string;
  thumbnail?: string;
  medium?: string;
  small?: string;
  square?: string;
  variants?: Record<string, string>;
}