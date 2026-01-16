/**
 * Mobile版本懒加载图片组件
 * Phase 5优化: 实现图片懒加载，减少初始加载时间
 * 支持WebP格式自动检测和转换
 * 支持响应式图片加载（srcset）
 */

import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { getOptimalImageUrl } from '../utils/webpSupport';
import {
  generateResponsiveImageConfig,
  optimizeMobileImageSize,
  getDevicePixelRatio,
} from '../utils/responsiveImage';
import { selectImageResolution, type ImageDisplayPurpose, type ImageVariants } from '../../utils/imageResolution';

interface MobileLazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  enableWebP?: boolean; // 是否启用WebP支持（默认true）
  enableResponsive?: boolean; // 是否启用响应式图片（默认true）
  purpose?: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge'; // 图片用途（兼容旧接口）
  displayWidth?: number; // 显示宽度（逻辑像素，用于优化）
  displayHeight?: number; // 显示高度（逻辑像素，用于优化）
  variants?: ImageVariants;  // 多分辨率版本URL（可选）
  displayPurpose?: ImageDisplayPurpose;  // 展示场景（可选，用于多分辨率选择）
}

/**
 * Mobile版本懒加载图片组件
 * 使用Intersection Observer实现懒加载
 * 支持占位符和错误回退
 * Phase 5: 支持响应式图片加载（srcset）
 */
