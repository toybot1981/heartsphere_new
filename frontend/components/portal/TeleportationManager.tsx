/**
 * 传送管理器
 * 协调传送动画、场景切换、状态更新
 */

import React, { useState, useCallback, useEffect } from 'react';
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
        console.log(`[TeleportationManager] 📡 收到传送门点击事件: portalId=${portalId}`);
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
    setIsTeleporting(true);

    // 播放传送音效
    if (!skip) {
      portalAudioService.playTeleportationSound().catch(err => {
        logger.warn('[TeleportationManager] 播放传送音效失败:', err);
      });
    }

    try {
      const result = await teleport(selectedPortal.id, skip);
      setTeleportationResult(result);

      if (result && result.success) {
        logger.info(`[TeleportationManager] 传送成功: targetHeartsphereId=${result.targetHeartsphereId}`);
        // 动画完成后触发场景切换
        // 这里不立即切换，等动画完成后通过onFadeOutComplete回调
      } else {
        // 传送失败
        setIsTeleporting(false);
        alert(result?.errorMessage || '传送失败，请稍后重试');
      }
    } catch (error: any) {
      logger.error(`[TeleportationManager] 传送失败:`, error);
      setIsTeleporting(false);
      alert('传送失败，请稍后重试');
    }
  }, [selectedPortal, teleport]);

  /**
   * 处理动画淡出完成（场景切换时机）
   */
  const handleFadeOutComplete = useCallback(() => {
    if (teleportationResult && teleportationResult.success) {
      // 触发场景切换
      onTeleportationComplete?.(
        teleportationResult.targetHeartsphereId!,
        teleportationResult.targetShareCode
      );
    }
  }, [teleportationResult, onTeleportationComplete]);

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
        duration={teleportationResult?.durationMs || 2000}
        onFadeOutComplete={handleFadeOutComplete}
        onAnimationEnd={handleAnimationComplete}
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
