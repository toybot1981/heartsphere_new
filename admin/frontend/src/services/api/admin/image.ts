/**
 * 图片管理API客户端
 */

import { request } from '../request';

// 类型定义
export interface ImageDTO {
  id: number;
  url: string;
  thumbnailUrl?: string;
  category?: string;
  isSystemResource?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImageListRequest {
  category?: string;
  isSystemResource?: boolean;
  page?: number;
  size?: number;
}

export interface ImageListResponse {
  images: ImageDTO[];
  total: number;
  page: number;
  size: number;
}

export interface ImageUploadResponse {
  url: string;
  thumbnailUrl?: string;
  id?: number;
}

export interface GenerateThumbnailRequest {
  width: number;
  height: number;
  keepAspectRatio?: boolean;
  quality?: number;
}

export const adminImageApi = {
  /**
   * 获取图片列表
   */
  getImages: async (params?: ImageListRequest): Promise<ImageListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isSystemResource !== undefined) {
      queryParams.append('isSystemResource', String(params.isSystemResource));
    }
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    
    const queryString = queryParams.toString();
    const url = `/images${queryString ? `?${queryString}` : ''}`;
    
    return await request<ImageListResponse>(url);
  },

  /**
   * 上传图片
   */
  uploadImage: async (file: File, category?: string): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }
    
    return await request<ImageUploadResponse>('/images', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * 删除图片
   */
  deleteImage: async (id: number): Promise<void> => {
    await request<void>(`/images/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 生成缩略图（支持自定义宽高比例）
   */
  generateThumbnail: async (
    imageUrl: string,
    params: GenerateThumbnailRequest
  ): Promise<ImageUploadResponse> => {
    return await request<ImageUploadResponse>('/images/generate-thumbnail', {
      method: 'POST',
      body: JSON.stringify({
        url: imageUrl,
        width: params.width,
        height: params.height,
        keepAspectRatio: params.keepAspectRatio !== undefined ? params.keepAspectRatio : true,
        quality: params.quality !== undefined ? params.quality : 0.85,
      }),
    });
  },

  /**
   * 一键生成所有缩略图（200x200小缩略图、中等质量、高质量）
   */
  generateAllThumbnails: async (
    imageUrl: string
  ): Promise<{
    smallThumbnail?: string;
    smallThumbnailPath?: string;
    smallThumbnailError?: string;
    medium?: string;
    mediumPath?: string;
    mediumError?: string;
    highQuality?: string;
    highQualityPath?: string;
    highQualityError?: string;
  }> => {
    return await request('/images/generate-all-thumbnails', {
      method: 'POST',
      body: JSON.stringify({
        url: imageUrl,
      }),
    });
  },

  /**
   * 批量生成所有图片的缩略图（只生成未生成的）
   */
  batchGenerateThumbnails: async (
    category?: string
  ): Promise<{
    total: number;
    processed: number;
    generated: number;
    skipped: number;
    failed: number;
    results: Array<{
      id: number;
      name: string;
      url: string;
      status: 'success' | 'skipped' | 'failed';
      message: string;
      generated?: Record<string, string>;
    }>;
  }> => {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    
    const queryString = queryParams.toString();
    const url = `/images/batch-generate-thumbnails${queryString ? `?${queryString}` : ''}`;
    
    return await request(url, {
      method: 'POST',
    });
  },
};
