// 共享模式API - 用于查看他人共享的心域内容

import { request } from '../base/request';
import type { World } from '../world/types';
import type { UserEra } from '../scene/types';

/**
 * 共享模式API
 * 专门用于查看他人共享的心域内容
 * 这些接口需要在请求头中包含共享模式标识（X-Shared-Mode 和 X-Share-Config-Id）
 */
export const sharedApi = {
  /**
   * 获取共享心域的世界列表（共享模式）
   */
  getSharedWorlds: async (token: string): Promise<World[]> => {
    const worlds = await request<World[]>('/heartconnect/shared/worlds', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return worlds;
  },

  /**
   * 获取共享心域的场景列表（共享模式）
   */
  getSharedEras: async (token: string): Promise<UserEra[]> => {
    const eras = await request<UserEra[]>('/heartconnect/shared/eras', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    eras?.forEach((era, index) => {
    });
    return eras;
  },

  /**
   * 获取指定世界的共享场景列表（共享模式）
   */
  getSharedErasByWorldId: async (worldId: number, token: string): Promise<UserEra[]> => {
    const eras = await request<UserEra[]>(`/heartconnect/shared/worlds/${worldId}/eras`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return eras;
  },

  /**
   * 获取指定场景的角色列表（共享模式）
   */
  getSharedCharactersByEraId: async (eraId: number, token: string): Promise<any[]> => {
    const characters = await request<any[]>(`/heartconnect/shared/eras/${eraId}/characters`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return characters;
  },

  /**
   * 保存聊天消息（共享模式）
   */
  saveChatMessage: async (sessionId: string, role: 'USER' | 'ASSISTANT', content: string, token: string, metadata?: any, importance?: number): Promise<any> => {
    const message = await request<any>(`/heartconnect/shared/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        content,
        metadata,
        importance,
      }),
    });
    return message;
  },

  /**
   * 获取聊天消息历史（共享模式）
   */
  getChatMessages: async (sessionId: string, token: string, limit: number = 100): Promise<{ messages: any[]; total: number }> => {
    const result = await request<{ messages: any[]; total: number }>(`/heartconnect/shared/chat/sessions/${sessionId}/messages?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return result;
  },

  /**
   * 清空聊天会话（共享模式）
   */
  clearChatSession: async (sessionId: string, token: string): Promise<void> => {
    await request<void>(`/heartconnect/shared/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

