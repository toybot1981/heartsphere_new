import React, { useState, useEffect, useRef } from 'react';

/**
 * 角色动作类型定义
 */
export type CharacterActionType =
  | 'nodding'     // 点头
  | 'shaking'     // 摇头
  | 'waving'      // 挥手
  | 'thinking'    // 思考
  | 'listening'   // 倾听
  | 'encouraging' // 鼓励
  | 'comforting'  // 安慰
  | 'idle';       // 待机

/**
 * 动作配置接口
 */
export interface ActionConfig {
  type: CharacterActionType;
  displayName: string;
  description: string;
  animation: ActionAnimation;
  duration: number;
  canInterrupt: boolean;
  priority: number;
}

/**
 * 动画关键帧
 */
export interface AnimationKeyframe {
  time: number;
  transform: {
    translateX?: number;
    translateY?: number;
    rotate?: number;
    scale?: number;
  };
  opacity?: number;
}

/**
 * 动画配置
 */
export interface ActionAnimation {
  keyframes: AnimationKeyframe[];
  easing: string;
  iterations: number;
}

/**
 * 动作配置库
 */
export const ActionConfigs: Record<CharacterActionType, ActionConfig> = {
  nodding: {
    type: 'nodding',
    displayName: '点头',
    description: '表示理解、同意、确认',
    animation: {
      keyframes: [
        { time: 0, transform: { rotate: 0 } },
        { time: 0.5, transform: { rotate: 10 } },
        { time: 1, transform: { rotate: 0 } },
      ],
      easing: 'ease-in-out',
      iterations: 1,
    },
    duration: 600,
    canInterrupt: true,
    priority: 7,
  },
  shaking: {
    type: 'shaking',
    displayName: '摇头',
    description: '表示疑惑、不理解、不确定',
    animation: {
      keyframes: [
        { time: 0, transform: { rotate: 0 } },
        { time: 0.25, transform: { rotate: -8 } },
        { time: 0.75, transform: { rotate: 8 } },
        { time: 1, transform: { rotate: 0 } },
      ],
      easing: 'ease-in-out',
      iterations: 1,
    },
    duration: 800,
    canInterrupt: true,
    priority: 6,
  },
  waving: {
    type: 'waving',
    displayName: '挥手',
    description: '打招呼、告别、欢迎',
    animation: {
      keyframes: [
        { time: 0, transform: { rotate: 0 } },
        { time: 0.2, transform: { rotate: -30 } },
        { time: 0.5, transform: { rotate: 30 } },
        { time: 0.8, transform: { rotate: -30 } },
        { time: 1, transform: { rotate: 0 } },
      ],
      easing: 'ease-in-out',
      iterations: 3,
    },
    duration: 3000,
    canInterrupt: false,
    priority: 10,
  },
  thinking: {
    type: 'thinking',
    displayName: '思考',
    description: '处理复杂问题、思考回答',
    animation: {
      keyframes: [
        { time: 0, transform: { scale: 1 } },
        { time: 0.5, transform: { scale: 1.05 } },
        { time: 1, transform: { scale: 1 } },
      ],
      easing: 'ease-in-out',
      iterations: Infinity,
    },
    duration: 0, // 持续到被打断
    canInterrupt: true,
    priority: 8,
  },
  listening: {
    type: 'listening',
    displayName: '倾听',
    description: '用户正在输入、等待用户发言',
    animation: {
      keyframes: [
        { time: 0, transform: { rotate: 0, translateY: 0 } },
        { time: 0.5, transform: { rotate: 3, translateY: -2 } },
        { time: 1, transform: { rotate: 0, translateY: 0 } },
      ],
      easing: 'ease-in-out',
      iterations: Infinity,
    },
    duration: 0, // 持续到被打断
    canInterrupt: true,
    priority: 9,
  },
  encouraging: {
    type: 'encouraging',
    displayName: '鼓励',
    description: '鼓励用户、支持用户、庆祝成就',
    animation: {
      keyframes: [
        { time: 0, transform: { scale: 1, rotate: 0 } },
        { time: 0.3, transform: { scale: 1.1, rotate: -5 } },
        { time: 0.6, transform: { scale: 1, rotate: 5 } },
        { time: 0.9, transform: { scale: 1, rotate: 0 } },
      ],
      easing: 'ease-out',
      iterations: 2,
    },
    duration: 2000,
    canInterrupt: true,
    priority: 8,
  },
  comforting: {
    type: 'comforting',
    displayName: '安慰',
    description: '用户难过、需要安慰、给予支持',
    animation: {
      keyframes: [
        { time: 0, transform: { scale: 1 } },
        { time: 0.5, transform: { scale: 1.08 } },
        { time: 1, transform: { scale: 1 } },
      ],
      easing: 'ease-in-out',
      iterations: 2,
    },
    duration: 4000,
    canInterrupt: true,
    priority: 9,
  },
  idle: {
    type: 'idle',
    displayName: '待机',
    description: '长时间未交互时的默认状态',
    animation: {
      keyframes: [
        { time: 0, transform: { scale: 1 } },
        { time: 0.5, transform: { scale: 1.02 } },
        { time: 1, transform: { scale: 1 } },
      ],
      easing: 'ease-in-out',
      iterations: Infinity,
    },
    duration: 0, // 持续
    canInterrupt: true,
    priority: 0,
  },
};

