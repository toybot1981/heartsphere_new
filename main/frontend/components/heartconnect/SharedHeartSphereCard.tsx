import React, { useState } from 'react';
import { ConnectionRequestModal } from './ConnectionRequestModal';
import { ShareCodeInputModal } from './ShareCodeInputModal';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { SharedHeartSphere } from '../../services/api/heartconnect/types';
import { useSharedMode } from '../../hooks/useSharedMode';
import { authApi } from '../../services/api';
import { getToken } from '../../services/api/base/tokenStorage';

interface SharedHeartSphereCardProps {
  sharedHeartSphere: SharedHeartSphere;
  onConnect?: () => void;
  isSelected?: boolean;
  onViewCharacters?: () => void;
  onEnterSharedMode?: () => void; // 进入共享模式后的回调（用于关闭模态框等）
}

/**
 * 共享心域卡片组件
 * 醒目的展示样式，用于快速连接界面
 */
export const SharedHeartSphereCard: React.FC<SharedHeartSphereCardProps> = ({
  sharedHeartSphere,
  onConnect,
  isSelected = false,
  onViewCharacters,
  onEnterSharedMode,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCodeInputModal, setShowCodeInputModal] = useState(false);
  const { enterSharedMode } = useSharedMode();
  
  const handleConnect = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (sharedHeartSphere.accessPermission === 'free') {
      // 自由连接，直接进入共享模式
      try {
        const token = getToken();
        if (!token) {
          alert('请先登录后再访问');
          return;
        }
        
        // 获取共享配置详情
        const shareConfig = await heartConnectApi.getShareConfigByCode(sharedHeartSphere.shareCode);
        
        // 获取当前用户ID
        const currentUser = await authApi.getCurrentUser(token);
        if (currentUser && currentUser.id) {
          enterSharedMode(shareConfig, currentUser.id);
          
          // 如果有回调（如在模态框中），先执行回调（关闭模态框），然后触发导航事件
          if (onEnterSharedMode) {
            onEnterSharedMode();
            // 延迟一下，确保模态框关闭后再触发导航
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('navigateToShared', { 
                detail: { shareConfigId: shareConfig.id, visitorId: currentUser.id, shareConfig } 
              }));
            }, 100);
          } else {
            // 直接触发导航事件
            window.dispatchEvent(new CustomEvent('navigateToShared', { 
              detail: { shareConfigId: shareConfig.id, visitorId: currentUser.id, shareConfig } 
            }));
          }
        } else {
          alert('无法获取用户信息，请重新登录');
        }
      } catch (err: any) {
        console.error('[SharedHeartSphereCard] 进入共享模式失败:', err);
        // 如果直接进入失败，回退到跳转方式
        window.location.href = `/share/${sharedHeartSphere.shareCode}`;
      }
    } else if (sharedHeartSphere.accessPermission === 'approval') {
      // 需要审批，显示连接请求模态框
      setShowRequestModal(true);
    }
  };
  
  const handleRequestSuccess = () => {
    setShowRequestModal(false);
    onConnect?.();
  };
  
  const handleCodeInput = (shareCode: string) => {
    // 通过共享码连接
    window.location.href = `/share/${shareCode}`;
  };
  
  // 根据请求状态显示不同的按钮
  const getActionButton = () => {
    if (sharedHeartSphere.requestStatus === 'pending') {
      return (
        <button
          disabled
          className="px-2 py-1.5 rounded-md border cursor-not-allowed text-xs"
          style={{
            backgroundColor: 'var(--bg-warning-alpha)',
            color: 'var(--color-warning)',
            borderColor: 'var(--border-warning-alpha)',
          }}
        >
          等待审批
        </button>
      );
    }
    
    if (sharedHeartSphere.requestStatus === 'approved') {
      return (
        <button
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const token = getToken();
              if (!token) {
                alert('请先登录后再访问');
                return;
              }
              
              // 获取共享配置详情
              const shareConfig = await heartConnectApi.getShareConfigByCode(sharedHeartSphere.shareCode);
              
              // 获取当前用户ID
              const currentUser = await authApi.getCurrentUser(token);
              if (currentUser && currentUser.id) {
                enterSharedMode(shareConfig, currentUser.id);
                
                // 如果有回调（如在模态框中），先执行回调（关闭模态框），然后触发导航事件
                if (onEnterSharedMode) {
                  onEnterSharedMode();
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('navigateToShared', { 
                      detail: { shareConfigId: shareConfig.id, visitorId: currentUser.id } 
                    }));
                  }, 100);
                } else {
                  window.dispatchEvent(new CustomEvent('navigateToShared', { 
                    detail: { shareConfigId: shareConfig.id, visitorId: currentUser.id } 
                  }));
                }
              } else {
                alert('无法获取用户信息，请重新登录');
              }
            } catch (err: any) {
              console.error('[SharedHeartSphereCard] 进入共享模式失败:', err);
              // 如果直接进入失败，回退到跳转方式
              window.location.href = `/share/${sharedHeartSphere.shareCode}`;
            }
          }}
          className="px-2 py-1.5 rounded-md transition-colors text-xs font-medium"
          style={{
            backgroundColor: 'var(--color-success, #22c55e)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-success-light, #16a34a)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-success, #22c55e)';
          }}
        >
          进入共享心域
        </button>
      );
    }
    
    if (sharedHeartSphere.accessPermission === 'free') {
      return (
        <button
          onClick={(e) => handleConnect(e)}
          className="px-2 py-1.5 rounded-md transition-all text-xs font-medium shadow-md"
          style={{
            background: 'linear-gradient(to right, var(--color-primary, #3b82f6), var(--color-primary, #a855f7))',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, var(--color-primary-light, #2563eb), var(--color-primary-light, #9333ea))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, var(--color-primary, #3b82f6), var(--color-primary, #a855f7))';
          }}
        >
          快速体验
        </button>
      );
    }
    
      return (
        <button
          onClick={(e) => handleConnect(e)}
          className="px-2 py-1.5 rounded-md transition-all text-xs font-medium shadow-md"
          style={{
            background: 'linear-gradient(to right, var(--color-primary, #ec4899), var(--color-error, #f43f5e))',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, var(--color-primary-light, #db2777), var(--color-error-light, #e11d48))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, var(--color-primary, #ec4899), var(--color-error, #f43f5e))';
          }}
        >
          申请连接
        </button>
      );
  };
  
  return (
    <>
      <div 
        className={`relative rounded-xl p-4 border-2 shadow-lg transition-all transform ${
          isSelected 
            ? 'ring-2 ring-offset-1 ring-offset-transparent z-10 scale-105' 
            : 'hover:scale-[1.02]'
        }`}
        style={{
          background: 'var(--gradient-card)',
          borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color-overlay)',
          boxShadow: isSelected 
            ? 'var(--shadow-primary)' 
            : 'var(--shadow-md)',
        }}
      style={{
        boxShadow: isSelected 
          ? '0 20px 40px rgba(59, 130, 246, 0.4), 0 0 20px rgba(147, 51, 234, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.1)' 
          : '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(147, 51, 234, 0.2), inset 0 1px 5px rgba(255, 255, 255, 0.05)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}>
        {/* 醒目标识 - 增强立体感 */}
        <div 
          className="absolute top-2 right-2 flex items-center gap-1 backdrop-blur-md px-2.5 py-1 rounded-full border-2 z-10 shadow-lg"
          style={{
            background: 'var(--bg-warning-alpha)',
            borderColor: 'var(--border-warning-alpha)',
            boxShadow: 'var(--shadow-warning)',
            transform: 'translateZ(10px)',
          }}
        >
          <span 
          className="text-base inline-block animate-pulse"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.8))',
            textShadow: '0 0 8px rgba(250, 204, 21, 0.6)',
          }}
        >
          ⭐
        </span>
          <span
            className="font-bold text-xs whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            style={{ color: 'var(--text-warning)' }}
          >
            共享心域
          </span>
        </div>
        
        {/* 封面图片 - 增强立体感 */}
        {sharedHeartSphere.coverImageUrl && (
          <div 
            className="mb-2 rounded-lg overflow-hidden relative"
            style={{
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.1)',
              transform: 'translateZ(5px)',
            }}
          >
            <div 
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, var(--bg-overlay-alpha), transparent)',
              }}
            />
            <img
              src={sharedHeartSphere.coverImageUrl}
              alt={sharedHeartSphere.heartSphereName}
              className="w-full h-24 object-cover"
              style={{
                filter: 'brightness(1.05) contrast(1.1)',
              }}
            />
          </div>
        )}
        
        {/* 主人信息 - 增强立体感 */}
        <div className="flex items-center gap-2 mb-2 pt-6">
          {sharedHeartSphere.ownerAvatar ? (
            <div
              className="relative"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
                transform: 'translateZ(8px)',
              }}
            >
              <img
                src={sharedHeartSphere.ownerAvatar}
                alt={sharedHeartSphere.ownerName}
                className="w-8 h-8 rounded-full border-2 flex-shrink-0"
                style={{ borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.4))' }}
                style={{
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                }}
              />
            </div>
          ) : (
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 relative"
              style={{
                background: 'linear-gradient(to right, var(--color-primary, #a855f7), var(--color-primary, #ec4899))',
                color: 'var(--text-primary)',
              }}
              style={{
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.5), 0 0 8px rgba(236, 72, 153, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                transform: 'translateZ(8px)',
              }}
            >
              <span className="relative z-10">{sharedHeartSphere.ownerName?.[0] || 'U'}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 
              className="text-sm font-bold truncate"
              style={{ color: 'var(--text-primary)' }}
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(147, 51, 234, 0.3)',
              }}
            >
              {sharedHeartSphere.heartSphereName}
            </h3>
            <p 
              className="text-xs truncate"
              style={{
                color: 'var(--text-secondary)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
              }}
            >
              主人：{sharedHeartSphere.ownerName}
            </p>
          </div>
        </div>
        
        {/* 描述 - 缩小 */}
        {sharedHeartSphere.description && (
          <p 
            className="mb-2 line-clamp-2 break-words text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            {sharedHeartSphere.description}
          </p>
        )}
        
        {/* 统计信息 - 增强立体感 */}
        <div className="flex items-center gap-3 mb-2 text-xs">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-sm"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.05))',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
            }}
          >
            <span className="text-sm">👁️</span>
            <span className="font-semibold">{sharedHeartSphere.viewCount || 0}</span>
          </div>
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-sm"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.05))',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
            }}
          >
            <span className="text-sm">💬</span>
            <span className="font-semibold">{sharedHeartSphere.requestCount || 0}</span>
          </div>
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-sm"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.05))',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
            }}
          >
            <span className="text-sm">✅</span>
            <span className="font-semibold">{sharedHeartSphere.approvedCount || 0}</span>
          </div>
        </div>
        
        {/* 共享范围 - 增强立体感 */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {sharedHeartSphere.shareType === 'all' && (
            <span
              className="px-2 py-0.5 rounded-full text-xs border whitespace-nowrap font-medium"
              style={{
                background: 'var(--gradient-badge-info)',
                color: 'var(--text-info-light)',
                borderColor: 'var(--border-info-alpha)',
                boxShadow: '0 2px 8px var(--shadow-info), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              全部共享
            </span>
          )}
          {sharedHeartSphere.worldCount && sharedHeartSphere.worldCount > 0 && (
            <span 
              className="px-2 py-0.5 rounded-full text-xs border whitespace-nowrap font-medium"
              style={{
                background: 'var(--bg-secondary-alpha)',
                color: 'var(--color-primary)',
                borderColor: 'var(--border-color-overlay)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {sharedHeartSphere.worldCount} 个世界
            </span>
          )}
          {sharedHeartSphere.eraCount && sharedHeartSphere.eraCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs border whitespace-nowrap font-medium"
              style={{
                background: 'var(--gradient-badge-pink)',
                color: 'var(--text-pink-light)',
                borderColor: 'var(--border-pink-alpha)',
                boxShadow: '0 2px 8px var(--shadow-pink), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {sharedHeartSphere.eraCount} 个场景
            </span>
          )}
        </div>
        
        {/* 操作按钮 - 缩小 */}
        <div className="flex gap-1.5 flex-wrap mt-1.5">
          {onViewCharacters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewCharacters();
              }}
              className="px-2 py-1.5 rounded-md transition-colors text-xs font-medium flex-1 min-w-[80px]"
              style={{
                backgroundColor: 'var(--color-info)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-info-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-info)';
              }}
            >
              👀 查看角色
            </button>
          )}
          {getActionButton()}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCodeInputModal(true);
            }}
            className="px-2 py-1.5 rounded-md transition-colors text-xs"
            style={{
              backgroundColor: 'var(--bg-secondary, #374151)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, #4b5563)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #374151)';
            }}
            title="输入共享码"
          >
            🔑
          </button>
        </div>
      </div>
      
      {/* 连接请求模态框 */}
      <ConnectionRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        shareCode={sharedHeartSphere.shareCode}
        onSuccess={handleRequestSuccess}
      />
      
      {/* 共享码输入模态框 */}
      <ShareCodeInputModal
        isOpen={showCodeInputModal}
        onClose={() => setShowCodeInputModal(false)}
        onSubmit={handleCodeInput}
      />
    </>
  );
};

