// 角色（Character）相关API

import { request } from '../base/request';
import type { SystemCharacter, UserCharacter, CreateCharacterDTO, UpdateCharacterDTO } from './types';

/**
 * 角色API
 * 包含系统预置角色和用户角色的CRUD操作
 */
export const characterApi = {
  /**
   * 获取所有系统预置角色（公共API，不需要认证）
   * 支持按场景ID过滤
   */
  getSystemCharacters: async (eraId?: number): Promise<SystemCharacter[]> => {
    const url = eraId ? `/preset-characters?eraId=${eraId}` : '/preset-characters';
    return request<SystemCharacter[]>(url, {
      method: 'GET',
    });
  },

  /**
   * 获取所有用户角色（需要认证）
   */
  getAllCharacters: async (token: string): Promise<UserCharacter[]> => {
    console.log("========== [characterApi] 获取所有角色 ==========");
    console.log("[characterApi] 请求参数: token存在=" + !!token);
    try {
      const result = await request<UserCharacter[]>('/characters', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[characterApi] 获取所有角色请求已发送");
      return result;
    } catch (error) {
      console.error("[characterApi] 获取所有角色失败:", error);
      throw error;
    }
  },

  /**
   * 根据世界ID获取用户角色
   */
  getCharactersByWorldId: async (worldId: number, token: string): Promise<UserCharacter[]> => {
    console.log(`========== [characterApi] 获取世界的角色 ========== WorldID: ${worldId}`);
    console.log(`[characterApi] 请求参数: worldId=${worldId}, token存在=${!!token}`);
    try {
      const result = await request<UserCharacter[]>(`/characters/world/${worldId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[characterApi] 获取世界角色请求已发送，WorldID: ${worldId}`);
      return result;
    } catch (error) {
      console.error(`[characterApi] 获取世界角色失败，WorldID: ${worldId}`, error);
      throw error;
    }
  },

  /**
   * 根据场景ID获取用户角色
   */
  getCharactersByEraId: async (eraId: number, token: string): Promise<UserCharacter[]> => {
    return request<UserCharacter[]>(`/characters/era/${eraId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建用户角色
   */
  createCharacter: async (data: CreateCharacterDTO, token: string): Promise<UserCharacter> => {
    console.log("========== [characterApi] 创建角色 ==========");
    console.log("[characterApi] 请求参数:", {
      name: data.name,
      worldId: data.worldId,
      eraId: data.eraId,
      role: data.role,
      age: data.age,
      token存在: !!token
    });
    try {
      const result = await request<UserCharacter>('/characters', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          age: data.age,
          gender: data.gender,
          role: data.role,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          backgroundUrl: data.backgroundUrl,
          themeColor: data.themeColor,
          colorAccent: data.colorAccent,
          firstMessage: data.firstMessage,
          systemInstruction: data.systemInstruction,
          voiceName: data.voiceName,
          mbti: data.mbti,
          tags: data.tags,
          speechStyle: data.speechStyle,
          catchphrases: data.catchphrases,
          secrets: data.secrets,
          motivations: data.motivations,
          relationships: data.relationships,
          worldId: data.worldId,
          eraId: data.eraId || null,
          systemCharacterId: data.systemCharacterId,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("[characterApi] 创建角色请求已发送");
      return result;
    } catch (error) {
      console.error("[characterApi] 创建角色失败:", error);
      throw error;
    }
  },

  /**
   * 更新用户角色
   */
  updateCharacter: async (id: number, data: UpdateCharacterDTO, token: string): Promise<UserCharacter> => {
    console.log(`========== [characterApi] 更新角色 ========== ID: ${id}`);
    console.log("[characterApi] 请求参数:", {
      id: id,
      name: data.name,
      worldId: data.worldId,
      eraId: data.eraId,
      role: data.role,
      age: data.age,
      token存在: !!token
    });
    try {
      const result = await request<UserCharacter>(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          age: data.age,
          gender: data.gender,
          role: data.role,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          backgroundUrl: data.backgroundUrl,
          themeColor: data.themeColor,
          colorAccent: data.colorAccent,
          firstMessage: data.firstMessage,
          systemInstruction: data.systemInstruction,
          voiceName: data.voiceName,
          mbti: data.mbti,
          tags: data.tags,
          speechStyle: data.speechStyle,
          catchphrases: data.catchphrases,
          secrets: data.secrets,
          motivations: data.motivations,
          relationships: data.relationships,
          worldId: data.worldId,
          eraId: data.eraId || null
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`[characterApi] 更新角色请求已发送，ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`[characterApi] 更新角色失败，ID: ${id}`, error);
      throw error;
    }
  },

  /**
   * 删除用户角色
   */
  deleteCharacter: async (id: number, token: string): Promise<void> => {
    console.log(`========== [characterApi] 删除角色 ========== ID: ${id}`);
    console.log(`[characterApi] 请求参数: id=${id}, token存在=${!!token}`);
    try {
      const result = await request<void>(`/characters/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[characterApi] 删除角色请求已发送，ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`[characterApi] 删除角色失败，ID: ${id}`, error);
      throw error;
    }
  },
};

