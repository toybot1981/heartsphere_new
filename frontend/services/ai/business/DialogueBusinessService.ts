/**
 * 对话相关业务逻辑服务
 * 从 AIService 中提取的对话生成相关方法
 */

import { AIService } from '../AIService';

/**
 * 对话业务服务
 */
export class DialogueBusinessService {
  constructor(private aiService: AIService) {}

  /**
   * 生成智慧回响（从对话历史中提取）
   */
  async generateWisdomEcho(history: Array<{role: string, text: string}>, characterName: string): Promise<string | null> {
    try {
      const prompt = `Analyze the conversation history. Extract a single, profound, and memorable quote (max 30 words) that represents the core wisdom or emotional comfort provided by ${characterName}. Output ONLY the quote.`;
      const context = history.map(m => `${m.role}: ${m.text}`).join('\n');
      const responseText = await this.aiService.generateTextString(`${prompt}\n\nCONVERSATION:\n${context}`);
      return responseText || null;
    } catch (error) {
      console.error('[DialogueBusinessService] 生成智慧回响失败:', error);
      return null;
    }
  }
}


