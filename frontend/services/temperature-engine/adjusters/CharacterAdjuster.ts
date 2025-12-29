/**
 * 角色调节器
 * 根据温度感调整角色表情、动作、语言风格等
 */

import {
  TemperatureLevel,
  TemperatureScore,
  EmotionType,
} from '../types/TemperatureTypes';

/**
 * 角色表情类型
 */
export type CharacterExpression = 
  | 'happy'      // 开心
  | 'sad'        // 难过
  | 'thinking'   // 思考
  | 'caring'     // 关心
  | 'comforting' // 安慰
  | 'encouraging' // 鼓励
  | 'neutral'    // 中性
  | 'excited';   // 兴奋

/**
 * 角色动作类型
 */
export type CharacterAction = 
  | 'nodding'     // 点头
  | 'shaking'     // 摇头
  | 'waving'      // 挥手
  | 'thinking'   // 思考
  | 'listening'  // 倾听
  | 'encouraging' // 鼓励
  | 'comforting'  // 安慰
  | 'idle';      // 待机

/**
 * 角色调节配置
 */
interface CharacterAdjustConfig {
  expression: CharacterExpression;
  action: CharacterAction;
  languageStyle: 'formal' | 'casual' | 'warm' | 'enthusiastic';
  responseSpeed: 'slow' | 'normal' | 'fast';
}

/**
 * 角色调节器类
 */
export class CharacterAdjuster {
  /**
   * 调节角色温度感
   */
  async adjust(
    targetLevel: TemperatureLevel,
    options?: {
      emotion?: EmotionType;
      context?: any;
    }
  ): Promise<CharacterAdjustConfig> {
    const config = this.getCharacterConfig(targetLevel, options);
    return config;
  }

  /**
   * 根据温度感级别获取角色配置
   */
  private getCharacterConfig(
    level: TemperatureLevel,
    options?: {
      emotion?: EmotionType;
      context?: any;
    }
  ): CharacterAdjustConfig {
    // 基础配置
    const baseConfigs: Record<TemperatureLevel, CharacterAdjustConfig> = {
      cold: {
        expression: 'neutral',
        action: 'idle',
        languageStyle: 'formal',
        responseSpeed: 'slow',
      },
      neutral: {
        expression: 'neutral',
        action: 'listening',
        languageStyle: 'casual',
        responseSpeed: 'normal',
      },
      warm: {
        expression: 'happy',
        action: 'listening',
        languageStyle: 'warm',
        responseSpeed: 'normal',
      },
      hot: {
        expression: 'excited',
        action: 'waving',
        languageStyle: 'enthusiastic',
        responseSpeed: 'fast',
      },
    };

    let config = { ...baseConfigs[level] };

    // 根据情绪调整
    if (options?.emotion) {
      config = this.adjustByEmotion(config, options.emotion);
    }

    return config;
  }

  /**
   * 根据情绪调整配置
   */
  private adjustByEmotion(
    config: CharacterAdjustConfig,
    emotion: EmotionType
  ): CharacterAdjustConfig {
    const emotionMappings: Record<EmotionType, Partial<CharacterAdjustConfig>> = {
      happy: {
        expression: 'happy',
        action: 'waving',
        languageStyle: 'warm',
      },
      sad: {
        expression: 'caring',
        action: 'comforting',
        languageStyle: 'warm',
      },
      anxious: {
        expression: 'thinking',
        action: 'listening',
        languageStyle: 'warm',
      },
      calm: {
        expression: 'neutral',
        action: 'listening',
        languageStyle: 'casual',
      },
      excited: {
        expression: 'excited',
        action: 'waving',
        languageStyle: 'enthusiastic',
      },
      tired: {
        expression: 'neutral',
        action: 'idle',
        languageStyle: 'casual',
      },
      neutral: {
        // 保持原配置
      },
    };

    const emotionConfig = emotionMappings[emotion];
    if (emotionConfig) {
      return { ...config, ...emotionConfig };
    }

    return config;
  }

  /**
   * 根据温度感评分调整角色
   */
  async adjustByScore(score: TemperatureScore): Promise<CharacterAdjustConfig> {
    // 根据评分确定情绪
    let emotion: EmotionType = 'neutral';
    
    if (score.factors.emotion > 0.7) {
      emotion = 'happy';
    } else if (score.factors.emotion < 0.3) {
      emotion = 'sad';
    }

    return this.adjust(score.level, { emotion });
  }

  /**
   * 获取表情建议
   */
  getExpressionSuggestion(
    level: TemperatureLevel,
    emotion?: EmotionType
  ): CharacterExpression {
    const config = this.getCharacterConfig(level, { emotion });
    return config.expression;
  }

  /**
   * 获取动作建议
   */
  getActionSuggestion(
    level: TemperatureLevel,
    emotion?: EmotionType
  ): CharacterAction {
    const config = this.getCharacterConfig(level, { emotion });
    return config.action;
  }

  /**
   * 获取语言风格建议
   */
  getLanguageStyleSuggestion(level: TemperatureLevel): 'formal' | 'casual' | 'warm' | 'enthusiastic' {
    const config = this.getCharacterConfig(level);
    return config.languageStyle;
  }

  /**
   * 表情到温度感的映射
   */
  expressionToTemperature(expression: CharacterExpression): TemperatureLevel {
    const mapping: Record<CharacterExpression, TemperatureLevel> = {
      happy: 'warm',
      excited: 'hot',
      caring: 'warm',
      comforting: 'warm',
      encouraging: 'warm',
      neutral: 'neutral',
      thinking: 'neutral',
      sad: 'cold',
    };

    return mapping[expression] || 'neutral';
  }

  /**
   * 动作到温度感的映射
   */
  actionToTemperature(action: CharacterAction): TemperatureLevel {
    const mapping: Record<CharacterAction, TemperatureLevel> = {
      waving: 'warm',
      encouraging: 'warm',
      listening: 'neutral',
      nodding: 'neutral',
      shaking: 'neutral',
      thinking: 'neutral',
      comforting: 'warm',
      idle: 'cold',
    };

    return mapping[action] || 'neutral';
  }
}

