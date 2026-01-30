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

/** 技能资源项（Bundled Resources 列表项） */
export interface SkillResourceItem {
  id: number;
  skillId: string;
  resourceType: string;
  resourceName: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 技能定义
 * 注意：已移除废弃的 functionSchema 字段，改用 mcpToolConfig
 */
export interface SkillDefinition {
  id?: number;
  skillId: string;
  name: string;
  description: string;
  category?: string;
  skillType?: string;
  executionType?: string;
  // 已移除：functionSchema (废弃，改用 mcpToolConfig)
  executionConfig?: string;
  autoTriggerKeywords?: string;
  maxUsagePerDay?: number;
  version?: string;
  author?: string;
  isSystemSkill?: boolean;
  // 新增字段：专业 Skill Creator 支持
  license?: string;
  compatibility?: string;
  metadata?: string;
  skillContent?: string;
  mcpToolConfig?: string;
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

  /**
   * 获取技能详情及关联的 Bundled Resources（单表视图一次性加载）
   * @param skillId - 技能 ID
   * @param token - 管理员 token
   */
  async getSkillByIdWithResources(
    skillId: string,
    token?: string | null
  ): Promise<{ skill: SkillDefinition; resources: SkillResourceItem[] } | null> {
    try {
      if (!token) {
        throw new Error('未登录');
      }

      const response = await request<
        | { code: number; message: string; data: { skill: SkillDefinition; resources: SkillResourceItem[] } }
        | { skill: SkillDefinition; resources: SkillResourceItem[] }
      >(`/skills/${skillId}?includeResources=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response && typeof response === 'object') {
        const data = 'data' in response && response.data ? response.data : response;
        if (data && 'skill' in data && data.skill) {
          return { skill: data.skill, resources: Array.isArray(data.resources) ? data.resources : [] };
        }
      }
      return null;
    } catch (error: any) {
      console.error('[SkillService] 获取技能及资源失败:', error);
      return null;
    }
  }
}
