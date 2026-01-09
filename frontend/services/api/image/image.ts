// 图片API
import { request } from '../base/request';
import type {
  ProxyDownloadResponse,
  ImageUploadResponse,
  ImageDeleteResponse,
  ImageProcessingResponse,
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
   * @param isSystemResource - 是否为系统资源，默认为 false。如果为 true，则不包含 userId
   */
  uploadImage: (
    file: File,
    category: string = 'general',
    token?: string,
    isSystemResource: boolean = false
  ): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (isSystemResource) {
      formData.append('isSystemResource', 'true');
    }

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

  /**
   * 生成缩略图
   * @param imageUrl - 图片URL或相对路径
   * @param width - 可选，目标宽度
   * @param height - 可选，目标高度
   * @param keepAspectRatio - 可选，是否保持宽高比，默认true
   * @param quality - 可选，压缩质量(0.0-1.0)，默认0.85
   * @param token - 可选，用户token
   */
  generateThumbnail: (
    imageUrl: string,
    width?: number,
    height?: number,
    keepAspectRatio?: boolean,
    quality?: number,
    token?: string
  ): Promise<ImageProcessingResponse> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const body: any = { url: imageUrl };
    if (width !== undefined) body.width = width;
    if (height !== undefined) body.height = height;
    if (keepAspectRatio !== undefined) body.keepAspectRatio = keepAspectRatio;
    if (quality !== undefined) body.quality = quality;

    return request<ImageProcessingResponse>('/images/thumbnail', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    });
  },

  /**
   * 裁剪图片
   * @param imageUrl - 图片URL或相对路径
   * @param x - 裁剪起始X坐标
   * @param y - 裁剪起始Y坐标
   * @param width - 裁剪宽度
   * @param height - 裁剪高度
   * @param token - 可选，用户token
   */
  cropImage: (
    imageUrl: string,
    x: number,
    y: number,
    width: number,
    height: number,
    token?: string
  ): Promise<ImageProcessingResponse> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ImageProcessingResponse>('/images/crop', {
      method: 'POST',
      body: JSON.stringify({
        url: imageUrl,
        x,
        y,
        width,
        height,
      }),
      headers: headers,
    });
  },

  /**
   * 获取图片列表（主要用于系统预置资源）
   * @param category - 图片分类，默认为 'all'
   * @param isSystemResource - 是否只获取系统资源，默认为 true
   * @param token - 可选，用户token
   */
  listImages: (
    category: string = 'all',
    isSystemResource: boolean = true,
    token?: string
  ): Promise<ImageListResponse> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ImageListResponse>(
      `/images/list?category=${encodeURIComponent(category)}&isSystemResource=${isSystemResource}`,
      {
        method: 'GET',
        headers: headers,
      }
    );
  },
};

