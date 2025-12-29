/**
 * 卡片系统 React Hook
 */

import { useState, useEffect } from 'react';
import { CardSystem, CardSystemConfig } from '../CardSystem';
import { Card, CardType, CardTemplate } from '../types/CardTypes';

/**
 * 卡片系统 Hook
 */
export function useCardSystem(config: CardSystemConfig) {
  const [system, setSystem] = useState<CardSystem | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    const cardSystem = new CardSystem(config);
    setSystem(cardSystem);
    setIsReady(true);
  }, [config.enabled, config.userId]);

  /**
   * 获取所有模板
   */
  const getAllTemplates = (): CardTemplate[] => {
    if (system) {
      return system.getAllTemplates();
    }
    return [];
  };

  /**
   * 根据类型获取模板
   */
  const getTemplatesByType = (type: CardType): CardTemplate[] => {
    if (system) {
      return system.getTemplatesByType(type);
    }
    return [];
  };

  /**
   * 根据ID获取模板
   */
  const getTemplateById = (id: string): CardTemplate | undefined => {
    if (system) {
      return system.getTemplateById(id);
    }
    return undefined;
  };

  /**
   * 创建卡片
   */
  const createCard = async (cardData: Partial<Card>): Promise<Card> => {
    if (system) {
      return await system.createCard(cardData);
    }
    throw new Error('卡片系统未就绪');
  };

  /**
   * 获取用户的所有卡片
   */
  const getUserCards = (): Card[] => {
    if (system) {
      return system.getUserCards();
    }
    return [];
  };

  /**
   * 根据ID获取卡片
   */
  const getCardById = (id: string): Card | undefined => {
    if (system) {
      return system.getCardById(id);
    }
    return undefined;
  };

  /**
   * 删除卡片
   */
  const deleteCard = async (id: string): Promise<void> => {
    if (system) {
      await system.deleteCard(id);
    }
  };

  /**
   * 获取收到的卡片消息
   */
  const getReceivedMessages = () => {
    if (system) {
      return system.getReceivedMessages();
    }
    return [];
  };

  /**
   * 获取发送的卡片消息
   */
  const getSentMessages = () => {
    if (system) {
      return system.getSentMessages();
    }
    return [];
  };

  /**
   * 获取未读消息数量
   */
  const getUnreadCount = (): number => {
    if (system) {
      return system.getUnreadCount();
    }
    return 0;
  };

  return {
    system,
    isReady,
    getAllTemplates,
    getTemplatesByType,
    getTemplateById,
    createCard,
    getUserCards,
    getCardById,
    deleteCard,
    getReceivedMessages,
    getSentMessages,
    getUnreadCount,
  };
}

