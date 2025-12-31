import React from 'react';
import type { QuickConnectCharacter } from '../../services/api/quickconnect/types';
import { CharacterCard } from './CharacterCard';

interface CharacterGridProps {
  characters: QuickConnectCharacter[];
  viewMode?: 'grid' | 'list' | 'compact';
  onSelectCharacter: (character: QuickConnectCharacter) => void;
  onToggleFavorite: (character: QuickConnectCharacter) => void;
  isLoading?: boolean;
  searchQuery?: string;  // 搜索关键词（用于高亮）
}

/**
 * E-SOUL网格布局组件
 */
export const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  viewMode = 'grid',
  onSelectCharacter,
  onToggleFavorite,
  isLoading = false,
  searchQuery = '',
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg">没有找到 E-SOUL</p>
      </div>
    );
  }
  
  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {characters.map((character, index) => (
          <CharacterCard
            key={character.characterId}
            character={character}
            onSelect={() => onSelectCharacter(character)}
            onToggleFavorite={() => onToggleFavorite(character)}
            viewMode={viewMode}
            index={index}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {characters.map((character, index) => (
        <CharacterCard
          key={character.characterId}
          character={character}
          onSelect={() => onSelectCharacter(character)}
          onToggleFavorite={() => onToggleFavorite(character)}
          viewMode={viewMode}
          index={index}
        />
      ))}
    </div>
  );
};

