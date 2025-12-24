// 图片API
import { request } from '../base/request';
import type {
  ProxyDownloadResponse,
  ImageUploadResponse,
  ImageDeleteResponse,
} from './types';

/**
 * 图片API
 */
export const imageApi = {
  /**
   * 代理下载图片（绕过CORS限制）
   * 通过后端代理从外部URL下载图片并返回base64 data URL
   * @param url - 图片URL
   */
  proxyDownload: async (
    url: string
  ): Promise<ProxyDownloadResponse> => {
    try {
      const response = await request<ProxyDownloadResponse>(
        `/images/proxy-download?url=${encodeURIComponent(url)}`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error: any) {
      console.error('[imageApi] 代理下载失败:', error);
      return {
        success: false,
        error: error.message || '代理下载失败',
      };
    }
  },

  /**
   * 上传图片文件
   * @param file - 图片文件
   * @param category - 图片分类，默认为 'general'
   * @param token - 可选，用户token
   */
  uploadImage: (
    file: File,
    category: string = 'general',
    token?: string
  ): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ImageUploadResponse>('/images/upload', {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  },

  /**
   * 上传Base64图片
   * @param base64Data - Base64编码的图片数据
   * @param category - 图片分类，默认为 'general'
   * @param token - 可选，用户token
   */
  uploadBase64Image: (
    base64Data: string,
    category: string = 'general',
    token?: string
  ): Promise<ImageUploadResponse> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ImageUploadResponse>('/images/upload-base64', {
      method: 'POST',
      body: JSON.stringify({ base64: base64Data, category }),
      headers: headers,
    });
  },

  /**
   * 删除图片
   * @param imageUrl - 图片URL
   * @param token - 可选，用户token
   */
  deleteImage: (
    imageUrl: string,
    token?: string
  ): Promise<ImageDeleteResponse> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ImageDeleteResponse>(
      `/images/delete?url=${encodeURIComponent(imageUrl)}`,
      {
        method: 'DELETE',
        headers: headers,
      }
    );
  },
};

