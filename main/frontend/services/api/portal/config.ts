/**
 * 传送门功能配置
 */

import { logger } from '../../../utils/logger';
import { request } from '../base/request';

/**
 * 传送门功能开关
 * 默认从后端配置读取，如果无法读取则使用默认值
 */
let portalEnabled: boolean | null = null;
let isChecking: boolean = false; // 防止重复请求

/**
 * 从后端获取传送门功能配置
 */
async function fetchPortalConfigFromBackend(): Promise<boolean> {
  try {
    
    // 尝试从后端API获取配置（如果后端提供了配置接口）
    // 注意：这里假设后端有一个配置接口，如果没有，可以通过其他方式获取
    // 例如：从应用启动时的全局配置或通过其他API获取
    
    // 方法1: 尝试调用后端配置API（如果存在）
    try {
      const response = await request<{ enabled?: boolean }>('/portal/config', {
        method: 'GET',
      });
      
      if (response && typeof response.enabled === 'boolean') {
        return response.enabled;
      }
    } catch (apiError: any) {
      // 如果API不存在，这是正常的，继续尝试其他方法
    }
    
    // 方法2: 通过尝试调用传送门API来判断功能是否启用
    // 如果功能未启用，API可能会返回404或特定错误
    try {
      const testResponse = await request('/portal/scene/0', {
        method: 'GET',
      });
      // 如果调用成功（即使返回空列表），说明功能已启用
      logger.info('[PortalConfig] 通过API调用检测：功能已启用');
      return true;
    } catch (testError: any) {
      // 如果返回404或特定错误，可能功能未启用
      const errorMsg = testError?.message || '';
      
      if (errorMsg.includes('404') || errorMsg.includes('not found') || testError?.status === 404) {
        logger.info('[PortalConfig] 通过API调用检测：功能未启用（404）');
        return false;
      }
      // 其他错误（如401）可能只是权限问题，功能可能已启用
      logger.info('[PortalConfig] 通过API调用检测：功能可能已启用（其他错误）');
      return true;
    }
  } catch (error) {
    console.error('[PortalConfig] ❌ 从后端获取配置失败:', error);
    logger.warn('[PortalConfig] 从后端获取配置失败，使用默认值false:', error);
    return false;
  }
}

/**
 * 检查传送门功能是否启用
 * 优先从localStorage读取缓存，然后尝试从后端API获取
 */
export async function checkPortalEnabled(): Promise<boolean> {
  logger.info('[PortalConfig] checkPortalEnabled 被调用');
  
  // 如果已经检查过，直接返回缓存值
  if (portalEnabled !== null) {
    logger.info('[PortalConfig] 使用缓存值:', portalEnabled);
    return portalEnabled;
  }

  // 防止重复请求
  if (isChecking) {
    logger.info('[PortalConfig] 正在检查中，等待结果...');
    // 等待检查完成（简单实现，最多等待2秒）
    let waitCount = 0;
    while (isChecking && waitCount < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
      if (portalEnabled !== null) {
        return portalEnabled;
      }
    }
    return false;
  }

  isChecking = true;
  
  try {
    // 尝试从localStorage读取缓存
    const cached = localStorage.getItem('portal_enabled');
    if (cached !== null) {
      portalEnabled = cached === 'true';
      logger.info('[PortalConfig] 从localStorage读取缓存:', portalEnabled);
      return portalEnabled;
    }

    // 从后端获取配置
    logger.info('[PortalConfig] 缓存不存在，从后端获取配置');
    portalEnabled = await fetchPortalConfigFromBackend();
    
    // 保存到缓存和localStorage
    if (portalEnabled) {
      localStorage.setItem('portal_enabled', 'true');
      logger.info('[PortalConfig] 传送门功能已启用（从后端获取）');
    } else {
      localStorage.setItem('portal_enabled', 'false');
      logger.info('[PortalConfig] 传送门功能未启用（从后端获取）');
    }
    
    return portalEnabled;
  } finally {
    isChecking = false;
  }
}

/**
 * 设置传送门功能开关状态
 */
export function setPortalEnabled(enabled: boolean): void {
  portalEnabled = enabled;
  localStorage.setItem('portal_enabled', enabled.toString());
}

/**
 * 同步检查传送门功能是否启用（不使用async）
 * 如果还未检查过，返回默认值false，并尝试异步获取
 */
export function isPortalEnabledSync(): boolean {
  logger.info('[PortalConfig] isPortalEnabledSync 被调用');
  
  if (portalEnabled !== null) {
    logger.info('[PortalConfig] isPortalEnabledSync 返回缓存值:', portalEnabled);
    return portalEnabled;
  }

  const cached = localStorage.getItem('portal_enabled');
  if (cached !== null) {
    portalEnabled = cached === 'true';
    logger.info('[PortalConfig] isPortalEnabledSync 从localStorage读取:', portalEnabled);
    return portalEnabled;
  }

  // 如果还没有检查过，触发异步检查（但不等待结果）
  checkPortalEnabled().catch(err => {
    console.error('[PortalConfig] 异步检查功能状态失败:', err);
    logger.warn('[PortalConfig] 异步检查功能状态失败:', err);
  });
  
  logger.info('[PortalConfig] isPortalEnabledSync 返回默认值false，已触发异步检查');
  return false;
}

/**
 * 重置配置（用于测试）
 */
export function resetPortalConfig(): void {
  portalEnabled = null;
  localStorage.removeItem('portal_enabled');
  logger.info('[PortalConfig] 配置已重置');
}

/**
 * 手动设置传送门功能状态（用于调试和测试）
 * 这不会从后端获取，直接设置本地状态
 */
export function setPortalEnabledManually(enabled: boolean): void {
  portalEnabled = enabled;
  localStorage.setItem('portal_enabled', enabled.toString());
  logger.info(`[PortalConfig] 手动设置传送门功能状态: ${enabled ? '启用' : '禁用'}`);
}

/**
 * 获取当前配置状态（用于调试）
 */
export function getPortalConfigDebugInfo(): {
  portalEnabled: boolean | null;
  localStorageValue: string | null;
  isChecking: boolean;
} {
  return {
    portalEnabled,
    localStorageValue: localStorage.getItem('portal_enabled'),
    isChecking,
  };
}
