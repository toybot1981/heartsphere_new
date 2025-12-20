// CRUD工厂函数，用于生成通用的CRUD操作

import { request } from './request';

export interface CrudApiConfig<T extends { id: number }, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  basePath: string;
  getToken?: () => string | null;
}

/**
 * 创建通用的CRUD API
 * @param config - CRUD配置
 * @returns CRUD API对象
 */
export function createCrudApi<T extends { id: number }, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>(
  config: CrudApiConfig<T, CreateDTO, UpdateDTO>
) {
  const { basePath, getToken } = config;

  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    /**
     * 获取所有记录
     */
    getAll: async (): Promise<T[]> => {
      return request<T[]>(basePath, {
        headers: getAuthHeaders(),
      });
    },

    /**
     * 根据ID获取记录
     */
    getById: async (id: number): Promise<T> => {
      return request<T>(`${basePath}/${id}`, {
        headers: getAuthHeaders(),
      });
    },

    /**
     * 创建记录
     */
    create: async (data: CreateDTO): Promise<T> => {
      return request<T>(basePath, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
    },

    /**
     * 更新记录
     */
    update: async (id: number, data: UpdateDTO): Promise<T> => {
      return request<T>(`${basePath}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
    },

    /**
     * 删除记录
     */
    delete: async (id: number): Promise<void> => {
      return request<void>(`${basePath}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    },
  };
}

