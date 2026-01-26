/**
 * 历史记录初始化 Hook
 * 处理聊天历史记录的初始化逻辑
 */

import { useEffect, useRef } from 'react';
import { Character, Message, CustomScenario, StoryNode } from '../../../types';
import { ScenarioState } from '../../../types/chat';

interface UseHistoryInitializationProps {
  character: Character | null;
  customScenario: CustomScenario | undefined;
  scenarioState: ScenarioState | undefined;
  safeHistory: Message[];
  isStoryMode: boolean;
  onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  onUpdateScenarioState?: (nodeId: string) => void;
  handleScenarioTransition: (node: StoryNode, choiceText: string | null) => Promise<void>;
}

/**
 * 历史记录初始化 Hook
 * 只在首次加载且history为空时执行初始化
 */
export const useHistoryInitialization = ({
  character,
  customScenario,
  scenarioState,
  safeHistory,
  isStoryMode,
  onUpdateHistory,
  onUpdateScenarioState,
  handleScenarioTransition,
}: UseHistoryInitializationProps) => {
  const hasInitializedRef = useRef<boolean>(false);
  const prevCharacterIdRef = useRef<string | undefined>(character?.id);
  const prevScenarioIdRef = useRef<string | undefined>(customScenario?.id);

  // 检测character或scenario是否切换了
  useEffect(() => {
    const characterChanged = prevCharacterIdRef.current !== character?.id;
    const scenarioChanged = prevScenarioIdRef.current !== customScenario?.id;

    if (characterChanged || scenarioChanged) {
      // Character or scenario changed
      hasInitializedRef.current = false;
      prevCharacterIdRef.current = character?.id;
      prevScenarioIdRef.current = customScenario?.id;
    }
  }, [character?.id, customScenario?.id]);

  // 初始化history：只在首次加载且history为空时执行
  useEffect(() => {
    if (!character) return;

    // 关键检查：
    // 1. 还没有初始化过
    // 2. history确实为空
    // 如果history已经有内容（用户已经交互过），就不再初始化
    const shouldInitialize = !hasInitializedRef.current && safeHistory.length === 0;

    if (shouldInitialize) {
      if (process.env.NODE_ENV === 'development') {
      }
      hasInitializedRef.current = true; // 立即标记为已初始化，防止重复执行

      if (customScenario && onUpdateScenarioState) {
        // Scenario Mode: 确保 scenarioState 已初始化
        
        // 验证 customScenario.nodes 存在
        if (!customScenario.nodes || typeof customScenario.nodes !== 'object') {
          console.error('[useHistoryInitialization] customScenario.nodes 不存在或格式错误:', {
            hasNodes: !!customScenario.nodes,
            nodesType: typeof customScenario.nodes,
            customScenarioId: customScenario.id,
            customScenarioTitle: customScenario.title,
            customScenarioKeys: Object.keys(customScenario),
          });
          // 不直接返回，而是尝试使用普通模式初始化
          // 这样可以避免完全无法使用的情况
          if (!isStoryMode) {
            const initMsg: Message = {
              id: 'init_scenario_error',
              role: 'model',
              text: character.firstMessage || '剧本数据不完整，无法初始化场景。',
              timestamp: Date.now(),
            };
            onUpdateHistory([initMsg]);
          }
          return;
        }
        
        let targetNodeId = scenarioState?.currentNodeId;

        // 如果 scenarioState 未初始化或 currentNodeId 无效，使用 startNodeId
        if (!targetNodeId || !customScenario.nodes[targetNodeId]) {
          targetNodeId = customScenario.startNodeId;

          // 验证 startNodeId 是否有效
          if (!targetNodeId || !customScenario.nodes[targetNodeId]) {
            console.error('[useHistoryInitialization] startNodeId 无效:', {
              startNodeId: customScenario.startNodeId,
              availableNodes: Object.keys(customScenario.nodes),
            });
            // 使用普通模式初始化作为降级方案
            if (!isStoryMode) {
              const initMsg: Message = {
                id: 'init_scenario_error',
                role: 'model',
                text: character.firstMessage || '剧本起始节点无效，无法初始化场景。',
                timestamp: Date.now(),
              };
              onUpdateHistory([initMsg]);
            }
            return;
          }

          // 更新 scenarioState
          if (onUpdateScenarioState) {
            onUpdateScenarioState(targetNodeId);
          }
        }

        const startNode = customScenario.nodes[targetNodeId];
        if (startNode) {
          if (process.env.NODE_ENV === 'development') {
          }
          handleScenarioTransition(startNode, null).catch((error) => {
            console.error('[useHistoryInitialization] Scenario初始化失败:', error);
          });
        } else {
          console.error('[useHistoryInitialization] 找不到起始节点:', {
            targetNodeId,
            availableNodes: Object.keys(customScenario.nodes || {}),
            hasNodes: !!customScenario.nodes,
          });
          // 使用普通模式初始化作为降级方案
          if (!isStoryMode) {
            const initMsg: Message = {
              id: 'init_scenario_error',
              role: 'model',
              text: character.firstMessage || '找不到起始节点，无法初始化场景。',
              timestamp: Date.now(),
            };
            onUpdateHistory([initMsg]);
          }
        }
      } else if (!isStoryMode) {
        // Normal Mode
        if (process.env.NODE_ENV === 'development') {
        }
        const initMsg: Message = {
          id: 'init',
          role: 'model',
          text: character.firstMessage,
          timestamp: Date.now(),
        };
        onUpdateHistory([initMsg]);
      } else if (isStoryMode && !customScenario) {
        // Main Story Mode
        if (process.env.NODE_ENV === 'development') {
        }
        const initMsg: Message = {
          id: 'init_story',
          role: 'model',
          text: character.firstMessage,
          timestamp: Date.now(),
        };
        onUpdateHistory([initMsg]);
      }

      if (process.env.NODE_ENV === 'development') {
      }
    } else if (!hasInitializedRef.current && safeHistory.length > 0) {
      // history已经有内容（可能是从外部加载的），标记为已初始化（防止后续被重置）
      hasInitializedRef.current = true;
    }
  }, [
    character,
    customScenario,
    scenarioState?.currentNodeId,
    safeHistory.length,
    isStoryMode,
    onUpdateHistory,
    onUpdateScenarioState,
    handleScenarioTransition,
  ]);
};


