import React, { useState, useEffect, useRef } from 'react';
import { selectImageResolution, isMobileDevice, type ImageDisplayPurpose, type ImageVariants } from '../utils/imageResolution';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  variants?: ImageVariants;  // 多分辨率版本URL（可选）
  purpose?: ImageDisplayPurpose;  // 展示场景（可选，默认'detail'）
  isMobile?: boolean;  // 是否为移动端（可选，默认自动检测）
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
  purpose = 'detail',
  isMobile: isMobileProp
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 自动检测设备类型（如果未指定）
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileDevice();

  // 根据展示场景选择合适的分辨率（使用统一的规则和回退策略）
  const selectedSrc = selectImageResolution(src, variants, purpose, isMobile);

  // 记录图片URL信息（用于调试）
  useEffect(() => {
    console.log('[LazyImage] 图片URL信息', {
      component: 'LazyImage (Admin)',
      alt,
      originalSrc: src,
      variants: variants ? {
        original: variants.original,
        thumbnail: variants.thumbnail,
        medium: variants.medium,
        highQuality: variants.highQuality
      } : null,
      purpose,
      isMobile,
      selectedSrc,
      className
    });
  }, [src, variants, purpose, isMobile, selectedSrc, alt, className]);

  // 验证 URL 是否有效
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || url.trim() === '') return false;
    // 检查是否是有效的 URL 格式
    try {
      // 如果是相对路径（以 / 开头），认为是有效的
      if (url.startsWith('/')) return true;
      // 如果是完整 URL，验证格式
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url);
        return true;
      }
      // data URL 也是有效的
      if (url.startsWith('data:')) return true;
      // 其他情况认为无效
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    // 如果 URL 无效，立即设置错误状态
    if (!isValidUrl(selectedSrc)) {
      console.warn('[LazyImage] 无效的图片URL:', selectedSrc);
      setHasError(true);
      setImageSrc(null);
      return;
    }
    setImageSrc(null);
  }, [selectedSrc]);

  useEffect(() => {
    // 如果 URL 无效，不进行加载
    if (!isValidUrl(selectedSrc)) {
      return;
    }

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

  const handleLoad = (e?: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    const img = e?.currentTarget;
    console.log('[LazyImage] 图片加载成功', {
      component: 'LazyImage (Admin)',
      alt,
      originalSrc: src,
      selectedSrc,
      actualLoadedSrc: img?.src || selectedSrc,
      purpose,
      isMobile,
      variants: variants ? {
        original: variants.original,
        thumbnail: variants.thumbnail,
        medium: variants.medium,
        highQuality: variants.highQuality
      } : null
    });
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    const img = e.currentTarget;
    console.error('[LazyImage] 图片加载失败', {
      component: 'LazyImage (Admin)',
      alt,
      originalSrc: src,
      selectedSrc,
      failedSrc: img.src,
      purpose,
      isMobile,
      variants: variants ? {
        original: variants.original,
        thumbnail: variants.thumbnail,
        medium: variants.medium,
        highQuality: variants.highQuality
      } : null,
      error: 'Image load failed'
    });
    onError?.(e);
  };

  // 如果 URL 无效，直接显示错误
  if (!isValidUrl(selectedSrc)) {
    return (
      <div className="relative" style={{ width: '100%', height: '100%' }}>
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{ zIndex: 3 }}>
          <div className="text-gray-500 text-sm">无效的图片URL</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      {!isLoaded && !hasError && imageSrc && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center" style={{ zIndex: 1 }}>
          <div className="text-gray-500 text-sm">加载中...</div>
        </div>
      )}
      
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s',
            position: 'relative',
            zIndex: isLoaded ? 2 : 1,
            display: 'block',
          }}
          onLoad={(e) => handleLoad(e)}
          onError={handleError}
          loading="lazy"
        />
      )}
      
      {!imageSrc && !hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{ zIndex: 1 }}>
          <div className="text-gray-500 text-sm">等待加载...</div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{ zIndex: 3 }}>
          <div className="text-gray-500 text-sm">图片加载失败</div>
        </div>
      )}
    </div>
  );
};
