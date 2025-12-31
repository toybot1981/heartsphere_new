import React, { useMemo, useEffect } from 'react';
import { useQuickConnect } from '../../hooks/useQuickConnect';
import { useSharedMode } from '../../hooks/useSharedMode';
import { SearchBox } from './SearchBox';
import { FilterTabs } from './FilterTabs';
import { CharacterGrid } from './CharacterGrid';
import { VirtualizedCharacterGrid } from './VirtualizedCharacterGrid';
import { useResponsive } from './useResponsive';
import { EmptyState } from './EmptyState';
import { QuickConnectErrorBoundary } from './ErrorBoundary';
import { SharedHeartSphereSection } from './SharedHeartSphereSection';
import type { ShareConfig } from '../../services/api/heartconnect/types';

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
  const { leaveSharedMode, isActive: isSharedMode, enterSharedMode, visitorId: currentVisitorId } = useSharedMode();
  const [selectedShareCode, setSelectedShareCode] = React.useState<string | null>(null);
  const [selectedSharedHeartSphere, setSelectedSharedHeartSphere] = React.useState<any>(null);
  
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
    loadCharacters,
    clearCache,
  } = useQuickConnect();
  
  // 当打开快速连接时，检查共享模式状态
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    
    console.log('[QuickConnectModal] 模态框已打开，检查共享模式状态');
    console.log('[QuickConnectModal] isSharedMode:', isSharedMode);
    
    try {
      // 如果已经在共享模式下，保持状态并加载角色
      if (isSharedMode) {
        console.log('[QuickConnectModal] 已在共享模式下，加载角色');
        loadCharacters();
      } else {
        // 不在共享模式下，清除可能存在的旧状态
        console.log('[QuickConnectModal] 不在共享模式下，清除旧状态');
        leaveSharedMode();
        // 重置选中状态
        setSelectedShareCode(null);
        setSelectedSharedHeartSphere(null);
      }
    } catch (error) {
      console.error('[QuickConnectModal] useEffect 中发生错误:', error);
    }
    // 只在 isOpen 变化时执行，避免循环依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  
  
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
  
  console.log('[QuickConnectModal] 渲染，isOpen:', isOpen);
  
  return (
    <QuickConnectErrorBoundary>
      <div
        className={modalClasses}
        onClick={(e) => {
          // 只有点击背景区域（不是内容区域）才关闭
          if (e.target === e.currentTarget) {
            console.log('[QuickConnectModal] 点击背景，关闭模态框');
            onClose();
          }
        }}
      >
        <div
          className={contentClasses}
          onClick={(e) => {
            e.stopPropagation();
            console.log('[QuickConnectModal] 点击内容区域，阻止冒泡');
          }}
        >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">查看共享心域</h2>
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
        <div className="p-6 pb-4 border-b border-white/10">
          <SharedHeartSphereSection 
            selectedShareCode={selectedShareCode}
            onSelectHeartSphere={async (shareCode, sharedHeartSphere) => {
              console.log('[QuickConnectModal] onSelectHeartSphere 被调用:', shareCode, sharedHeartSphere);
              setSelectedShareCode(shareCode);
              setSelectedSharedHeartSphere(sharedHeartSphere);
              
              // 清除缓存，确保重新加载
              clearCache();
              
              // 进入共享模式以加载对应的角色
              try {
                const { getToken } = await import('../../services/api/base/tokenStorage');
                
                const token = getToken();
                if (!token) {
                  console.error('[QuickConnectModal] 未找到token');
                  return;
                }
                
                // 直接从 sharedHeartSphere 对象构造 shareConfig，不需要调用 API
                const shareConfig: ShareConfig = {
                  id: sharedHeartSphere.shareConfigId,
                  userId: sharedHeartSphere.ownerId,
                  shareCode: sharedHeartSphere.shareCode,
                  shareType: sharedHeartSphere.shareType,
                  shareStatus: 'active', // 默认值，因为能显示说明是 active
                  accessPermission: sharedHeartSphere.accessPermission,
                  description: sharedHeartSphere.description,
                  coverImageUrl: sharedHeartSphere.coverImageUrl,
                  viewCount: sharedHeartSphere.viewCount,
                  requestCount: sharedHeartSphere.requestCount,
                  approvedCount: sharedHeartSphere.approvedCount,
                  createdAt: 0, // 这些字段在切换时不需要
                  updatedAt: 0,
                  worldCount: sharedHeartSphere.worldCount,
                  eraCount: sharedHeartSphere.eraCount,
                  characterCount: sharedHeartSphere.characterCount,
                };
                
                console.log('[QuickConnectModal] 构造的 shareConfig:', shareConfig);
                
                // 尝试从 useSharedMode hook 中获取 visitorId（如果已经在共享模式下）
                let visitorId: number | null = currentVisitorId;
                
                // 如果还是没有 visitorId，调用 API 获取
                if (!visitorId) {
                  const { authApi } = await import('../../services/api');
                  const currentUser = await authApi.getCurrentUser(token);
                  if (currentUser && currentUser.id) {
                    visitorId = currentUser.id;
                    console.log('[QuickConnectModal] 从 API 获取到 visitorId:', visitorId);
                  } else {
                    console.error('[QuickConnectModal] 无法获取用户ID');
                    return;
                  }
                } else {
                  console.log('[QuickConnectModal] 使用已有的 visitorId:', visitorId);
                }
                
                // 更新 React 状态
                console.log('[QuickConnectModal] 调用 enterSharedMode:', shareConfig.id, visitorId);
                enterSharedMode(shareConfig, visitorId);
                
                // 等待一下确保共享模式上下文已设置
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 加载对应共享心域的角色
                console.log('[QuickConnectModal] 开始加载角色...');
                await loadCharacters({ filter: 'all' });
                console.log('[QuickConnectModal] 角色加载完成');
              } catch (err) {
                console.error('[QuickConnectModal] 加载共享心域角色失败:', err);
              }
            }}
            onEnterSharedMode={onClose} // 传递关闭模态框的回调
          />
        </div>
        
        {/* 搜索和筛选区域 */}
        <div className="px-6 pt-4 pb-4 space-y-3 border-b border-white/10">
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
      </div>
    </QuickConnectErrorBoundary>
  );
};