/**
 * 动作触发规则
 */
export interface ActionTriggerRule {
  action: CharacterActionType;
  trigger: 'keyword' | 'emotion' | 'context' | 'time';
  condition: any;
  priority: number;
  cooldown?: number;
}

/**
 * 默认动作触发规则
 */
export const DefaultActionTriggers: ActionTriggerRule[] = [
  {
    action: 'nodding',
    trigger: 'keyword',
    condition: { keywords: ['是的', '对的', '明白了', '理解了', '好的', '嗯'] },
    priority: 7,
    cooldown: 3000,
  },
  {
    action: 'shaking',
    trigger: 'keyword',
    condition: { keywords: ['不是', '不对', '不明白', '不理解', '为什么'] },
    priority: 6,
    cooldown: 3000,
  },
  {
    action: 'waving',
    trigger: 'context',
    condition: { context: 'greeting' },
    priority: 10,
    cooldown: 5000,
  },
  {
    action: 'thinking',
    trigger: 'context',
    condition: { context: 'processing' },
    priority: 8,
    cooldown: 0,
  },
  {
    action: 'listening',
    trigger: 'context',
    condition: { context: 'user_typing' },
    priority: 9,
    cooldown: 0,
  },
  {
    action: 'encouraging',
    trigger: 'keyword',
    condition: { keywords: ['加油', '你能行', '相信你', '支持你'] },
    priority: 8,
    cooldown: 4000,
  },
  {
    action: 'comforting',
    trigger: 'emotion',
    condition: { emotions: ['sad', 'anxious', 'worried'] },
    priority: 9,
    cooldown: 5000,
  },
  {
    action: 'idle',
    trigger: 'time',
    condition: { time: 30000 }, // 30秒无交互
    priority: 0,
    cooldown: 0,
  },
];

/**
 * 动作队列状态
 */
export interface ActionQueueState {
  currentAction: CharacterActionType | null;
  queuedActions: Array<{
    action: CharacterActionType;
    timestamp: number;
    priority: number;
  }>;
  isPlaying: boolean;
}

/**
 * 角色动作组件 Props
 */
export interface CharacterActionProps {
  action?: CharacterActionType;
  children: React.ReactNode;
  onActionComplete?: (action: CharacterActionType) => void;
  className?: string;
}

/**
 * 角色动作组件
 */
