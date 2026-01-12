/**
 * 角色相关业务逻辑服务
 * 从 AIService 中提取的角色生成相关方法
 */

import { AIService } from '../AIService';
import { AIServiceException } from '../types';

/**
 * 角色业务服务
 */
export class CharacterBusinessService {
  constructor(private aiService: AIService) {}

  /**
   * 生成角色（从提示词）
   * 统一的角色生成接口，支持所有模式和provider
   */
  async generateCharacterFromPrompt(prompt: string, eraName: string): Promise<any> {
    const systemPrompt = `You are a creative writer. Create a complete character profile for a world/era named "${eraName}".
Output JSON only with these properties: 
- name, age (number), role, bio
- systemInstruction (detailed roleplay instructions)
- firstMessage (greeting)
- themeColor (hex), colorAccent (hex)
- mbti (e.g. INFJ)
- tags (array of strings, personality keywords)
- speechStyle (description of how they talk)
- catchphrases (array of strings, 2-3 common phrases)
- secrets (hidden depth/secret)
- motivations (current goal)

The content MUST be in Chinese.`;
    
    const userPrompt = `Character concept: "${prompt}".`;

    try {
      const responseText = await this.aiService.generateTextString(userPrompt, systemPrompt, { jsonMode: true });
      const details = JSON.parse(responseText);

      // 使用占位符图片以节省成本
      const avatarUrl = 'https://picsum.photos/seed/default_avatar/400/600';
      const backgroundUrl = 'https://picsum.photos/seed/default_bg/1080/1920';

      return {
        id: `custom_${Date.now()}`,
        voiceName: 'Kore',
        ...details,
        avatarUrl,
        backgroundUrl,
      };
    } catch (error) {
      throw new AIServiceException(
        `角色生成失败: ${error instanceof Error ? error.message : String(error)}`,
        'unknown'
      );
    }
  }

  /**
   * 生成角色图片
   */
  async generateCharacterImage(
    character: {name: string, role: string, bio: string, themeColor: string},
    worldStyle?: string
  ): Promise<string | null> {
    try {
      // 使用提示词构造器（如果可用）
      try {
        const { constructCharacterAvatarPrompt } = await import('../../../utils/promptConstructors');
        const prompt = constructCharacterAvatarPrompt(character.name, character.role, character.bio, character.themeColor, worldStyle);
        return await this.aiService.generateImageFromPrompt(prompt, '3:4');
      } catch {
        // 如果提示词构造器不可用，使用默认提示词
        const prompt = `A portrait of ${character.name}, ${character.role}. ${character.bio}. 
Style: ${worldStyle || 'realistic'}. 
Color theme: ${character.themeColor}. 
High quality, detailed, cinematic lighting.`;
        return await this.aiService.generateImageFromPrompt(prompt, '3:4');
      }
    } catch (error) {
      console.error('[CharacterBusinessService] 生成角色图片失败:', error);
      return null;
    }
  }
}

