/**
 * 传送门系统初始化
 * 在应用启动时自动检查功能状态
 */

import { checkPortalEnabled } from './config';
import { logger } from '../../../utils/logger';

let initialized = false;

/**
 * 初始化传送门系统
 * 应该在应用启动时调用
 */
export async function initPortalSystem(): Promise<void> {
  if (initialized) {
    return;
  }


  try {
    const enabled = await checkPortalEnabled();
    initialized = true;
  } catch (error) {
    console.error('[PortalInit] ❌ 传送门系统初始化失败:', error);
    logger.error('[PortalInit] 传送门系统初始化失败:', error);
  }
}

/**
 * 检查是否已初始化
 */
export function isInitialized(): boolean {
  return initialized;
}
