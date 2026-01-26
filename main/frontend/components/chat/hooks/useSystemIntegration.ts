/**
 * 系统集成Hook
 * 统一处理温度感引擎、情绪感知系统、记忆系统、陪伴系统、成长系统等集成逻辑
 */

import { useCallback } from 'react';
import { logger } from '../../../utils/logger';
import { MemorySource } from '../../../services/memory-system/types/MemoryTypes';
import { memoryApi } from '../../../services/api/memory/memory';
import { getToken } from '../../../services/api/base/tokenStorage';

interface SystemIntegrationProps {
  engine: any | null;
  engineReady: boolean;
  engineRunning?: boolean; // 引擎实际运行状态
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
  engineRunning,
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
        logger.info('[useSystemIntegration] 温度感引擎情绪分析:', emotion);
      } catch (error) {
        logger.error('[useSystemIntegration] 温度感引擎情绪分析失败:', error);
      }
    }

    // 2. 情绪感知系统：分析情绪
    let emotionAnalysisResult = null;
    if (emotionSystem.isReady) {
      try {
        emotionAnalysisResult = await emotionSystem.analyzeEmotion(userText, 'conversation');
        logger.info('[useSystemIntegration] 情绪感知系统分析:', emotionAnalysisResult);
        
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
        logger.info('[useSystemIntegration] 提取的记忆:', memories);
        
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

    // 注意：HSMem记忆提取已移至 generateAIResponse 中，在对话完成后统一处理
    // 这里不再重复提取，避免重复调用
    
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

    // 🆕 6. 角色成长系统集成（异步，不阻塞）
    // 检测学习机会和情感共鸣（需要characterId，从context中获取）
    // 注意：这里只做基础记录，详细的成长分析在 generateAIResponse 的 onComplete 中处理

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
    // 检查引擎是否就绪和运行
    if (!engine || !engineReady) {
      logger.info('[useSystemIntegration] 温度感引擎未就绪，跳过计算');
      return null;
    }

    // 如果提供了 engineRunning 状态，优先使用它
    if (engineRunning !== undefined && !engineRunning) {
      logger.info('[useSystemIntegration] 温度感引擎未运行，跳过计算');
      return null;
    }

    // 否则尝试从引擎获取状态
    try {
      const engineState = engine.getState?.();
      if (engineState && !engineState.isRunning) {
        logger.info('[useSystemIntegration] 温度感引擎未运行，跳过计算');
        return null;
      }
    } catch (error) {
      logger.info('[useSystemIntegration] 无法获取引擎状态，跳过计算:', error);
      return null;
    }

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
      
      logger.info('[useSystemIntegration] 温度感计算:', temperature);
      
      // 根据温度感调整UI
      if (temperature) {
        await engine.adjustTemperature(temperature.level, {
          elements: ['button', '.card', 'input'],
          animation: true,
        });
      }
      
      return temperature;
    } catch (error) {
      // 如果引擎未运行，静默失败，跳过计算
      if (error instanceof Error && error.message.includes('Engine is not running')) {
        logger.info('[useSystemIntegration] 温度感引擎未运行，跳过计算');
        return null;
      }
      logger.error('[useSystemIntegration] 温度感计算失败:', error);
      return null;
    }
  }, [engine, engineReady, engineRunning, scenarioState, safeHistory]);

  /**
   * 获取相关记忆（从 hsmem 检索长期记忆）
   */
  const getRelevantMemories = useCallback(async (
    userText: string,
    limit: number = 5,
    characterId?: number,
    onDebugInfo?: (info: any) => void
  ) => {
    const startTime = Date.now();
    
    try {
      const token = getToken();
      if (!token) {
        logger.warn('[useSystemIntegration] 未登录，跳过记忆检索');
        return [];
      }

      // 1. 检索用户专属记忆（P0，个体长期记忆）
      let userMemories: any[] = [];
      try {
        const retrieveResult = await memoryApi.retrieve(
          {
            queries: [
              {
                role: 'user',
                content: { text: userText },
              },
            ],
            limit: Math.ceil(limit * 0.5),  // 用户记忆占一半
          },
          token
        );
        
        userMemories = (retrieveResult.items || []).map((item: any) => ({
          id: item.id || `item_${Date.now()}_${Math.random()}`,
          type: item.memory_type || 'general',
          content: item.content || '',
          summary: item.summary || item.content?.substring(0, 100),
          importance: item.importance || 0.5,
          categories: item.categories || [],
          source: 'user_memory',  // 标记来源
          priority: 0,  // P0
          weight: 1.0,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn('[useSystemIntegration] 用户记忆检索失败，继续执行', {
          error: errorMessage,
        });
      }

      // 2. 检索角色通用资产（P1+P2，如果 characterId 存在）
      let characterAssets: any[] = [];
      if (characterId) {
        try {
          // 注意：使用 request 函数而不是直接 fetch，以便统一处理 API_BASE_URL
          const { request } = await import('../../../services/api/base/request');
          const assets = await request<any[]>(
            `/memory/v1/character/${characterId}/related-assets?query=${encodeURIComponent(userText)}&limit=${Math.ceil(limit * 0.5)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ).catch((error) => {
            // 静默处理404错误（端点可能尚未实现）
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('404') || errorMessage.includes('未找到') || errorMessage.includes('Not Found')) {
              logger.info('[useSystemIntegration] 角色资产端点不存在，跳过', { characterId });
              return [];
            }
            logger.warn('[useSystemIntegration] 检索角色资产失败', { characterId, error: errorMessage });
            return [];
          });
          
          // 兼容旧的响应格式（如果后端返回 ApiResponse 格式，request 函数已经提取了 data）
          const assetList = Array.isArray(assets) ? assets : [];
          
          if (assetList.length > 0) {
            characterAssets = assetList.map((asset: any, index: number) => ({
              id: asset.id,
              type: asset.assetType,
              content: asset.content,
              summary: asset.summary,
              importance: (asset.trustScore || 50) / 100,  // 转换为 0-1
              categories: [asset.assetType],
              source: 'character_asset',
              priority: index < Math.ceil(assetList.length / 2) ? 1 : 2,  // P1 或 P2
              weight: (asset.trustScore || 50) / 100,  // 按信任度加权
            }));
          }
        } catch (error) {
          logger.warn('[useSystemIntegration] 角色资产检索失败，继续执行', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const duration = Date.now() - startTime;
      
      // 3. 合并并排序：P0 > P1 > P2
      const allMemories = [...userMemories, ...characterAssets]
        .sort((a, b) => {
          // 优先级排序
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          // 相同优先级按重要性/权重排序
          return (b.importance * b.weight) - (a.importance * a.weight);
        })
        .slice(0, limit);

      // 4. 记录调试信息
      if (onDebugInfo) {
        onDebugInfo({
          retrieval: {
            query: userText,
            userMemories: userMemories.length,
            characterAssets: characterAssets.length,
            results: allMemories,
            timestamp: Date.now(),
            duration,
            layers: {
              p0_user: userMemories.length,
              p1_p2_assets: characterAssets.length,
            },
          },
        });
      }

      logger.info('[useSystemIntegration] 从多层记忆检索到结果:', {
        userMemories: userMemories.length,
        characterAssets: characterAssets.length,
        total: allMemories.length,
        duration: `${duration}ms`,
      });

      return allMemories;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('[useSystemIntegration] 获取相关记忆失败:', error);
      
      // 记录调试信息（错误情况）
      if (onDebugInfo) {
        onDebugInfo({
          retrieval: {
            query: userText,
            results: [],
            timestamp: Date.now(),
            duration,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
      
      return [];
    }
  }, [memorySystem, emotionMemoryFusion]);

  return {
    analyzeAndIntegrate,
    calculateTemperature,
    getRelevantMemories,
  };
};