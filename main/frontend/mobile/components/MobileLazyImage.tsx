/**
 * Mobile版本懒加载图片组件
 * Phase 5优化: 实现图片懒加载，减少初始加载时间
 * 支持WebP格式自动检测和转换
 * 支持响应式图片加载（srcset）
 */

import React, { useState, useEffect, useRef, memo } from 'react';
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
  const [webPUrl, setWebPUrl] = useState<string | null>(null);
  const [srcSet, setSrcSet] = useState<string>('');
  const [sizes, setSizes] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 优先使用多分辨率选择（如果提供了variants和displayPurpose）
  const baseSrc = variants && displayPurpose 
    ? selectImageResolution(src, variants, displayPurpose, true)
    : src;

  // Phase 5: 响应式图片配置
  useEffect(() => {
    if (enableResponsive && baseSrc && !baseSrc.includes('data:') && !baseSrc.includes('.svg')) {
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
    } else if (!enableResponsive) {
      // 如果不启用响应式，直接使用baseSrc
      setImageSrc(baseSrc);
    }
  }, [baseSrc, enableResponsive, purpose, displayWidth, displayHeight]);

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
      const finalSrc = webPUrl || imageSrc || baseSrc;
      if (finalSrc !== placeholder) {
        setImageSrc(finalSrc);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [baseSrc, imageSrc, webPUrl, placeholder]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // 如果WebP加载失败，回退到原始格式
    if (webPUrl && imageSrc === webPUrl) {
      setImageSrc(src);
      setHasError(false); // 重置错误状态，尝试加载原格式
      return;
    }
    
    setHasError(true);
    if (fallback) {
      setImageSrc(fallback);
    }
    onError?.();
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
