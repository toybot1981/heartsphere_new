import React, { useState, memo } from 'react';
import type { QuickConnectCharacter } from '../../services/api/quickconnect/types';
import { StarParticles } from './StarParticles';
import { HighlightText } from './HighlightText';

interface CharacterCardProps {
  character: QuickConnectCharacter;
  onSelect: () => void;
  onToggleFavorite: () => void;
  viewMode?: 'grid' | 'list' | 'compact';
  index?: number;  // 用于入场动画延迟
  searchQuery?: string;  // 搜索关键词（用于高亮）
}

/**
 * E-SOUL卡片组件
 * 使用memo优化性能，避免不必要的重渲染
 */
export const CharacterCard: React.FC<CharacterCardProps> = memo(({
  character,
  onSelect,
  onToggleFavorite,
  viewMode = 'grid',
  index = 0,
  searchQuery = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavoriteAnimating, setIsFavoriteAnimating] = useState(false);
  
  // 格式化最后访问时间
  const formatLastAccessTime = (timestamp?: number): string => {
    if (!timestamp) return '从未访问';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString();
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavoriteAnimating(true);
    onToggleFavorite();
    setTimeout(() => setIsFavoriteAnimating(false), 400);
  };
  
  // 卡片样式类
  const cardClasses = `
    relative rounded-lg border transition-all duration-300 cursor-pointer
    ${viewMode === 'grid' ? 'w-[140px] h-[180px]' : viewMode === 'compact' ? 'w-[120px] h-[160px]' : 'w-full h-16'}
    ${isHovered ? 'scale-105 -translate-y-1 shadow-xl' : 'scale-100'}
    ${character.isFavorite ? 'border-2 border-yellow-400' : 'border border-white/20'}
    ${character.isFavorite ? 'bg-yellow-400/25' : 'bg-white/10'}
  `;
  
  const cardStyle: React.CSSProperties = {
    '--delay': `${index * 50}ms`,
    '--theme-color': character.themeColor || '#3b82f6',
    '--accent-color': character.colorAccent || '#60a5fa',
    animationDelay: `${index * 50}ms`,
  } as React.CSSProperties;
  
  if (viewMode === 'list') {
    return (
      <div
        className="flex items-center gap-4 p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={character.avatarUrl}
          alt={character.characterName}
          className="w-16 h-16 rounded-full border-2"
          style={{ borderColor: character.themeColor }}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            <HighlightText text={character.characterName} highlight={searchQuery} />
          </h3>
          <p className="text-sm text-gray-400">
            <HighlightText text={character.sceneName} highlight={searchQuery} />
          </p>
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`p-2 rounded-full transition-all ${
            character.isFavorite ? 'text-yellow-400' : 'text-gray-400'
          } ${isFavoriteAnimating ? 'animate-spin scale-150' : ''}`}
        >
          <svg className="w-6 h-6" fill={character.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>
    );
  }
  
  return (
    <div
      className={cardClasses}
      style={cardStyle}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 星光粒子效果 */}
      <StarParticles
        count={character.isFavorite ? 8 : 5}
        intensity={character.isFavorite ? 1.5 : 1}
        color={character.colorAccent || '#60a5fa'}
      />
      
      {/* 头像区域 */}
      <div className="relative w-full h-20 flex items-center justify-center mb-1.5">
        <img
          src={character.avatarUrl}
          alt={character.characterName}
          className="w-14 h-14 rounded-full border-2 object-cover"
          style={{ borderColor: character.themeColor }}
        />
        {character.isOnline && (
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
        )}
      </div>
      
      {/* 内容区域 */}
      <div className="px-2 pb-2">
        <h3 className="text-sm font-semibold text-white mb-0.5 truncate">
          <HighlightText text={character.characterName} highlight={searchQuery} />
        </h3>
        <p className="text-xs text-gray-400 mb-1 truncate">
          <HighlightText text={character.sceneName} highlight={searchQuery} />
        </p>
        
        {/* 状态信息 */}
        <div className="text-[10px] text-gray-500">
          <div>{formatLastAccessTime(character.lastAccessTime)}</div>
          {character.accessCount > 5 && (
            <div>访问 {character.accessCount} 次</div>
          )}
        </div>
      </div>
      
      {/* 收藏按钮 */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-1.5 right-1.5 p-1 rounded-full transition-all ${
          character.isFavorite ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 bg-black/20'
        } ${isFavoriteAnimating ? 'animate-spin scale-150' : 'hover:scale-110'}`}
      >
        <svg className="w-4 h-4" fill={character.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>
      
      {/* 悬停预览 */}
      {isHovered && character.bio && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/90 rounded-b-lg text-[10px] text-gray-300">
          <p className="line-clamp-2">{character.bio}</p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，返回true表示props相等（不需要重渲染），false表示需要重渲染
  return (
    prevProps.character.characterId === nextProps.character.characterId &&
    prevProps.character.isFavorite === nextProps.character.isFavorite &&
    prevProps.character.lastAccessTime === nextProps.character.lastAccessTime &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.character.characterName === nextProps.character.characterName &&
    prevProps.character.sceneName === nextProps.character.sceneName
  );
});

