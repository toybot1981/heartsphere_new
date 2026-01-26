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
  useAvatarAsBackground?: boolean; // 是否使用头像作为背景
  avatarVariants?: ImageVariants; // 可选的头像多分辨率版本
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
  useAvatarAsBackground = true, // 默认使用头像作为背景
  avatarVariants,
}) => {
  // 根据设备类型和场景选择合适的分辨率
  const isMobile = isMobileDevice();
  
  // 如果使用头像作为背景，使用角色头像
  const imageToUse = useAvatarAsBackground ? character.avatarUrl : backgroundImage;
  const variantsToUse = useAvatarAsBackground ? avatarVariants : backgroundVariants;
  
  // 构建回退链：PC端 highQuality → src，移动端 medium → src
  const fallbackChain = React.useMemo(() => {
    if (!imageToUse || !variantsToUse) {
      return imageToUse ? [imageToUse] : [];
    }
    
    const chain: string[] = [];
    if (!isMobile) {
      // PC端：highQuality → src
      if (variantsToUse.highQuality) {
        chain.push(variantsToUse.highQuality);
      }
    } else {
      // 移动端：medium → src
      if (variantsToUse.medium) {
        chain.push(variantsToUse.medium);
      }
    }
    // 原图始终在回退链中
    chain.push(imageToUse);
    
    return chain.filter(url => url && url.trim());
  }, [imageToUse, variantsToUse, isMobile]);
  
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
  
  // 当 imageToUse 或 variants 变化时，重置回退索引
  useEffect(() => {
    setCurrentIndex(0);
  }, [imageToUse, variantsToUse]);

  // 如果使用头像作为背景，使用不同的滤镜效果
  const filterStyle = useAvatarAsBackground
    ? isCinematic
      ? 'brightness(0.7) saturate(1.1)' // 沉浸模式：稍暗，保持饱和度
      : 'brightness(0.6) saturate(1.2) blur(2px)' // 正常模式：更暗，增强饱和度，轻微模糊
    : isCinematic
    ? 'brightness(0.9)'
    : isStoryMode
    ? 'blur(0px) brightness(0.6)'
    : 'blur(4px) opacity(0.6)';

  return (
    <>
      <div
        className="absolute inset-0 z-0 transition-all duration-1000"
        style={{
          backgroundImage: bgLoaded && currentImageUrl ? `url(${currentImageUrl})` : 'none',
          backgroundSize: useAvatarAsBackground ? 'cover' : 'cover',
          backgroundPosition: useAvatarAsBackground ? 'center center' : 'center',
          backgroundRepeat: 'no-repeat',
          filter: filterStyle,
          zIndex: 0,
        }}
      >
        {!bgLoaded && !bgError && currentImageUrl && (
          <div 
            className="absolute inset-0 animate-pulse"
            style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}
          />
        )}
      </div>
      {/* 添加遮罩层，确保文字清晰可见 */}
      {useAvatarAsBackground && (
        <div
          className="absolute inset-0 z-[1] transition-all duration-1000"
          style={{
            background: isCinematic
              ? 'linear-gradient(to top, var(--bg-primary, #000000) 0%, transparent 30%, transparent 70%, var(--bg-primary, #000000) 100%)'
              : 'linear-gradient(to top, var(--bg-primary, #000000) 0%, rgba(0, 0, 0, 0.3) 20%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.3) 80%, var(--bg-primary, #000000) 100%)',
            zIndex: 1,
          }}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.backgroundImage === nextProps.backgroundImage &&
    prevProps.character.id === nextProps.character.id &&
    prevProps.character.avatarUrl === nextProps.character.avatarUrl &&
    prevProps.isStoryMode === nextProps.isStoryMode &&
    prevProps.isCinematic === nextProps.isCinematic &&
    prevProps.useAvatarAsBackground === nextProps.useAvatarAsBackground
  );
});

BackgroundLayer.displayName = 'BackgroundLayer';
