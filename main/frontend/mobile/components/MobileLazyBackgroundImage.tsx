/**
 * Mobile版本懒加载背景图片组件
 * Phase 5: 实现CSS背景图片懒加载
 * 
 * 用于需要保持backgroundImage布局的场景
 * 如果可能，建议使用MobileLazyImage替代
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { optimizeMobileImageSize } from '../utils/responsiveImage';

interface MobileLazyBackgroundImageProps {
  imageUrl: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  fallback?: string;
  displayWidth?: number;
  displayHeight?: number;
  purpose?: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge';
  children?: React.ReactNode;
}

/**
 * Mobile版本懒加载背景图片组件
 * 使用Intersection Observer实现懒加载
 * 支持响应式图片优化
 */
export const MobileLazyBackgroundImage: React.FC<MobileLazyBackgroundImageProps> = memo(({
  imageUrl,
  className = '',
  style = {},
  placeholder,
  fallback,
  displayWidth,
  displayHeight,
  purpose = 'medium',
  children,
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // 优化图片URL（响应式）
  const getOptimizedUrl = (url: string): string => {
    if (!url || url.startsWith('data:') || url.endsWith('.svg')) {
      return url;
    }

    if (displayWidth) {
      return optimizeMobileImageSize(url, displayWidth, displayHeight, purpose);
    }

    return url;
  };

  // 预加载图片（用于检测加载完成）
  useEffect(() => {
    if (!imageUrl || hasError) return;

    const optimizedUrl = getOptimizedUrl(imageUrl);
    
    // 创建隐藏的img元素来预加载图片
    const img = new Image();
    imgRef.current = img;

    img.onload = () => {
      setIsLoaded(true);
      setBackgroundImage(`url(${optimizedUrl})`);
    };

    img.onerror = () => {
      setHasError(true);
      if (fallback) {
        const fallbackUrl = getOptimizedUrl(fallback);
        setBackgroundImage(`url(${fallbackUrl})`);
      } else {
        // 如果没有fallback，使用placeholder或空字符串
        if (placeholder) {
          setBackgroundImage(`url(${placeholder})`);
        }
      }
    };

    img.src = optimizedUrl;

    return () => {
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
        imgRef.current = null;
      }
    };
  }, [imageUrl, displayWidth, displayHeight, purpose, fallback, placeholder, hasError]);

  // Intersection Observer懒加载
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imageUrl || hasError) return;

    // 如果浏览器支持Intersection Observer，使用懒加载
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLoaded && !hasError) {
              // 容器进入视口，开始加载图片
              const optimizedUrl = getOptimizedUrl(imageUrl);
              const img = new Image();
              
              img.onload = () => {
                setIsLoaded(true);
                setBackgroundImage(`url(${optimizedUrl})`);
              };

              img.onerror = () => {
                setHasError(true);
                if (fallback) {
                  const fallbackUrl = getOptimizedUrl(fallback);
                  setBackgroundImage(`url(${fallbackUrl})`);
                } else if (placeholder) {
                  setBackgroundImage(`url(${placeholder})`);
                }
              };

              img.src = optimizedUrl;
              observerRef.current?.unobserve(container);
            }
          });
        },
        {
          rootMargin: '50px', // 提前50px开始加载
        }
      );

      observerRef.current.observe(container);
    } else {
      // 不支持Intersection Observer，直接加载
      const optimizedUrl = getOptimizedUrl(imageUrl);
      const img = new Image();
      
      img.onload = () => {
        setIsLoaded(true);
        setBackgroundImage(`url(${optimizedUrl})`);
      };

      img.onerror = () => {
        setHasError(true);
        if (fallback) {
          const fallbackUrl = getOptimizedUrl(fallback);
          setBackgroundImage(`url(${fallbackUrl})`);
        } else if (placeholder) {
          setBackgroundImage(`url(${placeholder})`);
        }
      };

      img.src = optimizedUrl;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [imageUrl, isLoaded, hasError, displayWidth, displayHeight, purpose, fallback, placeholder]);

  // 合并样式
  const mergedStyle: React.CSSProperties = {
    ...style,
    backgroundImage: backgroundImage || (placeholder ? `url(${placeholder})` : 'none'),
    backgroundSize: style.backgroundSize || 'cover',
    backgroundPosition: style.backgroundPosition || 'center',
    backgroundRepeat: style.backgroundRepeat || 'no-repeat',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0.5,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={mergedStyle}
    >
      {children}
    </div>
  );
});

MobileLazyBackgroundImage.displayName = 'MobileLazyBackgroundImage';
