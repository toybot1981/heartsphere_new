// 剧本（Script）相关类型定义

/**
 * 用户剧本
 */
export interface UserScript {
  id: number;
  title: string;
  description: string | null;
  content: string;
  sceneCount: number;
  characterIds: string | null; // JSON数组格式的角色ID列表
  tags: string | null; // 标签（逗号分隔）
  worldId: number;
  eraId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 系统预置剧本
 */
export interface SystemScript {
  id: number;
  title: string;
  description: string;
  content: string;
  sceneCount: number;
  systemEraId: number | null;
  eraName: string | null;
  characterIds: string;
  tags: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建剧本DTO
 */
export interface CreateScriptDTO {
  systemScriptId?: number; // 系统预置剧本ID（用于从预置数据库查询完整数据）
  title?: string; // 可选：自定义标题（如果提供了systemScriptId，此字段可选；否则必需）
  description?: string | null;
  content?: string;
  sceneCount?: number;
  characterIds?: string | null; // JSON数组格式的角色ID列表
  tags?: string | null; // 标签（逗号分隔）
  worldId: number;
  eraId?: number;
}

/**
 * 更新剧本DTO
 */
export interface UpdateScriptDTO {
  title?: string;
  description?: string | null;
  content?: string;
  sceneCount?: number;
  characterIds?: string | null; // JSON数组格式的角色ID列表
  tags?: string | null; // 标签（逗号分隔）
  worldId?: number;
  eraId?: number;
}

