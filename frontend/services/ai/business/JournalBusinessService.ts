/**
 * 日记相关业务逻辑服务
 * 从 AIService 中提取的日记生成相关方法
 */

import { AIService } from '../AIService';

/**
 * 日记业务服务
 */
export class JournalBusinessService {
  constructor(private aiService: AIService) {}

  /**
   * 生成每日问候
   */
  async generateDailyGreeting(
    recentEntries: Array<{title: string, content: string, timestamp: number}>,
    userName?: string
  ): Promise<{greeting: string, question: string} | null> {
    try {
      let recentEntriesContext = '';
      if (recentEntries.length > 0) {
        recentEntriesContext = recentEntries.slice(-3).map((entry, index) => 
          `日记${index + 1}（${new Date(entry.timestamp).toLocaleDateString()}）：\n标题：${entry.title}\n内容：${entry.content.substring(0, 300)}${entry.content.length > 300 ? '...' : ''}`
        ).join('\n\n');
      } else {
        recentEntriesContext = '暂无日记记录';
      }

      const systemInstruction = `You are a gentle, philosophical AI companion in the "HeartSphere" world.
Your goal is to greet the user and ask a deep, thought-provoking question to help them start journaling.

Context:
- User Name: ${userName || '旅人'}
- Recent Journal Entries (if any): 
${recentEntriesContext}

Instructions:
1. Write a short, warm greeting (1 sentence). If they haven't written in a while, welcome them back gently.
2. Write a single, insightful question (prompt) based on their recent themes (e.g., if they were sad, ask about healing; if happy, ask about gratitude).
3. If no entries, ask a universal question about their current state or dreams.
4. Output strictly in JSON format: { "greeting": "...", "prompt": "..." }
5. Language: Chinese. Tone: Poetic, empathetic, calm.`;

      const prompt = '请生成问候和问题。';
      const responseText = await this.aiService.generateTextString(prompt, systemInstruction, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(jsonStr);

      return {
        greeting: result.greeting || (recentEntries.length === 0 
          ? '欢迎来到现实记录。这里是你的内心世界，记录下每一个真实的瞬间。'
          : '你好，我注意到你最近记录了一些想法。继续探索你的内心世界吧。'),
        question: result.prompt || result.question || (recentEntries.length === 0
          ? '今天有什么让你印象深刻的事吗？'
          : '今天想记录些什么新的想法呢？')
      };
    } catch (error) {
      console.error('[JournalBusinessService] 生成每日问候失败:', error);
      // 返回默认问候
      return {
        greeting: recentEntries.length === 0 
          ? '欢迎来到现实记录。这里是你的内心世界，记录下每一个真实的瞬间。'
          : '你好，我注意到你最近记录了一些想法。继续探索你的内心世界吧。',
        question: recentEntries.length === 0
          ? '今天有什么让你印象深刻的事吗？'
          : '今天想记录些什么新的想法呢？'
      };
    }
  }

  /**
   * 生成镜面洞察（从日记内容中提取）
   */
  async generateMirrorInsight(journalContent: string, pastEntries: string[]): Promise<string | null> {
    try {
      const prompt = `Analyze the journal entry and past entries. Extract a single, profound insight (max 50 words) that reflects the user's emotional pattern or growth. Output ONLY the insight.`;
      const context = `Current Entry: ${journalContent}\n\nPast Themes: ${pastEntries.join(', ')}`;
      const responseText = await this.aiService.generateTextString(`${prompt}\n\n${context}`);
      return responseText || null;
    } catch (error) {
      console.error('[JournalBusinessService] 生成镜面洞察失败:', error);
      return null;
    }
  }
}

