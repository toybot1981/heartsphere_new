/**
 * 场景转换辅助工具
 * 处理剧本场景转换相关的逻辑
 */

import { StoryNode, StoryOption, StoryOptionEffect } from '../../types';
import { ScenarioState, ScenarioStateUpdates } from '../../types/chat';

/**
 * 应用选项效果
 * 统一处理选项效果的应用逻辑
 */
export const applyOptionEffects = (
  effects: StoryOptionEffect[],
  currentState: ScenarioState
): ScenarioStateUpdates => {
  const updates: ScenarioStateUpdates = {
    favorability: {},
    events: [],
    items: [],
  };

  effects.forEach((effect) => {
    switch (effect.type) {
      case 'favorability':
        if (effect.value !== undefined) {
          const current = currentState.favorability?.[effect.target] || 0;
          const newValue = Math.max(0, Math.min(100, current + effect.value));
          updates.favorability![effect.target] = newValue;
        }
        break;

      case 'event':
        if (!currentState.events?.includes(effect.target)) {
          updates.events!.push(effect.target);
        }
        break;

      case 'item':
        if (!currentState.items?.includes(effect.target)) {
          updates.items!.push(effect.target);
        }
        break;
    }
  });

  return updates;
};

/**
 * 处理随机事件
 * 统一处理节点随机事件的触发逻辑
 */
export const processRandomEvents = (
  node: StoryNode,
  currentState: ScenarioState
): ScenarioStateUpdates | null => {
  if (!node.randomEvents || node.randomEvents.length === 0) {
    return null;
  }

  const updates: ScenarioStateUpdates = {
    events: [],
    items: [],
    favorability: {},
  };

  node.randomEvents.forEach((randomEvent) => {
    if (Math.random() < randomEvent.probability) {
      const effect = randomEvent.effect;

      switch (effect.type) {
        case 'event':
          if (!currentState.events?.includes(effect.target)) {
            updates.events!.push(effect.target);
          }
          break;

        case 'item':
          if (!currentState.items?.includes(effect.target)) {
            updates.items!.push(effect.target);
          }
          break;

        case 'favorability':
          if (effect.value !== undefined) {
            const current = currentState.favorability?.[effect.target] || 0;
            const newValue = Math.max(0, Math.min(100, current + effect.value));
            updates.favorability![effect.target] = newValue;
          }
          break;
      }
    }
  });

  // 检查是否有任何更新
  const hasUpdates =
    (updates.events && updates.events.length > 0) ||
    (updates.items && updates.items.length > 0) ||
    (updates.favorability && Object.keys(updates.favorability).length > 0);

  return hasUpdates ? updates : null;
};

/**
 * 验证选项是否可用
 * 检查选项的条件是否满足
 */
export const checkOptionConditions = (
  option: StoryOption,
  scenarioState: ScenarioState
): boolean => {
  if (!option.conditions || option.conditions.length === 0) {
    return true; // 没有条件，默认显示
  }

  // 所有条件都需要满足（AND逻辑）
  return option.conditions.every((condition) => {
    switch (condition.type) {
      case 'event':
        return scenarioState.events?.includes(condition.target) ?? false;

      case 'item':
        return scenarioState.items?.includes(condition.target) ?? false;

      case 'favorability':
        const current = scenarioState.favorability?.[condition.target] || 0;
        const threshold = condition.threshold || 0;
        return condition.operator === '>=' ? current >= threshold : current <= threshold;

      default:
        return true;
    }
  });
};
