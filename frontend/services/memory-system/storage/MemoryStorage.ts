/**
 * 记忆存储系统
 */

import {
  UserMemory,
  MemorySearchOptions,
  MemoryType,
  MemoryImportance,
} from '../types/MemoryTypes';

/**
 * 记忆存储接口
 */
export interface IMemoryStorage {
  save(memory: UserMemory): Promise<void>;
  getById(id: string): Promise<UserMemory | null>;
  search(userId: number, options: MemorySearchOptions): Promise<UserMemory[]>;
  delete(id: string): Promise<void>;
  update(memory: UserMemory): Promise<void>;
  clear(userId: number): Promise<void>;
}

/**
 * 本地存储实现
 */
export class LocalMemoryStorage implements IMemoryStorage {
  private storageKey = 'user_memories';
  private maxRecords = 2000;

  /**
   * 保存记忆
   */
  async save(memory: UserMemory): Promise<void> {
    const memories = this.getAllMemories();
    
    // 检查是否已存在
    const index = memories.findIndex(m => m.id === memory.id);
    if (index !== -1) {
      memories[index] = memory;
    } else {
      memories.push(memory);
    }
    
    // 限制记录数量
    if (memories.length > this.maxRecords) {
      // 保留最重要的记忆
      memories.sort((a, b) => {
        const importanceOrder = {
          [MemoryImportance.CORE]: 4,
          [MemoryImportance.IMPORTANT]: 3,
          [MemoryImportance.NORMAL]: 2,
          [MemoryImportance.TEMPORARY]: 1,
        };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      });
      memories.splice(this.maxRecords);
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(memories));
    } catch (error) {
      console.error('[MemoryStorage] 保存失败:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanOldMemories(memories);
        localStorage.setItem(this.storageKey, JSON.stringify(memories));
      }
    }
  }

  /**
   * 根据ID获取记忆
   */
  async getById(id: string): Promise<UserMemory | null> {
    const memories = this.getAllMemories();
    return memories.find(m => m.id === id) || null;
  }

  /**
   * 搜索记忆
   */
  async search(userId: number, options: MemorySearchOptions): Promise<UserMemory[]> {
    let memories = this.getAllMemories().filter(m => m.userId === userId);
    
    // 类型过滤
    if (options.memoryType) {
      memories = memories.filter(m => m.memoryType === options.memoryType);
    }
    
    // 重要性过滤
    if (options.importance) {
      memories = memories.filter(m => m.importance === options.importance);
    }
    
    // 时间过滤
    if (options.startDate) {
      memories = memories.filter(m => m.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      memories = memories.filter(m => m.timestamp <= options.endDate!);
    }
    
    // 关键词搜索
    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      memories = memories.filter(m => 
        m.content.toLowerCase().includes(keyword) ||
        m.structuredData?.key?.toLowerCase().includes(keyword) ||
        m.structuredData?.value?.toString().toLowerCase().includes(keyword)
      );
    }
    
    // 按重要性、使用频率、时间排序
    memories.sort((a, b) => {
      const importanceOrder = {
        [MemoryImportance.CORE]: 4,
        [MemoryImportance.IMPORTANT]: 3,
        [MemoryImportance.NORMAL]: 2,
        [MemoryImportance.TEMPORARY]: 1,
      };
      
      const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance];
      if (importanceDiff !== 0) return importanceDiff;
      
      const usageDiff = b.usageCount - a.usageCount;
      if (usageDiff !== 0) return usageDiff;
      
      return b.timestamp - a.timestamp;
    });
    
    // 限制数量
    if (options.limit) {
      memories = memories.slice(0, options.limit);
    }
    
    return memories;
  }

  /**
   * 删除记忆
   */
  async delete(id: string): Promise<void> {
    const memories = this.getAllMemories();
    const filtered = memories.filter(m => m.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  /**
   * 更新记忆
   */
  async update(memory: UserMemory): Promise<void> {
    await this.save(memory);
  }

  /**
   * 清空用户记忆
   */
  async clear(userId: number): Promise<void> {
    const memories = this.getAllMemories();
    const filtered = memories.filter(m => m.userId !== userId);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  /**
   * 获取所有记忆
   */
  private getAllMemories(): UserMemory[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as UserMemory[];
    } catch (error) {
      console.error('[MemoryStorage] 读取失败:', error);
      return [];
    }
  }

  /**
   * 清理旧记忆
   */
  private cleanOldMemories(memories: UserMemory[]): void {
    // 删除临时记忆和低使用频率的普通记忆
    const now = Date.now();
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
    
    const filtered = memories.filter(m => {
      if (m.importance === MemoryImportance.TEMPORARY) {
        return false; // 删除所有临时记忆
      }
      if (m.importance === MemoryImportance.NORMAL && m.usageCount < 2 && m.timestamp < threeMonthsAgo) {
        return false; // 删除低使用频率的旧普通记忆
      }
      return true;
    });
    
    memories.splice(0, memories.length, ...filtered);
  }
}



