/**
 * 传送门渲染相关类型定义
 */

/**
 * 传送门动画状态
 */
export enum PortalAnimationState {
  IDLE = 'idle',           // 待机
  ACTIVATED = 'activated', // 激活
  TELEPORTING = 'teleporting', // 传送中
  COOLDOWN = 'cooldown'    // 冷却
}

/**
 * 传送门类型
 */
export type PortalType = 'stargate' | 'wormhole' | 'quantum';

/**
 * 传送门位置
 */
export interface PortalPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * 传送门渲染配置
 */
export interface PortalRenderConfig {
  portalType: PortalType;
  position: PortalPosition;
  size: number; // 尺寸（米）
  state: PortalAnimationState;
  opacity?: number; // 透明度（0-1）
}

/**
 * 视觉质量设置
 */
export type VisualQuality = 'low' | 'medium' | 'high';

/**
 * 渲染器选项
 */
export interface PortalRendererOptions {
  quality?: VisualQuality;
  enableParticles?: boolean;
  enableLighting?: boolean;
  maxParticles?: number;
  targetFPS?: number;
}
