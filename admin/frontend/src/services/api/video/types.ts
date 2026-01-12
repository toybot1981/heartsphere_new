/**
 * 视频处理相关类型定义
 */

export interface VideoToAnimationRequest {
  url: string;
  format?: 'gif' | 'lottie' | 'pag';
  fps?: number;
  width?: number;
  height?: number;
  quality?: number | 'low' | 'medium' | 'high';
  keepAspectRatio?: boolean;
  startTime?: number;
  duration?: number;
  lottiePrecision?: number;
  lottieOptimize?: boolean;
  pagCompressionLevel?: number;
}

export interface VideoUploadRequest {
  file: File;
  category: string;
  isSystemResource?: boolean;
}

export interface VideoProcessingResponse {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  error?: string;
}
