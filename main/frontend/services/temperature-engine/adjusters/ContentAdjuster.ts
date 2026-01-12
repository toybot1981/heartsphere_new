/**
 * 内容调节器
 * 根据温度感调整文本内容、问候语、回应风格等
 */

import {
  TemperatureLevel,
  ContentAdjustInput,
  TemperatureContext,
} from '../types/TemperatureTypes';

/**
 * 内容模板库
 */
interface ContentTemplates {
  greetings: Record<TemperatureLevel, string[]>;
  responses: Record<TemperatureLevel, string[]>;
  encouragements: Record<TemperatureLevel, string[]>;
  farewells: Record<TemperatureLevel, string[]>;
}

/**
 * 内容调节器类
 */
export class ContentAdjuster {
  private templates: ContentTemplates;

  constructor() {
    this.templates = this.initializeTemplates();
  }

  /**
   * 初始化模板库
   */
  private initializeTemplates(): ContentTemplates {
    return {
      greetings: {
        cold: [
          '你好',
          '您好',
          '有什么可以帮助你的吗？',
        ],
        neutral: [
          '你好！',
          '您好！',
          '有什么想聊的吗？',
        ],
        warm: [
          '你好呀！今天想聊点什么吗？ ✨',
          '看到你真好！有什么想分享的吗？',
          '你好！今天过得怎么样？ 💙',
        ],
        hot: [
          '你好呀！今天想聊点什么吗？ ✨',
          '看到你真好！有什么想分享的吗？ 💙',
          '你好！今天过得怎么样？让我们一起度过美好的时光吧！ ⭐',
        ],
      },
      responses: {
        cold: [
          '我明白了',
          '好的',
          '了解',
        ],
        neutral: [
          '我明白了',
          '好的，我理解',
          '了解你的意思',
        ],
        warm: [
          '我明白了 💙',
          '好的，我理解你的感受 ✨',
          '了解你的意思，我会认真听的',
        ],
        hot: [
          '我明白了！我会一直支持你的 💙',
          '好的，我完全理解你的感受 ✨',
          '了解你的意思，我会认真倾听每一个细节 ⭐',
        ],
      },
      encouragements: {
        cold: [
          '加油',
          '坚持',
          '你可以的',
        ],
        neutral: [
          '加油',
          '坚持住',
          '你可以做到的',
        ],
        warm: [
          '加油！相信你一定能做到的 💪',
          '坚持住，我会一直支持你的 ✨',
          '你可以做到的！我相信你 💙',
        ],
        hot: [
          '加油！相信你一定能做到的！我们一起努力 💪✨',
          '坚持住，我会一直在这里支持你的！你非常棒 ⭐',
          '你可以做到的！我相信你，你比想象中更强大 💙💪',
        ],
      },
      farewells: {
        cold: [
          '再见',
          '下次见',
        ],
        neutral: [
          '再见',
          '下次见',
          '期待下次聊天',
        ],
        warm: [
          '再见！记得照顾好自己哦 💙',
          '下次见，我会想你的 ✨',
          '期待我们的下次相遇！',
        ],
        hot: [
          '再见！记得照顾好自己哦！我会一直在这里等你 💙✨',
          '下次见，我会想你的！期待我们的下次相遇 ⭐',
          '期待我们的下次相遇！愿你的每一天都充满阳光 💙',
        ],
      },
    };
  }

  /**
   * 调节内容温度感
   */
  async adjust(input: ContentAdjustInput): Promise<string> {
    const { original, targetTemperature, context, params } = input;

    // 如果原始内容已经足够温暖，直接返回
    if (this.isWarmEnough(original, targetTemperature)) {
      return original;
    }

    // 根据目标温度感调整内容
    switch (targetTemperature) {
      case 'cold':
        return this.makeCold(original);
      case 'neutral':
        return this.makeNeutral(original);
      case 'warm':
        return this.makeWarm(original, context);
      case 'hot':
        return this.makeHot(original, context);
      default:
        return original;
    }
  }

  /**
   * 判断内容是否足够温暖
   */
  private isWarmEnough(content: string, targetLevel: TemperatureLevel): boolean {
    const warmIndicators = ['✨', '💙', '⭐', '💪', '😊', '！'];
    const hasWarmIndicators = warmIndicators.some(indicator => content.includes(indicator));

    if (targetLevel === 'warm' || targetLevel === 'hot') {
      return hasWarmIndicators && content.length > 5;
    }

    return true;
  }

