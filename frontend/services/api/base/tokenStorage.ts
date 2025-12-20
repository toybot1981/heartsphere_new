// Token存储工具

const TOKEN_KEY = 'auth_token';
const ADMIN_TOKEN_KEY = 'admin_token';

export const tokenStorage = {
  // 保存用户token
  saveToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // 获取用户token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // 删除用户token
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // 保存管理员token
  saveAdminToken: (token: string) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  // 获取管理员token
  getAdminToken: (): string | null => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  // 删除管理员token
  removeAdminToken: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};

// 导出便捷函数
export const getToken = (): string | null => {
  return tokenStorage.getToken();
};

export const saveToken = (token: string): void => {
  return tokenStorage.saveToken(token);
};

export const removeToken = (): void => {
  return tokenStorage.removeToken();
};

