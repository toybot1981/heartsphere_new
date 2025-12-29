/**
 * 上下文感知器
 * 感知和分析用户当前上下文，为温度感计算提供依据
 */

import { TemperatureContext } from '../types/TemperatureTypes';

/**
 * 上下文感知器类
 */
export class ContextAwareness {
  /**
   * 构建完整上下文
   */
  buildContext(partialContext?: Partial<TemperatureContext>): TemperatureContext {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // 确定时间段
    const timeOfDay = this.getTimeOfDay(hour);

    // 确定季节
    const season = this.getSeason(now);

    // 构建完整上下文
    const context: TemperatureContext = {
      timeOfDay,
      dayOfWeek,
      season,
      device: partialContext?.device || this.detectDevice(),
      userActivity: {
        sessionDuration: partialContext?.userActivity?.sessionDuration || 0,
        messageCount: partialContext?.userActivity?.messageCount || 0,
        lastInteraction: partialContext?.userActivity?.lastInteraction || 0,
      },
      conversation: {
        length: partialContext?.conversation?.length || 0,
        topic: partialContext?.conversation?.topic,
        sentiment: partialContext?.conversation?.sentiment || 'neutral',
      },
      ...partialContext,
    };

    return context;
  }

  /**
   * 获取时间段
   */
  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 5 && hour < 9) {
      return 'morning';
    } else if (hour >= 9 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 14) {
      return 'afternoon';
    } else if (hour >= 14 && hour < 18) {
      return 'afternoon';
    } else if (hour >= 18 && hour < 22) {
      return 'evening';
    } else {
      return 'night';
    }
  }

  /**
   * 获取季节
   */
  private getSeason(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = date.getMonth() + 1; // 1-12

    if (month >= 3 && month <= 5) {
      return 'spring';
    } else if (month >= 6 && month <= 8) {
      return 'summer';
    } else if (month >= 9 && month <= 11) {
      return 'autumn';
    } else {
      return 'winter';
    }
  }

  /**
   * 检测设备类型
   */
  private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') {
      return 'desktop';
    }

    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();

    if (width < 768) {
      return 'mobile';
    } else if (width < 1024 || /tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * 检测连接速度
   */
  detectConnectionSpeed(): 'fast' | 'medium' | 'slow' {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return 'medium';
    }

    const connection = (navigator as any).connection;
    if (!connection) {
      return 'medium';
    }

    const effectiveType = connection.effectiveType;
    if (effectiveType === '4g' || effectiveType === '5g') {
      return 'fast';
    } else if (effectiveType === '3g' || effectiveType === '2g') {
      return 'slow';
    } else {
      return 'medium';
    }
  }

  /**
   * 分析上下文特征
   */
  analyzeContext(context: TemperatureContext): {
    warmth: number;      // 温暖度 (0-1)
    activity: number;    // 活跃度 (0-1)
    engagement: number;  // 参与度 (0-1)
  } {
    let warmth = 0.5;    // 默认中等温暖度
    let activity = 0.5;  // 默认中等活跃度
    let engagement = 0.5; // 默认中等参与度

    // 时间段影响温暖度
    switch (context.timeOfDay) {
      case 'morning':
        warmth += 0.1; // 早上更温暖
        activity += 0.1;
        break;
      case 'afternoon':
        warmth += 0.05;
        activity += 0.05;
        break;
      case 'evening':
        warmth += 0.05;
        activity -= 0.05;
        break;
      case 'night':
        warmth -= 0.1; // 晚上更冷静
        activity -= 0.15;
        break;
    }

    // 季节影响
    switch (context.season) {
      case 'spring':
        warmth += 0.1;
        activity += 0.1;
        break;
      case 'summer':
        warmth += 0.15;
        activity += 0.1;
        break;
      case 'autumn':
        warmth += 0.05;
        activity -= 0.05;
        break;
      case 'winter':
        warmth -= 0.1;
        activity -= 0.1;
        break;
    }

    // 对话情感倾向影响
    switch (context.conversation.sentiment) {
      case 'positive':
        warmth += 0.2;
        engagement += 0.2;
        break;
      case 'negative':
        warmth -= 0.2;
        engagement -= 0.1;
        break;
      case 'neutral':
        // 保持默认值
        break;
    }

    // 会话时长影响
    const sessionDuration = context.userActivity.sessionDuration;
    if (sessionDuration > 3600000) { // 超过1小时
      activity -= 0.1; // 可能疲劳
      engagement -= 0.05;
    } else if (sessionDuration < 60000) { // 少于1分钟
      engagement -= 0.1; // 可能刚进入
    } else if (sessionDuration > 300000 && sessionDuration < 1800000) { // 5-30分钟
      engagement += 0.1; // 最佳参与度
    }

    // 消息数量影响参与度
    const messageCount = context.userActivity.messageCount;
    if (messageCount > 20) {
      engagement += 0.15; // 高参与度
    } else if (messageCount < 3) {
      engagement -= 0.1; // 低参与度
    }

    // 最后交互时间影响
    const lastInteraction = context.userActivity.lastInteraction;
    if (lastInteraction < 5000) { // 5秒内
      engagement += 0.1; // 高活跃度
    } else if (lastInteraction > 300000) { // 5分钟以上
      engagement -= 0.15; // 可能离开
      activity -= 0.1;
    }

    // 对话长度影响
    if (context.conversation.length > 10) {
      engagement += 0.1;
      warmth += 0.05; // 长对话通常更温暖
    }

    // 归一化到0-1范围
    warmth = Math.max(0, Math.min(1, warmth));
    activity = Math.max(0, Math.min(1, activity));
    engagement = Math.max(0, Math.min(1, engagement));

    return { warmth, activity, engagement };
  }

  /**
   * 判断上下文是否需要调整温度感
   */
  shouldAdjustTemperature(context: TemperatureContext): {
    should: boolean;
    reason?: string;
    targetLevel?: 'cold' | 'neutral' | 'warm' | 'hot';
  } {
    const analysis = this.analyzeContext(context);

    // 如果温暖度很低，建议提升
    if (analysis.warmth < 0.3) {
      return {
        should: true,
        reason: 'context_warmth_low',
        targetLevel: 'warm',
      };
    }

    // 如果参与度很低，建议提升
    if (analysis.engagement < 0.3) {
      return {
        should: true,
        reason: 'context_engagement_low',
        targetLevel: 'warm',
      };
    }

    // 如果活跃度很高，可以更热情
    if (analysis.activity > 0.8 && analysis.engagement > 0.7) {
      return {
        should: true,
        reason: 'context_high_activity',
        targetLevel: 'hot',
      };
    }

    return {
      should: false,
    };
  }

  /**
   * 获取上下文建议
   */
  getContextSuggestions(context: TemperatureContext): string[] {
    const suggestions: string[] = [];
    const analysis = this.analyzeContext(context);

    // 根据时间段建议
    switch (context.timeOfDay) {
      case 'morning':
        suggestions.push('早上好！新的一天开始了呢 ✨');
        break;
      case 'afternoon':
        suggestions.push('下午好！今天过得怎么样？');
        break;
      case 'evening':
        suggestions.push('晚上好！一天辛苦了 💙');
        break;
      case 'night':
        suggestions.push('这么晚了还在呀，要注意休息哦 ✨');
        break;
    }

    // 根据参与度建议
    if (analysis.engagement < 0.3) {
      suggestions.push('有什么想聊的吗？我随时都在 ✨');
    } else if (analysis.engagement > 0.7) {
      suggestions.push('看到你充满活力的样子，我也很开心！');
    }

    // 根据对话情感建议
    if (context.conversation.sentiment === 'positive') {
      suggestions.push('感受到你的好心情了！💙');
    } else if (context.conversation.sentiment === 'negative') {
      suggestions.push('如果你愿意，我随时都在这里，想说什么都可以 ✨');
    }

    return suggestions;
  }
}

