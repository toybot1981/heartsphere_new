/**
 * 陪伴式交互系统 React Hook
 */

import { useState, useEffect, useRef } from 'react';
import { CompanionSystem, CompanionSystemConfig } from '../CompanionSystem';
import { CareMessage } from '../types/CompanionTypes';

/**
 * 陪伴式交互系统 Hook
 */
export function useCompanionSystem(config: CompanionSystemConfig) {
  const [system, setSystem] = useState<CompanionSystem | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [careMessages, setCareMessages] = useState<CareMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    // 初始化系统
    const companionSystem = new CompanionSystem(config);
    setSystem(companionSystem);
    setIsReady(true);

    // 加载初始消息
    const initialMessages = companionSystem.getUnreadMessages();
    setCareMessages(initialMessages);
    setUnreadCount(initialMessages.length);

    // 定期检查关怀触发条件（每5分钟检查一次）
    checkIntervalRef.current = setInterval(async () => {
      try {
        const newMessages = await companionSystem.checkAndGenerateCareMessages();
        if (newMessages.length > 0) {
          setCareMessages((prev) => [...prev, ...newMessages]);
          setUnreadCount((prev) => prev + newMessages.length);
        }
      } catch (error) {
        console.error('[useCompanionSystem] 检查关怀消息失败:', error);
      }
    }, 5 * 60 * 1000); // 5分钟

    // 立即检查一次
    companionSystem.checkAndGenerateCareMessages().then((newMessages) => {
      if (newMessages.length > 0) {
        setCareMessages((prev) => [...prev, ...newMessages]);
        setUnreadCount((prev) => prev + newMessages.length);
      }
    });

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [config.enabled, config.userId]);

  /**
   * 标记消息为已读
   */
  const markAsRead = (messageId: string) => {
    if (system) {
      system.markAsRead(messageId);
      setCareMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  /**
   * 更新最后互动时间
   */
  const updateLastInteractionTime = () => {
    if (system) {
      system.updateLastInteractionTime();
    }
  };

  /**
   * 手动触发关怀检查
   */
  const checkCareMessages = async () => {
    if (system) {
      const newMessages = await system.checkAndGenerateCareMessages();
      if (newMessages.length > 0) {
        setCareMessages((prev) => [...prev, ...newMessages]);
        setUnreadCount((prev) => prev + newMessages.length);
      }
      return newMessages;
    }
    return [];
  };

  return {
    system,
    isReady,
    careMessages,
    unreadCount,
    markAsRead,
    updateLastInteractionTime,
    checkCareMessages,
  };
}




