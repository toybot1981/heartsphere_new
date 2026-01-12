/**
 * 图片处理相关类型定义
 */

export interface ImageProcessingResponse {
  success: boolean;
  url?: string;
  error?: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface ImageCropRequest {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageThumbnailRequest {
  url: string;
  width: number;
  height: number;
}
