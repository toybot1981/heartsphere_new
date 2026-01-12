/**
 * 日记与记忆系统集成服务
 * 负责从日记中提取记忆，并将日记内容与记忆系统联动
 */

import { MemorySystem, MemorySystemConfig } from '../memory-system/MemorySystem';
import { MemorySource, MemoryType, MemoryImportance } from '../memory-system/types/MemoryTypes';
import { JournalEntry } from '../../types';
import { logger } from '../../utils/logger';

/**
 * 日记记忆集成配置
 */
export interface JournalMemoryIntegrationConfig {
  enabled: boolean;
  autoExtract: boolean;
  aiEnhanced: boolean;
  userId: number;
}

/**
 * 日记记忆集成服务类
 */
export class JournalMemoryIntegration {
  private memorySystem: MemorySystem | null = null;
  private config: JournalMemoryIntegrationConfig;

  constructor(config: JournalMemoryIntegrationConfig) {
    this.config = config;
    
    if (config.enabled) {
      this.memorySystem = new MemorySystem({
        enabled: config.enabled,
        autoExtraction: config.autoExtract,
        aiEnhanced: config.aiEnhanced,
        userId: config.userId,
        useRemoteStorage: true, // 使用远程存储连接到Redis/MongoDB
      });
    }
  }

  /**
   * 从日记条目中提取并保存记忆
   */
  async extractMemoriesFromJournal(entry: JournalEntry): Promise<void> {
    if (!this.config.enabled || !this.memorySystem) {
      return;
    }

    try {
      // 构建提取文本（包含标题、内容、洞察和标签）
      const textParts: string[] = [];
      
      if (entry.title) {
        textParts.push(`标题：${entry.title}`);
      }
      
      if (entry.content) {
        textParts.push(entry.content);
      }
      
      if (entry.insight) {
        textParts.push(`洞察：${entry.insight}`);
      }
      
      if (entry.tags) {
        const tagsArray = entry.tags.split(',').map(t => t.trim()).filter(t => t);
        if (tagsArray.length > 0) {
          textParts.push(`标签：${tagsArray.join('、')}`);
        }
      }
      
      const fullText = textParts.join('\n');
      
      if (!fullText.trim()) {
        logger.debug('[JournalMemoryIntegration] 日记内容为空，跳过记忆提取');
        return;
      }

      // 从日记中提取记忆
      const memories = await this.memorySystem.extractAndSave({
        text: fullText,
        source: MemorySource.JOURNAL,
        sourceId: entry.id,
        context: {
          userProfile: { id: this.config.userId },
        },
      });

      logger.debug('[JournalMemoryIntegration] 从日记中提取记忆成功', {
        journalId: entry.id,
        title: entry.title,
        extractedCount: memories.length,
      });

      // 如果有洞察（insight），将其作为重要记忆单独保存
      if (entry.insight && entry.insight.trim()) {
        await this.memorySystem.addMemory({
          memoryType: MemoryType.REFLECTION,
          importance: MemoryImportance.IMPORTANT,
          content: entry.insight,
          structuredData: {
            key: 'journal_insight',
            value: {
              journalId: entry.id,
              journalTitle: entry.title,
              timestamp: entry.timestamp,
            },
            tags: entry.tags ? entry.tags.split(',').map(t => t.trim()) : [],
          },
          source: MemorySource.JOURNAL,
          sourceId: entry.id,
          confidence: 0.9, // 洞察是AI生成的，置信度较高
        });
      }

      // 如果有标签，将标签作为偏好记忆保存
      if (entry.tags) {
        const tagsArray = entry.tags.split(',').map(t => t.trim()).filter(t => t);
        for (const tag of tagsArray) {
          await this.memorySystem.addMemory({
            memoryType: MemoryType.PREFERENCE,
            importance: MemoryImportance.NORMAL,
            content: `用户经常在日记中使用标签：${tag}`,
            structuredData: {
              key: 'journal_tag',
              value: tag,
              tags: [tag],
            },
            source: MemorySource.JOURNAL,
            sourceId: entry.id,
            confidence: 0.7,
          });
        }
      }

    } catch (error) {
      logger.error('[JournalMemoryIntegration] 从日记提取记忆失败', {
        journalId: entry.id,
        error,
      });
    }
  }

  /**
   * 根据日记内容获取相关记忆（用于对话上下文）
   */
  async getRelevantMemoriesForJournal(entry: JournalEntry, limit: number = 5): Promise<any[]> {
    if (!this.config.enabled || !this.memorySystem) {
      return [];
    }

    try {
      // 使用日记标题和内容作为上下文
      const context = `${entry.title || ''} ${entry.content || ''}`.trim();
      
      if (!context) {
        return [];
      }

      const memories = await this.memorySystem.getRelevantMemories(context, limit);
      
      logger.debug('[JournalMemoryIntegration] 获取相关记忆成功', {
        journalId: entry.id,
        relevantCount: memories.length,
      });

      return memories;
    } catch (error) {
      logger.error('[JournalMemoryIntegration] 获取相关记忆失败', {
        journalId: entry.id,
        error,
      });
      return [];
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<JournalMemoryIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.memorySystem) {
      this.memorySystem.updateConfig({
        enabled: this.config.enabled,
        autoExtraction: this.config.autoExtract,
        aiEnhanced: this.config.aiEnhanced,
        userId: this.config.userId,
        useRemoteStorage: true, // 使用远程存储连接到Redis/MongoDB
      });
    } else if (this.config.enabled) {
      this.memorySystem = new MemorySystem({
        enabled: this.config.enabled,
        autoExtraction: this.config.autoExtract,
        aiEnhanced: this.config.aiEnhanced,
        userId: this.config.userId,
        useRemoteStorage: true, // 使用远程存储连接到Redis/MongoDB
      });
    }
  }

  /**
   * 获取配置
   */
  getConfig(): Readonly<JournalMemoryIntegrationConfig> {
    return this.config;
  }
}

