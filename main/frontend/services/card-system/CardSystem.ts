/**
 * 卡片系统核心类
 */

import { Card, CardType, CardTemplate, CardMessage } from './types/CardTypes';
import { CardStorage } from './storage/CardStorage';
import { getAllTemplates, getTemplateById, getTemplatesByType } from './data/CardTemplates';

/**
 * 卡片系统配置
 */
export interface CardSystemConfig {
  enabled: boolean;
  userId: number;
}

/**
 * 卡片系统类
 */
export class CardSystem {
  private config: CardSystemConfig;
  private storage: CardStorage;

  constructor(config: CardSystemConfig) {
    this.config = config;
    this.storage = new CardStorage(config.userId);
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): CardTemplate[] {
    return getAllTemplates();
  }

  /**
   * 根据类型获取模板
   */
  getTemplatesByType(type: CardType): CardTemplate[] {
    return getTemplatesByType(type);
  }

  /**
   * 根据ID获取模板
   */
  getTemplateById(id: string): CardTemplate | undefined {
    return getTemplateById(id);
  }

  /**
   * 创建卡片
   */
  async createCard(cardData: Partial<Card>): Promise<Card> {
    const card: Card = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      type: cardData.type || CardType.CUSTOM,
      title: cardData.title || '',
      content: cardData.content || '',
      background: cardData.background || {
        type: 'color',
        value: '#FFE5E5',
      },
      style: cardData.style || {
        titleFont: 'Arial',
        titleColor: '#333',
        titleSize: 24,
        contentFont: 'Arial',
        contentColor: '#666',
        contentSize: 16,
        layout: {
          type: 'centered',
          titlePosition: 'top',
          contentPosition: 'center',
        },
      },
      decorations: cardData.decorations,
      templateId: cardData.templateId,
      createdAt: Date.now(),
    };

    await this.storage.saveCard(card);
    return card;
  }

  /**
   * 获取用户的所有卡片
   */
  getUserCards(): Card[] {
    return this.storage.getCards();
  }

  /**
   * 根据ID获取卡片
   */
  getCardById(id: string): Card | undefined {
    return this.storage.getCardById(id);
  }

  /**
   * 删除卡片
   */
  async deleteCard(id: string): Promise<void> {
    await this.storage.deleteCard(id);
  }

  /**
   * 获取收到的卡片消息
   */
  getReceivedMessages(): CardMessage[] {
    return this.storage.getReceivedMessages(this.config.userId);
  }

  /**
   * 获取发送的卡片消息
   */
  getSentMessages(): CardMessage[] {
    return this.storage.getSentMessages(this.config.userId);
  }

  /**
   * 获取未读消息数量
   */
  getUnreadCount(): number {
    return this.storage.getUnreadCount(this.config.userId);
  }

  /**
   * 发送卡片
   */
  async sendCard(card: Card, recipientId: number, message?: string): Promise<void> {
    const cardMessage: CardMessage = {
      id: `card_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: this.config.userId,
      recipientId,
      cardId: card.id,
      message,
      isRead: false,
      sentAt: Date.now(),
    };

    await this.storage.saveCardMessage(cardMessage);
  }
}