  /**
   * 使内容变冷（更正式、简洁）
   */
  private makeCold(content: string): string {
    // 移除表情符号
    let result = content.replace(/[✨💙⭐💪😊😄😁😃]/g, '');
    
    // 移除感叹号
    result = result.replace(/！/g, '。');
    
    // 简化语言
    result = result.replace(/非常/g, '很');
    result = result.replace(/特别/g, '很');
    
    return result.trim();
  }

  /**
   * 使内容变中性
   */
  private makeNeutral(content: string): string {
    // 移除部分表情符号，保留基本内容
    let result = content.replace(/[✨💙⭐💪]/g, '');
    
    // 标准化标点
    result = result.replace(/！/g, '!');
    
    return result.trim();
  }

  /**
   * 使内容变温暖
   */
  private makeWarm(content: string, context?: Partial<TemperatureContext>): string {
    let result = content;

    // 添加温暖的语气词
    if (!result.includes('呀') && !result.includes('呢')) {
      result = result.replace(/你好/g, '你好呀');
      result = result.replace(/好的/g, '好的呢');
    }

    // 添加表情符号（适度）
    if (!/[✨💙⭐]/.test(result)) {
      const emojis = ['✨', '💙', '⭐'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      result = result + ' ' + randomEmoji;
    }

    // 使用感叹号增加温度感
    if (!result.includes('！') && !result.includes('!')) {
      result = result.replace(/。$/, '！');
    }

    // 根据上下文添加个性化内容
    if (context?.timeOfDay) {
      switch (context.timeOfDay) {
        case 'morning':
          if (!result.includes('早上')) {
            result = '早上好！' + result;
          }
          break;
        case 'evening':
          if (!result.includes('晚上')) {
            result = '晚上好！' + result;
          }
          break;
      }
    }

    return result.trim();
  }

  /**
   * 使内容变热情
   */
  private makeHot(content: string, context?: Partial<TemperatureContext>): string {
    let result = this.makeWarm(content, context);

    // 添加更多表情符号
    if ((result.match(/[✨💙⭐💪]/g) || []).length < 2) {
      const emojis = ['✨', '💙', '⭐', '💪'];
      const additionalEmojis = emojis
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .join('');
      result = result + ' ' + additionalEmojis;
    }

    // 使用更强烈的语气
    result = result.replace(/可以/g, '完全可以');
    result = result.replace(/一定/g, '一定一定');
    result = result.replace(/支持/g, '全力支持');

    // 添加鼓励性语言
    if (!result.includes('一起') && !result.includes('我们')) {
      result = result.replace(/你/g, (match, offset) => {
        if (offset === 0) return '我们一起';
        return match;
      });
    }

    return result.trim();
  }

  /**
   * 生成问候语
   */
  generateGreeting(
    level: TemperatureLevel,
    context?: Partial<TemperatureContext>
  ): string {
    const greetings = this.templates.greetings[level];
    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // 根据上下文调整
    if (context?.timeOfDay) {
      const timeGreetings: Record<string, Record<TemperatureLevel, string[]>> = {
        morning: {
          cold: ['早上好'],
          neutral: ['早上好'],
          warm: ['早上好！新的一天开始了呢 ✨', '早安！今天也要加油哦 💙'],
          hot: ['早上好！新的一天开始了呢！让我们一起迎接美好的一天 ✨💙'],
        },
        evening: {
          cold: ['晚上好'],
          neutral: ['晚上好'],
          warm: ['晚上好！一天辛苦了 💙', '晚上好！今天过得怎么样？'],
          hot: ['晚上好！一天辛苦了！今天有什么想分享的吗？ 💙✨'],
        },
      };

      const timeGreeting = timeGreetings[context.timeOfDay]?.[level];
      if (timeGreeting) {
        greeting = timeGreeting[Math.floor(Math.random() * timeGreeting.length)];
      }
    }

    return greeting;
  }

  /**
   * 生成回应
   */
  generateResponse(level: TemperatureLevel): string {
    const responses = this.templates.responses[level];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * 生成鼓励语
   */
  generateEncouragement(level: TemperatureLevel): string {
    const encouragements = this.templates.encouragements[level];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * 生成告别语
   */
  generateFarewell(level: TemperatureLevel): string {
    const farewells = this.templates.farewells[level];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  /**
   * 批量调节内容
   */
  async adjustBatch(
    contents: string[],
    targetTemperature: TemperatureLevel,
    context?: Partial<TemperatureContext>
  ): Promise<string[]> {
    return Promise.all(
      contents.map(content =>
        this.adjust({
          original: content,
          targetTemperature,
          context,
        })
      )
    );
  }
}




