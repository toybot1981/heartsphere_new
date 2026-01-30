/**
 * 技能调试 API 服务
 */
import { SkillExecutionRecord, SkillStatistics, SkillApplicationResult } from '../../../types/skill';
import { request } from '../base/request';

const API_BASE = '/v1/skill/debug'; // 注意：不包含 /api，因为 request.ts 中的 API_BASE_URL 已经包含了 /api

export const skillDebugService = {
  /**
   * 获取对话的技能执行历史
   */
  async getConversationHistory(
    conversationId: number,
    options?: {
      skillId?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<SkillExecutionRecord[]> {
    const params = new URLSearchParams();
    if (options?.skillId) params.append('skillId', options.skillId.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const url = `${API_BASE}/conversation/${conversationId}/history${params.toString() ? '?' + params.toString() : ''}`;
    const response = await request<SkillExecutionRecord[]>(url, {
      method: 'GET',
    });
    return response || [];
  },

  /**
   * 获取分页的技能执行历史
   */
  async getConversationHistoryPaged(
    conversationId: number,
    page: number = 0,
    size: number = 20,
    options?: {
      skillId?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    content: SkillExecutionRecord[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (options?.skillId) params.append('skillId', options.skillId.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const url = `${API_BASE}/conversation/${conversationId}/history/paged?${params.toString()}`;
    const response = await request<{
      content: SkillExecutionRecord[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(url, {
      method: 'GET',
    });
    return response || {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 0,
    };
  },

  /**
   * 获取单个执行记录详情
   */
  async getRecordDetail(recordId: number): Promise<SkillExecutionRecord | null> {
    try {
      const response = await request<SkillExecutionRecord>(
        `${API_BASE}/record/${recordId}`,
        {
          method: 'GET',
        }
      );
      return response || null;
    } catch (error) {
      console.error('Failed to get record detail:', error);
      return null;
    }
  },

  /**
   * 获取用户统计信息
   */
  async getUserStatistics(
    userId: number,
    days: number = 7
  ): Promise<SkillStatistics | null> {
    try {
      const response = await request<SkillStatistics>(
        `${API_BASE}/user/${userId}/statistics?days=${days}`,
        {
          method: 'GET',
        }
      );
      return response || null;
    } catch (error) {
      // 静默处理404错误（端点可能尚未实现）
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('404') || errorMessage.includes('未找到') || errorMessage.includes('Not Found')) {
        // 端点不存在时静默返回null，不记录错误
        return null;
      }
      // 其他错误才记录
      console.error('Failed to get user statistics:', error);
      return null;
    }
  },

  /**
   * 获取监控统计信息
   */
  async getMonitorStats(): Promise<any> {
    try {
      const response = await request<any>(
        `${API_BASE}/monitor/stats`,
        {
          method: 'GET',
        }
      );
      return response || null;
    } catch (error) {
      console.error('Failed to get monitor stats:', error);
      return null;
    }
  },
};
