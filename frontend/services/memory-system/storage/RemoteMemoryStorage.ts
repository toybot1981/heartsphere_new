/**
 * 远程记忆存储实现
 * 连接到后端的 Redis (短期记忆) 和 MongoDB (长期记忆)
 */

import {
  UserMemory,
  MemorySearchOptions,
} from '../types/MemoryTypes';
import { IMemoryStorage } from './MemoryStorage';
import { memoryApi } from '../../api/memory';
import { logger } from '../../../utils/logger';

/**
 * 远程记忆存储实现
 * 使用后端 API 连接到 Redis 和 MongoDB
 */
export class RemoteMemoryStorage implements IMemoryStorage {
  private userId: number;
  private token: string | null = null;

  constructor(userId: number) {
    this.userId = userId;
    this.token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  /**
   * 更新 token
   */
  updateToken(token: string): void {
    this.token = token;
  }

  /**
   * 获取 token
   */
  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    if (!this.token) {
      throw new Error('未找到认证token，请先登录');
    }
    return this.token;
  }

  /**
   * 保存记忆到长期记忆（MongoDB）
   */
  async save(memory: UserMemory): Promise<void> {
    try {
      const token = this.getToken();
      
      await memoryApi.saveMemory(this.userId, {
        memoryType: memory.memoryType,
        importance: memory.importance,
        content: memory.content,
        structuredData: memory.structuredData,
        source: memory.source,
        sourceId: memory.sourceId,
        confidence: memory.confidence,
        tags: memory.structuredData?.tags,
        metadata: memory.metadata,
      }, token);
      
      logger.debug('[RemoteMemoryStorage] 保存记忆成功', {
        memoryId: memory.id,
        userId: this.userId,
      });
    } catch (error) {
      logger.error('[RemoteMemoryStorage] 保存记忆失败', {
        memoryId: memory.id,
        userId: this.userId,
        error,
      });
      throw error;
    }
  }

  /**
   * 根据ID获取记忆
   */
  async getById(id: string): Promise<UserMemory | null> {
    try {
      const token = this.getToken();
      const memory = await memoryApi.getMemoryById(this.userId, id, token);
      return memory;
    } catch (error) {
      logger.error('[RemoteMemoryStorage] 获取记忆失败', {
        memoryId: id,
        userId: this.userId,
        error,
      });
      return null;
    }
  }

  /**
   * 搜索记忆
   */
  async search(userId: number, options: MemorySearchOptions): Promise<UserMemory[]> {
    try {
      const token = this.getToken();
      const response = await memoryApi.searchMemories(userId, options, token);
      return response.memories || [];
    } catch (error) {
      logger.error('[RemoteMemoryStorage] 搜索记忆失败', {
        userId,
        options,
        error,
      });
      return [];
    }
  }

  /**
   * 删除记忆
   */
  async delete(id: string): Promise<void> {
    try {
      const token = this.getToken();
      await memoryApi.deleteMemory(this.userId, id, token);
      logger.debug('[RemoteMemoryStorage] 删除记忆成功', {
        memoryId: id,
        userId: this.userId,
      });
    } catch (error) {
      logger.error('[RemoteMemoryStorage] 删除记忆失败', {
        memoryId: id,
        userId: this.userId,
        error,
      });
      throw error;
    }
  }

  /**
   * 更新记忆
   */
  async update(memory: UserMemory): Promise<void> {
    try {
      const token = this.getToken();
      await memoryApi.updateMemory(this.userId, memory.id, {
        memoryType: memory.memoryType,
        importance: memory.importance,
        content: memory.content,
        structuredData: memory.structuredData,
        source: memory.source,
        sourceId: memory.sourceId,
        confidence: memory.confidence,
        tags: memory.structuredData?.tags,
        metadata: memory.metadata,
      }, token);
      
      logger.debug('[RemoteMemoryStorage] 更新记忆成功', {
        memoryId: memory.id,
        userId: this.userId,
      });
    } catch (error) {
      logger.error('[RemoteMemoryStorage] 更新记忆失败', {
        memoryId: memory.id,
        userId: this.userId,
        error,
      });
      throw error;
    }
  }

  /**
   * 清空用户记忆
   */
  async clear(userId: number): Promise<void> {
    // 注意：后端可能没有提供清空所有记忆的API
    // 这里可以记录日志，或者实现批量删除
    logger.warn('[RemoteMemoryStorage] 清空记忆功能需要后端API支持', {
      userId,
    });
    throw new Error('清空记忆功能需要后端API支持');
  }
}



