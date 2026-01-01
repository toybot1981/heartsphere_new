/**
 * 系统集成Hook
 * 统一处理温度感引擎、情绪感知系统、记忆系统、陪伴系统、成长系统等集成逻辑
 */

import { useCallback } from 'react';
import { logger } from '../../../utils/logger';
import { MemorySource } from '../../../services/memory-system/types/MemoryTypes';

interface SystemIntegrationProps {
  engine: any | null;
  engineReady: boolean;
  emotionSystem: any;
  memorySystem: any;
  companionSystem: any;
  companionMemorySystem: any;
  growthSystem: any;
  emotionMemoryFusion: any;
  scenarioState?: any;
  safeHistory: any[];
}

/**
 * 系统集成Hook
 * 统一处理各个系统的集成调用
 */
export const useSystemIntegration = ({
  engine,
  engineReady,
  emotionSystem,
  memorySystem,
  companionSystem,
  companionMemorySystem,
  growthSystem,
  emotionMemoryFusion,
  scenarioState,
  safeHistory,
}: SystemIntegrationProps) => {
  /**
   * 分析用户输入并集成各个系统
   */
  const analyzeAndIntegrate = useCallback(async (
    userText: string,
    userMsgId: string
  ) => {
    // 1. 温度感引擎：分析用户情绪
    if (engine && engineReady) {
      try {
        const emotion = await engine.analyzeEmotion({ text: userText });
        logger.debug('[useSystemIntegration] 温度感引擎情绪分析:', emotion);
      } catch (error) {
        logger.error('[useSystemIntegration] 温度感引擎情绪分析失败:', error);
      }
    }

    // 2. 情绪感知系统：分析情绪
    let emotionAnalysisResult = null;
    if (emotionSystem.isReady) {
      try {
        emotionAnalysisResult = await emotionSystem.analyzeEmotion(userText, 'conversation');
        logger.debug('[useSystemIntegration] 情绪感知系统分析:', emotionAnalysisResult);
        
        // 记录情绪记忆
        if (companionMemorySystem.isReady && emotionAnalysisResult) {
          companionMemorySystem.recordEmotionMemory(
            emotionAnalysisResult.primaryEmotion,
            emotionAnalysisResult.intensity,
            userText
          ).catch((error) => {
            logger.error('[useSystemIntegration] 记录情绪记忆失败:', error);
          });
        }
      } catch (error) {
        logger.error('[useSystemIntegration] 情绪感知系统分析失败:', error);
      }
    }

    // 3. 记忆系统：提取记忆
    if (memorySystem.isReady) {
      try {
        const memories = await memorySystem.extractAndSave(
          userText,
          MemorySource.CONVERSATION,
          userMsgId
        );
        logger.debug('[useSystemIntegration] 提取的记忆:', memories);
        
        // 记录成长数据（记忆数量）
        if (growthSystem.isReady && memories.length > 0) {
          growthSystem.recordGrowth({ memoryCount: memories.length }).catch((error) => {
            logger.error('[useSystemIntegration] 记录成长数据失败:', error);
          });
        }
      } catch (error) {
        logger.error('[useSystemIntegration] 记忆提取失败:', error);
      }
    }
    
    // 4. 更新最后互动时间（陪伴系统）
    if (companionSystem.isReady) {
      companionSystem.updateLastInteractionTime();
    }
    
    // 5. 记录成长数据（对话次数）
    if (growthSystem.isReady) {
      growthSystem.recordGrowth({ conversationCount: 1 }).catch((error) => {
        logger.error('[useSystemIntegration] 记录成长数据失败:', error);
      });
    }

    return { emotionAnalysisResult };
  }, [
    engine,
    engineReady,
    emotionSystem,
    memorySystem,
    companionSystem,
    companionMemorySystem,
    growthSystem,
  ]);

  /**
   * 计算温度感
   */
  const calculateTemperature = useCallback(async (userText: string) => {
    if (!engine || !engineReady) return null;

    try {
      const emotion = await engine.analyzeEmotion({ text: userText });
      const hour = new Date().getHours();
      const timeOfDay = hour >= 5 && hour < 12 ? 'morning' : 
                       hour >= 12 && hour < 18 ? 'afternoon' :
                       hour >= 18 && hour < 22 ? 'evening' : 'night';
      
      const temperature = await engine.calculateTemperature({
        userEmotion: emotion.type,
        context: {
          timeOfDay,
          device: 'desktop',
          userActivity: {
            sessionDuration: Date.now() - (scenarioState?.startTime || Date.now()),
            messageCount: safeHistory.length,
            lastInteraction: 1000,
          },
          conversation: {
            length: safeHistory.length,
            sentiment: emotion.type === 'happy' ? 'positive' : emotion.type === 'sad' ? 'negative' : 'neutral',
          },
        },
      });
      
      logger.debug('[useSystemIntegration] 温度感计算:', temperature);
      
      // 根据温度感调整UI
      if (temperature) {
        await engine.adjustTemperature(temperature.level, {
          elements: ['button', '.card', 'input'],
          animation: true,
        });
      }
      
      return temperature;
    } catch (error) {
      logger.error('[useSystemIntegration] 温度感计算失败:', error);
      return null;
    }
  }, [engine, engineReady, scenarioState, safeHistory]);

  /**
   * 获取相关记忆
   */
  const getRelevantMemories = useCallback(async (userText: string, limit: number = 3) => {
    if (!memorySystem.isReady || !emotionMemoryFusion) return [];

    try {
      const memories = await memorySystem.getRelevantMemories(userText, limit);
      logger.debug('[useSystemIntegration] 相关记忆:', memories);
      return memories;
    } catch (error) {
      logger.error('[useSystemIntegration] 获取相关记忆失败:', error);
      return [];
    }
  }, [memorySystem, emotionMemoryFusion]);

  return {
    analyzeAndIntegrate,
    calculateTemperature,
    getRelevantMemories,
  };
};