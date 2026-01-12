// 视频管理 API
import { request } from "./request";

export interface VideoUploadResponse {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface VideoInfo {
  url: string;
  relativePath: string;
  name: string;
  category: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  createdAt?: number;
}

export interface ListVideosResponse {
  success: boolean;
  videos?: VideoInfo[];
  error?: string;
}

export interface ConvertToAnimationResponse {
  success: boolean;
  animationUrl?: string;
  error?: string;
}

export interface CheckPagAvailableResponse {
  success: boolean;
  available?: boolean;
  error?: string;
}

export const videoApi = {
  /**
   * 上传视频
   */
  uploadVideo: async (
    file: File, 
    category: string, 
    token: string, 
    isSystemResource: boolean = false
  ): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (isSystemResource) {
      formData.append('isSystemResource', 'true');
    }
    
    return request<VideoUploadResponse>('/videos/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 列出视频
   */
  listVideos: async (
    category: string = 'all',
    token?: string,
    isSystemResource: boolean = false
  ): Promise<ListVideosResponse> => {
    const params = new URLSearchParams({
      category,
      isSystemResource: String(isSystemResource),
    });
    
    return request<ListVideosResponse>(`/videos?${params.toString()}`, {
      headers: token ? {
        Authorization: `Bearer ${token}`,
      } : {},
    });
  },

  /**
   * 转换为动画
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
    }, 
    token: string
  ): Promise<ConvertToAnimationResponse> => {
    return request<ConvertToAnimationResponse>('/videos/convert-to-animation', {
      method: 'POST',
      body: JSON.stringify({ url: videoUrl, ...options }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 检查 PAG 可用性
   */
  checkPagAvailable: async (token?: string): Promise<CheckPagAvailableResponse> => {
    return request<CheckPagAvailableResponse>('/videos/check-pag-available', {
      headers: token ? {
        Authorization: `Bearer ${token}`,
      } : {},
    });
  },

  /**
   * 获取视频 URL（向后兼容，返回完整 URL）
   */
  getUrl: (id: number): string => {
    // 返回完整 URL，用于 video src 等场景
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/admin', '') || 'http://localhost:8085';
    return `${baseUrl}/api/admin/videos/${id}`;
  },
};
