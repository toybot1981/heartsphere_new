/**
 * 传送门渲染层组件
 * 作为场景中的独立图层，管理所有传送门的渲染
 */

import React, { useEffect, useRef, useState } from 'react';
import { PortalRenderer } from './PortalRenderer';
import type { PortalConfig } from '../../services/api/portal/types';
import type { PortalRenderConfig, PortalRendererOptions, PortalAnimationState } from './types';
import { isPortalEnabledSync, checkPortalEnabled } from '../../services/api/portal/config';
import { logger } from '../../utils/logger';

interface PortalLayerProps {
  portals: PortalConfig[];
  sceneId?: number | null;
  onPortalClick?: (portalId: number) => void;
  onPortalHover?: (portalId: number | null) => void;
  className?: string;
  options?: PortalRendererOptions;
}

/**
 * 传送门渲染层
 * 条件渲染，只在功能启用时显示
 */
export const PortalLayer: React.FC<PortalLayerProps> = ({
  portals,
  sceneId,
  onPortalClick,
  onPortalHover,
  className = '',
  options,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<PortalRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPortalId, setHoveredPortalId] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  // 异步检查功能是否启用（首次加载时）
  useEffect(() => {
    console.log('[PortalLayer] 🚀 组件挂载，开始检查功能状态');
    const checkEnabled = async () => {
      console.log('[PortalLayer] 调用 checkPortalEnabled()');
      const enabled = await checkPortalEnabled();
      console.log(`[PortalLayer] ${enabled ? '✅' : '❌'} 功能状态检查完成: ${enabled ? '已启用' : '未启用'}`);
      logger.info(`[PortalLayer] 功能状态检查完成: ${enabled ? '已启用' : '未启用'}`);
      setIsEnabled(enabled);
    };
    checkEnabled();
  }, []);
  
  // 同步检查作为fallback
  const enabledSync = isPortalEnabledSync();
  const finalEnabled = isEnabled || enabledSync;
  
  // 添加调试日志
  useEffect(() => {
    console.log('[PortalLayer] 📊 组件渲染状态', {
      isEnabled: finalEnabled,
      enabledSync,
      portalsCount: portals.length,
      sceneId,
      activePortalsCount: portals.filter(p => p.isActive).length,
    });
    logger.debug('[PortalLayer] 组件渲染', {
      isEnabled: finalEnabled,
      enabledSync,
      portalsCount: portals.length,
      sceneId,
      activePortalsCount: portals.filter(p => p.isActive).length,
    });
  }, [finalEnabled, enabledSync, portals.length, sceneId]);

  // 初始化渲染器
  useEffect(() => {
    logger.debug('[PortalLayer] 初始化效果执行', {
      isEnabled: finalEnabled,
      hasContainer: !!containerRef.current,
      portalsCount: portals.length,
    });
    
    if (!finalEnabled) {
      logger.warn('[PortalLayer] 功能未启用，跳过初始化。提示：请检查后端配置 heartconnect.portal.enabled=true');
      return; // 功能未启用，不初始化
    }

    const container = containerRef.current;
    if (!container) return;

    const init = async () => {
      logger.debug('[PortalLayer] 开始初始化PortalRenderer', {
        containerSize: {
          width: container.clientWidth,
          height: container.clientHeight,
        },
        options,
      });
      
      try {
        const renderer = new PortalRenderer(options);
        logger.debug('[PortalLayer] PortalRenderer实例创建成功，开始初始化...');
        await renderer.init(container);
        logger.debug('[PortalLayer] PortalRenderer初始化成功');

        // 创建所有传送门
        const activePortals = portals.filter(p => p.isActive);
        logger.debug('[PortalLayer] 准备创建传送门', {
          totalPortals: portals.length,
          activePortals: activePortals.length,
          portals: activePortals.map(p => ({
            id: p.id,
            name: p.portalName,
            type: p.portalType,
          })),
        });
        
        for (const portal of activePortals) {
          const renderConfig: PortalRenderConfig = {
            portalType: portal.portalType as any,
            position: {
              x: portal.positionX || 0,
              y: portal.positionY || 0,
              z: portal.positionZ || 0,
            },
            size: portal.size || 3.0,
            state: 'idle' as PortalAnimationState,
          };

          logger.debug(`[PortalLayer] 创建传送门: ${portal.portalName} (ID: ${portal.id})`, renderConfig);
          await renderer.createPortal(portal.id, renderConfig);
          logger.debug(`[PortalLayer] 传送门创建成功: ${portal.portalName}`);
        }
        
        logger.info(`[PortalLayer] 所有传送门创建完成，共 ${activePortals.length} 个`);

        rendererRef.current = renderer;
        setIsInitialized(true);
        setError(null);
        logger.info('[PortalLayer] 传送门渲染层初始化成功');
      } catch (err: any) {
        logger.error('[PortalLayer] 初始化失败:', err);
        console.error('[PortalLayer] 初始化失败:', err);
        setError(err.message || '传送门渲染层初始化失败');
        
        // 提供更详细的错误信息
        if (err.message?.includes('Three.js未安装')) {
          logger.error('[PortalLayer] Three.js未安装，请运行: npm install three @types/three');
        }
      }
    };

    init();

    return () => {
      if (rendererRef.current) {
        logger.debug('[PortalLayer] 清理PortalRenderer');
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [finalEnabled]); // 只在功能启用状态变化时重新初始化

  // 同步传送门列表
  useEffect(() => {
    if (!rendererRef.current || !isInitialized) return;

    const currentPortalIds = new Set(portals.filter(p => p.isActive).map(p => p.id));
    const renderedPortalIds = new Set(Array.from((rendererRef.current as any).portals.keys()));

    // 添加新传送门
    portals
      .filter(p => p.isActive && !renderedPortalIds.has(p.id))
      .forEach(async portal => {
        const renderConfig: PortalRenderConfig = {
          portalType: portal.portalType as any,
          position: {
            x: portal.positionX || 0,
            y: portal.positionY || 0,
            z: portal.positionZ || 0,
          },
          size: portal.size || 3.0,
          state: 'idle' as PortalAnimationState,
        };
        try {
          await rendererRef.current!.createPortal(portal.id, renderConfig);
        } catch (err) {
          console.error(`[PortalLayer] 创建传送门失败: portalId=${portal.id}`, err);
        }
      });

    // 移除已删除的传送门
    renderedPortalIds.forEach(portalId => {
      if (!currentPortalIds.has(portalId)) {
        rendererRef.current!.removePortal(portalId);
      }
    });

    // 更新现有传送门配置
    portals
      .filter(p => p.isActive && renderedPortalIds.has(p.id))
      .forEach(portal => {
        rendererRef.current!.updatePortalConfig(portal.id, {
          position: {
            x: portal.positionX || 0,
            y: portal.positionY || 0,
            z: portal.positionZ || 0,
          },
          size: portal.size || 3.0,
        });
      });
  }, [portals, isInitialized]);

  // 处理鼠标事件（检测点击和悬停）
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rendererRef.current || !onPortalHover) return;

    // TODO: 实现射线检测，确定鼠标下的传送门
    // 这里简化处理，后续可以通过Three.js的Raycaster实现
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!rendererRef.current || !onPortalClick) return;

    // TODO: 实现射线检测，确定点击的传送门
    // 这里简化处理，后续可以通过Three.js的Raycaster实现
  };

  // 如果功能未启用，不渲染
  if (!finalEnabled) {
    console.warn('[PortalLayer] ⚠️ 功能未启用，不渲染组件', {
      isEnabled,
      enabledSync,
      localStorageValue: localStorage.getItem('portal_enabled'),
    });
    logger.debug('[PortalLayer] 功能未启用，不渲染组件', {
      isEnabled,
      enabledSync,
      localStorageValue: localStorage.getItem('portal_enabled'),
    });
    return null;
  }

  if (error) {
    return (
      <div className={`portal-layer-error ${className}`} style={{ padding: '10px', color: 'orange' }}>
        传送门渲染层加载失败: {error}
        <br />
        <small>这不会影响其他功能的使用</small>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`portal-layer ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto', // 允许接收鼠标事件
        zIndex: 10, // 确保在其他元素之上
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
};
