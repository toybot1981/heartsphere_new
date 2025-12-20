// 通用API类型定义

/**
 * 通用响应类型
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 通用实体类型（包含基础字段）
 */
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建DTO的通用类型
 */
export type CreateDTO<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * 更新DTO的通用类型
 */
export type UpdateDTO<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

