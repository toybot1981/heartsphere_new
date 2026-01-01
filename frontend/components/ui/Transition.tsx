import React, { useEffect, useState } from 'react';

/**
 * 页面过渡组件
 * 实现流畅的页面切换动画
 */

export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 300,
  className = '',
}) => {
  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'right',
  delay = 0,
  duration = 400,
  className = '',
}) => {
  const getTransform = () => {
    switch (direction) {
      case 'left':
        return 'translateX(-20px)';
      case 'right':
        return 'translateX(20px)';
      case 'up':
        return 'translateY(20px)';
      case 'down':
        return 'translateY(-20px)';
      default:
        return 'translateX(20px)';
    }
  };

  return (
    <div
      className={className}
      style={{
        animation: `slideIn ${duration}ms ease-out ${delay}ms both`,
        transformOrigin: getTransform(),
      }}
    >
      {children}
    </div>
  );
};

export interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 300,
  className = '',
}) => {
  return (
    <div
      className={`animate-scale-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 页面过渡容器
 */
export interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setContent(children);
      setIsVisible(true);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [children, duration]);

  const getTransitionComponent = () => {
    switch (type) {
      case 'slide':
        return (
          <SlideIn duration={duration} className={isVisible ? '' : 'opacity-0'}>
            {content}
          </SlideIn>
        );
      case 'scale':
        return (
          <ScaleIn duration={duration} className={isVisible ? '' : 'opacity-0'}>
            {content}
          </ScaleIn>
        );
      case 'fade':
      default:
        return (
          <FadeIn duration={duration} className={isVisible ? '' : 'opacity-0'}>
            {content}
          </FadeIn>
        );
    }
  };

  return <div className="min-h-full">{getTransitionComponent()}</div>;
};

/**
 * 列表交错动画
 */
export interface StaggeredListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  className = '',
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

/**
 * 呼吸动画组件
 */
export interface BreathingProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export const Breathing: React.FC<BreathingProps> = ({
  children,
  duration = 3000,
  className = '',
}) => {
  return (
    <div
      className={`animate-breathing ${className}`}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * 浮动动画组件
 */
export interface FloatingProps {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
}

export const Floating: React.FC<FloatingProps> = ({
  children,
  duration = 3000,
  distance = 10,
  className = '',
}) => {
  return (
    <div
      className={`animate-float ${className}`}
      style={{ 
        animationDuration: `${duration}ms`,
        transform: `translateY(${distance}px)`,
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;




