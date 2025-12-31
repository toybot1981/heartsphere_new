import React, { useState, useEffect } from 'react';

/**
 * 角色表情类型定义
 */
export type CharacterExpressionType = 
  | 'happy'      // 开心
  | 'thinking'   // 思考
  | 'caring'     // 关心
  | 'comforting' // 安慰
  | 'encouraging' // 鼓励
  | 'neutral'    // 中性
  | 'sad'        // 难过
  | 'surprised'; // 惊讶

/**
 * 表情配置接口
 */
export interface ExpressionConfig {
  type: CharacterExpressionType;
  displayName: string;
  emoji?: string;
  description: string;
  color: string;
}

/**
 * 表情配置库
 */
export const ExpressionConfigs: Record<CharacterExpressionType, ExpressionConfig> = {
  happy: {
    type: 'happy',
    displayName: '开心',
    emoji: '😊',
    description: '表达开心、满足的情感',
    color: 'var(--color-warm-pink)',
  },
  thinking: {
    type: 'thinking',
    displayName: '思考',
    emoji: '🤔',
    description: '表达思考、专注的状态',
    color: 'var(--color-calm-blue)',
  },
  caring: {
    type: 'caring',
    displayName: '关心',
    emoji: '❤️',
    description: '表达关心、体贴的情感',
    color: 'var(--color-warm-pink-light)',
  },
  comforting: {
    type: 'comforting',
    displayName: '安慰',
    emoji: '🤗',
    description: '表达安慰、支持的情感',
    color: 'var(--color-warm-beige)',
  },
  encouraging: {
    type: 'encouraging',
    displayName: '鼓励',
    emoji: '💪',
    description: '表达鼓励、激励的情感',
    color: 'var(--color-warm-orange)',
  },
  neutral: {
    type: 'neutral',
    displayName: '中性',
    emoji: '😐',
    description: '默认表情状态',
    color: 'var(--text-secondary)',
  },
  sad: {
    type: 'sad',
    displayName: '难过',
    emoji: '😔',
    description: '表达难过、同情的情感',
    color: 'var(--color-calm-blue)',
  },
  surprised: {
    type: 'surprised',
    displayName: '惊讶',
    emoji: '😲',
    description: '表达惊讶、意外的情感',
    color: 'var(--color-warning)',
  },
};

/**
 * 表情触发规则
 */
export interface ExpressionTriggerRule {
  keywords?: string[];
  emotions?: string[];
  context?: string[];
  priority: number;
  expression: CharacterExpressionType;
  cooldown?: number; // 冷却时间（毫秒）
}

/**
 * 默认表情触发规则
 */
export const DefaultExpressionTriggers: ExpressionTriggerRule[] = [
  {
    keywords: ['开心', '高兴', '快乐', '太棒了', '太好了', '喜欢', '爱', '😊', '😄'],
    emotions: ['happy', 'joy', 'excitement'],
    context: ['celebration', 'achievement'],
    priority: 10,
    expression: 'happy',
    cooldown: 5000,
  },
  {
    keywords: ['想', '思考', '考虑', '琢磨', '让我想想', '🤔'],
    emotions: ['confusion', 'curiosity'],
    context: ['question', 'complex_task'],
    priority: 9,
    expression: 'thinking',
    cooldown: 3000,
  },
  {
    keywords: ['关心', '担心', '难过', '不舒服', '不开心', '😔', '😢'],
    emotions: ['sad', 'anxious', 'worried'],
    context: ['comfort', 'support'],
    priority: 10,
    expression: 'caring',
    cooldown: 5000,
  },
  {
    keywords: ['安慰', '没关系', '别担心', '一切都会好的', '抱抱', '🤗'],
    emotions: ['comfort'],
    context: ['comfort'],
    priority: 9,
    expression: 'comforting',
    cooldown: 4000,
  },
  {
    keywords: ['加油', '你能行', '相信你', '支持你', '坚持', '💪'],
    emotions: ['encouragement', 'motivation'],
    context: ['encouragement', 'motivation'],
    priority: 8,
    expression: 'encouraging',
    cooldown: 4000,
  },
  {
    keywords: ['什么', '真的吗', '哇', '天哪', '😲', '😱'],
    emotions: ['surprise'],
    context: ['surprise'],
    priority: 7,
    expression: 'surprised',
    cooldown: 3000,
  },
];

/**
 * 表情组件 Props
 */
export interface CharacterExpressionProps {
  expression?: CharacterExpressionType;
  size?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

/**
 * 角色表情组件
 */
export const CharacterExpression: React.FC<CharacterExpressionProps> = ({
  expression = 'neutral',
  size = 120,
  className = '',
  onAnimationComplete,
}) => {
  const [currentExpression, setCurrentExpression] = useState<CharacterExpressionType>(expression);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (currentExpression !== expression) {
      setIsAnimating(true);
      setCurrentExpression(expression);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete?.();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [expression, currentExpression, onAnimationComplete]);
  
  const config = ExpressionConfigs[currentExpression];
  
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-warm-pink-lightest/50 to-calm-blue-lightest/50 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.5}px`,
      }}
    >
      {/* 表情主体 */}
      <div
        className={`
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}
        `}
        style={{
          color: config.color,
        }}
      >
        {config.emoji}
      </div>
      
      {/* 表情光晕 */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-30"
        style={{
          backgroundColor: config.color,
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
    </div>
  );
};

/**
 * 根据文本匹配表情
 */
export const matchExpressionByText = (text: string): CharacterExpressionType => {
  const lowerText = text.toLowerCase();
  
  // 按优先级排序规则
  const sortedTriggers = [...DefaultExpressionTriggers].sort((a, b) => b.priority - a.priority);
  
  for (const trigger of sortedTriggers) {
    if (trigger.keywords) {
      const matched = trigger.keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
      if (matched) {
        return trigger.expression;
      }
    }
  }
  
  return 'neutral';
};

/**
 * 根据情绪匹配表情
 */
export const matchExpressionByEmotion = (emotion: string): CharacterExpressionType => {
  const lowerEmotion = emotion.toLowerCase();
  
  for (const trigger of DefaultExpressionTriggers) {
    if (trigger.emotions) {
      const matched = trigger.emotions.some(e => e.toLowerCase() === lowerEmotion);
      if (matched) {
        return trigger.expression;
      }
    }
  }
  
  return 'neutral';
};

/**
 * 表情管理器 Hook
 */
export const useExpressionManager = () => {
  const [currentExpression, setCurrentExpression] = useState<CharacterExpressionType>('neutral');
  const [lastTriggerTime, setLastTriggerTime] = useState<Record<CharacterExpressionType, number>>({});
  
  const setExpression = (expression: CharacterExpressionType) => {
    const now = Date.now();
    const trigger = DefaultExpressionTriggers.find(t => t.expression === expression);
    const cooldown = trigger?.cooldown || 0;
    const lastTime = lastTriggerTime[expression] || 0;
    
    // 检查冷却时间
    if (now - lastTime < cooldown) {
      return false;
    }
    
    setCurrentExpression(expression);
    setLastTriggerTime(prev => ({ ...prev, [expression]: now }));
    return true;
  };
  
  const processText = (text: string) => {
    const expression = matchExpressionByText(text);
    return setExpression(expression);
  };
  
  const processEmotion = (emotion: string) => {
    const expression = matchExpressionByEmotion(emotion);
    return setExpression(expression);
  };
  
  const reset = () => {
    setCurrentExpression('neutral');
  };
  
  return {
    currentExpression,
    setExpression,
    processText,
    processEmotion,
    reset,
  };
};

export default CharacterExpression;



