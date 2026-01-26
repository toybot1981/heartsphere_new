/**
 * 角色头像组件
 * 提取ChatWindow的角色头像渲染逻辑
 */

import React, { memo, useState } from 'react';
import { Character } from '../../types';
import { LazyImage } from '../LazyImage';
import type { ImageVariants } from '../../utils/imageResolution';

interface CharacterAvatarProps {
  character: Character;
  isStoryMode?: boolean;
  isCinematic?: boolean;
  size?: 'small' | 'medium' | 'large';
  avatarVariants?: ImageVariants; // 可选的头像多分辨率版本
}

/**
 * 角色头像组件
 * 使用memo优化，避免不必要的重渲染
 */
export const CharacterAvatar = memo<CharacterAvatarProps>(({
  character,
  isStoryMode = false,
  isCinematic = false,
  size = 'medium',
  avatarVariants,
}) => {
  const [loaded, setLoaded] = useState(false);

  // 小尺寸头像（用于头部栏）- 使用缩略图
  if (size === 'small') {
    return (
      <div 
        className="relative w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
        style={{
          borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.2))',
        }}
      >
        <LazyImage
          src={character.avatarUrl}
          alt={character.name}
          variants={avatarVariants}
          purpose="thumbnail"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 大尺寸头像（用于影院模式）- 使用中等质量图
  if (size === 'large' && isCinematic) {
    return (
      <div className="relative w-64 h-64 max-w-[80vw] max-h-[80vw] flex items-center justify-center">
        <LazyImage
          src={character.avatarUrl}
          alt={character.name}
          variants={avatarVariants}
          purpose="detail"
          className="w-full h-full object-contain"
          style={{
            filter: 'drop-shadow(0 0 30px var(--shadow-color-overlay, rgba(255, 255, 255, 0.3)))',
          }}
        />
      </div>
    );
  }

  // 中等尺寸（用于背景显示，非影院模式）
  if (isStoryMode || isCinematic) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex items-start justify-center pointer-events-none z-10" 
      style={{ 
        top: '0',
        paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="relative h-[560px] w-[560px] max-w-[80vw] max-h-[80vh] flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-8 rounded-full blur-3xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle, ${character.colorAccent}33 0%, transparent 70%)`,
            opacity: loaded ? 0.08 : 0.04,
          }}
        />
        <LazyImage
          src={character.avatarUrl}
          alt={character.name}
          variants={avatarVariants}
          purpose="detail"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-contain transition-opacity duration-300 ${
            loaded ? 'opacity-20' : 'opacity-0'
          }`}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15)) grayscale(40%) brightness(1.15) contrast(0.9)',
            mixBlendMode: 'soft-light',
          }}
        />
        {!loaded && (
          <div 
            className="absolute inset-0 animate-pulse rounded-full"
            style={{ backgroundColor: 'var(--bg-secondary, rgba(31, 41, 55, 0.15))' }}
          />
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.character.id === nextProps.character.id &&
    prevProps.character.avatarUrl === nextProps.character.avatarUrl &&
    prevProps.isStoryMode === nextProps.isStoryMode &&
    prevProps.isCinematic === nextProps.isCinematic
  );
});

CharacterAvatar.displayName = 'CharacterAvatar';
