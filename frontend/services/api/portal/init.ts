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
    console.log('[PortalInit] 传送门系统已初始化，跳过');
    return;
  }

  console.log('[PortalInit] 🚀 开始初始化传送门系统...');
  logger.info('[PortalInit] 开始初始化传送门系统');

  try {
    const enabled = await checkPortalEnabled();
    console.log(`[PortalInit] ${enabled ? '✅' : '❌'} 传送门系统初始化完成: ${enabled ? '已启用' : '未启用'}`);
    logger.info(`[PortalInit] 传送门系统初始化完成: ${enabled ? '已启用' : '未启用'}`);
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
