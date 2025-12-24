/**
 * 信件相关业务逻辑服务
 * 从 AIService 中提取的信件生成相关方法
 */

import { AIService } from '../AIService';

/**
 * 信件业务服务
 */
export class LetterBusinessService {
  constructor(private aiService: AIService) {}

  /**
   * 生成时间信件（Chronos Letter）
   */
  async generateChronosLetter(
    sender: {name: string, role: string, systemInstruction?: string},
    userProfile: {nickname: string},
    journalEntries: Array<{title: string}>
  ): Promise<{subject: string, content: string} | null> {
    try {
      const randomEntry = journalEntries.length > 0 ? journalEntries[Math.floor(Math.random() * journalEntries.length)] : null;
      const memoryContext = randomEntry ? `I remember you wrote about "${randomEntry.title}"...` : '';

      const prompt = `Write a warm, personal letter to ${userProfile.nickname}.
You haven't seen them in a while. 
Mention something specific about their journey or the "memory" provided below to show you care.
MEMORY CONTEXT: ${memoryContext}
Output JSON with "subject" and "content".`;

      const systemInstruction = `You are ${sender.name} (${sender.role}). ${sender.systemInstruction || ''}`;
      const responseText = await this.aiService.generateTextString(prompt, systemInstruction, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('[LetterBusinessService] 生成时间信件失败:', error);
      return null;
    }
  }
}

