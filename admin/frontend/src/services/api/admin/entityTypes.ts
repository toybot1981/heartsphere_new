/**
 * 实体类型定义
 */

export interface EntityBase {
  id: number | string;
  name: string;
  description?: string;
}

export interface Era extends EntityBase {
  type: 'era';
  userId?: number;
  worldId?: number;
}

export interface Character extends EntityBase {
  type: 'character';
  eraId?: number;
  userId?: number;
  favorability?: number;
  skills?: Record<string, number>;
}

export interface ScenarioEvent extends EntityBase {
  type: 'event';
  eventId?: string;
  eraId?: number;
  systemEraId?: number;
  userId?: number;
  isSystem?: boolean;
  eraName?: string;
  systemEraName?: string;
  iconUrl?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  eventType?: string;
  triggerConditions?: Record<string, any>;
  description?: string;
}

export interface ScenarioItem extends EntityBase {
  type: 'item';
  itemId?: string;
  eraId?: number;
  systemEraId?: number;
  userId?: number;
  isSystem?: boolean;
  eraName?: string;
  systemEraName?: string;
  iconUrl?: string;
  itemType?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  properties?: Record<string, any>;
  description?: string;
}

export interface World extends EntityBase {
  type: 'world';
  userId?: number;
}

export type Entity = Era | Character | ScenarioEvent | ScenarioItem | World;

export interface EntityListResponse<T extends Entity> {
  items: T[];
  total: number;
  page?: number;
  size?: number;
  totalPages?: number;
}
