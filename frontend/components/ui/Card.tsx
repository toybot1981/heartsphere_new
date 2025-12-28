import React from 'react';

/**
 * 温暖感的卡片组件
 * 实现柔和阴影和渐变效果
 */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  noPadding?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  interactive = false,
  noPadding = false,
  onClick,
}) => {
  const baseStyles = `
    bg-white rounded-lg shadow-md transition-all duration-300 ease-out
    ${noPadding ? '' : 'p-6'}
    ${hover ? 'hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]' : ''}
    ${interactive ? 'cursor-pointer active:scale-[0.98]' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;
  
  const gradientStyles = 'gradient-card';
  
  return (
    <div
      className={`${baseStyles} ${gradientStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/**
 * 卡片标题组件
 */
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

/**
 * 卡片标题文本组件
 */
export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h3 className={`text-h3 font-semibold text-text-primary ${className}`}>
    {children}
  </h3>
);

/**
 * 卡片描述组件
 */
export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={`text-body text-text-secondary mt-1 ${className}`}>
    {children}
  </p>
);

/**
 * 卡片内容组件
 */
export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`${className}`}>
    {children}
  </div>
);

/**
 * 卡片底部组件
 */
export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`mt-4 pt-4 border-t border-warm-beige-dark/30 ${className}`}>
    {children}
  </div>
);

export default Card;

