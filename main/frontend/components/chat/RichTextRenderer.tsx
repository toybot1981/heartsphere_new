/**
 * 富文本渲染器组件
 * 用于渲染包含动作标记（*action*）和思考标记（(thought)）的文本
 * 支持技能名称和作用的高亮显示
 */

import React, { memo, useMemo } from 'react';

interface RichTextRendererProps {
  text: string;
  colorAccent: string;
  skillName?: string; // 技能名称（用于高亮显示）
}

// 正则表达式模式：匹配 *动作* 和 (思考)
const COMBINED_PATTERN = /(\*[^*]+\*|\([^)]+\))/g;

/**
 * 富文本渲染器组件
 * 支持以下格式：
 * - *动作内容*：斜体、半透明显示
 * - (思考内容)：小字体、特殊颜色显示
 * - 技能名称和作用：显著字体高亮显示
 */
export const RichTextRenderer = memo<RichTextRendererProps>(({ text, colorAccent, skillName }) => {
  const parts = useMemo(() => {
    // 先处理技能名称高亮（如果存在）
    let processedText = text;
    if (skillName) {
      // 转义特殊字符，创建正则表达式
      const escapedSkillName = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 在文本中查找技能名称，使用全局正则匹配并高亮
      const skillPattern = new RegExp(`(${escapedSkillName})`, 'gi');
      processedText = processedText.replace(skillPattern, '🔮SKILL_START$1🔮SKILL_END');
    }

    // 然后处理其他标记（动作、思考）
    // 使用更复杂的正则，先处理技能标记，再处理动作和思考标记
    const allPatterns = /(🔮SKILL_START.*?🔮SKILL_END|\*[^*]+\*|\([^)]+\))/g;
    const splitParts = processedText.split(allPatterns);
    
    // 过滤掉空字符串，然后渲染，确保每个元素都有唯一的 key
    return splitParts
      .map((part, index) => ({ part, index }))
      .filter(({ part }) => part.trim() !== '');
  }, [text, skillName]);

  return (
    <>
      <span className="whitespace-pre-wrap">
        {parts.map(({ part, index }) => {
          // 使用原始索引确保 key 的唯一性和稳定性
          const uniqueKey = `rich-text-${index}`;
          
          // 检查是否是技能高亮标记
          if (part.startsWith('🔮SKILL_START') && part.endsWith('🔮SKILL_END')) {
            const skillText = part.replace(/🔮SKILL_START|🔮SKILL_END/g, '');
            return (
              <span
                key={uniqueKey}
                className="font-bold text-lg px-1.5 py-0.5 rounded bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border border-yellow-400/50 shadow-lg shadow-yellow-500/20"
                style={{
                  color: '#FFD700',
                  textShadow: '0 0 8px rgba(255, 215, 0, 0.6), 0 0 16px rgba(255, 165, 0, 0.4)',
                }}
              >
                {skillText}
              </span>
            );
          }
          
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
      {/* 如果有技能，在文本末尾显示技能信息 */}
      {skillName && (
        <span
          className="inline-block ml-2 mt-1 font-bold text-base px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 border-2 border-cyan-400/60 shadow-xl shadow-cyan-500/30 animate-pulse"
          style={{
            color: '#00FFFF',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 200, 255, 0.6), 0 0 30px rgba(100, 150, 255, 0.4)',
          }}
        >
          ✨ 应用了 {skillName} 技能
        </span>
      )}
    </>
  );
});

RichTextRenderer.displayName = 'RichTextRenderer';
