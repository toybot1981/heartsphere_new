// Edu API 配置

// API 基础URL（从环境变量读取，默认使用开发环境）
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086/api/edu';

/**
 * 获取 API 基础 URL（用于资源管理等需要完整 URL 的场景）
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL?.replace('/api/edu', '') || 'http://localhost:8086';
};

/**
 * 获取完整的 API URL
 * @param path - API 路径
 * @returns 完整的 API URL
 */
export const getApiUrl = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
};
