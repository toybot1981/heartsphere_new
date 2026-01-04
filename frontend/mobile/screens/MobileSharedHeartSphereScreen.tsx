/**
 * Mobile版本共享心域选择页面组件
 * 参照PC版本的SharedHeartSphereScreen，但保持Mobile UI独立
 */

import React, { useState, useEffect, memo } from 'react';
import { WorldScene } from '../../types';
import { useSharedMode } from '../../hooks/useSharedMode';
import { sharedApi } from '../../services/api/heartconnect';
import { heartConnectApi } from '../../services/api/heartconnect';
import { getToken } from '../../services/api/base/tokenStorage';
import { convertErasToWorldScenes } from '../../utils/dataTransformers';
import { MobileSharedModeBanner, MobileWarmMessageModal } from '../components/modals';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileLazyImage } from '../components/MobileLazyImage';

interface MobileSharedHeartSphereScreenProps {
  onSelectScene: (sceneId: string) => void;
  onBack: () => void;
  dispatch: (action: any) => void;
}

/**
 * Mobile版本共享心域选择页面组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileSharedHeartSphereScreen: React.FC<MobileSharedHeartSphereScreenProps> = memo(({
  onSelectScene,
  onBack,
  dispatch,
}) => {
  const { shareConfig, isActive, leaveSharedMode } = useSharedMode();
  const [scenes, setScenes] = useState<WorldScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarmMessageModal, setShowWarmMessageModal] = useState(false);
  const [ownerName, setOwnerName] = useState<string>('');

  // 加载共享心域的场景数据
  useEffect(() => {
    // 如果不在共享模式，不显示错误，直接返回（让 onBack 处理导航）
    if (!isActive || !shareConfig) {
      // 不设置错误，避免显示错误页面
      // 如果正在离开，让导航逻辑处理
      setLoading(false);
      return;
    }

    const loadSharedScenes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) {
          setError('请先登录');
          setLoading(false);
          return;
        }

        console.log('[MobileSharedHeartSphereScreen] 加载共享场景，shareConfigId:', shareConfig.shareConfigId);
        
        // 使用共享模式API加载数据
        const worlds = await sharedApi.getSharedWorlds(token);
        const eras = await sharedApi.getSharedEras(token);
        
        console.log('[MobileSharedHeartSphereScreen] 加载成功，世界数量:', worlds.length, '场景数量:', eras.length);
        
        // 转换为前端 WorldScene 格式（共享模式下直接展示所有场景，不按世界分组）
        const convertedScenes = convertErasToWorldScenes(
          worlds,
          eras,
          [], // 角色列表在进入场景时加载
          undefined, // scripts
          undefined, // mainStories
          true // isSharedMode = true
        );
        setScenes(convertedScenes);
        
        // 获取主人信息
        if (shareConfig.ownerId) {
          try {
            const ownerInfo = await sharedApi.getShareConfigOwner(shareConfig.shareConfigId, token);
            setOwnerName(ownerInfo.ownerName || '');
          } catch (err) {
            console.warn('[MobileSharedHeartSphereScreen] 获取主人信息失败:', err);
          }
        }
      } catch (err: any) {
        console.error('[MobileSharedHeartSphereScreen] 加载失败:', err);
        setError(err.message || '加载共享场景失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadSharedScenes();
  }, [isActive, shareConfig]);

  const handleLeave = async () => {
    if (showWarmMessageModal) {
      setShowWarmMessageModal(false);
    }
    // 先导航到心域连接页面，再离开共享模式，避免停留在提示页面
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
    setTimeout(() => {
      leaveSharedMode();
    }, 100);
  };

  const handleSkipWarmMessage = () => {
    // 先导航到心域连接页面，再离开共享模式，避免停留在提示页面
    setShowWarmMessageModal(false);
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
    setTimeout(() => {
      leaveSharedMode();
    }, 100);
  };

  const handleWarmMessageSubmit = async (message: string) => {
    if (!shareConfig) return;

    try {
      // 使用 heartConnectApi.createWarmMessage 发送留言
      await heartConnectApi.createWarmMessage(shareConfig.id, message);
      // 先导航到心域连接页面，再离开共享模式，避免停留在提示页面
      setShowWarmMessageModal(false);
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
      setTimeout(() => {
        leaveSharedMode();
      }, 100);
    } catch (err) {
      console.error('[MobileSharedHeartSphereScreen] 发送暖心留言失败:', err);
      // 即使留言失败，也应该允许离开
      alert('留言发送失败，但你可以继续离开');
      // 先导航到心域连接页面，再离开共享模式，避免停留在提示页面
      setShowWarmMessageModal(false);
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
      setTimeout(() => {
        leaveSharedMode();
      }, 100);
    }
  };

  // 如果不在共享模式，直接返回 null，让导航逻辑处理
  if (!isActive || !shareConfig) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <MobileLoadingSpinner size="lg" text="加载共享心域中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-black flex flex-col items-center justify-center p-6">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl active:scale-95 transition-transform touch-manipulation min-h-[44px]"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden">
      {/* 共享模式标识栏 */}
      {shareConfig && (
        <MobileSharedModeBanner
          heartSphereName={shareConfig.heartSphereName || '共享心域'}
          ownerName={ownerName}
          onLeave={() => setShowWarmMessageModal(true)}
        />
      )}

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">共享心域</h1>
          <p className="text-slate-400 text-sm">选择场景开始探索</p>
        </div>

        {scenes.length === 0 ? (
          <MobileEmptyState
            icon="🌍"
            title="暂无共享场景"
            description="这个心域还没有共享的场景"
          />
        ) : (
          <div className="space-y-4">
            {scenes.map(scene => (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg active:scale-[0.97] transition-transform touch-manipulation cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectScene(scene.id);
                  }
                }}
              >
                <MobileLazyImage src={scene.imageUrl} alt={scene.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-5">
                  <h3 className="text-2xl font-bold text-white mb-1 shadow-black drop-shadow-md">{scene.name}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2 opacity-90">{scene.description}</p>
                </div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 text-[10px] text-white">
                  进入 &rarr;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 暖心留言模态框 */}
      {showWarmMessageModal && shareConfig && (
        <MobileWarmMessageModal
          isOpen={showWarmMessageModal}
          onClose={handleSkipWarmMessage}
          onSubmit={handleWarmMessageSubmit}
          ownerName={ownerName}
        />
      )}
    </div>
  );
});

MobileSharedHeartSphereScreen.displayName = 'MobileSharedHeartSphereScreen';
