/**
 * 技能资源管理服务
 * 提供技能资源（scripts/, references/, assets/）的 API 调用方法
 */

import { request } from '../api/request';

export interface SkillResource {
  id: number;
  skillId: string;
  resourceType: 'SCRIPT' | 'REFERENCE' | 'ASSET';
  resourceName: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  orderIndex: number;
  resourceContent?: string;
  resourceUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResourceRequest {
  file: File;
  resourceType: 'SCRIPT' | 'REFERENCE' | 'ASSET';
  description?: string;
}

export interface UpdateResourceRequest {
  description?: string;
  orderIndex?: number;
}

export class SkillResourceService {
  /**
   * 上传资源文件
   * @param skillId - 技能ID
   * @param file - 文件对象
   * @param resourceType - 资源类型
   * @param description - 资源描述（可选）
   * @param token - 可选的管理员token
   */
  async uploadResource(
    skillId: string,
    file: File,
    resourceType: 'SCRIPT' | 'REFERENCE' | 'ASSET',
    description?: string,
    token?: string | null
  ): Promise<SkillResource> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', resourceType);
      if (description) {
        formData.append('description', description);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await request<{ code: number; message: string; data: SkillResource }>(
        `/skills/${skillId}/resources`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      if (response.code !== 200) {
        throw new Error(response.message || '上传资源失败');
      }

      return response.data;
    } catch (error: any) {
      console.error('[SkillResourceService] 上传资源失败:', error);
      throw error;
    }
  }

  /**
   * 获取技能资源列表
   * @param skillId - 技能ID
   * @param resourceType - 资源类型（可选，用于筛选）
   * @param token - 可选的管理员token
   */
  async getResources(
    skillId: string,
    resourceType?: 'SCRIPT' | 'REFERENCE' | 'ASSET',
    token?: string | null
  ): Promise<SkillResource[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = resourceType
        ? `/skills/${skillId}/resources?resourceType=${resourceType}`
        : `/skills/${skillId}/resources`;

      const response = await request<{ code: number; message: string; data: SkillResource[] }>(
        url,
        {
          method: 'GET',
          headers,
        }
      );

      if (response.code !== 200) {
        throw new Error(response.message || '获取资源列表失败');
      }

      return response.data || [];
    } catch (error: any) {
      console.error('[SkillResourceService] 获取资源列表失败:', error);
      throw error;
    }
  }

  /**
   * 删除资源
   * @param skillId - 技能ID
   * @param resourceId - 资源ID
   * @param token - 可选的管理员token
   */
  async deleteResource(
    skillId: string,
    resourceId: number,
    token?: string | null
  ): Promise<void> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await request<{ code: number; message: string }>(
        `/skills/${skillId}/resources/${resourceId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (response.code !== 200) {
        throw new Error(response.message || '删除资源失败');
      }
    } catch (error: any) {
      console.error('[SkillResourceService] 删除资源失败:', error);
      throw error;
    }
  }

  /**
   * 更新资源
   * @param skillId - 技能ID
   * @param resourceId - 资源ID
   * @param updateData - 更新数据（description 或 orderIndex）
   * @param token - 可选的管理员token
   */
  async updateResource(
    skillId: string,
    resourceId: number,
    updateData: UpdateResourceRequest,
    token?: string | null
  ): Promise<SkillResource> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await request<{ code: number; message: string; data: SkillResource }>(
        `/skills/${skillId}/resources/${resourceId}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateData),
        }
      );

      if (response.code !== 200) {
        throw new Error(response.message || '更新资源失败');
      }

      return response.data;
    } catch (error: any) {
      console.error('[SkillResourceService] 更新资源失败:', error);
      throw error;
    }
  }
}
