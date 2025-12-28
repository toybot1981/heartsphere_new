import React, { useState, useEffect } from 'react';
import { CharacterExpression, ExpressionType, useExpressionManager } from './Expression';
import { CharacterAction, useActionManager } from './Action';

/**
 * 角色状态
 */
export interface CharacterState {
  expression: ExpressionType;
  action: string | null;
  isProcessing: boolean;
  lastInteraction: number;
}

/**
 * 角色组件 Props
 */
export interface CharacterProps {
  characterId?: string;
  size?: number;
  className?: string;
  onExpressionChange?: (expression: ExpressionType) => void;
  onActionComplete?: (action: string) => void;
}

/**
 * 角色组件
 * 整合表情和动作系统
 */
export const Character: React.FC<CharacterProps> = ({
  characterId = 'default',
  size = 120,
  className = '',
  onExpressionChange,
  onActionComplete,
}) => {
  const expressionManager = useExpressionManager();
  const actionManager = useActionManager();
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  
  useEffect(() => {
    // 检测长时间无交互，进入待机状态
    const idleCheck = setInterval(() => {
      const now = Date.now();
      if (now - lastInteraction > 30000) {
        // 30秒无交互，进入待机
        expressionManager.setExpression('neutral');
        actionManager.triggerAction('idle');
      }
    }, 5000);
    
    return () => clearInterval(idleCheck);
  }, [lastInteraction, expressionManager, actionManager]);
  
  useEffect(() => {
    onExpressionChange?.(expressionManager.currentExpression);
  }, [expressionManager.currentExpression, onExpressionChange]);
  
  const handleUserInteraction = () => {
    setLastInteraction(Date.now());
    // 打断待机状态
    if (actionManager.queue.currentAction === 'idle') {
      actionManager.reset();
    }
  };
  
  return (
    <div
      className={`character-container ${className}`}
      onMouseMove={handleUserInteraction}
      onTouchMove={handleUserInteraction}
      onClick={handleUserInteraction}
    >
      <CharacterAction
        action={actionManager.queue.currentAction as any}
        onActionComplete={(action) => {
          onActionComplete?.(action);
          actionManager.completeAction(action);
        }}
      >
        <CharacterExpression
          expression={expressionManager.currentExpression}
          size={size}
          className="character-expression"
        />
      </CharacterAction>
    </div>
  );
};

/**
 * 角色控制器 Hook
 */
export const useCharacterController = () => {
  const expressionManager = useExpressionManager();
  const actionManager = useActionManager();
  
  /**
   * 处理用户消息
   */
  const processMessage = (message: string) => {
    // 处理表情
    expressionManager.processText(message);
    
    // 处理动作
    actionManager.processText(message);
  };
  
  /**
   * 处理用户情绪
   */
  const processEmotion = (emotion: string) => {
    expressionManager.processEmotion(emotion);
    actionManager.processText(emotion);
  };
  
  /**
   * 设置处理中状态
   */
  const setProcessing = (isProcessing: boolean) => {
    if (isProcessing) {
      actionManager.triggerAction('thinking');
      expressionManager.setExpression('thinking');
    } else {
      actionManager.completeAction('thinking');
      expressionManager.setExpression('neutral');
    }
  };
  
  /**
   * 设置倾听状态
   */
  const setListening = (isListening: boolean) => {
    if (isListening) {
      actionManager.triggerAction('listening');
    } else {
      actionManager.completeAction('listening');
    }
  };
  
  /**
   * 设置欢迎状态
   */
  const setGreeting = () => {
    actionManager.triggerAction('waving');
    expressionManager.setExpression('happy');
  };
  
  /**
   * 鼓励用户
   */
  const encourage = () => {
    actionManager.triggerAction('encouraging');
    expressionManager.setExpression('encouraging');
  };
  
  /**
   * 安慰用户
   */
  const comfort = () => {
    actionManager.triggerAction('comforting');
    expressionManager.setExpression('comforting');
  };
  
  /**
   * 重置角色状态
   */
  const reset = () => {
    expressionManager.reset();
    actionManager.reset();
  };
  
  return {
    expression: expressionManager.currentExpression,
    action: actionManager.queue.currentAction,
    processMessage,
    processEmotion,
    setProcessing,
    setListening,
    setGreeting,
    encourage,
    comfort,
    reset,
  };
};

export default Character;

