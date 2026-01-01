/**
 * 错误处理工具函数
 * 统一处理AI调用和其他业务逻辑的错误
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  AUTH = 'auth',
  UNKNOWN = 'unknown',
}

/**
 * 错误消息映射
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: '【网络错误：请检查网络连接后重试】',
  [ErrorType.TIMEOUT]: '【请求超时：请稍后重试】',
  [ErrorType.RATE_LIMIT]: '【请求过于频繁：请稍后再试】',
  [ErrorType.AUTH]: '【认证失败：请检查API密钥配置】',
  [ErrorType.UNKNOWN]: '【系统错误：连接失败，请稍后重试】',
};

/**
 * 识别错误类型
 */
export function identifyErrorType(error: Error | unknown): ErrorType {
  if (!(error instanceof Error)) {
    return ErrorType.UNKNOWN;
  }
  
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return ErrorType.NETWORK;
  }
  if (message.includes('timeout')) {
    return ErrorType.TIMEOUT;
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return ErrorType.RATE_LIMIT;
  }
  if (message.includes('auth') || message.includes('401') || message.includes('403')) {
    return ErrorType.AUTH;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * 获取错误消息
 */
export function getErrorMessage(error: Error | unknown): string {
  const errorType = identifyErrorType(error);
  return ERROR_MESSAGES[errorType];
}

/**
 * 创建错误消息对象
 */
export function createErrorMessage(
  requestId: string,
  error: Error | unknown
): { id: string; role: 'model'; text: string; timestamp: number; isError?: boolean } {
  return {
    id: requestId,
    role: 'model',
    text: getErrorMessage(error),
    timestamp: Date.now(),
    isError: true,
  };
}
