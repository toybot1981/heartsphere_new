import React, { useMemo } from 'react';
import { useQuickConnect } from '../../hooks/useQuickConnect';
import { SearchBox } from './SearchBox';
import { FilterTabs } from './FilterTabs';
import { CharacterGrid } from './CharacterGrid';
import { VirtualizedCharacterGrid } from './VirtualizedCharacterGrid';
import { useResponsive } from './useResponsive';
import { EmptyState } from './EmptyState';
import { QuickConnectErrorBoundary } from './ErrorBoundary';
import { SharedHeartSphereSection } from './SharedHeartSphereSection';

interface QuickConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (characterId: number) => void;
}

/**
 * 快速连接主界面组件
 */
export const QuickConnectModal: React.FC<QuickConnectModalProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
}) => {
  const {
    filteredCharacters,
    searchQuery,
    filterType,
    sortBy,
    selectedSceneIds,
    isLoading,
    isSearching,
    viewMode,
    error,
    totalCount,
    favoriteCount,
    recentCount,
    setSearchQuery,
    setFilter,
    setSortBy,
    toggleFavorite,
    setViewMode,
    setSelectedSceneIds,
  } = useQuickConnect();
  
  // 响应式检测
  const { isMobile, isTablet } = useResponsive();
  
  // 根据设备类型调整视图模式
  const effectiveViewMode = useMemo(() => {
    if (isMobile) {
      return 'list'; // 移动端默认使用列表视图
    }
    return viewMode;
  }, [isMobile, viewMode]);
  
  // 是否使用虚拟滚动（超过50个卡片时）
  const useVirtualScroll = filteredCharacters.length > 50;
  
  if (!isOpen) return null;
  
  const handleSelectCharacter = (character: any) => {
    onSelectCharacter(character.characterId);
    onClose();
  };
  
  // 响应式样式
  const modalClasses = isMobile
    ? 'fixed inset-0 z-50 bg-gray-900 flex flex-col'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm';
  
  const contentClasses = isMobile
    ? 'relative w-full h-full bg-gray-900 flex flex-col'
    : 'relative w-full max-w-5xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col';
  
  return (
    <QuickConnectErrorBoundary>
      <div
        className={modalClasses}
        onClick={onClose}
      >
        <div
          className={contentClasses}
          onClick={(e) => e.stopPropagation()}
        >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">快速连接 E-SOUL</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 共享心域展示区域 */}
        <div className="p-6 border-b border-white/10">
          <SharedHeartSphereSection />
        </div>
        
        {/* 搜索和筛选区域 */}
        <div className="p-6 space-y-4 border-b border-white/10">
          {/* 搜索框 */}
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索 E-SOUL..."
          />
          
          {/* 筛选标签 */}
          <div className="flex items-center justify-between">
            <FilterTabs
              activeFilter={filterType}
              onFilterChange={setFilter}
              counts={{
                all: totalCount,
                favorite: favoriteCount,
                recent: recentCount,
              }}
              selectedSceneIds={selectedSceneIds}
              onSceneChange={setSelectedSceneIds}
            />
            
            {/* 排序和视图切换（移动端隐藏） */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 text-sm"
                >
                  <option value="frequency">按频率</option>
                  <option value="recent">按最近</option>
                  <option value="name">按名称</option>
                  <option value="favorite">收藏优先</option>
                </select>
                
                <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}
          
          {/* E-SOUL列表 */}
          {isLoading || isSearching ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCharacters.length === 0 ? (
            <EmptyState
              message={searchQuery ? `没有找到包含"${searchQuery}"的 E-SOUL` : '没有找到 E-SOUL'}
            />
          ) : useVirtualScroll ? (
            <VirtualizedCharacterGrid
              characters={filteredCharacters}
              viewMode={effectiveViewMode}
              onSelectCharacter={handleSelectCharacter}
              onToggleFavorite={toggleFavorite}
              searchQuery={searchQuery}
              containerHeight={isMobile ? window.innerHeight - 300 : 600}
            />
          ) : (
            <CharacterGrid
              characters={filteredCharacters}
              viewMode={effectiveViewMode}
              onSelectCharacter={handleSelectCharacter}
              onToggleFavorite={toggleFavorite}
              isLoading={false}
              searchQuery={searchQuery}
            />
          )}
        </div>
        
        {/* 底部统计信息 */}
        <div className="p-4 border-t border-white/10 bg-gray-800/50">
          <p className="text-sm text-gray-400 text-center">
            共找到 {totalCount} 个 E-SOUL
            {favoriteCount > 0 && ` · 收藏 ${favoriteCount} 个`}
            {recentCount > 0 && ` · 最近访问 ${recentCount} 个`}
          </p>
        </div>
      </div>
    </QuickConnectErrorBoundary>
  );
};

