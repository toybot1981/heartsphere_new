/**
 * 角色头像组件
 * 提取ChatWindow的角色头像渲染逻辑
 */

import React, { memo, useState } from 'react';
import { Character } from '../../types';

interface CharacterAvatarProps {
  character: Character;
  isStoryMode?: boolean;
  isCinematic?: boolean;
  size?: 'small' | 'medium' | 'large';
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
}) => {
  const [loaded, setLoaded] = useState(false);

  // 小尺寸头像（用于头部栏）
  if (size === 'small') {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
        <img
          src={character.avatarUrl}
          alt={character.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 大尺寸头像（用于影院模式）
  if (size === 'large' && isCinematic) {
    return (
      <div className="relative w-64 h-64 max-w-[80vw] max-h-[80vw] flex items-center justify-center">
        <img
          src={character.avatarUrl}
          alt={character.name}
          loading="lazy"
          className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
        />
      </div>
    );
  }

  // 中等尺寸（用于背景显示，非影院模式）
  if (isStoryMode || isCinematic) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ top: '80px' }}>
      <div className="relative h-[60vh] w-[60vh] max-w-[90vw] flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-40 rounded-full blur-3xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle, ${character.colorAccent}66 0%, transparent 70%)`,
            opacity: loaded ? 0.4 : 0.2,
          }}
        />
        <img
          src={character.avatarUrl}
          alt={character.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ maxHeight: '100%', maxWidth: '100%' }}
        />
        {!loaded && (
          <div className="absolute inset-0 bg-gray-800/50 animate-pulse rounded-full" />
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
