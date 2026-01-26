import React, { useState, useEffect, useRef, useMemo } from 'react';

import { selectImageResolution, isMobileDevice, type ImageDisplayPurpose, type ImageVariants } from '../utils/imageResolution';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  variants?: ImageVariants;  // 多分辨率版本URL（可选）
  purpose?: ImageDisplayPurpose;  // 展示场景（可选，默认'detail'）
  isMobile?: boolean;  // 是否为移动端（可选，默认自动检测）
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
  purpose = 'detail',
  isMobile: isMobileProp
}) => {
  // 如果没有有效的 src，直接返回空内容，不进行任何加载尝试
  if (!src || !src.trim()) {
    return (
      <div className={className} style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}>
        {/* 空状态，不显示任何内容 */}
      </div>
    );
  }

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0); // 当前回退索引
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasNoVariants = !variants; // 缓存是否有 variants，避免重复计算
  const failedUrlsRef = useRef<Set<string>>(new Set()); // 记录已失败的URL，避免重复尝试

  // 自动检测设备类型（如果未指定）
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileDevice();

  // 构建回退链：根据场景和variants构建完整的回退URL列表
  // 使用 useMemo 避免每次渲染都重新计算
  const fallbackChain = useMemo(() => {
    if (!variants) {
      // 如果没有 variants（只有原图），只使用原图，不添加 placeholder
      // 这样当原图加载失败时，会直接停止，不会闪烁
      const chain = [src].filter(url => url && url.trim());
      console.log('[LazyImage] 构建回退链（无variants，仅原图）', { purpose, chain, hasPlaceholder: !!placeholder });
      return chain;
    }

    const chain: string[] = [];
    
    switch (purpose) {
      case 'thumbnail':
        // 缩略图：thumbnail → src → placeholder
        if (variants.thumbnail) chain.push(variants.thumbnail);
        chain.push(src, placeholder);
        break;
      case 'list':
        // 列表：medium → src → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图，不尝试更高分辨率（因为更高分辨率可能也不存在）
        if (variants.medium) chain.push(variants.medium);
        chain.push(src, placeholder);
        break;
      
      case 'detail':
        // 详情页：medium → src → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图
        if (variants.medium) chain.push(variants.medium);
        chain.push(src, placeholder);
        break;
      
      case 'background':
        // 移动端背景：medium → src → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图
        if (variants.medium) chain.push(variants.medium);
        chain.push(src, placeholder);
        break;
      
      case 'chatBackground':
        // ChatWindow背景：根据设备类型选择
        if (!isMobile) {
          // PC端：highQuality → src → placeholder
          // 如果 highQuality (1920*1080) 加载失败，直接回退到原图
          if (variants.highQuality) chain.push(variants.highQuality);
        } else {
          // 移动端：medium → src → placeholder
          // 如果 medium (800*600) 加载失败，直接回退到原图
          if (variants.medium) chain.push(variants.medium);
        }
        chain.push(src, placeholder);
        break;
      
      case 'original':
        // 原图：src → placeholder
        chain.push(src, placeholder);
        break;
      
      default:
        // 默认：medium → src → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图
        if (variants.medium) chain.push(variants.medium);
        chain.push(src, placeholder);
    }
    
    // 去重并过滤空值，但确保原图（src）始终在链中（即使与其他URL重复）
    const filteredChain = chain.filter(url => url && url.trim());
    // 去重，但保留顺序
    const seen = new Set<string>();
    const finalChain: string[] = [];
    for (const url of filteredChain) {
      // 对于原图（src），即使重复也保留（确保原图在回退链中）
      if (url === src || !seen.has(url)) {
        finalChain.push(url);
        seen.add(url);
      }
    }
    // 确保原图在链中（如果不在，添加到末尾）
    if (src && src.trim() && !finalChain.includes(src)) {
      finalChain.push(src);
    }
    console.log('[LazyImage] 构建回退链', {
      purpose,
      isMobile,
      chain: finalChain,
      chainLength: finalChain.length,
      originalSrc: src,
      originalSrcInChain: finalChain.includes(src),
      availableVariants: {
        thumbnail: !!variants.thumbnail,
        medium: !!variants.medium,
        highQuality: !!variants.highQuality
      }
    });
    return finalChain;
  }, [variants, src, placeholder, purpose, isMobile]);
  
  // 根据回退索引选择当前要加载的URL
  const selectedSrc = fallbackChain[fallbackIndex] || fallbackChain[0] || src;

  // 当 src 或 variants 变化时，重置加载状态（不是 selectedSrc，避免回退时重置）
  useEffect(() => {
    // 如果没有 variants（只有原图），且已经标记为错误，不再重置
    if (hasNoVariants && hasError) {
      return;
    }
    // 重置回退索引（当 src 或 variants 变化时，重新开始回退链）
    setFallbackIndex(0);
    setIsLoaded(false);
    setHasError(false);
    setImageSrc(null); // 清空 imageSrc，强制重新加载
  }, [src, variants, hasNoVariants, hasError]);
  

  // 初始加载逻辑：只在 imageSrc 为 null 且 fallbackIndex 为 0 时触发
  // 回退时的 imageSrc 更新由 fallbackIndex 变化的 useEffect 处理
  useEffect(() => {
    // 如果 imageSrc 已经设置（可能是通过 fallbackIndex 变化设置的），不再处理
    if (imageSrc) {
      return;
    }
    
    // 只在初始加载时（fallbackIndex === 0）处理
    if (fallbackIndex !== 0) {
      return;
    }
    
    // 如果已经标记为错误或没有有效的源，不尝试加载
    if (hasError || !selectedSrc || !selectedSrc.trim() || fallbackChain.length === 0) {
      return;
    }
    
    // 如果没有 variants（只有原图），立即设置 imageSrc，不等待 Intersection Observer
    // 这样可以避免闪烁，因为图片会立即开始加载
    if (hasNoVariants && selectedSrc && selectedSrc.trim()) {
      setImageSrc(selectedSrc);
      return;
    }
    
    // 对于有 variants 的图片，也立即开始加载（不再等待 Intersection Observer）
    // 这样可以避免"加载中"状态持续显示
    if (selectedSrc && selectedSrc.trim()) {
      setImageSrc(selectedSrc);
      return;
    }
    
    // 以下代码保留作为备用，但通常不会执行到这里
    // 使用 setTimeout 确保 DOM 已经渲染，ref 已经绑定
    const timer = setTimeout(() => {
      const imgElement = imgRef.current;
      if (!imgElement) {
        // 如果 ref 仍然不存在，直接加载图片（降级方案）
        if (selectedSrc && selectedSrc.trim()) {
          setImageSrc(selectedSrc);
        }
        return;
      }

      // 如果图片已经在视口中，直接加载
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

      // 使用 Intersection Observer 监听图片是否进入视口
      
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
          root: rootElement, // 使用滚动容器作为root
          rootMargin: '200px', // 优化：提前200px开始加载，提升用户体验
          threshold: 0.01, // 优化：只需要1%可见即可触发，减少计算开销
        }
      );

      try {
        observerRef.current.observe(imgElement);
      } catch (error) {
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
  }, [selectedSrc, alt, hasError, fallbackChain.length, hasNoVariants, imageSrc, fallbackIndex]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const currentUrl = fallbackChain[fallbackIndex];
    const resolutionType = fallbackIndex === 0 && variants?.thumbnail === currentUrl ? 'thumbnail' :
                          fallbackIndex === 0 && variants?.medium === currentUrl ? 'medium' :
                          fallbackIndex === 0 && variants?.highQuality === currentUrl ? 'highQuality' :
                          'original/placeholder';
    
    console.log('[LazyImage] 图片加载成功', {
      componentName: 'LazyImage',
      imageAlt: alt,
      imageUrl: currentUrl,
      purpose,
      isMobile,
      fallbackIndex,
      resolutionType,
      hasVariants: !!variants,
      availableVariants: variants ? {
        thumbnail: variants.thumbnail || null,
        medium: variants.medium || null,
        highQuality: variants.highQuality || null,
        original: variants.original || null,
      } : null,
      fallbackChain,
      timestamp: new Date().toISOString(),
    });
    // 立即设置加载完成，避免闪烁
    setIsLoaded(true);
    onLoad?.(e);
  };

  // 当 fallbackIndex 变化时，更新 imageSrc
  useEffect(() => {
    // 如果已经标记为错误，不再尝试加载
    if (hasError) {
      return;
    }
    
    // 如果回退链为空，直接标记为错误
    if (fallbackChain.length === 0) {
      setHasError(true);
      setImageSrc(null);
      return;
    }
    
    // 如果没有 variants（只有原图），且原图已经加载失败，不再尝试
    if (hasNoVariants && hasError) {
      return;
    }
    
    // 只在回退时（fallbackIndex > 0）更新 imageSrc
    // 初始加载（fallbackIndex === 0）由另一个 useEffect 处理
    if (fallbackIndex > 0 && fallbackIndex < fallbackChain.length) {
      const newSrc = fallbackChain[fallbackIndex];
      if (newSrc && newSrc.trim()) {
        // 只有在当前 imageSrc 不同时才更新，避免不必要的闪烁
        if (imageSrc !== newSrc) {
          console.log('[LazyImage] 回退更新 imageSrc', {
            componentName: 'LazyImage',
            imageAlt: alt,
            purpose,
            fallbackIndex,
            oldSrc: imageSrc,
            newSrc,
            isOriginal: newSrc === src,
            timestamp: new Date().toISOString(),
          });
          // 重置加载状态，准备加载新URL
          setIsLoaded(false);
          // 直接设置新URL，不使用 setTimeout，避免延迟
          setImageSrc(newSrc);
        }
      } else {
        // 如果当前索引的 URL 无效，尝试下一个
        if (fallbackIndex < fallbackChain.length - 1) {
          setFallbackIndex(fallbackIndex + 1);
        } else {
          // 所有 URL 都无效，标记为错误
          setHasError(true);
          setImageSrc(null);
        }
      }
    } else if (fallbackIndex >= fallbackChain.length) {
      // 索引超出范围，标记为错误
      setHasError(true);
      setImageSrc(null);
    }
  }, [fallbackIndex, fallbackChain, hasError, hasNoVariants, alt, purpose, src, imageSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const failedUrl = fallbackChain[fallbackIndex];
    
    // 如果已经标记为错误，避免重复处理
    if (hasError) {
      return;
    }
    
    // 记录失败的URL，避免重复尝试同一个URL
    if (failedUrl) {
      failedUrlsRef.current.add(failedUrl);
    }
    
    // 检查当前失败的 URL 是否是原图
    const isFailedOriginal = failedUrl === src;
    
    // 检查下一个回退 URL
    const nextUrl = fallbackIndex < fallbackChain.length - 1 ? fallbackChain[fallbackIndex + 1] : null;
    const isNextPlaceholder = nextUrl === placeholder || 
                              (nextUrl && (nextUrl.includes('data:') || nextUrl.includes('/placeholder.png')));
    const isNextOriginal = nextUrl === src;
    
    // 如果下一个URL已经失败过，直接停止
    if (nextUrl && failedUrlsRef.current.has(nextUrl)) {
      console.error('[LazyImage] 下一个URL已经失败过，停止回退', {
        componentName: 'LazyImage',
        imageAlt: alt,
        purpose,
        failedUrl,
        nextUrl,
        timestamp: new Date().toISOString(),
      });
      setHasError(true);
      setImageSrc(null);
      setIsLoaded(false);
      onError?.(e);
      return;
    }
    
    console.warn('[LazyImage] 图片加载失败，尝试回退', {
      componentName: 'LazyImage',
      imageAlt: alt,
      imageUrl: failedUrl,
      purpose,
      isMobile,
      fallbackIndex,
      totalFallbacks: fallbackChain.length,
      hasVariants: !!variants,
      isFailedOriginal,
      nextFallback: nextUrl,
      isNextPlaceholder,
      isNextOriginal,
      fallbackChain,
      timestamp: new Date().toISOString(),
    });
    
    // 如果当前失败的 URL 是原图，立即停止回退（原图无法访问时，不应该再尝试其他URL）
    if (isFailedOriginal) {
      console.error('[LazyImage] 原图加载失败，停止回退', {
        componentName: 'LazyImage',
        imageAlt: alt,
        purpose,
        failedUrl,
        fallbackIndex,
        totalFallbacks: fallbackChain.length,
        timestamp: new Date().toISOString(),
      });
      setHasError(true);
      setImageSrc(null);
      setIsLoaded(false);
      onError?.(e);
      return;
    }
    
    // 如果下一个 URL 是 placeholder，停止回退
    if (isNextPlaceholder) {
      console.log('[LazyImage] 下一个URL是placeholder，停止回退', {
        componentName: 'LazyImage',
        imageAlt: alt,
        purpose,
        failedUrl,
        nextUrl,
        timestamp: new Date().toISOString(),
      });
      setHasError(true);
      setImageSrc(null);
      setIsLoaded(false);
      onError?.(e);
      return;
    }
    
    // 如果没有 variants（只有原图），原图加载失败时直接停止，不尝试 placeholder
    if (hasNoVariants) {
      console.error('[LazyImage] 原图加载失败且无variants，停止加载', {
        componentName: 'LazyImage',
        imageAlt: alt,
        purpose,
        originalSrc: src,
        timestamp: new Date().toISOString(),
      });
      // 立即设置错误状态，停止所有尝试
      setHasError(true);
      setImageSrc(null); // 停止加载
      setIsLoaded(false); // 确保不显示加载状态
      onError?.(e);
      return;
    }
    
    // 实现回退策略：如果当前URL加载失败，尝试下一个回退URL
    if (fallbackIndex < fallbackChain.length - 1) {
      // 还有可用的回退URL，尝试下一个
      const nextIndex = fallbackIndex + 1;
      const nextUrl = fallbackChain[nextIndex];
      
      // 如果下一个URL已经失败过，直接停止
      if (failedUrlsRef.current.has(nextUrl)) {
        console.error('[LazyImage] 下一个URL已经失败过，停止回退', {
          componentName: 'LazyImage',
          imageAlt: alt,
          purpose,
          nextUrl,
          timestamp: new Date().toISOString(),
        });
        setHasError(true);
        setImageSrc(null);
        setIsLoaded(false);
        onError?.(e);
        return;
      }
      
      const isOriginal = nextUrl === src;
      console.log('[LazyImage] 回退到下一个URL', {
        componentName: 'LazyImage',
        imageAlt: alt,
        purpose,
        nextIndex,
        nextUrl,
        isOriginal,
        originalSrc: src,
        totalFallbacks: fallbackChain.length,
        remainingFallbacks: fallbackChain.slice(nextIndex),
        timestamp: new Date().toISOString(),
      });
      setFallbackIndex(nextIndex);
    } else {
      // 所有回退URL都失败了，显示错误状态并停止尝试
      console.error('[LazyImage] 所有回退URL都失败，停止尝试', {
        componentName: 'LazyImage',
        imageAlt: alt,
        purpose,
        isMobile,
        fallbackChain,
        originalSrc: src,
        timestamp: new Date().toISOString(),
      });
      setHasError(true);
      setImageSrc(null); // 停止加载
      setIsLoaded(false);
      onError?.(e);
    }
  };

  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      {/* 占位符 - 只在加载中且没有错误时显示，且不是只有原图的情况（避免闪烁），设置为 pointer-events-none 避免阻止点击 */}
      {!isLoaded && !hasError && imageSrc && !hasNoVariants && (
        <div 
          className="absolute inset-0 animate-pulse flex items-center justify-center pointer-events-none" 
          style={{ 
            zIndex: 1,
            backgroundColor: 'var(--bg-secondary, #1f2937)',
          }}
        >
          <div 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            加载中...
          </div>
        </div>
      )}
      
      {/* 实际图片 - 只在有有效源且没有错误时渲染 */}
      {imageSrc && !hasError && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: hasNoVariants ? 1 : (isLoaded ? 1 : 0), // 如果没有 variants，直接显示，不等待加载完成
            transition: hasNoVariants ? 'none' : 'opacity 0.3s', // 如果没有 variants，不使用过渡动画
            position: 'relative',
            zIndex: isLoaded || hasNoVariants ? 2 : 1,
            display: 'block',
            visibility: 'visible', // 始终可见，通过 opacity 控制
            pointerEvents: 'none' // 设置为 none，避免图片阻止父元素的点击事件
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
      
      {/* 错误占位符 - 只在有错误时显示，且不闪烁，设置为 pointer-events-none 避免阻止点击 */}
      {hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none" 
          style={{ 
            zIndex: 3,
            backgroundColor: 'var(--bg-secondary, #1f2937)',
          }}
        >
          <div 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            图片加载失败
          </div>
        </div>
      )}
    </div>
  );
};





