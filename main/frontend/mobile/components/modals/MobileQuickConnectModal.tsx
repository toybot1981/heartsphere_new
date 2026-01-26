/**
 * Mobile版本快速连接模态框组件
 * 参照PC版本的QuickConnectModal，但使用Mobile UI组件
 * 复用业务逻辑（useQuickConnect Hook），但UI独立
 */

import React, { useState, useEffect, useMemo, memo } from 'react';
import { useQuickConnect } from '../../../hooks/useQuickConnect';
import { useSharedMode } from '../../../hooks/useSharedMode';
import { heartConnectApi } from '../../../services/api/heartconnect';
import { getToken } from '../../../services/api/base/tokenStorage';
import { authApi } from '../../../services/api';
import type { ShareConfig, SharedHeartSphere } from '../../../services/api/heartconnect/types';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileSmoothScroll } from '../MobileSmoothScroll';
import { MobileLoadingSpinner } from '../MobileLoadingSpinner';
import { MobileEmptyState } from '../MobileEmptyState';
import { MobileLazyImage } from '../MobileLazyImage';
import { MobileErrorBoundary } from '../MobileErrorBoundary';

interface MobileQuickConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterSharedMode?: () => void; // 进入共享模式后的回调（用于导航到sharedHeartSphere页面）
  onSelectCharacter?: (character: any) => void; // 选择角色后的回调（传递完整的角色对象，用于导航到聊天窗口）
}

/**
 * Mobile版本快速连接模态框组件
 */
