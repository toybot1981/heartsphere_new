/**
 * 剧本选项组件
 * 提取剧本选项渲染逻辑
 */

import React, { memo, useMemo } from 'react';
import { StoryOption, ScenarioState } from '../../types';
import { checkOptionConditions } from '../../utils/chat/scenarioHelpers';

interface ScenarioChoicesProps {
  options: StoryOption[];
  scenarioState: ScenarioState;
  isLoading: boolean;
  isCinematic: boolean;
  onOptionClick: (optionId: string) => void;
}

/**
 * 单个选项按钮组件
 */
const ChoiceButton = memo<{
  option: StoryOption;
  disabled: boolean;
  onClick: () => void;
}>(({ option, disabled, onClick }) => {
  const buttonText = option.text || option.id || '选择';

  return (
    <button
      key={option.id}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          onClick();
        }
      }}
      disabled={disabled}
      className={`
        bg-indigo-600/80 backdrop-blur-md hover:bg-indigo-500 text-white px-6 py-3 rounded-xl 
        shadow-lg border border-indigo-400/50 transition-all active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
        min-w-[120px] text-base font-medium whitespace-nowrap
      `}
      style={{
        backgroundColor: disabled ? 'rgba(79, 70, 229, 0.4)' : 'rgba(79, 70, 229, 0.8)',
      }}
      aria-label={`选择: ${buttonText}`}
    >
      {buttonText}
    </button>
  );
});

ChoiceButton.displayName = 'ChoiceButton';

/**
 * 剧本选项组件
 * 使用memo优化，避免不必要的重渲染
 */
export const ScenarioChoices = memo<ScenarioChoicesProps>(({
  options,
  scenarioState,
  isLoading,
  isCinematic,
  onOptionClick,
}) => {
  // 过滤有效选项
  const validOptions = useMemo(() => {
    return options.filter(opt => {
      // 检查是否隐藏
      if (opt.hidden) return false;
      
      // 检查条件
      return checkOptionConditions(opt, scenarioState);
    });
  }, [options, scenarioState]);

  if (validOptions.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap gap-3 justify-center mt-4 animate-fade-in ${isCinematic ? 'mb-10' : ''}`}
      style={{
        zIndex: 999,
        position: 'relative',
        pointerEvents: 'auto',
      }}
    >
      {validOptions.map((opt) => (
        <ChoiceButton
          key={opt.id}
          option={opt}
          disabled={isLoading}
          onClick={() => {
            try {
              onOptionClick(opt.id);
            } catch (error) {
              console.error('[ScenarioChoices] 处理选项点击时出错:', error);
            }
          }}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.options.length === nextProps.options.length &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isCinematic === nextProps.isCinematic &&
    prevProps.scenarioState.currentNodeId === nextProps.scenarioState.currentNodeId
  );
});

ScenarioChoices.displayName = 'ScenarioChoices';
