// Token存储工具（平台兼容）

import { platformStorage } from '../../storage/platformStorage';

const TOKEN_KEY = 'auth_token';
const ADMIN_TOKEN_KEY = 'admin_token';

export const tokenStorage = {
  // 保存用户token
  saveToken: async (token: string) => {
    await platformStorage.setItem(TOKEN_KEY, token);
  },

  // 获取用户token
  getToken: async (): Promise<string | null> => {
    return await platformStorage.getItem(TOKEN_KEY);
  },

  // 删除用户token
  removeToken: async () => {
    await platformStorage.removeItem(TOKEN_KEY);
  },

  // 保存管理员token
  saveAdminToken: async (token: string) => {
    await platformStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  // 获取管理员token
  getAdminToken: async (): Promise<string | null> => {
    return await platformStorage.getItem(ADMIN_TOKEN_KEY);
  },

  // 删除管理员token
  removeAdminToken: async () => {
    await platformStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};

// 导出便捷函数（同步版本，用于向后兼容）
// 注意：这些函数在微信小程序中可能返回null，建议使用异步版本
export const getToken = (): string | null => {
  // 同步版本：尝试从localStorage获取（浏览器环境）
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const saveToken = (token: string): void => {
  // 同步版本：保存到localStorage（浏览器环境）
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
  // 异步保存（兼容微信小程序）
  tokenStorage.saveToken(token).catch(err => {
    console.error('[TokenStorage] saveToken error:', err);
  });
};

export const removeToken = (): void => {
  // 同步版本：从localStorage删除（浏览器环境）
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(TOKEN_KEY);
  }
  // 异步删除（兼容微信小程序）
  tokenStorage.removeToken().catch(err => {
    console.error('[TokenStorage] removeToken error:', err);
  });
};

// 导出异步版本（推荐使用）
export const getTokenAsync = tokenStorage.getToken;
export const saveTokenAsync = tokenStorage.saveToken;
export const removeTokenAsync = tokenStorage.removeToken;