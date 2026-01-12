// 图片管理 API
import { request } from "./request";

export interface ImageUploadResponse {
  success: boolean;
  url?: string;
  variants?: Record<string, string>;
  error?: string;
}

export type ImageVariants = Record<string, string>;

export interface ImageInfo {
  url: string;
  relativePath: string;
  name: string;
  category: string;
  size?: number;
  width?: number;
  height?: number;
  createdAt?: number;
  variants?: ImageVariants;
}

export interface ListImagesResponse {
  success: boolean;
  images?: ImageInfo[];
  error?: string;
}

export interface ProxyDownloadResponse {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export interface CropImageResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface GenerateThumbnailResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const imageApi = {
  /**
   * 上传图片
   */
  uploadImage: async (
    file: File, 
    category: string, 
    token: string, 
    isSystemResource: boolean = false
  ): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (isSystemResource) {
      formData.append('isSystemResource', 'true');
    }
    
    return request<ImageUploadResponse>('/images/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 上传 Base64 图片
   */
  uploadBase64Image: async (
    base64Data: string, 
    category: string, 
    token?: string
  ): Promise<ImageUploadResponse> => {
    return request<ImageUploadResponse>('/images/upload-base64', {
      method: 'POST',
      body: JSON.stringify({ base64Data, category }),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },

  /**
   * 列出图片
   */
  listImages: async (
    category: string = 'all',
    isSystemResource: boolean = false,
    token?: string
  ): Promise<ListImagesResponse> => {
    const params = new URLSearchParams({
      category,
      isSystemResource: String(isSystemResource),
    });
    
    return request<ListImagesResponse>(`/images?${params.toString()}`, {
      headers: token ? {
        Authorization: `Bearer ${token}`,
      } : {},
    });
  },

  /**
   * 删除图片
   */
  deleteImage: async (imageUrl: string, token: string): Promise<{ success: boolean; error?: string }> => {
    return request<{ success: boolean; error?: string }>('/images/delete', {
      method: 'DELETE',
      body: JSON.stringify({ url: imageUrl }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 代理下载图片（转换为 base64）
   */
  proxyDownload: async (imageUrl: string): Promise<ProxyDownloadResponse> => {
    return request<ProxyDownloadResponse>(`/images/proxy-download?url=${encodeURIComponent(imageUrl)}`, {
      method: 'GET',
    });
  },

  /**
   * 生成缩略图
   */
  generateThumbnail: async (
    imageUrl: string, 
    width: number, 
    height: number, 
    token: string
  ): Promise<GenerateThumbnailResponse> => {
    return request<GenerateThumbnailResponse>('/images/generate-thumbnail', {
      method: 'POST',
      body: JSON.stringify({ url: imageUrl, width, height }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 裁剪图片
   */
  cropImage: async (
    imageUrl: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    token: string
  ): Promise<CropImageResponse> => {
    return request<CropImageResponse>('/images/crop', {
      method: 'POST',
      body: JSON.stringify({ url: imageUrl, x, y, width, height }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取图片 URL（向后兼容，返回完整 URL）
   */
  getUrl: (id: number, variant?: string): string => {
    const variantParam = variant ? `?variant=${variant}` : '';
    // 返回完整 URL，用于 img src 等场景
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/admin', '') || 'http://localhost:8085';
    return `${baseUrl}/api/admin/images/${id}${variantParam}`;
  },
};
