import React, { useMemo } from 'react';
import type { QuickConnectCharacter } from '../../services/api/quickconnect/types';
import { CharacterCard } from './CharacterCard';
import { useVirtualScroll } from './useVirtualScroll';

interface VirtualizedCharacterGridProps {
  characters: QuickConnectCharacter[];
  viewMode?: 'grid' | 'list' | 'compact';
  onSelectCharacter: (character: QuickConnectCharacter) => void;
  onToggleFavorite: (character: QuickConnectCharacter) => void;
  searchQuery?: string;
  containerHeight?: number;
}

/**
 * 虚拟化E-SOUL网格布局组件
 * 用于优化大量卡片的渲染性能
 */
export const VirtualizedCharacterGrid: React.FC<VirtualizedCharacterGridProps> = ({
  characters,
  viewMode = 'grid',
  onSelectCharacter,
  onToggleFavorite,
  searchQuery = '',
  containerHeight = 600,
}) => {
  // 根据视图模式计算项目高度
  const itemHeight = useMemo(() => {
    switch (viewMode) {
      case 'grid':
        return 280; // 卡片高度 + 间距
      case 'list':
        return 80;
      case 'compact':
        return 220;
      default:
        return 280;
    }
  }, [viewMode]);
  
  // 计算每行项目数
  const itemsPerRow = useMemo(() => {
    if (viewMode === 'list') return 1;
    // 根据容器宽度计算（假设卡片宽度200px，间距16px）
    return Math.floor((window.innerWidth - 48) / 216) || 1;
  }, [viewMode]);
  
  // 计算实际项目高度（考虑多列布局）
  const actualItemHeight = viewMode === 'grid' ? itemHeight * itemsPerRow : itemHeight;
  
  const {
    containerRef,
    visibleItems,
    startIndex,
    totalHeight,
    offsetY,
    handleScroll,
  } = useVirtualScroll(characters, {
    itemHeight: actualItemHeight,
    containerHeight,
    overscan: 2,
  });
  
  // 将可见项目按行分组（仅网格模式需要）
  const visibleRows = useMemo(() => {
    if (viewMode !== 'grid') {
      return visibleItems.map((character, index) => ({
        characters: [character],
        rowIndex: startIndex + index,
      }));
    }
    
    const rows: Array<{ characters: QuickConnectCharacter[]; rowIndex: number }> = [];
    for (let i = 0; i < visibleItems.length; i += itemsPerRow) {
      rows.push({
        characters: visibleItems.slice(i, i + itemsPerRow),
        rowIndex: Math.floor((startIndex + i) / itemsPerRow),
      });
    }
    return rows;
  }, [visibleItems, startIndex, viewMode, itemsPerRow]);
  
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
  
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-y-auto"
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
              {visibleRows.map((row, rowIdx) => (
                <React.Fragment key={row.rowIndex}>
                  {row.characters.map((character, colIdx) => (
                    <CharacterCard
                      key={character.characterId}
                      character={character}
                      onSelect={() => onSelectCharacter(character)}
                      onToggleFavorite={() => onToggleFavorite(character)}
                      viewMode={viewMode}
                      index={row.rowIndex * itemsPerRow + colIdx}
                      searchQuery={searchQuery}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="space-y-2 px-4">
              {visibleItems.map((character, index) => (
                <CharacterCard
                  key={character.characterId}
                  character={character}
                  onSelect={() => onSelectCharacter(character)}
                  onToggleFavorite={() => onToggleFavorite(character)}
                  viewMode={viewMode}
                  index={startIndex + index}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



