/**
 * 卡片预览组件
 */

import React from 'react';
import { Card } from '../../services/card-system/types/CardTypes';

interface CardPreviewProps {
  card: Card;
  className?: string;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ card, className = '' }) => {
  const getBackgroundStyle = () => {
    if (card.background.type === 'color') {
      return { backgroundColor: card.background.value };
    } else if (card.background.type === 'image') {
      return {
        backgroundImage: `url(${card.background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else {
      // gradient
      return { background: card.background.value };
    }
  };

  const getTextAlign = () => {
    if (card.style.layout.contentPosition === 'center') {
      return 'text-center';
    } else if (card.style.layout.contentPosition === 'bottom') {
      return 'text-right';
    }
    return 'text-left';
  };

  return (
    <div
      className={`rounded-xl shadow-lg overflow-hidden ${className}`}
      style={{
        ...getBackgroundStyle(),
        aspectRatio: '16 / 9',
        minHeight: '300px',
      }}
    >
      <div
        className={`h-full flex flex-col justify-${card.style.layout.contentPosition} p-8 ${getTextAlign()}`}
      >
        {card.title && (
          <h2
            style={{
              fontFamily: card.style.titleFont,
              color: card.style.titleColor,
              fontSize: `${card.style.titleSize}px`,
              fontWeight: 'bold',
              marginBottom: card.content ? '16px' : '0',
            }}
          >
            {card.title}
          </h2>
        )}
        {card.content && (
          <p
            style={{
              fontFamily: card.style.contentFont,
              color: card.style.contentColor,
              fontSize: `${card.style.contentSize}px`,
              lineHeight: '1.6',
            }}
          >
            {card.content}
          </p>
        )}
        {card.decorations?.emojis && card.decorations.emojis.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {card.decorations.emojis.map((emoji, index) => (
              <span key={index} className="text-2xl">
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




