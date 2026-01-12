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
    console.log('[sharedApi] ========== 请求共享世界列表 ==========');
    const worlds = await request<World[]>('/heartconnect/shared/worlds', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('[sharedApi] ✅ 获取共享世界列表成功，数量:', worlds?.length || 0);
    console.log('[sharedApi] 世界列表详情:', worlds);
    return worlds;
  },

  /**
   * 获取共享心域的场景列表（共享模式）
   */
  getSharedEras: async (token: string): Promise<UserEra[]> => {
    console.log('[sharedApi] ========== 请求共享场景列表 ==========');
    const eras = await request<UserEra[]>('/heartconnect/shared/eras', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('[sharedApi] ✅ 获取共享场景列表成功，数量:', eras?.length || 0);
    console.log('[sharedApi] 场景列表详情:', eras);
    eras?.forEach((era, index) => {
      console.log(`[sharedApi]   场景[${index}]: id=${era.id}, name=${era.name}, worldId=${(era as any).worldId || 'N/A'}`);
    });
    return eras;
  },

  /**
   * 获取指定世界的共享场景列表（共享模式）
   */
  getSharedErasByWorldId: async (worldId: number, token: string): Promise<UserEra[]> => {
    console.log(`[sharedApi] ========== 请求指定世界的共享场景列表 ========== worldId=${worldId}`);
    const eras = await request<UserEra[]>(`/heartconnect/shared/worlds/${worldId}/eras`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`[sharedApi] ✅ 获取指定世界的共享场景列表成功，数量:`, eras?.length || 0);
    return eras;
  },

  /**
   * 获取指定场景的角色列表（共享模式）
   */
  getSharedCharactersByEraId: async (eraId: number, token: string): Promise<any[]> => {
    console.log(`[sharedApi] ========== 请求指定场景的角色列表 ========== eraId=${eraId}`);
    const characters = await request<any[]>(`/heartconnect/shared/eras/${eraId}/characters`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`[sharedApi] ✅ 获取指定场景的角色列表成功，数量:`, characters?.length || 0);
    console.log(`[sharedApi] 角色列表详情:`, characters);
    return characters;
  },

  /**
   * 保存聊天消息（共享模式）
   */
  saveChatMessage: async (sessionId: string, role: 'USER' | 'ASSISTANT', content: string, token: string, metadata?: any, importance?: number): Promise<any> => {
    console.log(`[sharedApi] ========== 保存共享模式聊天消息 ========== sessionId=${sessionId}`);
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
    console.log(`[sharedApi] ✅ 保存共享模式聊天消息成功:`, message);
    return message;
  },

  /**
   * 获取聊天消息历史（共享模式）
   */
  getChatMessages: async (sessionId: string, token: string, limit: number = 100): Promise<{ messages: any[]; total: number }> => {
    console.log(`[sharedApi] ========== 获取共享模式聊天消息历史 ========== sessionId=${sessionId}`);
    const result = await request<{ messages: any[]; total: number }>(`/heartconnect/shared/chat/sessions/${sessionId}/messages?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`[sharedApi] ✅ 获取共享模式聊天消息历史成功，数量:`, result?.messages?.length || 0);
    return result;
  },

  /**
   * 清空聊天会话（共享模式）
   */
  clearChatSession: async (sessionId: string, token: string): Promise<void> => {
    console.log(`[sharedApi] ========== 清空共享模式聊天会话 ========== sessionId=${sessionId}`);
    await request<void>(`/heartconnect/shared/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`[sharedApi] ✅ 清空共享模式聊天会话成功`);
  },
};

