/**
 * 角色头像组件
 * 提取ChatWindow的角色头像渲染逻辑
 */

import React, { memo, useState } from 'react';
import { Character } from '../../types';

interface CharacterAvatarProps {
  character: Character;
  isStoryMode: boolean;
  isCinematic: boolean;
}

/**
 * 角色头像组件
 * 使用memo优化，避免不必要的重渲染
 */
export const CharacterAvatar = memo<CharacterAvatarProps>(({
  character,
  isStoryMode,
  isCinematic,
}) => {
  const [loaded, setLoaded] = useState(false);

  if (isStoryMode || isCinematic) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className="relative h-[85vh] w-[85vh] max-w-full flex items-end justify-center pb-10">
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