export const MobileQuickConnectModal: React.FC<MobileQuickConnectModalProps> = memo(({
  isOpen,
  onClose,
  onEnterSharedMode,
  onSelectCharacter,
}) => {
  const { leaveSharedMode, isActive: isSharedMode, enterSharedMode, visitorId: currentVisitorId } = useSharedMode();
  const [selectedShareCode, setSelectedShareCode] = useState<string | null>(null);
  const [selectedSharedHeartSphere, setSelectedSharedHeartSphere] = useState<SharedHeartSphere | null>(null);
  const [sharedHeartSpheres, setSharedHeartSpheres] = useState<SharedHeartSphere[]>([]);
  const [loadingSharedSpheres, setLoadingSharedSpheres] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    filteredCharacters,
    filterType,
    selectedSceneIds,
    isLoading,
    isSearching,
    error,
    totalCount,
    favoriteCount,
    recentCount,
    setSearchQuery: setQuickConnectSearchQuery,
    setFilter,
    setSelectedSceneIds,
    loadCharacters,
    clearCache,
  } = useQuickConnect();

  // 加载共享心域列表
  useEffect(() => {
    
    if (!isOpen) {
      return;
    }
    
    
    const loadSharedHeartSpheres = async () => {
      setLoadingSharedSpheres(true);
      
      try {
        const data = await heartConnectApi.getPublicSharedHeartSpheres();
        
        if (data && data.length > 0) {
          // 移动端最多显示3个，按随机选择
          const selectedData = data.length > 3 
            ? [...data].sort(() => Math.random() - 0.5).slice(0, 3)
            : data;
          setSharedHeartSpheres(selectedData);
          
          // 默认选中第一个
          if (selectedData.length > 0 && !selectedShareCode) {
            handleSelectHeartSphere(selectedData[0].shareCode, selectedData[0]);
          } else {
          }
        } else {
          setSharedHeartSpheres([]);
        }
      } catch (err: any) {
        console.error('[MobileQuickConnectModal] ❌ 加载共享心域失败:', err);
        console.error('[MobileQuickConnectModal] 错误详情:', err.message || err);
        console.error('[MobileQuickConnectModal] 错误堆栈:', err.stack);
        setSharedHeartSpheres([]);
      } finally {
        setLoadingSharedSpheres(false);
      }
    };
    
    loadSharedHeartSpheres();
  }, [isOpen]);

  // 当打开时，检查共享模式状态
  useEffect(() => {
    
    if (!isOpen) {
      return;
    }
    
    if (isSharedMode) {
      // 已在共享模式下，加载角色
      loadCharacters();
    } else {
      // 不在共享模式下，清除旧状态
      leaveSharedMode();
      setSelectedShareCode(null);
      setSelectedSharedHeartSphere(null);
    }
  }, [isOpen, isSharedMode]);

  // 选择共享心域
  const handleSelectHeartSphere = async (shareCode: string, sharedHeartSphere: SharedHeartSphere) => {
    
    setSelectedShareCode(shareCode);
    setSelectedSharedHeartSphere(sharedHeartSphere);
    
    // 清除缓存
    clearCache();
    
    // 进入共享模式
    try {
      const token = getToken();
      if (!token) {
        console.error('[MobileQuickConnectModal] ❌ 未找到token');
        return;
      }
      
      // 构造shareConfig
      const shareConfig: ShareConfig = {
        id: sharedHeartSphere.shareConfigId,
        userId: sharedHeartSphere.ownerId,
        shareCode: sharedHeartSphere.shareCode,
        shareType: sharedHeartSphere.shareType,
        shareStatus: 'active',
        accessPermission: sharedHeartSphere.accessPermission,
        description: sharedHeartSphere.description,
        coverImageUrl: sharedHeartSphere.coverImageUrl,
        viewCount: sharedHeartSphere.viewCount,
        requestCount: sharedHeartSphere.requestCount,
        approvedCount: sharedHeartSphere.approvedCount,
        createdAt: 0,
        updatedAt: 0,
        worldCount: sharedHeartSphere.worldCount,
        eraCount: sharedHeartSphere.eraCount,
        characterCount: sharedHeartSphere.characterCount,
      };
      
      // 获取visitorId
      let visitorId: number | null = currentVisitorId;
      if (!visitorId) {
        const currentUser = await authApi.getCurrentUser(token);
        if (currentUser && currentUser.id) {
          visitorId = currentUser.id;
        } else {
          console.error('[MobileQuickConnectModal] ❌ 无法获取用户ID');
          return;
        }
      } else {
      }
      
      // 进入共享模式
      enterSharedMode(shareConfig, visitorId);
      
      // 等待一下确保共享模式上下文已设置
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 加载角色
      await loadCharacters({ filter: 'all' });
    } catch (err: any) {
      console.error('[MobileQuickConnectModal] ❌ 进入共享模式失败:', err);
      console.error('[MobileQuickConnectModal] 错误详情:', err.message || err);
      console.error('[MobileQuickConnectModal] 错误堆栈:', err.stack);
    }
  };

  // 处理进入共享心域页面
  const handleEnterSharedHeartSphere = () => {
    if (onEnterSharedMode) {
      onEnterSharedMode();
    }
    onClose();
  };

  // 处理角色选择
  const handleSelectCharacter = (character: any) => {
    
    if (onSelectCharacter) {
      // 传递完整的角色对象，而不仅仅是ID
      try {
        onSelectCharacter(character);
        onClose();
      } catch (err: any) {
        console.error('[MobileQuickConnectModal] ❌ onSelectCharacter回调执行失败:', err);
        console.error('[MobileQuickConnectModal] 错误详情:', err.message || err);
        console.error('[MobileQuickConnectModal] 错误堆栈:', err.stack);
      }
    } else {
      console.error('[MobileQuickConnectModal] ❌ onSelectCharacter回调不存在！');
      console.error('[MobileQuickConnectModal] 无法处理角色选择');
    }
  };

  // 同步搜索查询
  useEffect(() => {
    setQuickConnectSearchQuery(searchQuery);
  }, [searchQuery, setQuickConnectSearchQuery]);

  // ESC键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // 组件渲染日志

  if (!isOpen) {
    return null;
  }
  

  return (
    <MobileErrorBoundary>
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          // 点击背景关闭
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="backdrop-blur-xl rounded-2xl shadow-2xl border max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
          style={{
            backgroundColor: 'var(--bg-overlay-alpha)',
            borderColor: 'var(--border-color-overlay)',
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            animationDuration: '200ms',
            animationTimingFunction: 'ease-out',
          }}
        >
          {/* 头部栏 */}
          <div className="flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-white/10">
            <h2 id="modal-title" className="text-xl font-bold text-white">心域连接</h2>
            <MobileTouchableButton
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white"
              aria-label="关闭"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </MobileTouchableButton>
          </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 共享心域选择区域 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌟</span>
                  <h3 className="text-lg font-bold text-white">发现共享心域</h3>
                </div>
                {loadingSharedSpheres && (
                  <div 
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{
                      borderColor: 'var(--color-primary)',
                    }} 
                    role="status"
                    aria-label="加载中"
                  />
                )}
              </div>

              {loadingSharedSpheres ? (
                <div className="flex justify-center py-8">
                  <MobileLoadingSpinner size="md" />
                </div>
              ) : sharedHeartSpheres.length === 0 ? (
                <MobileEmptyState
                  icon="🌟"
                  title="暂无共享心域"
                  description="当有用户分享心域时，会在这里显示"
                />
              ) : (
                <div className="space-y-3">
                  {sharedHeartSpheres.map((shared) => (
                    <div
                      key={shared.shareConfigId}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectHeartSphere(shared.shareCode, shared);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectHeartSphere(shared.shareCode, shared);
                        }
                      }}
                      className="p-4 rounded-xl border-2 transition-all active:scale-[0.97] touch-manipulation cursor-pointer backdrop-blur-sm"
                      style={{
                        borderColor: selectedShareCode === shared.shareCode
                          ? 'var(--border-color-primary-alpha)'
                          : 'var(--border-color-overlay)',
                        backgroundColor: selectedShareCode === shared.shareCode
                          ? 'var(--bg-primary-alpha)'
                          : 'var(--bg-card)',
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectHeartSphere(shared.shareCode, shared);
                        }
                      }}
                      aria-label={`选择共享心域: ${shared.description || shared.shareCode}`}
                      aria-pressed={selectedShareCode === shared.shareCode}
                    >
                      <div className="flex items-start gap-3">
                        {shared.coverImageUrl && (
                          <MobileLazyImage
                            src={shared.coverImageUrl}
                            alt={shared.description || '共享心域'}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-semibold text-base truncate">
                              {shared.description || `共享码: ${shared.shareCode}`}
                            </h4>
                            {selectedShareCode === shared.shareCode && (
                              <span 
                                className="text-xs"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                已选择
                              </span>
                            )}
                          </div>
                          <p 
                            className="text-sm mb-2 line-clamp-2"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {shared.characterCount || 0} 个角色 · {shared.eraCount || 0} 个场景
                          </p>
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-xs"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              {shared.accessPermission === 'free' ? '🔓 自由访问' : '🔒 需要请求'}
                            </span>
                            <span 
                              className="text-xs"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              👁 {shared.viewCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 进入共享心域按钮 */}
              {selectedSharedHeartSphere && isSharedMode && (
                <div className="mt-4">
                  <MobileTouchableButton
                    onClick={handleEnterSharedHeartSphere}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    进入共享心域
                  </MobileTouchableButton>
                </div>
              )}
            </div>

            {/* 角色列表区域 - 在共享模式下显示 */}
            {isSharedMode && selectedSharedHeartSphere && (
              <div>
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white mb-2">搜索角色</h3>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索角色名称..."
                      className="w-full min-h-[44px] px-4 py-3 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color-overlay)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                      }}
                      aria-label="搜索角色"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center active:opacity-70 transition-opacity duration-200 touch-manipulation rounded-lg"
                        style={{
                          color: 'var(--text-tertiary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)';
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-tertiary)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        aria-label="清除搜索"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* 筛选标签 */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <MobileTouchableButton
                    onClick={() => setFilter('all')}
                    variant={filterType === 'all' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    全部 {totalCount > 0 && `(${totalCount})`}
                  </MobileTouchableButton>
                  <MobileTouchableButton
                    onClick={() => setFilter('favorite')}
                    variant={filterType === 'favorite' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    收藏 {favoriteCount > 0 && `(${favoriteCount})`}
                  </MobileTouchableButton>
                  <MobileTouchableButton
                    onClick={() => setFilter('recent')}
                    variant={filterType === 'recent' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    最近 {recentCount > 0 && `(${recentCount})`}
                  </MobileTouchableButton>
                </div>

                {/* 角色列表 */}
                {error && (
                  <div 
                    className="mb-4 p-3 backdrop-blur-sm border rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--bg-error-alpha)',
                      borderColor: 'var(--border-error-alpha)',
                      color: 'var(--color-error)',
                    }}
                    role="alert"
                    aria-live="assertive"
                  >
                    {error}
                  </div>
                )}

                {isLoading || isSearching ? (
                  <div className="flex justify-center py-12">
                    <MobileLoadingSpinner size="lg" text="加载中..." />
                  </div>
                ) : filteredCharacters.length === 0 ? (
                  <MobileEmptyState
                    icon="🔍"
                    title={searchQuery ? `未找到"${searchQuery}"相关角色` : '暂无角色'}
                    description={searchQuery ? '尝试搜索其他关键词' : '选择一个共享心域以查看角色'}
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredCharacters.map((character) => (
                      <div
                        key={character.characterId}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelectCharacter(character);
                        }}
                      className="p-4 backdrop-blur-md rounded-xl border active:scale-[0.97] transition-all cursor-pointer touch-manipulation"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color-overlay)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color-primary-alpha)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectCharacter(character);
                        }
                      }}
                      aria-label={`选择角色: ${character.characterName || character.name}`}
                    >
                        <div className="flex items-center gap-3">
                          {character.avatarUrl && (
                            <MobileLazyImage
                              src={character.avatarUrl}
                              alt={character.characterName || character.name}
                              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-base truncate">
                              {character.characterName || character.name}
                            </h4>
                            {character.sceneName && (
                              <p 
                                className="text-sm truncate"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                {character.sceneName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileErrorBoundary>
  );
});

MobileQuickConnectModal.displayName = 'MobileQuickConnectModal';
