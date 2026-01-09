/**
 * 传送门音效系统
 * 管理传送过程中的音效播放
 */

interface AudioConfig {
  enabled: boolean;
  volume: number; // 0-1
}

class PortalAudioService {
  private config: AudioConfig = {
    enabled: true,
    volume: 0.5,
  };
  private audioContext: AudioContext | null = null;

  /**
   * 初始化音频上下文
   */
  private initAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * 播放音效
   */
  private async playSound(frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine'): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const ctx = this.initAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.config.volume * 0.3, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('[PortalAudioService] 播放音效失败:', error);
    }
  }

  /**
   * 播放传送门激活音效
   */
  async playActivationSound(): Promise<void> {
    // 上升音调
    await this.playSound(400, 0.3, 'sine');
    await new Promise(resolve => setTimeout(resolve, 50));
    await this.playSound(600, 0.3, 'sine');
  }

  /**
   * 播放传送音效
   */
  async playTeleportationSound(): Promise<void> {
    // 持续的低频嗡鸣 + 高频脉冲
    const ctx = this.initAudioContext();
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();
    const gainNode2 = ctx.createGain();

    oscillator1.connect(gainNode1);
    oscillator2.connect(gainNode2);
    gainNode1.connect(ctx.destination);
    gainNode2.connect(ctx.destination);

    // 低频基础音
    oscillator1.type = 'sawtooth';
    oscillator1.frequency.value = 100;
    gainNode1.gain.setValueAtTime(this.config.volume * 0.2, ctx.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    // 高频脉冲
    oscillator2.type = 'square';
    oscillator2.frequency.value = 800;
    gainNode2.gain.setValueAtTime(0, ctx.currentTime);
    // 脉冲效果
    for (let i = 0; i < 5; i++) {
      const time = ctx.currentTime + i * 0.3;
      gainNode2.gain.setValueAtTime(this.config.volume * 0.3, time);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    }

    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + 1.5);
    oscillator2.stop(ctx.currentTime + 1.5);
  }

  /**
   * 播放到达音效
   */
  async playArrivalSound(): Promise<void> {
    // 下降音调 + 轻微回响
    await this.playSound(600, 0.2, 'sine');
    await new Promise(resolve => setTimeout(resolve, 50));
    await this.playSound(400, 0.3, 'sine');
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
}

// 单例
export const portalAudioService = new PortalAudioService();
