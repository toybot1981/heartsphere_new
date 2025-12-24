/**
 * 场景相关业务逻辑服务
 * 从 AIService 中提取的场景生成相关方法
 */

import { AIService } from '../AIService';

/**
 * 场景业务服务
 */
export class SceneBusinessService {
  constructor(private aiService: AIService) {}

  /**
   * 生成场景描述（基于对话历史）
   */
  async generateSceneDescription(history: Array<{role: string, text: string}>): Promise<string | null> {
    try {
      const prompt = "Summarize the current visual setting and atmosphere of the story based on the last few messages. Keep it concise (1-2 sentences), focusing on visual elements for image generation.";
      const context = history.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n');
      const responseText = await this.aiService.generateTextString(`${prompt}\n\nSTORY CONTEXT:\n${context}`);
      return responseText || null;
    } catch (error) {
      console.error('[SceneBusinessService] 生成场景描述失败:', error);
      return null;
    }
  }

  /**
   * 生成心情图片
   */
  async generateMoodImage(text: string, worldStyle?: string): Promise<string | null> {
    try {
      // 构建提示词
      let prompt = `A moody, atmospheric scene that captures the emotional essence of: "${text}". `;
      if (worldStyle) {
        prompt += `Style: ${worldStyle}. `;
      }
      prompt += `High quality, cinematic lighting, vibrant colors. Aspect Ratio: 16:9.`;

      const response = await this.aiService.generateImage({
        prompt,
        aspectRatio: '16:9',
      });

      if (response.images && response.images.length > 0) {
        return response.images[0].url || response.images[0].base64 || null;
      }
      return null;
    } catch (error) {
      console.error('[SceneBusinessService] 生成心情图片失败:', error);
      return null;
    }
  }
}

