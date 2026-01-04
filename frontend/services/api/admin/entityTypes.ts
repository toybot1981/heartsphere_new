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
  eraId?: number;
  eventType?: string;
  triggerConditions?: Record<string, any>;
}

export interface ScenarioItem extends EntityBase {
  type: 'item';
  eraId?: number;
  itemType?: string;
  properties?: Record<string, any>;
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
