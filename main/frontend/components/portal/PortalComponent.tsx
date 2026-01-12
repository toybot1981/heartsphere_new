/**
 * 传送门React组件
 * 封装PortalRenderer，提供React接口
 */

import React, { useEffect, useRef, useState } from 'react';
import { PortalRenderer } from './PortalRenderer';
import type { PortalRenderConfig, PortalRendererOptions, PortalAnimationState } from './types';

interface PortalComponentProps {
  portalId: number;
  config: PortalRenderConfig;
  containerId?: string;
  className?: string;
  options?: PortalRendererOptions;
  onStateChange?: (state: PortalAnimationState) => void;
}

/**
 * 传送门组件
 * 渲染单个传送门的3D视觉效果
 */
export const PortalComponent: React.FC<PortalComponentProps> = ({
  portalId,
  config,
  containerId,
  className = '',
  options,
  onStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<PortalRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化渲染器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const init = async () => {
      try {
        const renderer = new PortalRenderer(options);
        await renderer.init(container);
        await renderer.createPortal(portalId, config);
        rendererRef.current = renderer;
        setIsInitialized(true);
        setError(null);
      } catch (err: any) {
        console.error('[PortalComponent] 初始化失败:', err);
        setError(err.message || '传送门初始化失败');
      }
    };

    init();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [portalId]); // 只在portalId变化时重新初始化

  // 更新配置
  useEffect(() => {
    if (rendererRef.current && isInitialized) {
      rendererRef.current.updatePortalConfig(portalId, config);
    }
  }, [config, portalId, isInitialized]);

  // 更新状态
  useEffect(() => {
    if (rendererRef.current && isInitialized) {
      rendererRef.current.updatePortalState(portalId, config.state);
      onStateChange?.(config.state);
    }
  }, [config.state, portalId, isInitialized, onStateChange]);

  if (error) {
    return (
      <div className={`portal-error ${className}`} style={{ padding: '10px', color: 'red' }}>
        传送门加载失败: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={`portal-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        pointerEvents: 'none', // 不拦截鼠标事件，让点击事件传递到父组件
      }}
    />
  );
};
