/**
 * API 配置模块
 * 统一管理 API 基础 URL，支持环境变量配置
 */

/**
 * 获取 API 基础 URL
 * 优先级：环境变量 > 默认值
 * - 如果 VITE_API_BASE_URL 为空或未设置，使用相对路径（返回空字符串）
 * - 开发环境默认：http://localhost:8081
 * - 生产环境默认：使用相对路径（空字符串）
 */
export function getApiBaseUrl(): string {
  // 优先使用环境变量（Vite 中通过 import.meta.env 访问）
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  // 使用 Vite 环境变量（如果明确设置了值，包括空字符串）
  if (import.meta.env.VITE_API_BASE_URL !== undefined) {
    // 如果设置为空字符串，使用相对路径
    return import.meta.env.VITE_API_BASE_URL || '';
  }
  
  // 根据环境自动判断
  if (import.meta.env.PROD) {
    // 生产环境默认使用相对路径
    return '';
  } else {
    // 开发环境默认使用 localhost
    return 'http://localhost:8081';
  }
}

/**
 * API 基础 URL（包含 /api 路径）
 * 如果 baseUrl 为空，则返回 /api（相对路径）
 */
const baseUrl = getApiBaseUrl();
export const API_BASE_URL = baseUrl ? `${baseUrl}/api` : '/api';

/**
 * 获取完整的 API URL
 * @param endpoint - API 端点（以 / 开头）
 * @returns 完整的 API URL
 */
export function getApiUrl(endpoint: string): string {
  // 确保 endpoint 以 / 开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // 如果 API_BASE_URL 是 /api，则直接拼接
  if (API_BASE_URL === '/api') {
    return `${API_BASE_URL}${normalizedEndpoint}`;
  }
  return `${API_BASE_URL}${normalizedEndpoint}`;
}


