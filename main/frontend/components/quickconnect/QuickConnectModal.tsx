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
    
    
    try {
      // 如果已经在共享模式下，保持状态并加载角色
      if (isSharedMode) {
        loadCharacters();
      } else {
        // 不在共享模式下，清除可能存在的旧状态
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
    ? 'fixed inset-0 z-50 flex flex-col'
    : 'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm';
  
  const modalStyle: React.CSSProperties = isMobile
    ? { backgroundColor: 'var(--bg-card, #111827)' }
    : { backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.7))' };
  
  const contentClasses = isMobile
    ? 'relative w-full h-full flex flex-col'
    : 'relative w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col';
  
  const contentStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card, #111827)',
  };
  
  
  return (
    <QuickConnectErrorBoundary>
      <div
        className={modalClasses}
        style={modalStyle}
        onClick={(e) => {
          // 只有点击背景区域（不是内容区域）才关闭
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className={contentClasses}
          style={contentStyle}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))' }}
        >
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            查看共享心域
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 共享心域展示区域 */}
        <div 
          className="p-6 pb-4 border-b"
          style={{ borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))' }}
        >
          <SharedHeartSphereSection 
            selectedShareCode={selectedShareCode}
            onSelectHeartSphere={async (shareCode, sharedHeartSphere) => {
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
                
                
                // 尝试从 useSharedMode hook 中获取 visitorId（如果已经在共享模式下）
                let visitorId: number | null = currentVisitorId;
                
                // 如果还是没有 visitorId，调用 API 获取
                if (!visitorId) {
                  const { authApi } = await import('../../services/api');
                  const currentUser = await authApi.getCurrentUser(token);
                  if (currentUser && currentUser.id) {
                    visitorId = currentUser.id;
                  } else {
                    console.error('[QuickConnectModal] 无法获取用户ID');
                    return;
                  }
                } else {
                }
                
                // 更新 React 状态
                enterSharedMode(shareConfig, visitorId);
                
                // 等待一下确保共享模式上下文已设置
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 加载对应共享心域的角色
                await loadCharacters({ filter: 'all' });
              } catch (err) {
                console.error('[QuickConnectModal] 加载共享心域角色失败:', err);
              }
            }}
            onEnterSharedMode={onClose} // 传递关闭模态框的回调
          />
        </div>
        
        {/* 搜索和筛选区域 */}
        <div 
          className="px-6 pt-4 pb-4 space-y-3 border-b"
          style={{ borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))' }}
        >
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
                  className="px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                    borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="frequency">按频率</option>
                  <option value="recent">按最近</option>
                  <option value="name">按名称</option>
                  <option value="favorite">收藏优先</option>
                </select>
                
                <div 
                  className="flex items-center gap-1 rounded-lg p-1"
                  style={{ backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))' }}
                >
                  <button
                    onClick={() => setViewMode('grid')}
                    className="p-2 rounded transition-colors"
                    style={{
                      backgroundColor: viewMode === 'grid' ? 'var(--color-primary, #3b82f6)' : 'transparent',
                      color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    }}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'grid') {
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'grid') {
                        e.currentTarget.style.color = 'var(--text-tertiary)';
                      }
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-2 rounded transition-colors"
                    style={{
                      backgroundColor: viewMode === 'list' ? 'var(--color-primary, #3b82f6)' : 'transparent',
                      color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    }}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'list') {
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'list') {
                        e.currentTarget.style.color = 'var(--text-tertiary)';
                      }
                    }}
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
            <div 
              className="mb-4 p-4 border rounded-lg"
              style={{
                backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
                borderColor: 'var(--color-error, rgba(239, 68, 68, 0.5))',
                color: 'var(--color-error, #fca5a5)',
              }}
            >
              {error}
            </div>
          )}
          
          {/* E-SOUL列表 */}
          {isLoading || isSearching ? (
            <div className="flex items-center justify-center py-20">
              <div 
                className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-primary, #3b82f6)' }}
              />
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
        <div
          className="p-4 border-t"
          style={{
            borderColor: 'var(--border-color-overlay)',
            backgroundColor: 'var(--bg-primary-dark-alpha)',
          }}
        >
          <p
            className="text-sm text-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
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

