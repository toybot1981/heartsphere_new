/**
 * 个性化记忆系统核心类
 */

import {
  UserMemory,
  MemoryType,
  MemoryImportance,
  MemorySource,
  MemorySearchOptions,
} from './types/MemoryTypes';
import { MemoryExtractor, MemoryExtractionRequest } from './extractors/MemoryExtractor';
import { LocalMemoryStorage, IMemoryStorage } from './storage/MemoryStorage';
import { AIMemoryExtractor } from './ai/AIMemoryExtractor';

/**
 * 记忆系统配置
 */
export interface MemorySystemConfig {
  enabled: boolean;
  autoExtraction: boolean;
  aiEnhanced: boolean; // 是否使用AI增强提取
  userId: number;
}

/**
 * 个性化记忆系统类
 */
export class MemorySystem {
  private config: MemorySystemConfig;
  private extractor: MemoryExtractor;
  private aiExtractor: AIMemoryExtractor;
  private storage: IMemoryStorage;

  constructor(config: MemorySystemConfig, storage?: IMemoryStorage) {
    this.config = config;
    this.storage = storage || new LocalMemoryStorage();
    this.extractor = new MemoryExtractor();
    this.aiExtractor = new AIMemoryExtractor();
  }

  /**
   * 从文本中提取并保存记忆
   */
  async extractAndSave(request: MemoryExtractionRequest): Promise<UserMemory[]> {
    if (!this.config.enabled || !this.config.autoExtraction) {
      return [];
    }

    // 提取记忆（优先使用AI增强）
    let memories: UserMemory[];
    
    if (this.config.aiEnhanced) {
      try {
        memories = await this.aiExtractor.extractWithAI(request);
      } catch (error) {
        console.error('[MemorySystem] AI提取失败，降级到基础提取:', error);
        memories = await this.extractor.extractMemories(request);
      }
    } else {
      memories = await this.extractor.extractMemories(request);
    }
    
    // 保存记忆
    for (const memory of memories) {
      try {
        await this.storage.save(memory);
      } catch (error) {
        console.error('[MemorySystem] 保存记忆失败:', error);
      }
    }
    
    return memories;
  }

  /**
   * 搜索记忆
   */
  async searchMemories(options: MemorySearchOptions): Promise<UserMemory[]> {
    return this.storage.search(this.config.userId, options);
  }

  /**
   * 获取相关记忆（用于对话上下文）
   */
  async getRelevantMemories(context: string, limit: number = 5): Promise<UserMemory[]> {
    // 使用关键词搜索
    const keywordMatches = context.match(/[\u4e00-\u9fa5a-zA-Z0-9]+/g) || [];
    const keywords = keywordMatches.slice(0, 3).join(' ');
    
    const memories = await this.storage.search(this.config.userId, {
      keyword: keywords,
      limit,
    });
    
    // 如果关键词搜索结果不足，返回最近的重要记忆
    if (memories.length < limit) {
      const recentMemories = await this.storage.search(this.config.userId, {
        importance: MemoryImportance.IMPORTANT,
        limit: limit - memories.length,
      });
      memories.push(...recentMemories);
    }
    
    // 更新使用次数
    memories.forEach(memory => {
      memory.usageCount++;
      memory.lastUsedAt = Date.now();
      this.storage.update(memory).catch(console.error);
    });
    
    return memories;
  }

  /**
   * 手动添加记忆
   */
  async addMemory(memory: Omit<UserMemory, 'id' | 'userId' | 'timestamp' | 'usageCount'>): Promise<UserMemory> {
    const fullMemory: UserMemory = {
      ...memory,
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      timestamp: Date.now(),
      usageCount: 0,
    };
    
    await this.storage.save(fullMemory);
    return fullMemory;
  }

  /**
   * 更新记忆
   */
  async updateMemory(memory: UserMemory): Promise<void> {
    await this.storage.update(memory);
  }

  /**
   * 删除记忆
   */
  async deleteMemory(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  /**
   * 获取记忆统计
   */
  async getMemoryStatistics(): Promise<{
    total: number;
    byType: Record<MemoryType, number>;
    byImportance: Record<MemoryImportance, number>;
  }> {
    const allMemories = await this.storage.search(this.config.userId, {});
    
    const byType: Record<MemoryType, number> = {} as any;
    const byImportance: Record<MemoryImportance, number> = {} as any;
    
    // 初始化
    Object.values(MemoryType).forEach(type => {
      byType[type] = 0;
    });
    Object.values(MemoryImportance).forEach(importance => {
      byImportance[importance] = 0;
    });
    
    allMemories.forEach(memory => {
      byType[memory.memoryType] = (byType[memory.memoryType] || 0) + 1;
      byImportance[memory.importance] = (byImportance[memory.importance] || 0) + 1;
    });
    
    return {
      total: allMemories.length,
      byType,
      byImportance,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MemorySystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): Readonly<MemorySystemConfig> {
    return this.config;
  }
}

