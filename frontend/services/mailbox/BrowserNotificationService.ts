/**
 * 浏览器通知服务
 * 负责管理浏览器通知权限和显示通知
 * 
 * @author HeartSphere
 * @version 1.0
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export class BrowserNotificationService {
  private static instance: BrowserNotificationService | null = null;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public static getInstance(): BrowserNotificationService {
    if (!BrowserNotificationService.instance) {
      BrowserNotificationService.instance = new BrowserNotificationService();
    }
    return BrowserNotificationService.instance;
  }

  /**
   * 请求通知权限
   */
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('浏览器不支持通知功能');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('通知权限已被拒绝');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }

  /**
   * 检查是否支持通知
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * 检查是否有权限
   */
  public hasPermission(): boolean {
    return this.isSupported() && this.permission === 'granted';
  }

  /**
   * 显示通知
   */
  public async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.hasPermission()) {
      // 尝试请求权限
      const granted = await this.requestPermission();
      if (!granted) {
        return null;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        data: options.data,
      });

      // 自动关闭通知（5秒后）
      setTimeout(() => {
        notification.close();
      }, 5000);

      // 点击通知时聚焦窗口
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('显示通知失败:', error);
      return null;
    }
  }

  /**
   * 显示新消息通知
   */
  public async notifyNewMessage(
    title: string,
    body: string,
    icon?: string,
    messageId?: number
  ): Promise<void> {
    await this.showNotification({
      title,
      body,
      icon,
      tag: 'new-message',
      data: { messageId },
    });
  }
}

export const browserNotificationService = BrowserNotificationService.getInstance();

