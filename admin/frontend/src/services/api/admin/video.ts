/**
 * 视频管理API客户端
 */

import { request } from '../request';

// 类型定义
export interface VideoDTO {
  id?: number;
  url: string;
  relativePath?: string;
  name: string;
  category?: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoListRequest {
  category?: string;
  isSystemResource?: boolean;
  page?: number;
  size?: number;
}

export interface VideoListResponse {
  videos: VideoDTO[];
  total: number;
  page: number;
  size: number;
}

export interface VideoUploadResponse {
  url: string;
  relativePath?: string;
  id?: number;
}

export const adminVideoApi = {
  /**
   * 获取视频列表
   */
  getVideos: async (params?: VideoListRequest): Promise<VideoListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isSystemResource !== undefined) {
      queryParams.append('isSystemResource', String(params.isSystemResource));
    }
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    
    const queryString = queryParams.toString();
    const url = `/videos${queryString ? `?${queryString}` : ''}`;
    
    return await request<VideoListResponse>(url);
  },

  /**
   * 上传视频
   */
  uploadVideo: async (file: File, category?: string): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }
    
    return await request<VideoUploadResponse>('/videos', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * 删除视频
   */
  deleteVideo: async (id: number): Promise<void> => {
    await request<void>(`/videos/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 检查PAG转换器是否可用
   */
  checkPagAvailable: async (): Promise<{ available: boolean; message: string }> => {
    return await request<{ available: boolean; message: string }>('/videos/check-pag-available');
  },

  /**
   * 将视频转换为动画（GIF/Lottie/PAG）
   */
  convertToAnimation: async (
    videoUrl: string,
    options: {
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
  ): Promise<{ url: string; relativePath: string; format: string }> => {
    return await request<{ url: string; relativePath: string; format: string }>('/videos/convert-to-animation', {
      method: 'POST',
      body: JSON.stringify({
        url: videoUrl,
        ...options,
      }),
    });
  },
};
