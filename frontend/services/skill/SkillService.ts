/**
 * 技能服务
 * 负责与后端技能系统 API 交互
 */

import { API_BASE_URL } from '../api/config';

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
  id: number;
  skillId: string;
  name: string;
  description: string;
  category?: string;
  skillType?: string;
  executionType?: string;
  functionSchema?: string;
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
 * API 响应包装
 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * 技能服务类
 */
export class SkillService {
  private baseUrl = `${API_BASE_URL}/skills`;

  /**
   * 获取角色可用技能（用于 Function Calling）
   */
  async getCharacterAvailableSkills(characterId: number, token?: string): Promise<FunctionDefinition[]> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const response = await fetch(`${this.baseUrl}/character/${characterId}/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result: ApiResponse<FunctionDefinition[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('[SkillService] 获取角色可用技能失败:', error);
      return [];
    }
  }

  /**
   * 检查自动触发技能
   */
  async checkAutoTriggerSkills(
    characterId: number,
    userInput: string,
    token?: string
  ): Promise<SkillDefinition[]> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const response = await fetch(`${this.baseUrl}/character/${characterId}/auto-trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ input: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result: ApiResponse<SkillDefinition[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('[SkillService] 检查自动触发技能失败:', error);
      return [];
    }
  }

  /**
   * 执行技能
   */
  async executeSkill(
    skillId: string,
    characterId: number,
    parameters: Record<string, any>,
    token?: string
  ): Promise<any> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const response = await fetch(`${API_BASE_URL}/skills/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          skillId,
          characterId,
          parameters,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result.data;
    } catch (error) {
      console.error('[SkillService] 执行技能失败:', error);
      throw error;
    }
  }

  /**
   * 获取角色已装备的技能
   */
  async getEquippedSkills(characterId: number, token?: string): Promise<CharacterSkillBinding[]> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const response = await fetch(`${API_BASE_URL}/characters/${characterId}/skills`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result: ApiResponse<CharacterSkillBinding[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('[SkillService] 获取已装备技能失败:', error);
      return [];
    }
  }

  /**
   * 获取所有可用技能
   */
  async getAllSkills(category?: string, token?: string): Promise<SkillDefinition[]> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const url = category 
        ? `${this.baseUrl}?category=${encodeURIComponent(category)}`
        : `${this.baseUrl}/available`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result: ApiResponse<SkillDefinition[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('[SkillService] 获取所有技能失败:', error);
      return [];
    }
  }

  /**
   * 装备技能
   */
  async equipSkill(
    characterId: number,
    skillId: string,
    options?: {
      isEnabled?: boolean;
      autoTrigger?: boolean;
      priority?: number;
    },
    token?: string
  ): Promise<CharacterSkillBinding> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const response = await fetch(
        `${API_BASE_URL}/characters/${characterId}/skills/${skillId}/equip`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            isEnabled: options?.isEnabled ?? true,
            autoTrigger: options?.autoTrigger ?? false,
            priority: options?.priority ?? 0,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: ApiResponse<CharacterSkillBinding> = await response.json();
      return result.data;
    } catch (error) {
      console.error('[SkillService] 装备技能失败:', error);
      throw error;
    }
  }

  /**
   * 卸载技能
   */
  async unequipSkill(characterId: number, skillId: string, token?: string): Promise<void> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const response = await fetch(
        `${API_BASE_URL}/characters/${characterId}/skills/${skillId}/unequip`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('[SkillService] 卸载技能失败:', error);
      throw error;
    }
  }

  /**
   * 切换技能启用状态
   */
  async toggleSkill(characterId: number, skillId: string, token?: string): Promise<CharacterSkillBinding> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const response = await fetch(
        `${API_BASE_URL}/characters/${characterId}/skills/${skillId}/toggle`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: ApiResponse<CharacterSkillBinding> = await response.json();
      return result.data;
    } catch (error) {
      console.error('[SkillService] 切换技能状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取技能详情
   */
  async getSkillById(skillId: string, token?: string): Promise<SkillDefinition | null> {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        throw new Error('未登录');
      }

      const response = await fetch(`${this.baseUrl}/${skillId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result: ApiResponse<SkillDefinition> = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('[SkillService] 获取技能详情失败:', error);
      return null;
    }
  }
}

// 导出单例
export const skillService = new SkillService();
