import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

/**
 * 高亮文本组件
 * 用于在搜索结果中高亮显示匹配的关键词
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className = '',
}) => {
  if (!highlight || !text) {
    return <span className={className}>{text}</span>;
  }
  
  // 转义特殊字符，用于正则表达式
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  const escapedHighlight = escapeRegex(highlight);
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark
              key={index}
              className="bg-yellow-400/50 text-yellow-100 px-1 rounded"
            >
              {part}
            </mark>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

