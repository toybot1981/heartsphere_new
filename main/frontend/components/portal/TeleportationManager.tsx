/**
 * 传送管理器
 * 协调传送动画、场景切换、状态更新
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TeleportationAnimation } from './TeleportationAnimation';
import { TeleportationConfirmDialog } from './TeleportationConfirmDialog';
import { PortalPreviewCard } from './PortalPreviewCard';
import { usePortal } from '../../hooks/usePortal';
import { portalApi } from '../../services/api/portal';
import type { PortalConfig, PortalPreview, TeleportationResult } from '../../services/api/portal/types';
import { PortalAnimationState } from './types';
import { logger } from '../../utils/logger';
import { portalAudioService } from '../../services/portal/audio';

interface TeleportationManagerProps {
  sceneId?: number | null;
  onTeleportationComplete?: (targetHeartsphereId: number, targetShareCode?: string) => void;
  children?: React.ReactNode;
}

/**
 * 传送管理器组件
 * 处理完整的传送流程：预览 -> 确认 -> 动画 -> 场景切换
 */
export const TeleportationManager: React.FC<TeleportationManagerProps> = ({
  sceneId,
  onTeleportationComplete,
  children,
}) => {
  const { teleport, getPreview, portals } = usePortal(sceneId);
  const [selectedPortal, setSelectedPortal] = useState<PortalConfig | null>(null);
  const [portalPreview, setPortalPreview] = useState<PortalPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [teleportationResult, setTeleportationResult] = useState<TeleportationResult | null>(null);
  
  // 使用 ref 保存最新的传送结果，避免闭包问题
  const teleportationResultRef = useRef<TeleportationResult | null>(null);
  useEffect(() => {
    teleportationResultRef.current = teleportationResult;
  }, [teleportationResult]);

  /**
   * 处理传送门点击
   */
  const handlePortalClick = useCallback(async (portalId: number) => {
    const portal = portals.find(p => p.id === portalId);
    if (!portal || !portal.isActive) {
      logger.warn(`[TeleportationManager] 传送门不存在或未激活: portalId=${portalId}`);
      return;
    }

    setSelectedPortal(portal);

    // 获取预览信息
    try {
      const preview = await getPreview(portalId);
      setPortalPreview(preview);
      
      if (preview.canAccess) {
        // 可以直接访问，显示确认对话框
        setShowConfirm(true);
      } else {
        // 无法访问，显示预览卡片（只读模式）
        setShowPreview(true);
      }
    } catch (error: any) {
      logger.error(`[TeleportationManager] 获取传送门预览失败:`, error);
      alert('获取传送门信息失败，请稍后重试');
    }
  }, [portals, getPreview]);

  /**
   * 监听传送门点击事件
   */
  useEffect(() => {
    const handlePortalClickEvent = (event: CustomEvent) => {
      const { portalId } = event.detail;
      if (portalId) {
        logger.debug(`[TeleportationManager] 收到传送门点击事件: portalId=${portalId}`);
        handlePortalClick(portalId);
      }
    };

    window.addEventListener('portal-click', handlePortalClickEvent as EventListener);
    window.addEventListener('portal:click', handlePortalClickEvent as EventListener); // 兼容两种格式
    
    return () => {
      window.removeEventListener('portal-click', handlePortalClickEvent as EventListener);
      window.removeEventListener('portal:click', handlePortalClickEvent as EventListener);
    };
  }, [handlePortalClick]);

  /**
   * 处理确认传送
   */
  const handleConfirmTeleport = useCallback(async (skip: boolean = false) => {
    if (!selectedPortal) return;

    setSkipAnimation(skip);
    setShowConfirm(false);
    setShowPreview(false);
    
    // 先设置传送状态，但不要立即开始动画
    // 等传送请求成功后再开始动画
    try {
      const result = await teleport(selectedPortal.id, skip);
      
      // 先设置结果，确保 ref 也更新
      setTeleportationResult(result);
      teleportationResultRef.current = result;
      
      if (result && result.success) {
        // 如果跳过动画，直接触发完成回调
        if (skip) {
          if (onTeleportationComplete) {
            onTeleportationComplete(
              result.targetHeartsphereId!,
              result.targetShareCode
            );
          }
          return;
        }
        
        // 现在开始动画（动画会触发 onFadeOutComplete）
        logger.info(`[TeleportationManager] 开始动画，等待淡出完成...`);
        setIsTeleporting(true);
        
        // 播放传送音效
        portalAudioService.playTeleportationSound().catch(err => {
          logger.warn('[TeleportationManager] 播放传送音效失败:', err);
        });
      } else {
        // 传送失败
        logger.error(`[TeleportationManager] 传送失败: result=`, result);
        alert(result?.errorMessage || '传送失败，请稍后重试');
      }
    } catch (error: any) {
      logger.error(`[TeleportationManager] 传送失败:`, error);
      setIsTeleporting(false);
      // 提供更详细的错误信息
      const errorMessage = error?.message || error?.error || '未知错误';
      if (errorMessage.includes('未登录') || errorMessage.includes('未授权') || errorMessage.includes('401')) {
        alert('使用传送门需要登录，请先登录后再试');
      } else if (errorMessage.includes('权限') || errorMessage.includes('403')) {
        alert('无权限使用此传送门');
      } else {
        alert(`传送失败: ${errorMessage}`);
      }
    }
  }, [selectedPortal, teleport]);

  /**
   * 处理动画淡出完成（场景切换时机）
   */
  const handleFadeOutComplete = useCallback(() => {
    // 使用 ref 获取最新的传送结果，避免闭包问题
    const result = teleportationResultRef.current;
    logger.info(`[TeleportationManager] 动画淡出完成，检查传送结果:`, result);
    
    if (result && result.success) {
      logger.info(`[TeleportationManager] 动画淡出完成，准备切换场景: targetHeartsphereId=${result.targetHeartsphereId}, targetShareCode=${result.targetShareCode}`);
      // 触发场景切换
      if (onTeleportationComplete) {
        onTeleportationComplete(
          result.targetHeartsphereId!,
          result.targetShareCode
        );
      } else {
        logger.warn('[TeleportationManager] onTeleportationComplete 回调未定义');
      }
    } else {
      logger.warn('[TeleportationManager] 传送结果无效或失败，无法切换场景', result);
    }
  }, [onTeleportationComplete]);

  /**
   * 处理动画完成
   */
  const handleAnimationComplete = useCallback(() => {
    // 播放到达音效
    portalAudioService.playArrivalSound().catch(err => {
      logger.warn('[TeleportationManager] 播放到达音效失败:', err);
    });

    setIsTeleporting(false);
    setSelectedPortal(null);
    setPortalPreview(null);
    setTeleportationResult(null);
  }, []);

  return (
    <>
      {/* 传送动画包装 */}
      <TeleportationAnimation
        isActive={isTeleporting}
        skipAnimation={skipAnimation}
        duration={Math.max((teleportationResult?.durationMs || 4000) * 2, 4000)} // 将时长延长一倍，至少4秒
        portalType={selectedPortal?.portalType || 'stargate'} // 传递传送门类型
        onFadeOutComplete={handleFadeOutComplete}
        onAnimationEnd={handleAnimationComplete}
        onAnimationStart={() => {
          const animDuration = Math.max((teleportationResult?.durationMs || 4000) * 2, 4000);
          logger.info(`[TeleportationManager] 动画开始: isTeleporting=${isTeleporting}, skipAnimation=${skipAnimation}, portalType=${selectedPortal?.portalType || 'stargate'}, duration=${animDuration}`);
        }}
      >
        {children}
      </TeleportationAnimation>

      {/* 预览卡片（悬停或无法访问时显示） */}
      {showPreview && portalPreview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PortalPreviewCard
              preview={portalPreview}
              onCancel={() => setShowPreview(false)}
              onTeleport={portalPreview.canAccess ? () => {
                setShowPreview(false);
                setShowConfirm(true);
              } : undefined}
            />
          </div>
        </div>
      )}

      {/* 确认对话框 */}
      {showConfirm && selectedPortal && portalPreview && (
        <TeleportationConfirmDialog
          open={showConfirm}
          portalName={selectedPortal.portalName}
          targetHeartsphereName={portalPreview.targetHeartsphereName}
          targetOwnerName={portalPreview.targetOwnerName}
          skipAnimation={skipAnimation}
          onConfirm={handleConfirmTeleport}
          onCancel={() => {
            setShowConfirm(false);
            setSelectedPortal(null);
            setPortalPreview(null);
          }}
        />
      )}
    </>
  );
};

/**
 * Hook：用于在场景组件中使用传送功能
 */
export const useTeleportation = () => {
  const handlePortalClick = useCallback((portalId: number) => {
    // 触发自定义事件，让TeleportationManager监听
    window.dispatchEvent(new CustomEvent('portal-click', {
      detail: { portalId }
    }));
  }, []);

  return {
    handlePortalClick,
  };
};
