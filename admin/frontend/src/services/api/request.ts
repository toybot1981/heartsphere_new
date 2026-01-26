// Admin API 基础请求函数

import { API_BASE_URL } from './config';
import { tokenStorage } from '@heartsphere/shared-frontend';
import { triggerTokenExpiry } from '../../utils/tokenExpiryHandler';

export interface RequestOptions extends RequestInit {
  signal?: AbortSignal;
}

/**
 * Admin API 通用请求函数
 * @param url - API端点（不包含base URL）
 * @param options - 请求选项
 * @returns Promise<T>
 */
export const request = async <T>(url: string, options?: RequestOptions): Promise<T> => {
  const method = options?.method?.toUpperCase() || 'GET';
  const fullUrl = `${API_BASE_URL}${url}`;
  
  try {
    // 处理请求体
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
    
    // 构建Headers对象
    const headers = new Headers();
    headers.set('Accept', 'application/json;charset=UTF-8');
    
    if (contentType) {
      headers.set('Content-Type', `${contentType};charset=UTF-8`);
    }
    
    // 检查自定义headers中是否已有Authorization
    let hasCustomAuthorization = false;
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        hasCustomAuthorization = options.headers.has('Authorization');
      } else if (typeof options.headers === 'object' && options.headers !== null) {
        const customHeaders = options.headers as Record<string, unknown>;
        hasCustomAuthorization = 'Authorization' in customHeaders || 'authorization' in customHeaders;
      }
    }
    
    // 添加管理员认证token
    if (!hasCustomAuthorization) {
      try {
        const token = await tokenStorage.getAdminToken();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (err) {
        console.warn('[request] 获取管理员token失败:', err);
      }
    }
    
    // 合并自定义headers
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers.set(key, value);
        });
      } else if (typeof options.headers === 'object') {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers.set(key, String(value));
        });
      }
    }
    
    // 发送请求
    const response = await fetch(fullUrl, {
      ...options,
      method,
      headers,
      body: requestBody,
      signal: options?.signal,
    });
    
    // 解析响应
    const responseContentType = response.headers.get('content-type');
    let responseData: any;
    
    if (responseContentType && responseContentType.includes('application/json')) {
      // 使用TextDecoder确保UTF-8编码正确解析
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        // 如果JSON解析失败，尝试使用TextDecoder
        const decoder = new TextDecoder('utf-8');
        const buffer = await response.arrayBuffer();
        const decodedText = decoder.decode(buffer);
        responseData = JSON.parse(decodedText);
      }
    } else {
      responseData = await response.text();
    }
    
    // 辅助函数：检测是否为认证错误
    const isAuthError = (status: number, message: string): boolean => {
      // 检测401状态码
      if (status === 401) {
        return true;
      }
      // 检测错误消息中是否包含认证相关的关键词
      const authErrorKeywords = [
        '无效的管理员token',
        'JWT验证失败',
        'token 为空',
        '无法从token中提取用户名',
        '管理员不存在',
        '管理员账号已被禁用',
        '登录已过期',
        '需要管理员认证',
        'unauthorized',
        'token expired',
        'invalid token'
      ];
      const lowerMessage = message.toLowerCase();
      return authErrorKeywords.some(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );
    };
    
    // 优先检测 401 未授权错误（token 过期）
    if (response.status === 401) {
      console.warn('[request] 检测到 401 未授权错误，token 可能已过期');
      // 使用统一的 token 过期处理机制
      triggerTokenExpiry();
      throw new Error('登录已过期，请重新登录');
    }
    
    // 处理 ApiResponse 格式的响应
    // 后端返回格式: { code: 200, message: "...", data: <实际数据>, timestamp: "..." }
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      // 检查响应状态码
      if (responseData.code !== 200 && responseData.code !== 0) {
        const errorMessage = responseData.message || `请求失败: ${responseData.code}`;
        // 检测是否为认证错误
        if (isAuthError(response.status, errorMessage)) {
          console.warn('[request] 检测到认证错误，token 可能已过期:', errorMessage);
          // 使用统一的 token 过期处理机制
          triggerTokenExpiry();
          throw new Error('登录已过期，请重新登录');
        }
        throw new Error(errorMessage);
      }
      // 如果响应不成功（HTTP状态码不是2xx），也抛出错误
      if (!response.ok) {
        const errorMessage = responseData.message || `请求失败: ${response.status} ${response.statusText}`;
        // 检测是否为认证错误
        if (isAuthError(response.status, errorMessage)) {
          console.warn('[request] 检测到认证错误，token 可能已过期:', errorMessage);
          // 使用统一的 token 过期处理机制
          triggerTokenExpiry();
          throw new Error('登录已过期，请重新登录');
        }
        throw new Error(errorMessage);
      }
      // 返回 data 字段的内容
      return responseData.data !== undefined ? responseData.data : responseData;
    }
    
    // 处理非 ApiResponse 格式的响应
    if (!response.ok) {
      let errorMessage = `请求失败: ${response.status} ${response.statusText}`;
      if (responseData && typeof responseData === 'object') {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      }
      // 检测是否为认证错误
      if (isAuthError(response.status, errorMessage)) {
        console.warn('[request] 检测到认证错误，token 可能已过期:', errorMessage);
        // 触发 token 过期事件（只触发一次）
        if (!tokenExpiredEventDispatched) {
          tokenExpiredEventDispatched = true;
          window.dispatchEvent(new CustomEvent('admin-token-expired', {
            detail: { reason: 'auth_error', status: response.status, message: errorMessage }
          }));
          // 3秒后重置标志，允许重新登录后再次检测
          setTimeout(() => {
            tokenExpiredEventDispatched = false;
          }, 3000);
        }
        throw new Error('登录已过期，请重新登录');
      }
      throw new Error(errorMessage);
    }
    
    // 直接返回响应数据（非 ApiResponse 格式）
    return responseData as T;
  } catch (error: any) {
    console.error(`[Admin API Request] ${method} ${fullUrl} 失败:`, error);
    
    // 在catch块中也检测认证错误（处理网络错误或其他异常情况）
    if (error && error.message) {
      const errorMessage = String(error.message);
      const authErrorKeywords = [
        '无效的管理员token',
        'JWT验证失败',
        'token 为空',
        '无法从token中提取用户名',
        '管理员不存在',
        '管理员账号已被禁用',
        '登录已过期',
        '需要管理员认证',
        'unauthorized',
        'token expired',
        'invalid token'
      ];
      
      const isAuthError = authErrorKeywords.some(keyword => 
        errorMessage.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isAuthError) {
        console.warn('[request] 在错误处理中检测到认证错误，token 可能已过期:', errorMessage);
        // 使用统一的 token 过期处理机制
        triggerTokenExpiry();
        throw new Error('登录已过期，请重新登录');
      }
    }
    
    throw error;
  }
};
