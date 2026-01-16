/**
 * 共享心域页面组件
 * 独立页面，专门用于查看他人共享的心域内容
 * 只能访问共享的角色和场景
 */

import React, { useState, useEffect, useRef } from 'react';
import { WorldScene } from '../../types';
import { Button } from '../Button';
import { SceneCard } from '../SceneCard';
import { useSharedMode } from '../../hooks/useSharedMode';
import { heartConnectApi, sharedApi } from '../../services/api/heartconnect';
import { getToken } from '../../services/api/base/tokenStorage';
import { convertErasToWorldScenes } from '../../utils/dataTransformers';
import { WarmMessageModal } from '../heartconnect/WarmMessageModal';
import { PortalSelectionModal } from '../portal/PortalSelectionModal';
import { TeleportationAnimation } from '../portal/TeleportationAnimation';
import { portalApi } from '../../services/api/portal';
import type { PortalType } from '../../services/api/portal/types';
import { setSharedModeState } from '../../services/api/base/sharedModeState';
// 移除动画包装，让传送门动画更突出
// import { SharedHeartSphereWrapper } from '../transitions';
// import { pageTransitionManager } from '../../hooks/usePageTransition';

interface SharedHeartSphereScreenProps {
  onSceneSelect: (sceneId: string) => void;
  onBack: () => void;
  dispatch: (action: any) => void;
  onSceneObjectSelect?: (scene: WorldScene) => void; // 传递场景对象
}

