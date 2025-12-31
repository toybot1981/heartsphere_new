/**
 * 富文本渲染器组件
 * 用于渲染包含动作标记（*action*）和思考标记（(thought)）的文本
 */

import React, { memo, useMemo } from 'react';

interface RichTextRendererProps {
  text: string;
  colorAccent: string;
}

// 正则表达式模式：匹配 *动作* 和 (思考)
const COMBINED_PATTERN = /(\*[^*]+\*|\([^)]+\))/g;

/**
 * 富文本渲染器组件
 * 支持以下格式：
 * - *动作内容*：斜体、半透明显示
 * - (思考内容)：小字体、特殊颜色显示
 */
export const RichTextRenderer = memo<RichTextRendererProps>(({ text, colorAccent }) => {
  const parts = useMemo(() => {
    const splitParts = text.split(COMBINED_PATTERN);
    // 过滤掉空字符串，然后渲染，确保每个元素都有唯一的 key
    return splitParts
      .map((part, index) => ({ part, index }))
      .filter(({ part }) => part.trim() !== '');
  }, [text]);

  return (
    <span className="whitespace-pre-wrap">
      {parts.map(({ part, index }) => {
        // 使用原始索引确保 key 的唯一性和稳定性
        const uniqueKey = `rich-text-${index}`;
        
        if (part.startsWith('*') && part.endsWith('*')) {
          // Action: Italic, slightly faded
          return (
            <span 
              key={uniqueKey} 
              className="italic opacity-70 text-sm mx-1 block my-1" 
              style={{ color: '#e5e7eb' }}
            >
              {part.slice(1, -1)}
            </span>
          );
        } else if (part.startsWith('(') && part.endsWith(')')) {
          // Thought/Inner Monologue: Smaller, distinct color
          return (
            <span 
              key={uniqueKey} 
              className="block text-xs my-1 font-serif opacity-80 tracking-wide" 
              style={{ color: `${colorAccent}cc` }}
            >
              {part}
            </span>
          );
        } else {
          // Standard dialogue
          return <span key={uniqueKey}>{part}</span>;
        }
      })}
    </span>
  );
});

RichTextRenderer.displayName = 'RichTextRenderer';
