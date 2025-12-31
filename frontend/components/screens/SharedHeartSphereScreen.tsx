/**
 * 共享心域页面组件
 * 独立页面，专门用于查看他人共享的心域内容
 * 只能访问共享的角色和场景
 */

import React, { useState, useEffect } from 'react';
import { WorldScene } from '../../types';
import { Button } from '../Button';
import { SceneCard } from '../SceneCard';
import { useSharedMode } from '../../hooks/useSharedMode';
import { heartConnectApi } from '../../services/api/heartconnect';
import { sharedApi } from '../../services/api/heartconnect';
import { getToken } from '../../services/api/base/tokenStorage';
import { convertErasToWorldScenes } from '../../utils/dataTransformers';
import { WarmMessageModal } from '../heartconnect/WarmMessageModal';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarmMessageModal, setShowWarmMessageModal] = useState(false);
  const [ownerName, setOwnerName] = useState<string>('');

  // 加载共享心域的场景数据
  useEffect(() => {
    console.log('[SharedHeartSphereScreen] useEffect 触发, isActive:', isActive, 'shareConfig:', shareConfig);
    if (!isActive || !shareConfig) {
      console.warn('[SharedHeartSphereScreen] 未进入共享模式或 shareConfig 为空', { isActive, shareConfig });
      setError('未进入共享模式');
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

        console.log('[SharedHeartSphereScreen] 开始加载共享心域数据...');
        
        // 使用共享模式API加载数据
        const worlds = await sharedApi.getSharedWorlds(token);
        const eras = await sharedApi.getSharedEras(token);
        
        console.log('[SharedHeartSphereScreen] 加载成功:', { worlds: worlds.length, eras: eras.length });
        
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
        if (shareConfig.userId) {
          try {
            // 尝试从 shareConfig 中获取主人昵称
            // 如果 shareConfig 中有 ownerName 或 nickname 字段，使用它
            const ownerNickname = (shareConfig as any).ownerName || (shareConfig as any).nickname || shareConfig.shareCode || '心域主人';
            setOwnerName(ownerNickname);
          } catch (err) {
            console.error('获取主人信息失败:', err);
            setOwnerName('心域主人');
          }
        } else {
          setOwnerName('心域主人');
        }
      } catch (err: any) {
        console.error('[SharedHeartSphereScreen] 加载失败:', err);
        setError(err.message || '加载共享心域失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadSharedScenes();
  }, [isActive, shareConfig]);

  const handleLeave = () => {
    setShowWarmMessageModal(true);
  };

  const handleWarmMessageSubmit = async (message: string) => {
    if (shareConfig) {
      try {
        await heartConnectApi.createWarmMessage(shareConfig.id, message);
        console.log('[SharedHeartSphereScreen] 留言发送成功');
        alert('留言发送成功！感谢你的反馈。');
      } catch (err: any) {
        console.error('发送暖心留言失败:', err);
        alert(err.message || '发送留言失败，请稍后重试');
        return;
      }
    }
    leaveSharedMode();
    setShowWarmMessageModal(false);
    onBack();
  };

  const handleSkipWarmMessage = () => {
    leaveSharedMode();
    setShowWarmMessageModal(false);
    onBack();
  };

  if (!isActive || !shareConfig) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <p className="text-gray-400 mb-4">未进入共享模式</p>
          <Button onClick={onBack}>返回</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载共享心域中...</p>
        </div>
      </div>
    );
  }

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
    </>
  );
};

