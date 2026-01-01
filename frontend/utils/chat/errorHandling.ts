/**
 * 错误处理工具
 * 统一处理AI服务调用错误
 */

/**
 * 错误类型枚举
 */
export enum AIErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  AUTH = 'auth',
  UNKNOWN = 'unknown',
}

/**
 * 获取错误类型
 */
export const getErrorType = (error: Error | unknown): AIErrorType => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return AIErrorType.NETWORK;
  }
  if (lowerMessage.includes('timeout')) {
    return AIErrorType.TIMEOUT;
  }
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
    return AIErrorType.RATE_LIMIT;
  }
  if (lowerMessage.includes('auth') || lowerMessage.includes('401') || lowerMessage.includes('403')) {
    return AIErrorType.AUTH;
  }
  
  return AIErrorType.UNKNOWN;
};

/**
 * 获取用户友好的错误消息
 */
export const getErrorMessage = (error: Error | unknown): string => {
  const errorType = getErrorType(error);
  
  const errorMessages: Record<AIErrorType, string> = {
    [AIErrorType.NETWORK]: '【网络错误：请检查网络连接后重试】',
    [AIErrorType.TIMEOUT]: '【请求超时：请稍后重试】',
    [AIErrorType.RATE_LIMIT]: '【请求过于频繁：请稍后再试】',
    [AIErrorType.AUTH]: '【认证失败：请重新登录】',
    [AIErrorType.UNKNOWN]: '【系统错误：连接失败，请稍后重试】',
  };
  
  return errorMessages[errorType];
};

/**
 * 创建错误消息对象
 */
export const createErrorMessage = (error: Error | unknown, requestId: string) => {
  return {
    id: requestId,
    role: 'model' as const,
    text: getErrorMessage(error),
    timestamp: Date.now(),
    isError: true,
  };
};
