/**
 * 背景层组件
 * 提取ChatWindow的背景层逻辑
 */

import React, { memo } from 'react';
import { Character } from '../../types';
import { useImagePreload } from './hooks/useImagePreload';

interface BackgroundLayerProps {
  backgroundImage: string | null;
  character: Character;
  isStoryMode: boolean;
  isCinematic: boolean;
}

/**
 * 背景层组件
 * 使用memo优化，避免不必要的重渲染
 */
export const BackgroundLayer = memo<BackgroundLayerProps>(({
  backgroundImage,
  character,
  isStoryMode,
  isCinematic,
}) => {
  const { loaded: bgLoaded, error: bgError } = useImagePreload(backgroundImage);

  const filterStyle = isCinematic
    ? 'brightness(0.9)'
    : isStoryMode
    ? 'blur(0px) brightness(0.6)'
    : 'blur(4px) opacity(0.6)';

  return (
    <div
      className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
      style={{
        backgroundImage: bgLoaded && backgroundImage ? `url(${backgroundImage})` : 'none',
        filter: filterStyle,
      }}
    >
      {!bgLoaded && !bgError && backgroundImage && (
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
