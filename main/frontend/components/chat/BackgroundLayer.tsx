/**
 * 背景层组件
 * 提取ChatWindow的背景层逻辑
 */

import React, { memo, useState, useEffect } from 'react';
import { Character } from '../../types';
import { useImagePreload } from './hooks/useImagePreload';
import { selectImageResolution, isMobileDevice } from '../../utils/imageResolution';
import type { ImageVariants } from '../../utils/imageResolution';

interface BackgroundLayerProps {
  backgroundImage: string | null;
  character: Character;
  isStoryMode: boolean;
  isCinematic: boolean;
  backgroundVariants?: ImageVariants; // 可选的背景多分辨率版本
}

/**
 * 背景层组件
 * 使用memo优化，避免不必要的重渲染
 * 支持图片加载失败时回退到原图
 */
export const BackgroundLayer = memo<BackgroundLayerProps>(({
  backgroundImage,
  character,
  isStoryMode,
  isCinematic,
  backgroundVariants,
}) => {
  // 根据设备类型和场景选择合适的分辨率
  const isMobile = isMobileDevice();
  
  // 构建回退链：PC端 highQuality → src，移动端 medium → src
  const fallbackChain = React.useMemo(() => {
    if (!backgroundImage || !backgroundVariants) {
      return backgroundImage ? [backgroundImage] : [];
    }
    
    const chain: string[] = [];
    if (!isMobile) {
      // PC端：highQuality → src
      if (backgroundVariants.highQuality) {
        chain.push(backgroundVariants.highQuality);
      }
    } else {
      // 移动端：medium → src
      if (backgroundVariants.medium) {
        chain.push(backgroundVariants.medium);
      }
    }
    // 原图始终在回退链中
    chain.push(backgroundImage);
    
    return chain.filter(url => url && url.trim());
  }, [backgroundImage, backgroundVariants, isMobile]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImageUrl = fallbackChain[currentIndex] || null;
  
  const { loaded: bgLoaded, error: bgError } = useImagePreload(currentImageUrl);
  
  // 当图片加载失败时，回退到下一个URL
  useEffect(() => {
    if (bgError && currentIndex < fallbackChain.length - 1) {
      console.log('[BackgroundLayer] 图片加载失败，回退到下一个URL', {
        failedUrl: currentImageUrl,
        nextIndex: currentIndex + 1,
        nextUrl: fallbackChain[currentIndex + 1],
        isOriginal: fallbackChain[currentIndex + 1] === backgroundImage,
        timestamp: new Date().toISOString(),
      });
      setCurrentIndex(currentIndex + 1);
    }
  }, [bgError, currentIndex, fallbackChain, currentImageUrl, backgroundImage]);
  
  // 当 backgroundImage 或 variants 变化时，重置回退索引
  useEffect(() => {
    setCurrentIndex(0);
  }, [backgroundImage, backgroundVariants]);

  const filterStyle = isCinematic
    ? 'brightness(0.9)'
    : isStoryMode
    ? 'blur(0px) brightness(0.6)'
    : 'blur(4px) opacity(0.6)';

  return (
    <div
      className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
      style={{
        backgroundImage: bgLoaded && currentImageUrl ? `url(${currentImageUrl})` : 'none',
        filter: filterStyle,
        zIndex: 0,
      }}
    >
      {!bgLoaded && !bgError && currentImageUrl && (
        <div className="absolute inset-0 bg-gray-900 animate-pulse" />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.backgroundImage === nextProps.backgroundImage &&
    prevProps.character.id === nextProps.character.id &&
    prevProps.isStoryMode === nextProps.isStoryMode &&
    prevProps.isCinematic === nextProps.isCinematic
  );
});

BackgroundLayer.displayName = 'BackgroundLayer';
