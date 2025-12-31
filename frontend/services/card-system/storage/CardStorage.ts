/**
 * 卡片存储系统
 */

import { Card, CardMessage } from '../types/CardTypes';

/**
 * 卡片存储类
 */
export class CardStorage {
  private userId: number;
  private cardsKey: string;
  private messagesKey: string;

  constructor(userId: number) {
    this.userId = userId;
    this.cardsKey = `user_cards_${userId}`;
    this.messagesKey = `card_messages_${userId}`;
  }

  /**
   * 保存卡片
   */
  async saveCard(card: Card): Promise<void> {
    try {
      const cards = this.getCards();
      const index = cards.findIndex((c) => c.id === card.id);
      if (index >= 0) {
        cards[index] = card;
      } else {
        cards.push(card);
      }
      localStorage.setItem(this.cardsKey, JSON.stringify(cards));
    } catch (error) {
      console.error('[CardStorage] 保存卡片失败:', error);
    }
  }

  /**
   * 获取所有卡片
   */
  getCards(): Card[] {
    try {
      const data = localStorage.getItem(this.cardsKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[CardStorage] 获取卡片失败:', error);
    }
    return [];
  }

  /**
   * 根据ID获取卡片
   */
  getCardById(id: string): Card | undefined {
    const cards = this.getCards();
    return cards.find((card) => card.id === id);
  }

  /**
   * 删除卡片
   */
  async deleteCard(id: string): Promise<void> {
    try {
      const cards = this.getCards();
      const filtered = cards.filter((card) => card.id !== id);
      localStorage.setItem(this.cardsKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('[CardStorage] 删除卡片失败:', error);
    }
  }

  /**
   * 保存卡片消息
   */
  async saveCardMessage(message: CardMessage): Promise<void> {
    try {
      const messages = this.getCardMessages();
      messages.push(message);
      localStorage.setItem(this.messagesKey, JSON.stringify(messages));
    } catch (error) {
      console.error('[CardStorage] 保存卡片消息失败:', error);
    }
  }

  /**
   * 获取收到的卡片消息
   */
  getReceivedMessages(recipientId: number): CardMessage[] {
    const messages = this.getCardMessages();
    return messages
      .filter((msg) => msg.recipientId === recipientId)
      .sort((a, b) => b.sentAt - a.sentAt);
  }

  /**
   * 获取发送的卡片消息
   */
  getSentMessages(senderId: number): CardMessage[] {
    const messages = this.getCardMessages();
    return messages
      .filter((msg) => msg.senderId === senderId)
      .sort((a, b) => b.sentAt - a.sentAt);
  }

  /**
   * 获取所有卡片消息
   */
  getCardMessages(): CardMessage[] {
    try {
      const data = localStorage.getItem(this.messagesKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[CardStorage] 获取卡片消息失败:', error);
    }
    return [];
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      const messages = this.getCardMessages();
      const message = messages.find((msg) => msg.id === messageId);
      if (message) {
        message.isRead = true;
        message.readAt = Date.now();
        localStorage.setItem(this.messagesKey, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('[CardStorage] 标记消息已读失败:', error);
    }
  }

  /**
   * 获取未读消息数量
   */
  getUnreadCount(recipientId: number): number {
    const messages = this.getReceivedMessages(recipientId);
    return messages.filter((msg) => !msg.isRead).length;
  }
}