export const MobileLazyImage: React.FC<MobileLazyImageProps> = memo(({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23111" width="400" height="300"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E加载中...%3C/text%3E%3C/svg%3E',
  fallback,
  className = '',
  onLoad,
  onError,
  enableWebP = true,
  enableResponsive = true,
  purpose = 'medium',
  displayWidth,
  displayHeight,
  variants,
  displayPurpose,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0); // 当前回退索引
  const [webPUrl, setWebPUrl] = useState<string | null>(null);
  const [srcSet, setSrcSet] = useState<string>('');
  const [sizes, setSizes] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 构建回退链：根据场景和variants构建完整的回退URL列表
  const fallbackChain = useMemo(() => {
    if (!variants || !displayPurpose) {
      // 如果没有 variants（只有原图），只使用原图，不添加 fallback 或 placeholder
      // 这样当原图加载失败时，会直接停止，不会闪烁
      const chain = [src].filter(url => url && url.trim());
      console.log('[MobileLazyImage] 构建回退链（无variants，仅原图）', { displayPurpose, chain, hasFallback: !!fallback, hasPlaceholder: !!placeholder });
      return chain;
    }

    const chain: string[] = [];
    
    switch (displayPurpose) {
      case 'thumbnail':
      case 'list':
        // 列表：medium → src → fallback → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图
        if (variants.medium) chain.push(variants.medium);
        chain.push(src);
        if (fallback) chain.push(fallback);
        chain.push(placeholder);
        break;
      
      case 'detail':
        // 详情页：medium → src → fallback → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图
        if (variants.medium) chain.push(variants.medium);
        chain.push(src);
        if (fallback) chain.push(fallback);
        chain.push(placeholder);
        break;
      
      case 'background':
        // 移动端背景：medium → src → fallback → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图
        if (variants.medium) chain.push(variants.medium);
        chain.push(src);
        if (fallback) chain.push(fallback);
        chain.push(placeholder);
        break;
      
      case 'chatBackground':
        // ChatWindow背景（移动端）：medium → src → fallback → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图
        if (variants.medium) chain.push(variants.medium);
        chain.push(src);
        if (fallback) chain.push(fallback);
        chain.push(placeholder);
        break;
      
      case 'original':
        // 原图：src → fallback → placeholder
        chain.push(src);
        if (fallback) chain.push(fallback);
        chain.push(placeholder);
        break;
      
      default:
        // 默认：medium → src → fallback → placeholder
        // 如果 medium (800*600) 加载失败，直接回退到原图
        if (variants.medium) chain.push(variants.medium);
        chain.push(src);
        if (fallback) chain.push(fallback);
        chain.push(placeholder);
    }
    
    // 去重并过滤空值
    const finalChain = Array.from(new Set(chain.filter(url => url && url.trim())));
    console.log('[MobileLazyImage] 构建回退链', {
      displayPurpose,
      chain: finalChain,
      chainLength: finalChain.length,
      availableVariants: {
        thumbnail: !!variants.thumbnail,
        medium: !!variants.medium,
        highQuality: !!variants.highQuality
      }
    });
    return finalChain;
  }, [variants, src, fallback, placeholder, displayPurpose]);

  // 优先使用多分辨率选择（如果提供了variants和displayPurpose）
  const baseSrc = fallbackChain[fallbackIndex] || src;

  // 当回退链变化时，重置回退索引
  useEffect(() => {
    setFallbackIndex(0);
    setIsLoaded(false);
    setHasError(false);
    setWebPUrl(null);
  }, [fallbackChain.length]);

  // Phase 5: 响应式图片配置
  useEffect(() => {
    if (baseSrc && baseSrc !== placeholder && !baseSrc.includes('data:') && !baseSrc.includes('.svg')) {
      if (enableResponsive) {
        // 如果指定了显示尺寸，使用优化函数
        if (displayWidth) {
          const optimizedUrl = optimizeMobileImageSize(baseSrc, displayWidth, displayHeight, purpose);
          setImageSrc(optimizedUrl);
        } else {
          // 否则使用响应式配置
          const config = generateResponsiveImageConfig(baseSrc, purpose);
          setImageSrc(config.src);
          setSrcSet(config.srcSet);
          setSizes(config.sizes);
        }
      } else {
        // 如果不启用响应式，直接使用baseSrc
        setImageSrc(baseSrc);
      }
    }
  }, [baseSrc, enableResponsive, purpose, displayWidth, displayHeight, placeholder]);

  // Phase 5: WebP格式支持（在响应式配置之后）
  useEffect(() => {
    if (enableWebP && imageSrc && !imageSrc.includes('data:') && !imageSrc.includes('.svg')) {
      getOptimalImageUrl(imageSrc, true).then((optimalUrl) => {
        if (optimalUrl !== imageSrc) {
          setWebPUrl(optimalUrl);
        }
      });
    }
  }, [imageSrc, enableWebP]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // 如果图片已经在加载中（不是占位符），不需要懒加载
    if (imageSrc !== placeholder && !imageSrc.includes('data:')) {
      return;
    }

    // 如果浏览器支持Intersection Observer，使用懒加载
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // 图片进入视口，开始加载
              // 优先使用WebP格式（如果可用），否则使用响应式配置的src
              const finalSrc = webPUrl || imageSrc || baseSrc;
              if (finalSrc !== placeholder) {
                setImageSrc(finalSrc);
              }
              observerRef.current?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px', // 提前50px开始加载
        }
      );

      observerRef.current.observe(img);
    } else {
      // 不支持Intersection Observer，直接加载
      const currentSrc = fallbackChain[fallbackIndex] || baseSrc;
      const finalSrc = webPUrl || currentSrc;
      if (finalSrc && finalSrc !== placeholder) {
        setImageSrc(finalSrc);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fallbackChain, fallbackIndex, imageSrc, webPUrl, placeholder]);

  const handleLoad = () => {
    const currentUrl = fallbackChain[fallbackIndex];
    
    console.log('[MobileLazyImage] 图片加载成功', {
      displayPurpose,
      currentUrl,
      fallbackIndex,
      resolutionType: fallbackIndex === 0 && variants?.thumbnail === currentUrl ? 'thumbnail' :
                      fallbackIndex === 0 && variants?.medium === currentUrl ? 'medium' :
                      fallbackIndex === 0 && variants?.highQuality === currentUrl ? 'highQuality' :
                      'original/placeholder',
      webPUsed: !!webPUrl
    });
    setIsLoaded(true);
    onLoad?.();
  };

  // 当 fallbackIndex 变化时，更新 imageSrc
  useEffect(() => {
    if (fallbackIndex < fallbackChain.length) {
      const newSrc = fallbackChain[fallbackIndex];
      
      // 检查是否是 placeholder URL（data URL 或 placeholder）
      const isPlaceholderUrl = newSrc === placeholder || 
                               (newSrc && (newSrc.includes('data:') || newSrc.includes('/placeholder.png')));
      
      if (newSrc && newSrc !== imageSrc && !isPlaceholderUrl) {
        setImageSrc(placeholder); // 先显示占位符
        setIsLoaded(false);
        setHasError(false);
        setWebPUrl(null); // 重置WebP URL
        // 使用 setTimeout 确保状态更新后再设置新URL
        const timer = setTimeout(() => {
          setImageSrc(newSrc);
        }, 10);
        return () => clearTimeout(timer);
      } else if (isPlaceholderUrl) {
        // 如果回退到了 placeholder，停止加载
        console.log('[MobileLazyImage] 回退到 placeholder，停止加载', {
          displayPurpose,
          fallbackIndex,
          newSrc,
          timestamp: new Date().toISOString(),
        });
        setHasError(true);
        setImageSrc(placeholder);
        setIsLoaded(false);
        return;
      }
    }
  }, [fallbackIndex, fallbackChain, imageSrc, placeholder, displayPurpose]);

  const handleError = () => {
    const failedUrl = fallbackChain[fallbackIndex];
    console.warn('[MobileLazyImage] 图片加载失败，尝试回退', {
      displayPurpose,
      failedUrl,
      fallbackIndex,
      totalFallbacks: fallbackChain.length,
      hasVariants: !!variants,
      nextFallback: fallbackIndex < fallbackChain.length - 1 ? fallbackChain[fallbackIndex + 1] : null
    });
    
    // 如果没有 variants（只有原图），原图加载失败时直接停止，不尝试 fallback 或 placeholder
    if (!variants || !displayPurpose) {
      console.error('[MobileLazyImage] 原图加载失败且无variants，停止加载', {
        displayPurpose,
        originalSrc: src
      });
      setHasError(true);
      onError?.();
      return;
    }
    
    // 实现回退策略：如果当前URL加载失败，尝试下一个回退URL
    if (fallbackIndex < fallbackChain.length - 1) {
      // 还有可用的回退URL，尝试下一个
      const nextIndex = fallbackIndex + 1;
      const nextUrl = fallbackChain[nextIndex];
      
      // 检查下一个 URL 是否是 placeholder（data URL 或 placeholder）
      const isPlaceholderUrl = nextUrl === placeholder || 
                               (nextUrl && (nextUrl.includes('data:') || nextUrl.includes('/placeholder.png')));
      
      if (isPlaceholderUrl) {
        // 如果下一个 URL 是 placeholder，停止加载
        console.log('[MobileLazyImage] 回退到 placeholder，停止加载', {
          displayPurpose,
          nextIndex,
          nextUrl,
          timestamp: new Date().toISOString(),
        });
        setHasError(true);
        onError?.();
        return;
      }
      
      console.log('[MobileLazyImage] 回退到下一个URL', {
        displayPurpose,
        nextIndex,
        nextUrl,
        timestamp: new Date().toISOString(),
      });
      setFallbackIndex(nextIndex);
    } else {
      // 所有回退URL都失败了，显示错误状态
      console.error('[MobileLazyImage] 所有回退URL都失败', {
        displayPurpose,
        fallbackChain,
        originalSrc: src
      });
      setHasError(true);
      onError?.();
    }
  };

  // Phase 5: 构建最终的图片属性
  const finalSrc = webPUrl || imageSrc;
  const finalSrcSet = enableResponsive && srcSet ? srcSet : undefined;
  const finalSizes = enableResponsive && sizes ? sizes : undefined;

  return (
    <img
      ref={imgRef}
      src={finalSrc}
      srcSet={finalSrcSet}
      sizes={finalSizes}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
});

MobileLazyImage.displayName = 'MobileLazyImage';
