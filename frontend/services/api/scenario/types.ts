// 剧本事件和物品相关类型定义

export interface ScenarioEvent {
  id: number;
  name: string;
  eventId: string; // 唯一标识，用于剧本中引用
  description?: string;
  eraId?: number;
  eraName?: string;
  systemEraId?: number; // 关联的系统预置场景ID
  userId?: number;
  isSystem: boolean;
  iconUrl?: string;
  tags?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioItem {
  id: number;
  name: string;
  itemId: string; // 唯一标识，用于剧本中引用
  description?: string;
  eraId?: number;
  eraName?: string;
  systemEraId?: number; // 关联的系统预置场景ID
  userId?: number;
  isSystem: boolean;
  iconUrl?: string;
  itemType?: string; // weapon, tool, key, consumable, collectible等
  tags?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScenarioEventDTO {
  name: string;
  eventId: string;
  description?: string;
  eraId?: number;
  iconUrl?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateScenarioEventDTO {
  name?: string;
  eventId?: string;
  description?: string;
  iconUrl?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateScenarioItemDTO {
  name: string;
  itemId: string;
  description?: string;
  eraId?: number;
  iconUrl?: string;
  itemType?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateScenarioItemDTO {
  name?: string;
  itemId?: string;
  description?: string;
  iconUrl?: string;
  itemType?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
}

