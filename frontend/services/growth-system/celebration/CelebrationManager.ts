/**
 * 成长庆祝管理器
 * 负责处理里程碑达成时的庆祝动画和消息
 */

import { GrowthMilestone } from '../types/GrowthTypes';
import { aiService } from '../../ai';

/**
 * 庆祝消息类型
 */
export interface CelebrationMessage {
  id: string;
  milestone: GrowthMilestone;
  title: string;
  message: string;
  animationType: 'confetti' | 'fireworks' | 'sparkles' | 'stars';
  duration: number; // 动画持续时间（毫秒）
}

/**
 * 成长庆祝管理器类
 */
export class CelebrationManager {
  private userId: number;
  private recentCelebrations: Map<string, number> = new Map(); // 防止重复庆祝

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * 检查并生成庆祝消息
   */
  async checkAndCelebrate(milestones: GrowthMilestone[]): Promise<CelebrationMessage[]> {
    const newMilestones = milestones.filter((m) => {
      // 检查是否已经庆祝过（24小时内不重复庆祝）
      const lastCelebration = this.recentCelebrations.get(m.id) || 0;
      const hoursSinceLastCelebration =
        (Date.now() - lastCelebration) / (1000 * 60 * 60);
      return hoursSinceLastCelebration >= 24;
    });

    if (newMilestones.length === 0) {
      return [];
    }

    const celebrations: CelebrationMessage[] = [];

    for (const milestone of newMilestones) {
      const celebration = await this.generateCelebration(milestone);
      if (celebration) {
        celebrations.push(celebration);
        this.recentCelebrations.set(milestone.id, Date.now());
      }
    }

    return celebrations;
  }

  /**
   * 生成庆祝消息
   */
  private async generateCelebration(
    milestone: GrowthMilestone
  ): Promise<CelebrationMessage | null> {
    // 确定动画类型
    const animationType = this.getAnimationType(milestone);

    // 生成庆祝消息
    const message = await this.generateCelebrationMessage(milestone);

    return {
      id: `celebration_${milestone.id}_${Date.now()}`,
      milestone,
      title: this.getCelebrationTitle(milestone),
      message,
      animationType,
      duration: this.getAnimationDuration(milestone),
    };
  }

  /**
   * 获取动画类型
   */
  private getAnimationType(milestone: GrowthMilestone): CelebrationMessage['animationType'] {
    // 根据里程碑类型和重要性选择动画
    if (milestone.type === 'first_use' || milestone.type === 'anniversary') {
      return 'fireworks';
    } else if (milestone.type === 'growth_streak' && (milestone.value || 0) >= 30) {
      return 'fireworks';
    } else if (milestone.type === 'conversation_count' && (milestone.value || 0) >= 100) {
      return 'confetti';
    } else if (milestone.type === 'memory_count' && (milestone.value || 0) >= 50) {
      return 'sparkles';
    } else {
      return 'stars';
    }
  }

  /**
   * 获取庆祝标题
   */
  private getCelebrationTitle(milestone: GrowthMilestone): string {
    const titles: Record<GrowthMilestone['type'], string> = {
      first_use: '🎉 欢迎加入！',
      first_conversation: '💬 第一次对话！',
      first_memory: '📝 第一份记忆！',
      conversation_count: '💭 对话里程碑！',
      memory_count: '📚 记忆里程碑！',
      emotion_insight: '💡 情绪洞察！',
      growth_streak: '🔥 连续使用！',
      anniversary: '🎂 纪念日！',
    };

    return titles[milestone.type] || '🎉 里程碑达成！';
  }

  /**
   * 生成庆祝消息（使用AI）
   */
  private async generateCelebrationMessage(milestone: GrowthMilestone): Promise<string> {
    try {
      const prompt = this.buildCelebrationPrompt(milestone);
      const response = await aiService.generateText({
        prompt,
        systemInstruction:
          '你是一个温暖贴心的陪伴者，擅长用鼓励和庆祝的语气与用户交流。',
        temperature: 0.8,
        maxTokens: 150,
      });

      return response.content || this.getDefaultMessage(milestone);
    } catch (error) {
      console.error('[CelebrationManager] AI生成庆祝消息失败:', error);
      return this.getDefaultMessage(milestone);
    }
  }

  /**
   * 构建庆祝提示词
   */
  private buildCelebrationPrompt(milestone: GrowthMilestone): string {
    return `
请生成一条庆祝消息，庆祝用户达成了以下里程碑：

里程碑：${milestone.title}
描述：${milestone.description}
${milestone.value ? `达成值：${milestone.value}` : ''}

要求：
- 语气要热情、鼓励、庆祝
- 简洁明了（不超过50字）
- 可以适当使用表情符号
- 要体现对用户成长的认可和鼓励

请直接返回消息内容，不要包含其他说明。
`;
  }

  /**
   * 获取默认庆祝消息
   */
  private getDefaultMessage(milestone: GrowthMilestone): string {
    const messages: Record<GrowthMilestone['type'], string> = {
      first_use: '欢迎加入心域！让我们一起开始这段美好的旅程吧～✨',
      first_conversation: '第一次对话完成！希望我们的交流能给你带来温暖 💙',
      first_memory: '第一份记忆已保存！这些珍贵的回忆会一直陪伴着你 📝',
      conversation_count: `恭喜你完成了${milestone.value}次对话！每一次交流都是成长的见证 💭`,
      memory_count: `恭喜你保存了${milestone.value}份记忆！这些记忆都是珍贵的宝藏 📚`,
      emotion_insight: '你对自己的情绪有了更深的了解，这是成长的重要一步 💡',
      growth_streak: `连续使用${milestone.value}天！你的坚持让人感动 🔥`,
      anniversary: '感谢你一直以来的陪伴！让我们一起继续这段美好的旅程 🎂',
    };

    return messages[milestone.type] || '恭喜你达成了这个里程碑！继续加油 💪';
  }

  /**
   * 获取动画持续时间
   */
  private getAnimationDuration(milestone: GrowthMilestone): number {
    // 根据里程碑重要性设置动画持续时间
    if (milestone.type === 'first_use' || milestone.type === 'anniversary') {
      return 5000; // 5秒
    } else if (
      milestone.type === 'growth_streak' &&
      (milestone.value || 0) >= 30
    ) {
      return 4000; // 4秒
    } else {
      return 3000; // 3秒
    }
  }
}

