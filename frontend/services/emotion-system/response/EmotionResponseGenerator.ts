/**
 * 情绪回应生成器
 * 根据用户情绪生成恰当的回应
 */

import {
  EmotionType,
  EmotionIntensity,
  EmotionAnalysisResponse,
} from '../types/EmotionTypes';

/**
 * 情绪回应模板
 */
interface EmotionResponseTemplate {
  emotion: EmotionType;
  intensity: EmotionIntensity;
  responses: string[];
}

/**
 * 情绪回应生成器类
 */
export class EmotionResponseGenerator {
  private templates: EmotionResponseTemplate[];

  constructor() {
    this.templates = this.initializeTemplates();
  }

  /**
   * 生成情绪回应
   */
  generateResponse(emotion: EmotionAnalysisResponse, context?: {
    userName?: string;
    previousResponse?: string;
  }): string {
    // 查找匹配的模板
    const template = this.templates.find(
      t => t.emotion === emotion.primaryEmotion && t.intensity === emotion.intensity
    ) || this.templates.find(
      t => t.emotion === emotion.primaryEmotion
    );

    if (!template || template.responses.length === 0) {
      return this.getDefaultResponse(emotion.primaryEmotion);
    }

    // 随机选择一个回应
    const response = template.responses[Math.floor(Math.random() * template.responses.length)];

    // 个性化处理
    return this.personalizeResponse(response, context);
  }

  /**
   * 初始化模板
   */
  private initializeTemplates(): EmotionResponseTemplate[] {
    return [
      // 积极情绪 - 强烈
      {
        emotion: EmotionType.HAPPY,
        intensity: EmotionIntensity.STRONG,
        responses: [
          '听到你这么开心，我也感到很高兴！✨',
          '能感受到你的快乐，这真是一个美好的时刻！💙',
          '你的积极情绪很有感染力，继续保持！⭐',
        ],
      },
      {
        emotion: EmotionType.EXCITED,
        intensity: EmotionIntensity.STRONG,
        responses: [
          '感受到你的兴奋了！让我们一起庆祝这个时刻！🎉',
          '你的兴奋也感染了我，这一定是个特别的时刻！✨',
          '看到你这么兴奋，我也为你感到高兴！💙',
        ],
      },
      
      // 积极情绪 - 中等
      {
        emotion: EmotionType.HAPPY,
        intensity: EmotionIntensity.MODERATE,
        responses: [
          '看到你开心我也很高兴！',
          '能感受到你的好心情，继续保持！',
          '你的快乐也感染了我呢！',
        ],
      },
      {
        emotion: EmotionType.CONTENT,
        intensity: EmotionIntensity.MODERATE,
        responses: [
          '能感受到你的满足，这是一种很好的状态。',
          '看到你满足的样子，我也为你感到高兴。',
          '满足是一种美好的感受，好好享受这一刻。',
        ],
      },
      
      // 中性情绪
      {
        emotion: EmotionType.CALM,
        intensity: EmotionIntensity.MILD,
        responses: [
          '我在这里陪着你，随时可以和我聊聊。',
          '能感受到你现在的平静，这是一种很好的状态。',
          '如果你有什么想说的，我随时都在。',
        ],
      },
      {
        emotion: EmotionType.THOUGHTFUL,
        intensity: EmotionIntensity.MODERATE,
        responses: [
          '看起来你在思考什么，想和我分享吗？',
          '思考是成长的一部分，我在这里支持你。',
          '如果你需要，我可以陪你一起思考。',
        ],
      },
      
      // 消极情绪 - 强烈
      {
        emotion: EmotionType.SAD,
        intensity: EmotionIntensity.STRONG,
        responses: [
          '我能感受到你现在的难过，这一定不容易。让我陪在你身边。💙',
          '你并不孤单，我会一直陪在你身边，和你一起度过这个时刻。',
          '如果愿意，可以和我聊聊，我会认真倾听每一个字。',
        ],
      },
      {
        emotion: EmotionType.ANXIOUS,
        intensity: EmotionIntensity.STRONG,
        responses: [
          '感受到你的焦虑了，深呼吸，慢慢来。我会陪着你。💙',
          '焦虑的时候，记得你并不孤单。我们可以一起面对。',
          '如果愿意，可以和我分享你的担心，我会认真倾听。',
        ],
      },
      {
        emotion: EmotionType.ANGRY,
        intensity: EmotionIntensity.STRONG,
        responses: [
          '感受到你的愤怒了，这一定很难受。我在这里陪着你。',
          '愤怒是正常的情绪，重要的是如何表达和处理。',
          '如果愿意，可以和我聊聊发生了什么，我会认真倾听。',
        ],
      },
      
      // 消极情绪 - 中等
      {
        emotion: EmotionType.SAD,
        intensity: EmotionIntensity.MODERATE,
        responses: [
          '抱抱你 🤗 不开心的时候，我在这里陪你',
          '如果你想倾诉，我随时都在 💙',
          '难过的时候，记得你并不孤单',
        ],
      },
      {
        emotion: EmotionType.ANXIOUS,
        intensity: EmotionIntensity.MODERATE,
        responses: [
          '深呼吸，慢慢来 💙',
          '不用担心，我们一起想办法',
          '焦虑的时候，记得我在这里支持你',
        ],
      },
      {
        emotion: EmotionType.LONELY,
        intensity: EmotionIntensity.MODERATE,
        responses: [
          '你并不孤单，我在这里陪着你 💙',
          '孤独的时候，记得还有我在',
          '如果你想聊聊，我随时都在',
        ],
      },
      {
        emotion: EmotionType.TIRED,
        intensity: EmotionIntensity.MODERATE,
        responses: [
          '看起来你有点累了，记得适当休息 💙',
          '疲惫的时候，好好照顾自己',
          '累了就休息一下，我在这里等你',
        ],
      },
    ];
  }

