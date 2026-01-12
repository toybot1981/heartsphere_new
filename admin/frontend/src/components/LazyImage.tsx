import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  variants?: Record<string, string>;  // 多分辨率版本URL（可选）
  purpose?: 'detail' | 'thumbnail' | 'list' | 'card';  // 展示场景（可选，默认'detail'）
}

/**
 * 图片懒加载组件 - Admin 版本（简化版）
 * 使用 Intersection Observer API 实现图片懒加载
 */
export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder.png',
  onLoad,
  onError,
  variants,
  purpose = 'detail'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 根据展示场景选择合适的分辨率（简化版）
  const selectImageResolution = (baseSrc: string, variants?: Record<string, string>, purpose?: string): string => {
    if (!variants || !purpose) {
      return baseSrc;
    }
    // 根据 purpose 选择合适的分辨率变体
    const variantKey = purpose === 'thumbnail' ? 'thumbnail' : purpose === 'list' ? 'small' : 'original';
    return variants[variantKey] || variants['original'] || baseSrc;
  };

  const selectedSrc = selectImageResolution(src, variants, purpose);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setImageSrc(null);
  }, [selectedSrc]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const imgElement = imgRef.current;
      if (!imgElement) {
        setImageSrc(selectedSrc);
        return;
      }

      // 检查是否在视口中
      const checkIfInViewport = () => {
        const rect = imgElement.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      };

      if (checkIfInViewport()) {
        setImageSrc(selectedSrc);
        return;
      }

      // 使用 Intersection Observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      let rootElement: Element | null = null;
      let parent = imgElement.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        if (style.overflow === 'auto' || style.overflow === 'scroll' || 
            style.overflowY === 'auto' || style.overflowY === 'scroll' ||
            (style.maxHeight && parseInt(style.maxHeight) > 0)) {
          rootElement = parent;
          break;
        }
        parent = parent.parentElement;
      }
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(selectedSrc);
              if (observerRef.current && imgElement) {
                observerRef.current.unobserve(imgElement);
              }
            }
          });
        },
        {
          root: rootElement,
          rootMargin: '100px',
          threshold: [0, 0.01, 0.1, 0.5, 1.0],
        }
      );

      try {
        observerRef.current.observe(imgElement);
      } catch (error) {
        console.error('[LazyImage] Observer 观察失败', error);
        setImageSrc(selectedSrc);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        const imgElement = imgRef.current;
        if (imgElement) {
          observerRef.current.unobserve(imgElement);
        }
        observerRef.current.disconnect();
      }
    };
  }, [selectedSrc, alt]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  };

  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      {!isLoaded && !hasError && imageSrc && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center" style={{ zIndex: 1 }}>
          <div className="text-gray-500 text-sm">加载中...</div>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc || placeholder}
        alt={alt}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: (imageSrc && isLoaded) ? 1 : 0,
          transition: 'opacity 0.3s',
          position: 'relative',
          zIndex: (imageSrc && isLoaded) ? 2 : 1,
          display: 'block',
          visibility: (imageSrc && isLoaded) ? 'visible' : 'hidden',
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{ zIndex: 3 }}>
          <div className="text-gray-500 text-sm">图片加载失败</div>
        </div>
      )}
    </div>
  );
};
