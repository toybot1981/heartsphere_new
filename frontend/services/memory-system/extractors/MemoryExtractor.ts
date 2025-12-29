/**
 * 记忆提取器
 * 从对话、日记等中提取记忆
 */

import {
  UserMemory,
  MemoryType,
  MemoryImportance,
  MemorySource,
} from '../types/MemoryTypes';
import { EmotionType } from '../../emotion-system/types/EmotionTypes';

/**
 * 记忆提取请求
 */
export interface MemoryExtractionRequest {
  text: string;
  source: MemorySource;
  sourceId?: string;
  context?: {
    conversationHistory?: string[];
    userProfile?: any;
    emotion?: EmotionType;
  };
}

/**
 * 记忆提取器类
 */
export class MemoryExtractor {
  /**
   * 从文本中提取记忆
   */
  async extractMemories(request: MemoryExtractionRequest): Promise<UserMemory[]> {
    const memories: UserMemory[] = [];
    const text = request.text.toLowerCase();

    // 1. 提取个人信息
    const personalInfo = this.extractPersonalInfo(text, request);
    memories.push(...personalInfo);

    // 2. 提取偏好信息
    const preferences = this.extractPreferences(text, request);
    memories.push(...preferences);

    // 3. 提取重要时刻
    const importantMoments = this.extractImportantMoments(text, request);
    memories.push(...importantMoments);

    // 4. 提取情感经历
    const emotionalExperiences = this.extractEmotionalExperiences(text, request);
    memories.push(...emotionalExperiences);

    // 5. 提取习惯信息
    const habits = this.extractHabits(text, request);
    memories.push(...habits);

    return memories;
  }

  /**
   * 提取个人信息
   */
  private extractPersonalInfo(
    text: string,
    request: MemoryExtractionRequest
  ): UserMemory[] {
    const memories: UserMemory[] = [];
    const patterns = [
      { pattern: /(?:我叫|我是|我的名字是)(.{1,20})/i, key: 'name' },
      { pattern: /(?:我|今年)(\d{1,3})岁/i, key: 'age' },
      { pattern: /(?:生日|出生日期)(.{1,30})/i, key: 'birthday' },
      { pattern: /(?:住在|来自)(.{1,30})/i, key: 'location' },
    ];

    patterns.forEach(({ pattern, key }) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 0 && value.length < 50) {
          memories.push({
            id: this.generateMemoryId(),
            userId: request.context?.userProfile?.id || 0,
            memoryType: MemoryType.PERSONAL_INFO,
            importance: MemoryImportance.CORE,
            content: `${key}: ${value}`,
            structuredData: {
              key,
              value,
            },
            source: request.source,
            sourceId: request.sourceId,
            timestamp: Date.now(),
            usageCount: 0,
            confidence: 0.8,
          });
        }
      }
    });

    return memories;
  }

  /**
   * 提取偏好信息
   */
  private extractPreferences(
    text: string,
    request: MemoryExtractionRequest
  ): UserMemory[] {
    const memories: UserMemory[] = [];
    const patterns = [
      { pattern: /(?:喜欢|爱好|爱)(.{1,30})/i, type: 'like' },
      { pattern: /(?:不喜欢|讨厌|讨厌)(.{1,30})/i, type: 'dislike' },
      { pattern: /(?:经常|总是)(.{1,30})/i, type: 'frequent' },
    ];

    patterns.forEach(({ pattern, type }) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 0 && value.length < 50) {
          memories.push({
            id: this.generateMemoryId(),
            userId: request.context?.userProfile?.id || 0,
            memoryType: MemoryType.PREFERENCE,
            importance: MemoryImportance.IMPORTANT,
            content: `${type === 'like' ? '喜欢' : type === 'dislike' ? '不喜欢' : '经常'}: ${value}`,
            structuredData: {
              key: type,
              value,
            },
            source: request.source,
            sourceId: request.sourceId,
            timestamp: Date.now(),
            usageCount: 0,
            confidence: 0.7,
          });
        }
      }
    });

    return memories;
  }

  /**
   * 提取重要时刻
   */
  private extractImportantMoments(
    text: string,
    request: MemoryExtractionRequest
  ): UserMemory[] {
    const memories: UserMemory[] = [];
    const patterns = [
      { pattern: /(?:生日|纪念日|节日)(.{1,50})/i, importance: MemoryImportance.CORE },
      { pattern: /(?:重要|特别|难忘)(.{1,50})/i, importance: MemoryImportance.IMPORTANT },
      { pattern: /(?:今天|昨天|那天)(.{1,50})/i, importance: MemoryImportance.NORMAL },
    ];

    patterns.forEach(({ pattern, importance }) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const content = match[1].trim();
        if (content.length > 5 && content.length < 100) {
          memories.push({
            id: this.generateMemoryId(),
            userId: request.context?.userProfile?.id || 0,
            memoryType: MemoryType.IMPORTANT_MOMENT,
            importance,
            content,
            source: request.source,
            sourceId: request.sourceId,
            timestamp: Date.now(),
            usageCount: 0,
            confidence: 0.6,
            metadata: {
              emotion: request.context?.emotion,
            },
          });
        }
      }
    });

    return memories;
  }

  /**
   * 提取情感经历
   */
  private extractEmotionalExperiences(
    text: string,
    request: MemoryExtractionRequest
  ): UserMemory[] {
    const memories: UserMemory[] = [];
    
    // 检测情感相关关键词
    const emotionKeywords = ['难过', '开心', '激动', '焦虑', '担心', '害怕', '失望', '惊喜'];
    const hasEmotion = emotionKeywords.some(keyword => text.includes(keyword));
    
    if (hasEmotion && request.context?.emotion) {
      // 提取包含情感关键词的句子
      const sentences = text.split(/[。！？\n]/);
      sentences.forEach(sentence => {
        if (emotionKeywords.some(keyword => sentence.includes(keyword)) && sentence.length > 10) {
          memories.push({
            id: this.generateMemoryId(),
            userId: request.context?.userProfile?.id || 0,
            memoryType: MemoryType.EMOTIONAL_EXPERIENCE,
            importance: MemoryImportance.IMPORTANT,
            content: sentence.trim(),
            source: request.source,
            sourceId: request.sourceId,
            timestamp: Date.now(),
            usageCount: 0,
            confidence: 0.7,
            metadata: {
              emotion: request.context.emotion,
            },
          });
        }
      });
    }

    return memories;
  }

  /**
   * 提取习惯信息
   */
  private extractHabits(
    text: string,
    request: MemoryExtractionRequest
  ): UserMemory[] {
    const memories: UserMemory[] = [];
    const patterns = [
      { pattern: /(?:习惯|经常|总是)(.{1,30})/i },
      { pattern: /(?:作息|睡觉|起床)(.{1,30})/i },
      { pattern: /(?:每天|每周|每月)(.{1,30})/i },
    ];

    patterns.forEach(({ pattern }) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 0 && value.length < 50) {
          memories.push({
            id: this.generateMemoryId(),
            userId: request.context?.userProfile?.id || 0,
            memoryType: MemoryType.HABIT,
            importance: MemoryImportance.NORMAL,
            content: value,
            structuredData: {
              key: 'habit',
              value,
            },
            source: request.source,
            sourceId: request.sourceId,
            timestamp: Date.now(),
            usageCount: 0,
            confidence: 0.6,
          });
        }
      }
    });

    return memories;
  }

  /**
   * 生成记忆ID
   */
  private generateMemoryId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