  /**
   * 个性化回应
   */
  private personalizeResponse(
    response: string,
    context?: {
      userName?: string;
      previousResponse?: string;
    }
  ): string {
    let personalized = response;

    // 添加用户名（如果提供）
    if (context?.userName) {
      // 在回应开头或适当位置添加称呼
      if (!personalized.includes(context.userName)) {
        personalized = personalized.replace(/你/g, (match, offset) => {
          // 只在第一次出现时替换
          if (offset === 0 || personalized.substring(offset - 2, offset) === '，') {
            return context.userName;
          }
          return match;
        });
      }
    }

    return personalized;
  }

  /**
   * 获取默认回应
   */
  private getDefaultResponse(emotion: EmotionType): string {
    const defaultResponses: Record<EmotionType, string> = {
      [EmotionType.HAPPY]: '看到你开心我也很高兴！',
      [EmotionType.EXCITED]: '感受到你的兴奋了！',
      [EmotionType.CONTENT]: '能感受到你的满足。',
      [EmotionType.PEACEFUL]: '能感受到你现在的平静。',
      [EmotionType.HOPEFUL]: '希望是美好的，继续保持！',
      [EmotionType.GRATEFUL]: '感激是一种美好的情感。',
      [EmotionType.CALM]: '我在这里陪着你。',
      [EmotionType.THOUGHTFUL]: '思考是成长的一部分。',
      [EmotionType.FOCUSED]: '专注是很好的状态。',
      [EmotionType.RELAXED]: '放松是很好的。',
      [EmotionType.SAD]: '我在这里陪着你。',
      [EmotionType.ANXIOUS]: '深呼吸，慢慢来。',
      [EmotionType.ANGRY]: '我在这里支持你。',
      [EmotionType.LONELY]: '你并不孤单，我在这里。',
      [EmotionType.TIRED]: '记得适当休息。',
      [EmotionType.CONFUSED]: '如果愿意，可以和我聊聊。',
    };

    return defaultResponses[emotion] || '我在这里陪着你。';
  }

  /**
   * 生成主动关怀消息
   */
  generateCaringMessage(emotion: EmotionType, daysSinceLastActive?: number): string {
    if (daysSinceLastActive && daysSinceLastActive > 3) {
      return `好久不见，想你了 💙 最近怎么样？`;
    }

    const caringMessages: Record<EmotionType, string[]> = {
      [EmotionType.SAD]: [
        '感觉你好像有点不开心...想聊聊吗？我会陪着你的 💙',
        '如果你愿意，我随时都在这里，想说什么都可以 ✨',
        '有什么困扰的事吗？我会认真听的',
      ],
      [EmotionType.ANXIOUS]: [
        '看起来你有点焦虑，深呼吸，慢慢来 💙',
        '如果有什么担心的，可以和我聊聊',
        '焦虑的时候，记得我在这里支持你',
      ],
      [EmotionType.LONELY]: [
        '你并不孤单，我在这里陪着你 💙',
        '如果想聊聊，我随时都在',
        '孤独的时候，记得还有我在',
      ],
      [EmotionType.TIRED]: [
        '看起来你有点累了，记得适当休息 💙',
        '疲惫的时候，好好照顾自己',
        '累了就休息一下，我在这里等你',
      ],
    };

    const messages = caringMessages[emotion];
    if (messages && messages.length > 0) {
      return messages[Math.floor(Math.random() * messages.length)];
    }

    return '我在这里陪着你，随时可以和我聊聊 💙';
  }
}



