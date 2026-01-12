// 用户认证工具函数

import { tokenStorage, getToken } from '@heartsphere/shared-frontend';

/**
 * 从 JWT token 中解析用户信息
 * @param token JWT token 字符串
 * @returns 解析后的用户信息，如果解析失败则返回 null
 */
export const decodeToken = (token: string): { userId?: number; studentId?: number; role?: string; [key: string]: any } | null => {
  try {
    // JWT token 格式：header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // 解码 payload（base64url）
    const payload = parts[1];
    // 替换 base64url 字符
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // 添加 padding（如果需要）
    const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    // 解码 JSON
    const decoded = JSON.parse(atob(paddedBase64));
    return decoded;
  } catch (error) {
    console.error('解析 token 失败:', error);
    return null;
  }
};

/**
 * 获取当前用户ID（从 token 中解析）
 * @returns 用户ID，如果获取失败则返回 null
 */
export const getCurrentUserId = async (): Promise<number | null> => {
  try {
    const token = await tokenStorage.getToken();
    if (!token) {
      return null;
    }
    
    const decoded = decodeToken(token);
    if (!decoded) {
      return null;
    }
    
    // 尝试不同的字段名（根据实际 token 结构调整）
    return decoded.studentId || decoded.userId || decoded.id || decoded.sub || null;
  } catch (error) {
    console.error('获取用户ID失败:', error);
    return null;
  }
};

/**
 * 获取当前用户角色
 * @returns 用户角色，如果获取失败则返回 null
 */
export const getCurrentUserRole = async (): Promise<string | null> => {
  try {
    const token = await tokenStorage.getToken();
    if (!token) {
      return null;
    }
    
    const decoded = decodeToken(token);
    if (!decoded) {
      return null;
    }
    
    return decoded.role || null;
  } catch (error) {
    console.error('获取用户角色失败:', error);
    return null;
  }
};

/**
 * 同步获取当前用户ID（不使用 async/await）
 * @returns 用户ID，如果获取失败则返回 null
 */
export const getCurrentUserIdSync = (): number | null => {
  try {
    // 使用同步版本的 getToken
    const token = getToken() || (typeof window !== 'undefined' && window.localStorage 
      ? window.localStorage.getItem('auth_token') 
      : null);
    
    if (!token) {
      return null;
    }
    
    const decoded = decodeToken(token);
    if (!decoded) {
      return null;
    }
    
    // 尝试不同的字段名（根据实际 token 结构调整）
    return decoded.studentId || decoded.userId || decoded.id || decoded.sub || null;
  } catch (error) {
    console.error('获取用户ID失败:', error);
    return null;
  }
};

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await tokenStorage.getToken();
    if (!token) {
      return false;
    }
    
    const decoded = decodeToken(token);
    if (!decoded) {
      return false;
    }
    
    // 检查 token 是否过期（如果有 exp 字段）
    if (decoded.exp) {
      const expirationTime = decoded.exp * 1000; // exp 是秒级时间戳
      if (Date.now() >= expirationTime) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
