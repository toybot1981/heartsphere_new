/**
 * 技能服务 - Admin 前端版本
 * 负责与后端技能系统 API 交互
 */

import { request } from '../api/request';

/**
 * Function Definition（用于 AI Function Calling）
 */
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

/**
 * 技能定义
 */
export interface SkillDefinition {
  id?: number;
  skillId: string;
  name: string;
  description: string;
  category?: string;
  skillType?: string;
  executionType?: string;
  functionSchema?: string;
  executionConfig?: string;
  autoTriggerKeywords?: string;
  maxUsagePerDay?: number;
  version?: string;
  author?: string;
  isSystemSkill?: boolean;
}

/**
 * 角色技能装备
 */
export interface CharacterSkillBinding {
  id: number;
  characterId: number;
  skillId: string;
  isEnabled: boolean;
  autoTrigger: boolean;
  priority: number;
  usageCount: number;
  lastUsedAt?: string;
  equippedAt: string;
}

/**
 * 技能服务类 - Admin 版本
 * 使用 admin API 的 request 函数
 */
export class SkillService {
  /**
   * 获取所有可用技能
   * @param category - 可选，技能分类
   * @param token - 管理员 token
   */
  async getAllSkills(category?: string, token?: string | null): Promise<SkillDefinition[]> {
    try {
      if (!token) {
        throw new Error('未登录');
      }

      const url = category 
        ? `/skills?category=${encodeURIComponent(category)}`
        : '/skills';

      const response = await request<{ code: number; message: string; data: SkillDefinition[] }>(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // 适配不同的响应格式
      if (response && 'data' in response) {
        return response.data || [];
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error: any) {
      console.error('[SkillService] 获取所有技能失败:', error);
      throw error;
    }
  }

  /**
   * 创建技能
   * @param skill - 技能定义
   * @param token - 管理员 token
   */
  async createSkill(skill: SkillDefinition, token?: string | null): Promise<SkillDefinition> {
    try {
      if (!token) {
        throw new Error('未登录');
      }

      const response = await request<{ code: number; message: string; data: SkillDefinition }>( '/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(skill),
      });

      // 适配不同的响应格式
      if (response && 'data' in response) {
        return response.data;
      }
      return response as SkillDefinition;
    } catch (error: any) {
      console.error('[SkillService] 创建技能失败:', error);
      throw error;
    }
  }

  /**
   * 更新技能
   * @param skillId - 技能 ID
   * @param skill - 技能定义（部分）
   * @param token - 管理员 token
   */
  async updateSkill(skillId: string, skill: Partial<SkillDefinition>, token?: string | null): Promise<SkillDefinition> {
    try {
      if (!token) {
        throw new Error('未登录');
      }

      const response = await request<{ code: number; message: string; data: SkillDefinition }>(`/skills/${skillId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(skill),
      });

      // 适配不同的响应格式
      if (response && 'data' in response) {
        return response.data;
      }
      return response as SkillDefinition;
    } catch (error: any) {
      console.error('[SkillService] 更新技能失败:', error);
      throw error;
    }
  }

  /**
   * 删除技能
   * @param skillId - 技能 ID
   * @param token - 管理员 token
   */
  async deleteSkill(skillId: string, token?: string | null): Promise<void> {
    try {
      if (!token) {
        throw new Error('未登录');
      }

      await request<void>(`/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('[SkillService] 删除技能失败:', error);
      throw error;
    }
  }

  /**
   * 获取技能详情
   * @param skillId - 技能 ID
   * @param token - 管理员 token
   */
  async getSkillById(skillId: string, token?: string | null): Promise<SkillDefinition | null> {
    try {
      if (!token) {
        throw new Error('未登录');
      }

      const response = await request<{ code: number; message: string; data: SkillDefinition }>(`/skills/${skillId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // 适配不同的响应格式
      if (response && 'data' in response) {
        return response.data || null;
      }
      return (response as SkillDefinition) || null;
    } catch (error: any) {
      console.error('[SkillService] 获取技能详情失败:', error);
      return null;
    }
  }
}
