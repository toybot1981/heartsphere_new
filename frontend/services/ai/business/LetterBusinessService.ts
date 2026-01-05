/**
 * 信件相关业务逻辑服务
 * 从 AIService 中提取的信件生成相关方法
 */

import { AIService } from '../AIService';

/**
 * 安全地解析 JSON 字符串，处理可能包含控制字符的情况
 */
function safeParseJSON(jsonStr: string): any {
  try {
    // 首先尝试直接解析
    return JSON.parse(jsonStr);
  } catch (error) {
    // 如果失败，尝试修复包含控制字符的 JSON
    try {
      // 移除代码块标记
      let cleaned = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // 尝试提取 JSON 对象（如果被其他文本包围）
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      // 使用 JSON.stringify 的逆向操作：先解析为对象（如果可能），然后再序列化
      // 但更简单的方法是手动转义字符串值中的控制字符
      // 使用一个状态机来正确处理字符串值
      let result = '';
      let inString = false;
      let escapeNext = false;
      
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        
        if (escapeNext) {
          result += char;
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          result += char;
          escapeNext = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          result += char;
          continue;
        }
        
        if (inString) {
          // 在字符串内部，转义控制字符
          if (char === '\n') {
            result += '\\n';
          } else if (char === '\r') {
            result += '\\r';
          } else if (char === '\t') {
            result += '\\t';
          } else if (char === '\f') {
            result += '\\f';
          } else if (char === '\b') {
            result += '\\b';
          } else if (char.charCodeAt(0) < 0x20) {
            // 其他控制字符
            result += '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
          } else {
            result += char;
          }
        } else {
          result += char;
        }
      }
      
      return JSON.parse(result);
    } catch (secondError) {
      // 如果还是失败，记录错误并抛出
      console.error('[safeParseJSON] JSON 解析失败:', secondError);
      console.error('[safeParseJSON] 原始字符串:', jsonStr);
      throw error; // 抛出原始错误
    }
  }
}

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
Output JSON with "subject" and "content". The content field should be a single string, use \\n for line breaks if needed.`;

      const systemInstruction = `You are ${sender.name} (${sender.role}). ${sender.systemInstruction || ''}`;
      const responseText = await this.aiService.generateTextString(prompt, systemInstruction, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return safeParseJSON(jsonStr);
    } catch (error) {
      console.error('[LetterBusinessService] 生成时间信件失败:', error);
      if (error instanceof Error) {
        console.error('[LetterBusinessService] 错误详情:', error.message);
      }
      return null;
    }
  }
}


