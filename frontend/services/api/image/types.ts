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