export const CharacterAction: React.FC<CharacterActionProps> = ({
  action,
  children,
  onActionComplete,
  className = '',
}) => {
  const actionRef = useRef<HTMLDivElement>(null);
  const [currentAction, setCurrentAction] = useState<CharacterActionType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    if (action && action !== currentAction) {
      setCurrentAction(action);
      playAction(action);
    } else if (!action && currentAction) {
      setCurrentAction(null);
      setIsPlaying(false);
    }
  }, [action]);
  
  const playAction = (actionType: CharacterActionType) => {
    if (!actionRef.current) return;
    
    const config = ActionConfigs[actionType];
    if (!config) return;
    
    setIsPlaying(true);
    
    const keyframes = config.animation.keyframes.map(kf => ({
      transform: `
        translate(${kf.transform.translateX || 0}px, ${kf.transform.translateY || 0}px)
        rotate(${kf.transform.rotate || 0}deg)
        scale(${kf.transform.scale || 1})
      `,
      opacity: kf.opacity !== undefined ? kf.opacity : 1,
    }));
    
    const animation = actionRef.current.animate(
      keyframes,
      {
        duration: config.duration || 3000,
        easing: config.animation.easing,
        iterations: config.animation.iterations,
      }
    );
    
    if (config.duration > 0) {
      animation.onfinish = () => {
        setIsPlaying(false);
        onActionComplete?.(actionType);
      };
    }
  };
  
  return (
    <div
      ref={actionRef}
      className={className}
    >
      {children}
    </div>
  );
};

/**
 * 动作管理器 Hook
 */
export const useActionManager = () => {
  const [queue, setQueue] = useState<ActionQueueState>({
    currentAction: null,
    queuedActions: [],
    isPlaying: false,
  });
  const [lastTriggerTime, setLastTriggerTime] = useState<Record<CharacterActionType, number>>({});
  
  const triggerAction = (action: CharacterActionType) => {
    const now = Date.now();
    const trigger = DefaultActionTriggers.find(t => t.action === action);
    const cooldown = trigger?.cooldown || 0;
    const lastTime = lastTriggerTime[action] || 0;
    
    // 检查冷却时间
    if (now - lastTime < cooldown) {
      return false;
    }
    
    // 检查是否可以打断当前动作
    const currentConfig = queue.currentAction ? ActionConfigs[queue.currentAction] : null;
    const newConfig = ActionConfigs[action];
    
    if (queue.isPlaying && currentConfig && !currentConfig.canInterrupt) {
      // 不能打断，加入队列
      setQueue(prev => ({
        ...prev,
        queuedActions: [...prev.queuedActions, {
          action,
          timestamp: now,
          priority: newConfig.priority,
        }],
      }));
      return false;
    }
    
    setLastTriggerTime(prev => ({ ...prev, [action]: now }));
    setQueue(prev => ({
      currentAction: action,
      queuedActions: prev.queuedActions,
      isPlaying: true,
    }));
    
    return true;
  };
  
  const completeAction = (action: CharacterActionType) => {
    setQueue(prev => {
      if (prev.currentAction !== action) return prev;
      
      // 处理队列中的下一个动作
      const sortedQueue = [...prev.queuedActions]
        .sort((a, b) => b.priority - a.priority);
      const nextAction = sortedQueue.shift();
      
      if (nextAction) {
        setTimeout(() => {
          triggerAction(nextAction.action);
        }, 100);
      }
      
      return {
        currentAction: null,
        queuedActions: sortedQueue,
        isPlaying: false,
      };
    });
  };
  
  const processContext = (context: string) => {
    const trigger = DefaultActionTriggers.find(
      t => t.trigger === 'context' && t.condition.context === context
    );
    
    if (trigger) {
      triggerAction(trigger.action);
    }
  };
  
  const processText = (text: string) => {
    const lowerText = text.toLowerCase();
    
    for (const trigger of DefaultActionTriggers) {
      if (trigger.trigger === 'keyword' && trigger.condition.keywords) {
        const matched = trigger.condition.keywords.some(
          (keyword: string) => lowerText.includes(keyword.toLowerCase())
        );
        
        if (matched) {
          triggerAction(trigger.action);
          break;
        }
      }
    }
  };
  
  const reset = () => {
    setQueue({
      currentAction: null,
      queuedActions: [],
      isPlaying: false,
    });
  };
  
  return {
    queue,
    triggerAction,
    completeAction,
    processContext,
    processText,
    reset,
  };
};

export default CharacterAction;

