// 基础请求函数，用于处理与后端的通信

const API_BASE_URL = 'http://localhost:8081/api';

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
  
  // 日志记录（对于 subscription-plans 的请求，静默处理）
  if (!isSubscriptionPlansRequest) {
    console.log(`=== [API Request] ${requestId} 开始 ===`);
    console.log(`[${requestId}] 基本信息:`, {
      url: fullUrl,
      method: method,
      hasBody: !!options?.body,
      timestamp: new Date().toISOString()
    });
  }
  
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
    
    // 2. 构建headers对象
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    // 只在需要时设置Content-Type (不是FormData)
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    // 3. 合并自定义headers
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey !== 'content-type' && lowerKey !== 'accept') {
            headers[key] = value;
          }
        });
      } else if (typeof options.headers === 'object' && options.headers !== null) {
        const customHeaders = options.headers as Record<string, unknown>;
        Object.entries(customHeaders).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey !== 'content-type' && lowerKey !== 'accept' && value != null) {
            headers[key] = String(value);
          }
        });
      }
    }

    // 4. 发送请求
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: requestBody,
      credentials: options?.credentials || 'include',
      cache: options?.cache || 'no-cache',
      redirect: options?.redirect || 'follow',
      referrer: options?.referrer,
      referrerPolicy: options?.referrerPolicy,
      mode: options?.mode || 'cors',
      signal: options?.signal,
    });

    // 5. 调试：显示响应状态（对于 subscription-plans 的 404 错误，静默处理）
    if (!(isSubscriptionPlansRequest && response.status === 404)) {
      console.log(`[${requestId}] 响应状态:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    // 6. 处理错误响应
    if (!response.ok) {
      // 尝试解析错误响应
      let errorText = '';
      let errorMessage = '';
      try {
        errorText = await response.text();
        
        // 对于 subscription-plans 的 404 错误，静默处理（不输出错误日志）
        const isSubscriptionPlans404 = response.status === 404 && url.includes('/subscription-plans');
        if (!isSubscriptionPlans404) {
          console.error(`[${requestId}] 错误响应文本:`, errorText);
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
          console.error(`[${requestId}] 解析错误响应失败:`, e);
        }
      }
      
      // 对于 subscription-plans 的 404，直接抛出错误让调用方处理
      if (response.status === 404 && url.includes('/subscription-plans')) {
        throw new Error('Not Found');
      }
      
      // 根据状态码提供更友好的错误信息
      if (response.status === 403) {
        errorMessage = errorMessage || '权限不足：您没有权限执行此操作';
      } else if (response.status === 404) {
        errorMessage = errorMessage || '资源不存在或已被删除';
      } else if (response.status === 401) {
        errorMessage = errorMessage || '未授权：请重新登录';
        // 清除认证 token
        console.warn('[API] 检测到 token 验证失败，清除本地 token');
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
          console.warn('[API] 检测到管理后台 token 验证失败（500错误），清除本地 token');
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
      console.log(`[${requestId}] 请求成功，无响应体 (204 No Content)`);
      console.log(`=== [API Request] ${requestId} 完成 ===`);
      return undefined as unknown as T;
    }

    // 8. 尝试读取响应体
    const text = await response.text();
    
    // 如果响应体为空，直接返回
    if (!text || text.trim() === '') {
      console.log(`[${requestId}] 请求成功，响应体为空`);
      console.log(`=== [API Request] ${requestId} 完成 ===`);
      return undefined as unknown as T;
    }

    // 9. 检查内容类型是否为 JSON，或者尝试解析为 JSON
    if (responseContentType && responseContentType.includes('application/json')) {
      try {
        const data = JSON.parse(text);
        console.log(`[${requestId}] 请求成功，响应数据:`, data);
        
        // 如果响应是 ApiResponse 格式（包含 code, message, data），提取 data 部分
        if (data && typeof data === 'object' && 'data' in data && 'code' in data) {
          console.log(`[${requestId}] 检测到 ApiResponse 格式，提取 data 字段`);
          console.log(`[${requestId}] ApiResponse code:`, data.code, 'message:', data.message);
          console.log(`[${requestId}] ApiResponse data:`, data.data);
          console.log(`=== [API Request] ${requestId} 完成 ===`);
          return data.data;
        }
        
        console.log(`=== [API Request] ${requestId} 完成 ===`);
        return data;
      } catch (e) {
        // JSON 解析失败，返回文本
        console.warn(`[${requestId}] JSON 解析失败，返回文本:`, e);
        console.log(`[${requestId}] 请求成功，响应文本:`, text);
        console.log(`=== [API Request] ${requestId} 完成 ===`);
        return text as unknown as T;
      }
    } else {
      // 非 JSON 响应，返回文本
      console.log(`[${requestId}] 请求成功，响应文本:`, text);
      console.log(`=== [API Request] ${requestId} 完成 ===`);
      return text as unknown as T;
    }
  } catch (error: any) {
    if (!isSubscriptionPlansRequest) {
      console.error(`[${requestId}] 请求异常:`, error);
    }
    throw error;
  }
};

