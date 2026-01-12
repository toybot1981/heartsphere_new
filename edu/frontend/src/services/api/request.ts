// Edu API 基础请求函数

import { API_BASE_URL } from './config';
import { tokenStorage } from '@heartsphere/shared-frontend';

export interface RequestOptions extends RequestInit {
  signal?: AbortSignal;
}

/**
 * Edu API 通用请求函数
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
    headers.set('Accept', 'application/json');
    
    if (contentType) {
      headers.set('Content-Type', contentType);
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
    
    // 添加用户认证token
    if (!hasCustomAuthorization) {
      try {
        const token = await tokenStorage.getToken();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (err) {
        console.warn('[request] 获取用户token失败:', err);
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
    
    // 处理响应
    if (!response.ok) {
      let errorMessage = `请求失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // 如果响应不是JSON，使用默认错误信息
      }
      throw new Error(errorMessage);
    }
    
    // 解析响应
    const responseContentType = response.headers.get('content-type');
    if (responseContentType && responseContentType.includes('application/json')) {
      const jsonData = await response.json();
      // 如果响应是 ApiResponse 格式，提取 data
      if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
        return jsonData.data as T;
      }
      return jsonData as T;
    } else {
      return await response.text() as unknown as T;
    }
  } catch (error: any) {
    console.error(`[Edu API Request] ${method} ${fullUrl} 失败:`, error);
    throw error;
  }
};
