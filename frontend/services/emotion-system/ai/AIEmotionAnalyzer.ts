/**
 * AI增强的情绪分析器
 * 使用大语言模型进行更深入的情绪分析
 */

import {
  EmotionType,
  EmotionIntensity,
  EmotionAnalysisRequest,
  EmotionAnalysisResponse,
} from '../types/EmotionTypes';
import { aiService } from '../../ai';

/**
 * AI情绪分析器类
 */
export class AIEmotionAnalyzer {
  /**
   * 使用AI分析情绪
   */
  async analyzeWithAI(request: EmotionAnalysisRequest): Promise<EmotionAnalysisResponse> {
    if (!request.text) {
      return this.getDefaultResponse();
    }

    // 构建AI提示词
    const prompt = this.buildAnalysisPrompt(request);

    try {
      // 调用AI服务
      const response = await aiService.generateText({
        prompt,
        systemInstruction: '你是一个专业的情绪分析专家，擅长深入理解文本中的情绪和情感。',
        temperature: 0.3, // 较低的温度以获得更一致的分析
        maxTokens: 500,
      });

      // 解析AI响应
      return this.parseAIResponse(response.content || '', request);
    } catch (error) {
      console.error('[AIEmotionAnalyzer] AI分析失败:', error);
      // 降级到基础分析
      return this.getDefaultResponse();
    }
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(request: EmotionAnalysisRequest): string {
    const contextInfo = request.context
      ? `
上下文信息：
- 对话历史: ${request.context.conversationHistory?.slice(-3).join(' | ') || '无'}
- 时间: ${request.context.timeOfDay !== undefined ? `${request.context.timeOfDay}点` : '未知'}
- 星期: ${request.context.dayOfWeek !== undefined ? `周${request.context.dayOfWeek}` : '未知'}
`
      : '';

    return `
请分析以下文本的情绪状态，并返回JSON格式的结果。

文本内容：
${request.text}
${contextInfo}

请分析并返回JSON格式结果，包含以下字段：
{
  "primaryEmotion": "主要情绪类型（happy/excited/content/peaceful/hopeful/grateful/calm/thoughtful/focused/relaxed/sad/anxious/angry/lonely/tired/confused）",
  "secondaryEmotions": ["次要情绪类型数组（可选）"],
  "intensity": "情绪强度（mild/moderate/strong）",
  "confidence": 分析置信度（0-1之间的小数）,
  "emotionTags": ["情绪标签数组，如['工作压力', '情感困扰']"],
  "keyPhrases": ["关键短语数组，最能体现情绪的短语"],
  "reasoning": "分析理由（简要说明为什么得出这个结论）"
}

注意：
- 要深入理解文本的隐含情绪，不仅仅是表面文字
- 考虑上下文的情绪背景
- 识别情绪的混合状态
- 评估情绪的强度和真实性
- 只返回JSON，不要包含其他文字
`;
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(
    aiResponse: string,
    request: EmotionAnalysisRequest
  ): EmotionAnalysisResponse {
    try {
      // 尝试提取JSON（可能包含markdown代码块）
      let jsonStr = aiResponse.trim();
      
      // 移除可能的markdown代码块标记
      if (jsonStr.startsWith('```')) {
        const lines = jsonStr.split('\n');
        jsonStr = lines.slice(1, -1).join('\n');
      }
      
      // 移除可能的json标记
      jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      
      const parsed = JSON.parse(jsonStr);
      
      // 验证和规范化
      return {
        primaryEmotion: this.validateEmotionType(parsed.primaryEmotion) || EmotionType.CALM,
        secondaryEmotions: parsed.secondaryEmotions?.map((e: string) => this.validateEmotionType(e)).filter(Boolean) || undefined,
        intensity: this.validateIntensity(parsed.intensity) || EmotionIntensity.MODERATE,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
        emotionTags: Array.isArray(parsed.emotionTags) ? parsed.emotionTags : [],
        keyPhrases: Array.isArray(parsed.keyPhrases) ? parsed.keyPhrases : this.extractKeyPhrases(request.text || ''),
        reasoning: parsed.reasoning || 'AI分析结果',
      };
    } catch (error) {
      console.error('[AIEmotionAnalyzer] 解析AI响应失败:', error);
      // 降级处理
      return this.getDefaultResponse();
    }
  }

  /**
   * 验证情绪类型
   */
  private validateEmotionType(emotion: string): EmotionType | null {
    const validEmotions = Object.values(EmotionType);
    return validEmotions.includes(emotion as EmotionType) ? (emotion as EmotionType) : null;
  }

  /**
   * 验证强度
   */
  private validateIntensity(intensity: string): EmotionIntensity | null {
    const validIntensities = Object.values(EmotionIntensity);
    return validIntensities.includes(intensity as EmotionIntensity) ? (intensity as EmotionIntensity) : null;
  }

  /**
   * 提取关键短语（降级方案）
   */
  private extractKeyPhrases(text: string): string[] {
    // 简单的句子分割
    const sentences = text.split(/[。！？\n]/).filter(s => s.trim().length > 5);
    return sentences.slice(0, 3);
  }

  /**
   * 获取默认响应
   */
  private getDefaultResponse(): EmotionAnalysisResponse {
    return {
      primaryEmotion: EmotionType.CALM,
      intensity: EmotionIntensity.MILD,
      confidence: 0.3,
      emotionTags: [],
      keyPhrases: [],
    };
  }
}




