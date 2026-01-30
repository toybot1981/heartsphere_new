/**
 * 统一的 Token 过期处理机制
 * 确保在整个应用生命周期中，token 过期事件只被处理一次
 */

// 全局状态：是否正在处理 token 过期
let isHandlingTokenExpiry = false;
// 全局状态：是否已经触发过 token 过期事件
let hasTokenExpired = false;

/**
 * 触发 token 过期事件（带防重复机制）
 * @returns 是否成功触发（如果已经在处理中，返回 false）
 */
export const triggerTokenExpiry = (): boolean => {
  // 如果已经在处理中，直接返回
  if (isHandlingTokenExpiry || hasTokenExpired) {
    console.log('[TokenExpiryHandler] Token过期事件已在处理中或已触发，跳过重复触发');
    return false;
  }

  // 标记为已触发
  hasTokenExpired = true;
  
  // 触发事件
  window.dispatchEvent(new CustomEvent('admin-token-expired', {
    detail: { 
      timestamp: Date.now(),
      reason: 'token_expired'
    }
  }));
  
  console.log('[TokenExpiryHandler] Token过期事件已触发');
  return true;
};

/**
 * 开始处理 token 过期（由 AdminAuthContext 调用）
 * @returns 是否应该处理（如果已经在处理中，返回 false）
 */
export const startHandlingTokenExpiry = (): boolean => {
  if (isHandlingTokenExpiry) {
    console.log('[TokenExpiryHandler] Token过期已在处理中，跳过重复处理');
    return false;
  }

  isHandlingTokenExpiry = true;
  console.log('[TokenExpiryHandler] 开始处理Token过期');
  return true;
};

/**
 * 完成处理 token 过期（由 AdminAuthContext 调用）
 * 在用户重新登录后调用，重置所有状态
 */
export const completeHandlingTokenExpiry = (): void => {
  isHandlingTokenExpiry = false;
  hasTokenExpired = false;
  console.log('[TokenExpiryHandler] Token过期处理完成，状态已重置');
};

/**
 * 重置 token 过期状态（用于测试或特殊情况）
 */
export const resetTokenExpiryState = (): void => {
  isHandlingTokenExpiry = false;
  hasTokenExpired = false;
  console.log('[TokenExpiryHandler] Token过期状态已重置');
};
