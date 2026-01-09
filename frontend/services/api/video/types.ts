/**
 * 视频上传响应
 */
export interface VideoUploadResponse {
  success: boolean;
  url?: string;
  relativePath?: string;
  message?: string;
  error?: string;
}

/**
 * 视频转动画请求参数
 */
export interface VideoToAnimationRequest {
  url: string;
  format?: 'gif' | 'lottie' | 'pag';
  fps?: number;
  width?: number;
  height?: number;
  keepAspectRatio?: boolean;
  quality?: 'low' | 'medium' | 'high';
  startTime?: number;
  duration?: number;
  lottiePrecision?: number;
  lottieOptimize?: boolean;
  pagCompressionLevel?: number;
}

/**
 * 视频转动画响应
 */
export interface VideoToAnimationResponse {
  success: boolean;
  url?: string;
  relativePath?: string;
  format?: string;
  originalSize?: number;
  message?: string;
  error?: string;
}

/**
 * 视频信息
 */
export interface VideoInfo {
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  fileSize: number;
  format: string;
  codec: string;
}

/**
 * 视频信息响应
 */
export interface VideoInfoResponse {
  success: boolean;
  width?: number;
  height?: number;
  duration?: number;
  frameRate?: number;
  fileSize?: number;
  format?: string;
  codec?: string;
  error?: string;
}

/**
 * 视频列表项
 */
export interface VideoListItem {
  url: string;
  relativePath: string;
  name: string;
  category: string;
  size: number;
  createdAt: string | Date;
}

/**
 * 视频列表响应
 */
export interface VideoListResponse {
  success: boolean;
  videos?: VideoListItem[];
  count?: number;
  error?: string;
}
