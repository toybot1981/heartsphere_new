// 相册插件API
import { request } from '../base/request';

export interface Album {
  id: number;
  name: string;
  description?: string;
  coverPhotoUrl?: string;
  photoCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: number;
  albumId: number;
  title?: string;
  description?: string;
  photoUrl: string;
  thumbnailUrl?: string;
  takenAt?: string;
  location?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlbumRequest {
  pluginInstanceId: number;
  name: string;
  description?: string;
  tags?: string[];
}

export interface UpdateAlbumRequest {
  name?: string;
  description?: string;
  tags?: string[];
  coverPhotoId?: number;
}

export interface CreatePhotoRequest {
  title?: string;
  description?: string;
  takenAt?: string;
  location?: string;
  tags?: string[];
}

/**
 * 相册插件API
 */
export const photoAlbumApi = {
  /**
   * 获取相册列表
   */
  getAlbums: (pluginInstanceId?: number, token?: string): Promise<Album[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const queryParams = new URLSearchParams();
    if (pluginInstanceId) {
      queryParams.append('pluginInstanceId', String(pluginInstanceId));
    }

    return request<Album[]>(`/plugins/photo-album/albums${queryParams.toString() ? '?' + queryParams.toString() : ''}`, {
      headers,
    });
  },

  /**
   * 获取相册详情
   */
  getAlbumById: (albumId: number, token?: string): Promise<Album> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<Album>(`/plugins/photo-album/albums/${albumId}`, {
      headers,
    });
  },

  /**
   * 创建相册
   */
  createAlbum: (requestData: CreateAlbumRequest, token?: string): Promise<Album> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<Album>('/plugins/photo-album/albums', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
    });
  },

  /**
   * 更新相册
   */
  updateAlbum: (albumId: number, requestData: UpdateAlbumRequest, token?: string): Promise<Album> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<Album>(`/plugins/photo-album/albums/${albumId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestData),
    });
  },

  /**
   * 删除相册
   */
  deleteAlbum: (albumId: number, token?: string): Promise<void> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<void>(`/plugins/photo-album/albums/${albumId}`, {
      method: 'DELETE',
      headers,
    });
  },

  /**
   * 获取相册中的照片列表
   */
  getPhotos: (albumId: number, token?: string): Promise<Photo[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<Photo[]>(`/plugins/photo-album/albums/${albumId}/photos`, {
      headers,
    });
  },

  /**
   * 上传照片
   */
  uploadPhoto: (
    albumId: number,
    file: File,
    requestData?: CreatePhotoRequest,
    token?: string
  ): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', file);
    if (requestData?.title) formData.append('title', requestData.title);
    if (requestData?.description) formData.append('description', requestData.description);
    if (requestData?.takenAt) formData.append('takenAt', requestData.takenAt);
    if (requestData?.location) formData.append('location', requestData.location);
    if (requestData?.tags) formData.append('tags', JSON.stringify(requestData.tags));

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // 注意：不要设置 Content-Type，让浏览器自动设置 multipart/form-data 边界

    return request<Photo>(`/plugins/photo-album/albums/${albumId}/photos`, {
      method: 'POST',
      headers,
      body: formData,
    });
  },

  /**
   * 获取照片详情
   */
  getPhotoById: (photoId: number, token?: string): Promise<Photo> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<Photo>(`/plugins/photo-album/photos/${photoId}`, {
      headers,
    });
  },

  /**
   * 更新照片信息
   */
  updatePhoto: (photoId: number, requestData: CreatePhotoRequest, token?: string): Promise<Photo> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<Photo>(`/plugins/photo-album/photos/${photoId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestData),
    });
  },

  /**
   * 删除照片
   */
  deletePhoto: (photoId: number, token?: string): Promise<void> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<void>(`/plugins/photo-album/photos/${photoId}`, {
      method: 'DELETE',
      headers,
    });
  },
};
