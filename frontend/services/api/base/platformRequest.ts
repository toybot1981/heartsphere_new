/**
 * 平台兼容的网络请求层
 * 支持浏览器（fetch）和微信小程序（wx.request）
 */

import { isBrowser, isWeChatMiniProgram } from '../../../utils/platform';
import { logger } from '../../../utils/logger';

export interface PlatformRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
  signal?: AbortSignal;
}

export interface PlatformResponse<T = any> {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<T>;
  text(): Promise<string>;
  headers: {
    get(name: string): string | null;
  };
}

/**
 * 浏览器fetch请求
 */
async function browserRequest<T>(
  url: string,
  options: PlatformRequestOptions
): Promise<PlatformResponse<T>> {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body,
    signal: options.signal,
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    json: () => response.json(),
    text: () => response.text(),
    headers: {
      get: (name: string) => response.headers.get(name),
    },
  };
}

/**
 * 微信小程序wx.request请求
 */
async function wechatRequest<T>(
  url: string,
  options: PlatformRequestOptions
): Promise<PlatformResponse<T>> {
  return new Promise((resolve, reject) => {
    if (typeof wx === 'undefined') {
      reject(new Error('wx is not available'));
      return;
    }

    // 转换headers为微信小程序格式
    const header: Record<string, string> = {};
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        header[key.toLowerCase()] = value;
      });
    }

    // 处理body
    let data: any = undefined;
    if (options.body) {
      if (options.body instanceof FormData) {
        // 微信小程序不支持FormData，需要转换为对象
        const formData: Record<string, any> = {};
        // 注意：这里需要根据实际情况处理FormData
        // 微信小程序上传文件需要使用wx.uploadFile
        logger.warn('[WeChatRequest] FormData is not fully supported, converting to object');
        data = formData;
      } else {
        try {
          data = JSON.parse(options.body);
        } catch {
          data = options.body;
        }
      }
    }

    wx.request({
      url,
      method: (options.method || 'GET') as any,
      header,
      data,
      success: (res) => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.errMsg || 'OK',
          json: async () => {
            if (typeof res.data === 'string') {
              return JSON.parse(res.data);
            }
            return res.data as T;
          },
          text: async () => {
            if (typeof res.data === 'string') {
              return res.data;
            }
            return JSON.stringify(res.data);
          },
          headers: {
            get: (name: string) => {
              const headerName = name.toLowerCase();
              return res.header[headerName] || null;
            },
          },
        });
      },
      fail: (error) => {
        reject(new Error(error.errMsg || 'Request failed'));
      },
    });
  });
}

/**
 * 平台兼容的请求函数
 */
export async function platformRequest<T>(
  url: string,
  options: PlatformRequestOptions = {}
): Promise<PlatformResponse<T>> {
  if (isWeChatMiniProgram) {
    return wechatRequest<T>(url, options);
  }
  if (isBrowser) {
    return browserRequest<T>(url, options);
  }
  throw new Error('Unsupported platform for network requests');
}
