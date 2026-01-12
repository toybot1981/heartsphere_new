// 视频API
import { request } from '../base/request';
import type {
  VideoUploadResponse,
  VideoToAnimationRequest,
  VideoToAnimationResponse,
  VideoInfoResponse,
  VideoListResponse,
} from './types';

/**
 * 视频API
 */
export const videoApi = {
  /**
   * 上传视频文件
   * @param file - 视频文件
   * @param category - 视频分类，默认为 'general'
   * @param token - 可选，用户token
   * @param isSystemResource - 是否为系统资源，默认为 false
   */
  uploadVideo: async (
    file: File,
    category: string = 'general',
    token?: string,
    isSystemResource: boolean = false
  ): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('isSystemResource', String(isSystemResource));

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await request<VideoUploadResponse>('/videos/upload', {
        method: 'POST',
        body: formData,
        headers: headers,
      });
      return response;
    } catch (error: any) {
      console.error('[videoApi] 视频上传失败:', error);
      return {
        success: false,
        error: error.message || '视频上传失败',
      };
    }
  },

  /**
   * 转换视频为动画
   * @param request - 转换请求参数
   * @param token - 可选，用户token
   */
  convertToAnimation: async (
    requestParams: VideoToAnimationRequest,
    token?: string
  ): Promise<VideoToAnimationResponse> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await request<VideoToAnimationResponse>(
        '/videos/to-animation',
        {
          method: 'POST',
          body: JSON.stringify(requestParams),
          headers: headers,
        }
      );
      return response;
    } catch (error: any) {
      console.error('[videoApi] 视频转换失败:', error);
      return {
        success: false,
        error: error.message || '视频转换失败',
      };
    }
  },

  /**
   * 获取视频信息
   * @param url - 视频URL
   * @param token - 可选，用户token
   */
  getVideoInfo: async (
    url: string,
    token?: string
  ): Promise<VideoInfoResponse> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await request<VideoInfoResponse>(
        `/videos/info?url=${encodeURIComponent(url)}`,
        {
          method: 'GET',
          headers: headers,
        }
      );
      return response;
    } catch (error: any) {
      console.error('[videoApi] 获取视频信息失败:', error);
      return {
        success: false,
        error: error.message || '获取视频信息失败',
      };
    }
  },

  /**
   * 列出视频文件
   * @param category - 分类名称，默认为 'all'（所有分类）
   * @param token - 可选，用户token
   * @param isSystemResource - 是否为系统资源，默认为 true
   */
  listVideos: async (
    category: string = 'all',
    token?: string,
    isSystemResource: boolean = true
  ): Promise<VideoListResponse> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await request<VideoListResponse>(
        `/videos/list?category=${encodeURIComponent(category)}&isSystemResource=${isSystemResource}`,
        {
          method: 'GET',
          headers: headers,
        }
      );
      return response;
    } catch (error: any) {
      console.error('[videoApi] 获取视频列表失败:', error);
      return {
        success: false,
        error: error.message || '获取视频列表失败',
      };
    }
  },

  /**
   * 检查 PAG 转换功能是否可用
   * @param token - 可选，用户token
   */
  checkPagAvailable: async (token?: string): Promise<{ success: boolean; available?: boolean; message?: string }> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await request<{ success: boolean; available?: boolean; message?: string }>(
        '/videos/pag-available',
        {
          method: 'GET',
          headers: headers,
        }
      );
      return response;
    } catch (error: any) {
      console.error('[videoApi] 检查 PAG 可用性失败:', error);
      return {
        success: false,
        available: false,
        message: '检查 PAG 转换功能状态失败',
      };
    }
  },
};
