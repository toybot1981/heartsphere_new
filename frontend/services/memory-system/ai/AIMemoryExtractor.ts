/**
 * AI增强的记忆提取器
 * 使用大语言模型进行更深入和准确的记忆提取
 */

import {
  UserMemory,
  MemoryType,
  MemoryImportance,
  MemorySource,
} from '../types/MemoryTypes';
import { MemoryExtractionRequest } from '../extractors/MemoryExtractor';
import { aiService } from '../../ai';

/**
 * AI记忆提取器类
 */
export class AIMemoryExtractor {
  /**
   * 使用AI提取记忆
   */
  async extractWithAI(request: MemoryExtractionRequest): Promise<UserMemory[]> {
    if (!request.text || request.text.length < 10) {
      return [];
    }

    // 构建AI提示词
    const prompt = this.buildExtractionPrompt(request);

    try {
      // 调用AI服务
      const response = await aiService.generateText({
        prompt,
        systemInstruction: '你是一个记忆提取专家，擅长从对话和文本中提取重要的用户信息、偏好、习惯和情感经历。',
        temperature: 0.3,
        maxTokens: 1000,
      });

      // 解析AI响应
      return this.parseAIResponse(response.content || '', request);
    } catch (error) {
      console.error('[AIMemoryExtractor] AI提取失败:', error);
      return [];
    }
  }

  /**
   * 构建提取提示词
   */
  private buildExtractionPrompt(request: MemoryExtractionRequest): string {
    const contextInfo = request.context
      ? `
上下文信息：
- 对话历史: ${request.context.conversationHistory?.slice(-3).join(' | ') || '无'}
- 用户情绪: ${request.context.emotion || '未知'}
`
      : '';

    return `
请从以下文本中提取重要的记忆信息，并返回JSON格式的结果。

文本内容：
${request.text}
${contextInfo}

请提取以下类型的记忆：
1. 个人信息：姓名、年龄、生日、位置等
2. 偏好信息：喜欢的事物、不喜欢的食物等
3. 重要时刻：生日、纪念日、特别事件等
4. 情感经历：用户分享的情感经历
5. 习惯信息：作息习惯、使用习惯等

请返回JSON数组格式，每个记忆包含：
{
  "memoryType": "记忆类型（personal_info/preference/important_moment/emotional_experience/habit）",
  "importance": "重要性（core/important/normal/temporary）",
  "content": "记忆内容（简洁描述）",
  "structuredData": {
    "key": "结构化键（如'name', 'age', 'birthday'等）",
    "value": "结构化值",
    "tags": ["标签数组"]
  },
  "confidence": 提取置信度（0-1之间的小数）
}

注意：
- 只提取明确提到的信息，不要推测
- 重要性判断：核心记忆（如生日）> 重要记忆（如偏好）> 普通记忆（如一般对话）> 临时记忆（如会话上下文）
- 置信度根据信息的明确程度判断
- 只返回JSON数组，不要包含其他文字
`;
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(
    aiResponse: string,
    request: MemoryExtractionRequest
  ): UserMemory[] {
    try {
      // 提取JSON
      let jsonStr = aiResponse.trim();
      
      // 移除markdown代码块
      if (jsonStr.startsWith('```')) {
        const lines = jsonStr.split('\n');
        jsonStr = lines.slice(1, -1).join('\n');
      }
      
      jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      
      const parsed = JSON.parse(jsonStr);
      
      if (!Array.isArray(parsed)) {
        return [];
      }

      // 转换为UserMemory格式
      return parsed
        .map((item: any) => {
          const memoryType = this.validateMemoryType(item.memoryType);
          const importance = this.validateImportance(item.importance);
          
          if (!memoryType || !importance) {
            return null;
          }

          return {
            id: this.generateMemoryId(),
            userId: request.context?.userProfile?.id || 0,
            memoryType,
            importance,
            content: item.content || '',
            structuredData: item.structuredData || undefined,
            source: request.source,
            sourceId: request.sourceId,
            timestamp: Date.now(),
            usageCount: 0,
            confidence: Math.max(0, Math.min(1, item.confidence || 0.7)),
            metadata: {
              emotion: request.context?.emotion,
            },
          } as UserMemory;
        })
        .filter((m: UserMemory | null): m is UserMemory => m !== null);
    } catch (error) {
      console.error('[AIMemoryExtractor] 解析AI响应失败:', error);
      return [];
    }
  }

  /**
   * 验证记忆类型
   */
  private validateMemoryType(type: string): MemoryType | null {
    const validTypes = Object.values(MemoryType);
    return validTypes.includes(type as MemoryType) ? (type as MemoryType) : null;
  }

  /**
   * 验证重要性
   */
  private validateImportance(importance: string): MemoryImportance | null {
    const validImportances = Object.values(MemoryImportance);
    return validImportances.includes(importance as MemoryImportance)
      ? (importance as MemoryImportance)
      : null;
  }

  /**
   * 生成记忆ID
   */
  private generateMemoryId(): string {
    return `memory_ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

