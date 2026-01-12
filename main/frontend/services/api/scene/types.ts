// 场景（Era）相关类型定义

/**
 * 系统预置场景
 */
export interface SystemEra {
  id: number;
  name: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

/**
 * 用户场景
 */
export interface UserEra {
  id: number;
  name: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
  imageUrl: string | null;
  systemEraId: number | null;
  worldId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建场景DTO
 */
export interface CreateEraDTO {
  name: string;
  description: string;
  startYear?: number;
  endYear?: number;
  worldId: number;
  imageUrl?: string;
  systemEraId?: number | null;
}

/**
 * 更新场景DTO
 */
export interface UpdateEraDTO {
  name?: string;
  description?: string;
  startYear?: number | null;
  endYear?: number | null;
  worldId?: number;
  imageUrl?: string;
  systemEraId?: number | null;
}

