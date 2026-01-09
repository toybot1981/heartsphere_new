/**
 * 传送门Hook
 * 管理传送门相关的状态和操作
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { portalApi } from '../services/api/portal';
import type {
  PortalConfig,
  CreatePortalRequest,
  UpdatePortalRequest,
  PortalPreview,
  TeleportationResult,
} from '../services/api/portal/types';
import { logger } from '../utils/logger';

interface PortalState {
  portals: PortalConfig[];
  activePortalId: number | null;
  isTeleporting: boolean;
  teleportationResult: TeleportationResult | null;
  loading: boolean;
  error: string | null;
}

/**
 * 传送门Hook
 */
export const usePortal = (sceneId?: number | null) => {
  const [state, setState] = useState<PortalState>({
    portals: [],
    activePortalId: null,
    isTeleporting: false,
    teleportationResult: null,
    loading: false,
    error: null,
  });

  // 使用ref保存最新的state，避免闭包问题
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * 加载场景的传送门列表
   */
  const loadPortals = useCallback(async (targetSceneId?: number | null) => {
    const id = targetSceneId ?? sceneId;
    if (!id) {
      logger.warn('[usePortal] loadPortals: sceneId未提供');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const portals = await portalApi.getPortalsByScene(id, true); // 只加载激活的传送门
      setState(prev => ({
        ...prev,
        portals,
        loading: false,
      }));
      logger.debug(`[usePortal] 加载传送门列表成功: sceneId=${id}, count=${portals.length}`);
    } catch (error: any) {
      const errorMessage = error?.message || '加载传送门列表失败';
      logger.error(`[usePortal] 加载传送门列表失败:`, error);
      setState(prev => ({
        ...prev,
        portals: [], // 确保 portals 始终是数组
        loading: false,
        error: errorMessage,
      }));
    }
  }, [sceneId]);

  /**
   * 创建传送门
   */
  const createPortal = useCallback(async (data: CreatePortalRequest): Promise<PortalConfig | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const portal = await portalApi.createPortal(data);
      setState(prev => ({
        ...prev,
        portals: [...prev.portals, portal],
        loading: false,
      }));
      logger.debug(`[usePortal] 创建传送门成功: portalId=${portal.id}`);
      return portal;
    } catch (error: any) {
      const errorMessage = error?.message || '创建传送门失败';
      logger.error(`[usePortal] 创建传送门失败:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  /**
   * 更新传送门
   */
  const updatePortal = useCallback(async (
    portalId: number,
    data: UpdatePortalRequest
  ): Promise<PortalConfig | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const portal = await portalApi.updatePortal(portalId, data);
      setState(prev => ({
        ...prev,
        portals: prev.portals.map(p => p.id === portalId ? portal : p),
        loading: false,
      }));
      logger.debug(`[usePortal] 更新传送门成功: portalId=${portalId}`);
      return portal;
    } catch (error: any) {
      const errorMessage = error?.message || '更新传送门失败';
      logger.error(`[usePortal] 更新传送门失败:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  /**
   * 删除传送门
   */
  const deletePortal = useCallback(async (portalId: number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await portalApi.deletePortal(portalId);
      setState(prev => ({
        ...prev,
        portals: prev.portals.filter(p => p.id !== portalId),
        activePortalId: prev.activePortalId === portalId ? null : prev.activePortalId,
        loading: false,
      }));
      logger.debug(`[usePortal] 删除传送门成功: portalId=${portalId}`);
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || '删除传送门失败';
      logger.error(`[usePortal] 删除传送门失败:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  /**
   * 获取传送门预览
   */
  const getPreview = useCallback(async (portalId: number): Promise<PortalPreview | null> => {
    try {
      const preview = await portalApi.getPortalPreview(portalId);
      return preview;
    } catch (error: any) {
      logger.error(`[usePortal] 获取传送门预览失败:`, error);
      return null;
    }
  }, []);

  /**
   * 执行传送
   */
  const teleport = useCallback(async (
    portalId: number,
    skipAnimation: boolean = false
  ): Promise<TeleportationResult | null> => {
    setState(prev => ({
      ...prev,
      isTeleporting: true,
      activePortalId: portalId,
      error: null,
    }));

    try {
      const result = await portalApi.executeTeleportation(portalId, { skipAnimation });
      setState(prev => ({
        ...prev,
        isTeleporting: false,
        teleportationResult: result,
      }));
      logger.debug(`[usePortal] 传送成功: portalId=${portalId}, result=`, result);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || '传送失败';
      logger.error(`[usePortal] 传送失败:`, error);
      setState(prev => ({
        ...prev,
        isTeleporting: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  /**
   * 设置激活的传送门
   */
  const setActivePortal = useCallback((portalId: number | null) => {
    setState(prev => ({ ...prev, activePortalId: portalId }));
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      portals: [],
      activePortalId: null,
      isTeleporting: false,
      teleportationResult: null,
      loading: false,
      error: null,
    });
  }, []);

  // 当sceneId变化时，自动加载传送门列表
  useEffect(() => {
    logger.debug('[usePortal] sceneId变化，检查是否需要加载传送门', {
      sceneId,
      hasSceneId: !!sceneId,
    });
    
    if (sceneId) {
      logger.info(`[usePortal] 开始自动加载传送门列表: sceneId=${sceneId}`);
      loadPortals(sceneId);
    } else {
      logger.warn('[usePortal] sceneId为空，跳过加载传送门列表');
    }
  }, [sceneId, loadPortals]);

  return {
    // 状态（确保 portals 始终是数组）
    portals: state.portals || [],
    activePortalId: state.activePortalId,
    isTeleporting: state.isTeleporting,
    teleportationResult: state.teleportationResult,
    loading: state.loading,
    error: state.error,

    // 操作方法
    loadPortals,
    createPortal,
    updatePortal,
    deletePortal,
    getPreview,
    teleport,
    setActivePortal,
    clearError,
    reset,
  };
};
