import React, { useState, useEffect, useRef } from 'react';

import { selectImageResolution, type ImageDisplayPurpose, type ImageVariants } from '../utils/imageResolution';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  variants?: ImageVariants;  // 多分辨率版本URL（可选）
  purpose?: ImageDisplayPurpose;  // 展示场景（可选，默认'detail'）
}

/**
 * 图片懒加载组件
 * 使用 Intersection Observer API 实现图片懒加载
 * 只有当图片进入视口时才开始加载
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

  // 根据展示场景选择合适的分辨率
  const selectedSrc = selectImageResolution(src, variants, purpose, false);

  useEffect(() => {
    // 使用 setTimeout 确保 DOM 已经渲染，ref 已经绑定
    const timer = setTimeout(() => {
      const imgElement = imgRef.current;
      if (!imgElement) {
        console.warn('[LazyImage] imgElement 不存在（延迟检查后仍然不存在）', { alt, selectedSrc });
        // 如果 ref 仍然不存在，直接加载图片（降级方案）
        setImageSrc(selectedSrc);
        return;
      }

      // 如果图片已经在视口中，直接加载
      const checkIfInViewport = () => {
        const rect = imgElement.getBoundingClientRect();
        const inViewport = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        console.log('[LazyImage] 检查视口', { 
          alt, 
          selectedSrc, 
          inViewport,
          rect: { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right },
          viewport: { height: window.innerHeight, width: window.innerWidth }
        });
        return inViewport;
      };

      if (checkIfInViewport()) {
        console.log('[LazyImage] 图片在视口中，直接加载', { alt, selectedSrc });
        setImageSrc(selectedSrc);
        return;
      }

      // 使用 Intersection Observer 监听图片是否进入视口
      console.log('[LazyImage] 设置 Intersection Observer', { alt, selectedSrc, imgElement });
      
      // 先清理旧的Observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // 查找最近的滚动容器作为root
      let rootElement: Element | null = null;
      let parent = imgElement.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        if (style.overflow === 'auto' || style.overflow === 'scroll' || 
            style.overflowY === 'auto' || style.overflowY === 'scroll' ||
            style.maxHeight && parseInt(style.maxHeight) > 0) {
          rootElement = parent;
          console.log('[LazyImage] 找到滚动容器', { alt, rootElement: parent.className });
          break;
        }
        parent = parent.parentElement;
      }
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            console.log('[LazyImage] Intersection Observer 触发', { 
              alt, 
              selectedSrc, 
              isIntersecting: entry.isIntersecting,
              intersectionRatio: entry.intersectionRatio,
              boundingClientRect: entry.boundingClientRect,
              rootBounds: entry.rootBounds
            });
            if (entry.isIntersecting) {
              console.log('[LazyImage] 图片进入视口，开始加载', { alt, selectedSrc });
              setImageSrc(selectedSrc);
              if (observerRef.current && imgElement) {
                observerRef.current.unobserve(imgElement);
              }
            }
          });
        },
        {
          root: rootElement, // 使用滚动容器作为root
          rootMargin: '100px', // 增加提前加载距离到100px
          threshold: [0, 0.01, 0.1, 0.5, 1.0], // 多个阈值，确保能触发
        }
      );

      try {
        observerRef.current.observe(imgElement);
        console.log('[LazyImage] Observer 已观察元素', { alt, selectedSrc });
      } catch (error) {
        console.error('[LazyImage] Observer 观察失败', { alt, selectedSrc, error });
        // 如果Observer失败，直接加载图片
        setImageSrc(selectedSrc);
      }
    }, 0); // 使用 setTimeout(fn, 0) 确保在下一个事件循环中执行

    // 清理函数
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

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    const img = e.currentTarget;
    console.log('[LazyImage] 图片加载成功', {
      src: img.src,
      alt: alt,
      purpose,
      imageSrc,
      selectedSrc,
      isLoaded: true,
      imgElement: {
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        className: img.className,
        style: img.style.cssText
      }
    });
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    const img = e.currentTarget;
    console.error('[LazyImage] 图片加载失败', {
      src: img.src,
      alt: alt,
      purpose,
      imageSrc,
      selectedSrc
    });
    onError?.(e);
  };

  // 添加调试：打印渲染状态
  useEffect(() => {
    console.log('[LazyImage] 渲染状态', {
      alt,
      imageSrc,
      isLoaded,
      hasError,
      selectedSrc,
      className
    });
  }, [imageSrc, isLoaded, hasError, alt, selectedSrc, className]);

  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      {/* 占位符 - 只在加载中且没有错误时显示 */}
      {!isLoaded && !hasError && imageSrc && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center" style={{ zIndex: 1 }}>
          <div className="text-gray-500 text-sm">加载中...</div>
        </div>
      )}
      
      {/* 实际图片 - 始终渲染，确保 ref 可以绑定 */}
      <img
        ref={imgRef}
        src={imageSrc || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+'}
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
          pointerEvents: (imageSrc && isLoaded) ? 'auto' : 'none'
        }}
        onLoad={(e) => {
          // 只有当 imageSrc 存在时才触发加载成功
          if (imageSrc) {
            handleLoad(e);
          }
        }}
        onError={handleError}
        loading="lazy"
      />
      
      {/* 错误占位符 */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{ zIndex: 3 }}>
          <div className="text-gray-500 text-sm">图片加载失败</div>
        </div>
      )}
    </div>
  );
};





