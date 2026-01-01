// 基础请求函数，用于处理与后端的通信

import { getSharedModeState } from './sharedModeState';
import { API_BASE_URL } from '../config';
import { logger } from '../../../utils/logger';

export interface RequestOptions extends RequestInit {
  signal?: AbortSignal;
}

/**
 * 通用请求函数
 * @param url - API端点（不包含base URL）
 * @param options - 请求选项
 * @returns Promise<T>
 */
export const request = async <T>(url: string, options?: RequestOptions): Promise<T> => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const fullUrl = `${API_BASE_URL}${url}`;
  const method = options?.method?.toUpperCase() || 'GET';
  
  // 检查是否是 subscription-plans 的请求（用于静默处理404）
  const isSubscriptionPlansRequest = url.includes('/subscription-plans');
  
  try {
    // 1. 确保请求体正确处理
    let requestBody: string | FormData | undefined = undefined;
    let contentType: string | undefined = 'application/json';
    
    if (options?.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (options.body instanceof FormData) {
        requestBody = options.body;
        contentType = undefined; // 让浏览器自动设置
      } else {
        requestBody = typeof options.body === 'string' 
          ? options.body 
          : JSON.stringify(options.body);
      }
    }
    
    // 2. 构建Headers对象（直接使用Headers而不是普通对象）
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    
    // 只在需要时设置Content-Type (不是FormData)
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    // 2.3. 添加认证token（如果存在）
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (err) {
      // 静默处理，不影响正常请求
      logger.debug('获取认证token失败:', err);
    }
    
    // 2.5. 添加共享模式标识（如果存在且接口需要）
    // 只在需要共享模式上下文的接口上添加请求头
    const needsSharedMode = url.includes('/quick-connect/') || 
                           url.includes('/heartconnect/shared/') ||
                           (url.includes('/heartconnect/config/') && !url.includes('/heartconnect/config/by-code/')) ||
                           url.includes('/heartconnect/connection/');
    
    // 明确不需要共享模式的接口
    const excludesSharedMode = url.includes('/auth/') ||
                               url.includes('/admin/') ||
                               url.includes('/favorites/') ||
                               url.includes('/access-history/') ||
                               url.includes('/heartconnect/config/by-code/');
    
    if (needsSharedMode && !excludesSharedMode) {
      try {
        const sharedModeState = getSharedModeState();
        if (sharedModeState.shareConfigId) {
          headers.set('X-Shared-Mode', 'true');
          headers.set('X-Share-Config-Id', sharedModeState.shareConfigId.toString());
        }
      } catch (err) {
        // 静默处理，不影响正常请求
        logger.error('[request] 检查共享模式时发生错误:', err);
      }
    }
    
    // 3. 合并自定义headers（保护共享模式请求头不被覆盖）
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          const lowerKey = key.toLowerCase();
          // 保护共享模式请求头和系统请求头
          if (lowerKey !== 'content-type' && 
              lowerKey !== 'accept' && 
              lowerKey !== 'x-shared-mode' && 
              lowerKey !== 'x-share-config-id') {
            headers.set(key, value);
          }
        });
      } else if (typeof options.headers === 'object' && options.headers !== null) {
        const customHeaders = options.headers as Record<string, unknown>;
        Object.entries(customHeaders).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase();
          // 保护共享模式请求头和系统请求头
          if (lowerKey !== 'content-type' && 
              lowerKey !== 'accept' && 
              lowerKey !== 'x-shared-mode' && 
              lowerKey !== 'x-share-config-id' && 
              value != null) {
            headers.set(key, String(value));
          }
        });
      }
    }
    
    // 3.5. 在实际调用API之前打印传输参数和请求头
    logger.debug(`[request] ========== API调用信息 ==========`);
    logger.debug(`[request] URL: ${fullUrl}`);
    logger.debug(`[request] Method: ${method}`);
    logger.debug(`[request] 请求头:`, Object.fromEntries(headers.entries()));
    if (requestBody) {
      if (requestBody instanceof FormData) {
        logger.debug(`[request] Body: FormData (${requestBody instanceof FormData ? '是' : '否'})`);
      } else {
        try {
          const bodyStr = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
          logger.debug(`[request] Body:`, bodyStr.length > 500 ? bodyStr.substring(0, 500) + '...' : bodyStr);
        } catch (e) {
          logger.debug(`[request] Body: [无法序列化]`);
        }
      }
    } else {
      logger.debug(`[request] Body: null`);
    }
    logger.debug(`[request] ========== API调用信息结束 ==========`);

    // 4. 发送请求
    const response = await fetch(fullUrl, {
      method,
      headers: headers, // 直接使用 Headers 对象
      body: requestBody,
      credentials: options?.credentials || 'include',
      cache: options?.cache || 'no-cache',
      redirect: options?.redirect || 'follow',
      referrer: options?.referrer,
      referrerPolicy: options?.referrerPolicy,
      mode: options?.mode || 'cors',
      signal: options?.signal,
    });


    // 6. 处理错误响应
    if (!response.ok) {
      // 尝试解析错误响应
      let errorText = '';
      let errorMessage = '';
      try {
        errorText = await response.text();
        
        // 对于某些特定的404错误，静默处理（不输出错误日志）
        const isSubscriptionPlans404 = response.status === 404 && url.includes('/subscription-plans');
        const isShareConfigNotFound = response.status === 404 && (
          url.includes('/heartconnect/config/my') || 
          url.includes('/heartconnect/config/by-code')
        );
        if (!isSubscriptionPlans404 && !isShareConfigNotFound) {
          logger.error(`[${requestId}] 错误响应文本:`, errorText);
        }
        
        // 尝试解析JSON错误响应
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          // 如果不是JSON，直接使用文本
          errorMessage = errorText;
        }
      } catch (e) {
        if (!(response.status === 404 && url.includes('/subscription-plans'))) {
          logger.error(`[${requestId}] 解析错误响应失败:`, e);
        }
      }
      
      // 对于 subscription-plans 的 404，直接抛出错误让调用方处理
      if (response.status === 404 && url.includes('/subscription-plans')) {
        throw new Error('Not Found');
      }
      
      // 对于共享配置不存在的404，使用更友好的错误消息
      const isShareConfigNotFound = response.status === 404 && (
        url.includes('/heartconnect/config/my') || 
        url.includes('/heartconnect/config/by-code')
      ) && (errorMessage && (
        errorMessage.includes('共享配置不存在') ||
        errorMessage.includes('共享码不存在')
      ));
      
      // 根据状态码提供更友好的错误信息
      if (response.status === 403) {
        errorMessage = errorMessage || '权限不足：您没有权限执行此操作';
      } else if (response.status === 404) {
        // 对于某些特定的404错误，不记录为错误（如共享配置不存在是正常情况）
        const isShareConfigNotFound = errorMessage && (
          errorMessage.includes('共享配置不存在') ||
          errorMessage.includes('共享码不存在')
        );
        if (isShareConfigNotFound) {
          // 静默处理，不输出错误日志
          logger.debug(`[${requestId}] 资源不存在（正常情况）:`, errorMessage);
        } else {
          errorMessage = errorMessage || '资源不存在或已被删除';
        }
      } else if (response.status === 401) {
        errorMessage = errorMessage || '未授权：请重新登录';
        // 清除认证 token
        localStorage.removeItem('auth_token');
        // 如果是管理后台相关的请求，清除 admin token
        if (url.includes('/admin/')) {
          localStorage.removeItem('admin_token');
          // 触发自定义事件，通知 AdminScreen 清除 token
          window.dispatchEvent(new CustomEvent('admin-token-expired'));
        }
        // 触发自定义事件，通知应用需要重新登录
        window.dispatchEvent(new CustomEvent('auth-token-expired'));
      } else if (response.status === 500) {
        errorMessage = errorMessage || '服务器内部错误，请稍后重试';
        // 如果是管理后台相关的请求且错误信息包含 token 验证失败，清除 admin token
        if (url.includes('/admin/') && (errorText.includes('token') || errorText.includes('Token') || errorText.includes('JWT'))) {
          localStorage.removeItem('admin_token');
          window.dispatchEvent(new CustomEvent('admin-token-expired'));
        }
      } else {
        errorMessage = errorMessage || `请求失败: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // 7. 检查响应是否有内容（204 No Content 等状态码没有响应体）
    const responseContentType = response.headers.get('content-type');
    
      // 如果是 204 No Content，直接返回（不尝试读取响应体）
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    // 8. 尝试读取响应体
    const text = await response.text();
    
    // 如果响应体为空，直接返回
    if (!text || text.trim() === '') {
      return undefined as unknown as T;
    }

    // 9. 检查内容类型是否为 JSON，或者尝试解析为 JSON
    if (responseContentType && responseContentType.includes('application/json')) {
      try {
        const data = JSON.parse(text);
        
        // 如果响应是 ApiResponse 格式（包含 code, message, data），提取 data 部分
        if (data && typeof data === 'object' && 'data' in data && 'code' in data) {
          return data.data;
        }
        
        return data;
      } catch (e) {
        // JSON 解析失败，返回文本
        return text as unknown as T;
      }
    } else {
      // 非 JSON 响应，返回文本
      return text as unknown as T;
    }
  } catch (error: unknown) {
    // 对于某些特定的404错误，不记录为错误（如共享配置不存在是正常情况）
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isShareConfigNotFound = errorMessage && (
      errorMessage.includes("共享配置不存在") ||
      errorMessage.includes("共享码不存在")
    );
    
    if (!isSubscriptionPlansRequest && !isShareConfigNotFound) {
      logger.error(`[${requestId}] 请求异常:`, error);
    } else if (isShareConfigNotFound) {
      logger.debug(`[${requestId}] 资源不存在（正常情况）:`, errorMessage);
    }
    throw error;
  }
};