export const SharedHeartSphereScreen: React.FC<SharedHeartSphereScreenProps> = ({
  onSceneSelect,
  onBack,
  dispatch,
  onSceneObjectSelect,
}) => {
  const { shareConfig, isActive, leaveSharedMode } = useSharedMode();
  const [scenes, setScenes] = useState<WorldScene[]>([]);
  const [loading, setLoading] = useState(false); // 初始值改为 false，不显示 loading
  const [error, setError] = useState<string | null>(null);
  const [showWarmMessageModal, setShowWarmMessageModal] = useState(false);
  const [showPortalSelection, setShowPortalSelection] = useState(false);
  const [ownerName, setOwnerName] = useState<string>('');
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportEffect, setTeleportEffect] = useState<PortalType>('stargate');
  const [pendingTeleport, setPendingTeleport] = useState<{ targetShareCode: string; targetSphere: any } | null>(null);

  // 使用 ref 防止重复加载
  const loadingRef = useRef(false);
  const loadedShareConfigIdRef = useRef<number | null>(null);

  // 加载共享心域的场景数据
  useEffect(() => {
    
    if (!isActive || !shareConfig) {
      console.warn('[SharedHeartSphereScreen] 未进入共享模式或 shareConfig 为空', { isActive, shareConfig });
      setError('未进入共享模式');
      setLoading(false);
      return;
    }

    // 防止重复加载同一个 shareConfig
    if (loadedShareConfigIdRef.current === shareConfig.id && !loadingRef.current) {
      return;
    }

    // 如果正在加载，跳过
    if (loadingRef.current) {
      return;
    }

    const loadSharedScenes = async () => {
      loadingRef.current = true;
      loadedShareConfigIdRef.current = shareConfig.id;
      try {
        setLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) {
          setError('请先登录');
          setLoading(false);
          return;
        }

        // 确保 sharedModeState 已设置（供 request.ts 使用）
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        const visitorId = currentUser.id || null;
        
        if (!shareConfig || !shareConfig.id) {
          console.error('[SharedHeartSphereScreen] shareConfig 或 shareConfig.id 为空:', shareConfig);
          setError('共享配置无效');
          setLoading(false);
          return;
        }
        
        setSharedModeState(shareConfig.id, visitorId);
        
        // 使用共享模式API加载数据
        const worlds = await sharedApi.getSharedWorlds(token);
        const eras = await sharedApi.getSharedEras(token);
        
        
        // 转换为 WorldScene 格式（共享模式下直接展示所有场景，不按世界分组）
        const worldScenes = convertErasToWorldScenes(
          worlds,
          eras,
          [], // 角色列表在进入场景时加载
          undefined, // scripts
          undefined, // mainStories
          true // isSharedMode = true
        );
        
        setScenes(worldScenes);
        
        // 获取主人信息（如果有）
        if (shareConfig.ownerName) {
          setOwnerName(shareConfig.ownerName);
        } else if (shareConfig.userId) {
          // 如果后端没有返回 ownerName，使用默认值
          setOwnerName('心域主人');
        } else {
          setOwnerName('心域主人');
        }
      } catch (err: any) {
        console.error('[SharedHeartSphereScreen] 加载失败:', err);
        setError(err.message || '加载共享心域失败，请稍后重试');
        // 加载失败时清除标记，允许重试
        loadedShareConfigIdRef.current = null;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadSharedScenes();
  }, [isActive, shareConfig?.id]); // 只依赖 shareConfig.id，避免 shareConfig 对象引用变化导致重复加载

  const handleLeave = () => {
    setShowWarmMessageModal(true);
  };

  const handleWarmMessageSubmit = async (message: string) => {
    if (shareConfig) {
      try {
        await heartConnectApi.createWarmMessage(shareConfig.id, message);
        alert('留言发送成功！感谢你的反馈。');
      } catch (err: any) {
        console.error('发送暖心留言失败:', err);
        alert(err.message || '发送留言失败，请稍后重试');
        return;
      }
    }
    
    // 先导航到心域连接页面，再离开共享模式，避免停留在提示页面
    setShowWarmMessageModal(false);
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
    // 延迟离开共享模式，确保导航先完成
    setTimeout(() => {
      leaveSharedMode();
    }, 100);
  };

  const handleSkipWarmMessage = () => {
    // 先导航到心域连接页面，再离开共享模式，避免停留在提示页面
    setShowWarmMessageModal(false);
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
    // 延迟离开共享模式，确保导航先完成
    setTimeout(() => {
      leaveSharedMode();
    }, 100);
  };

  // 处理传送门选择
  const handleTeleport = async (targetShareCode: string, effect: PortalType) => {
    try {
      // 这里需要创建一个临时传送门或直接执行传送
      // 由于传送门现在不在场景中，我们需要直接执行传送逻辑
      // 先获取目标心域信息
      const sharedSpheres = await heartConnectApi.getPublicSharedHeartSpheres();
      const targetSphere = sharedSpheres.find(s => s.shareCode === targetShareCode);
      
      if (!targetSphere) {
        alert('目标心域不存在或已失效');
        return;
      }

      // 保存待传送的目标信息，先显示动画
      setPendingTeleport({ targetShareCode, targetSphere });
      setTeleportEffect(effect);
      
      
      // 开始传送动画（使用 setTimeout 确保状态更新后再触发动画）
      setTimeout(() => {
        setIsTeleporting(true);
      }, 10);
    } catch (err: any) {
      console.error('[SharedHeartSphereScreen] 传送失败:', err);
      alert(err.message || '传送失败，请稍后重试');
    }
  };

  // 传送动画完成后的回调
  const handleTeleportationComplete = () => {
    if (!pendingTeleport) {
      console.warn('[SharedHeartSphereScreen] handleTeleportationComplete: pendingTeleport 为空');
      return;
    }

    const { targetShareCode, targetSphere } = pendingTeleport;
    
    
    // 注意：SharedHeartSphere 的字段是 shareConfigId，需要映射到 ShareConfig 的 id
    const token = getToken();
    const visitorId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
    
    // 生成心域名称：昵称+的+心域
    const heartSphereName = targetSphere.ownerName 
      ? `${targetSphere.ownerName}的心域`
      : (targetSphere.heartSphereName || '未命名心域');
    
    // 触发导航事件
    const navigateEvent = new CustomEvent('navigateToShared', {
      detail: {
        shareConfigId: targetSphere.shareConfigId, // 使用 shareConfigId 而不是 id
        visitorId: visitorId,
        shareConfig: {
          id: targetSphere.shareConfigId, // 映射 shareConfigId 到 id
          shareCode: targetShareCode,
          name: heartSphereName, // 使用生成的名称
          userId: targetSphere.ownerId, // 使用 ownerId 而不是 userId
          ownerName: targetSphere.ownerName,
          shareType: targetSphere.shareType,
          shareStatus: 'active' as const, // 默认值
          accessPermission: targetSphere.accessPermission,
          viewCount: targetSphere.viewCount,
          requestCount: targetSphere.requestCount,
          approvedCount: targetSphere.approvedCount,
          createdAt: 0, // 默认值
          updatedAt: 0, // 默认值
        },
      }
    });
    
    window.dispatchEvent(navigateEvent);

    // 更新URL
    window.history.pushState({}, '', `/share/${targetShareCode}`);
    
    // 延迟重置状态，确保事件被处理
    setTimeout(() => {
      setIsTeleporting(false);
      setPendingTeleport(null);
    }, 100);
  };

  // 如果不在共享模式，直接返回 null，让导航逻辑处理
  if (!isActive || !shareConfig) {
    return null;
  }

  // 移除 loading 显示，直接显示内容，避免影响传送门效果
  // if (loading) {
  //   return (
  //     <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
  //       <div className="text-center">
  //         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
  //         <p className="text-gray-400">加载共享心域中...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onBack} variant="ghost">返回</Button>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col p-8 bg-gradient-to-br from-gray-900 to-black">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="!p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400">
                ✨ 欢迎来到 {ownerName || '心域主人'} 的心域 ✨
              </h2>
              <p className="text-amber-200 text-sm flex items-center gap-2 mt-2">
                <span className="text-lg">💝</span>
                <span>这里充满了温暖与故事，愿你在这里找到心灵的共鸣</span>
                <span className="text-[10px] bg-blue-700 px-2 py-0.5 rounded text-blue-200 ml-2">共享模式</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPortalSelection(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 transition-all shadow-lg flex items-center gap-2"
              title="传送到其他共享心域"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span>传送</span>
            </button>
            <button
              onClick={handleLeave}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 transition-all shadow-lg"
            >
              离开共享心域
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mb-6 p-4 bg-blue-900/40 border border-blue-500/50 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="text-blue-200 font-bold text-sm mb-1">共享模式提示</p>
              <p className="text-blue-300 text-xs">
                你正在查看他人共享的心域。在此模式下，你只能访问主人共享的场景和角色，且你的操作不会保存到主人的心域中。
              </p>
            </div>
          </div>
        </div>

        {/* 场景列表 */}
        {scenes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌟</div>
              <p className="text-gray-400 text-lg mb-2">暂无共享的场景</p>
              <p className="text-gray-500 text-sm">主人还没有共享任何场景</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10 scrollbar-hide">
            {scenes.map(scene => (
              <div key={scene.id} className="relative group">
                <SceneCard
                  scene={scene}
                  onSelect={() => {
                    onSceneSelect(scene.id);
                    // 如果提供了 onSceneObjectSelect 回调，传递场景对象
                    if (onSceneObjectSelect) {
                      onSceneObjectSelect(scene);
                    }
                  }}
                  isUserOwned={false} // 共享模式下，场景不属于访问者
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 暖心留言模态框 */}
      <WarmMessageModal
        isOpen={showWarmMessageModal}
        onClose={handleSkipWarmMessage}
        onSubmit={handleWarmMessageSubmit}
        ownerName={ownerName}
      />
      {/* 传送门选择模态框 */}
      <PortalSelectionModal
        isOpen={showPortalSelection}
        onClose={() => setShowPortalSelection(false)}
        onTeleport={handleTeleport}
      />
      
      {/* 传送动画 - 使用 fixed 定位覆盖整个屏幕 */}
      <TeleportationAnimation
        isActive={isTeleporting}
        portalType={teleportEffect}
        duration={4000} // 4秒动画
        onFadeOutComplete={handleTeleportationComplete}
      />
    </>
  );
};

