// Token存储工具（平台兼容）
// 所有子项目共享的Token存储工具

const TOKEN_KEY = 'auth_token';
const ADMIN_TOKEN_KEY = 'admin_token';

export const tokenStorage = {
  // 保存用户token
  saveToken: async (token: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // 获取用户token
  getToken: async (): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // 删除用户token
  removeToken: async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  },

  // 保存管理员token
  saveAdminToken: async (token: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
  },

  // 获取管理员token
  getAdminToken: async (): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    return null;
  },

  // 删除管理员token
  removeAdminToken: async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },
};

// 导出便捷函数（同步版本，用于向后兼容）
export const getToken = (): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

// 导出异步版本（推荐使用）
export const getTokenAsync = tokenStorage.getToken;
export const saveTokenAsync = tokenStorage.saveToken;
export const removeTokenAsync = tokenStorage.removeToken;
