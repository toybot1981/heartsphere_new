/**
 * 媒体相关业务逻辑服务
 * 从 AIService 中提取的媒体生成相关方法
 */

import { AIService } from '../AIService';

/**
 * 媒体业务服务
 */
export class MediaBusinessService {
  constructor(private aiService: AIService) {}

  /**
   * 从提示词生成图片
   */
  async generateImageFromPrompt(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '1:1'): Promise<string | null> {
    try {
      const response = await this.aiService.generateImage({
        prompt,
        aspectRatio,
      });

      if (response.images && response.images.length > 0) {
        return response.images[0].url || response.images[0].base64 || null;
      }
      return null;
    } catch (error) {
      console.error('[MediaBusinessService] 从提示词生成图片失败:', error);
      return null;
    }
  }

  /**
   * 生成语音（文本转语音）
   */
  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string | null> {
    try {
      const response = await this.aiService.textToSpeech({
        text,
        voice: voiceName,
      });

      if (response.audio) {
        return response.audio.base64 || response.audio.url || null;
      }
      return null;
    } catch (error) {
      console.error('[MediaBusinessService] 生成语音失败:', error);
      return null;
    }
  }

  /**
   * 生成用户头像
   */
  async generateUserAvatar(nickname: string, worldStyle?: string): Promise<string | null> {
    try {
      // 使用提示词构造器（如果可用）
      try {
        const { constructUserAvatarPrompt } = await import('../../../utils/promptConstructors');
        const prompt = constructUserAvatarPrompt(nickname, worldStyle);
        return await this.generateImageFromPrompt(prompt, '1:1');
      } catch {
        // 如果提示词构造器不可用，使用默认提示词
        const prompt = `A portrait of ${nickname}, user avatar. Style: ${worldStyle || 'realistic'}. High quality, detailed.`;
        return await this.generateImageFromPrompt(prompt, '1:1');
      }
    } catch (error) {
      console.error('[MediaBusinessService] 生成用户头像失败:', error);
      return null;
    }
  }

  /**
   * 分析图片生成时代信息
   */
  async analyzeImageForEra(base64Image: string): Promise<{name: string, description: string} | null> {
    try {
      const prompt = `Analyze this image and create an era/world concept. Output JSON with "name" and "description".`;
      // TODO: 实现图片分析功能（需要支持多模态的模型）
      console.warn('[MediaBusinessService] analyzeImageForEra 暂未实现，需要图片输入支持');
      return null;
    } catch (error) {
      console.error('[MediaBusinessService] 分析图片失败:', error);
      return null;
    }
  }
}

