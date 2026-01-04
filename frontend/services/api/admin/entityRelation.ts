/**
 * 实体关系API
 */
import { request } from '../base/request';

export interface EntityRelation {
  id: number;
  sourceEntityType: string;
  sourceEntityId: string;
  targetEntityType: string;
  targetEntityId: string;
  relationType: string;
  strength?: number;
  description?: string;
}

export interface EntityRelationListResponse {
  items: EntityRelation[];
  total: number;
}

export interface EntityRelationRecommendation {
  relationType: string;
  description: string;
  defaultStrength: number;
}

export const adminEntityRelationApi = {
  /**
   * 创建实体关系
   */
  createRelation: (relation: {
    sourceEntityType: string;
    sourceEntityId: string;
    targetEntityType: string;
    targetEntityId: string;
    relationType: string;
    strength?: number;
  }, token: string): Promise<EntityRelation> => {
    return request<EntityRelation>('/admin/entities/relations', {
      method: 'POST',
      body: JSON.stringify(relation),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 查询实体的所有关系
   */
  getRelations: (entityType: string, entityId: string, token: string): Promise<EntityRelationListResponse> => {
    return request<EntityRelationListResponse>(`/admin/entities/relations?entityType=${entityType}&entityId=${entityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 查询两个实体之间的关系
   */
  getRelationsBetween: (
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    token: string
  ): Promise<EntityRelationListResponse> => {
    return request<EntityRelationListResponse>(
      `/admin/entities/relations/between?sourceType=${sourceType}&sourceId=${sourceId}&targetType=${targetType}&targetId=${targetId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 推荐相关实体
   */
  recommendRelatedEntities: (
    entityType: string,
    entityId: string,
    limit: number,
    token: string
  ): Promise<{ items: any[]; total: number }> => {
    return request<{ items: any[]; total: number }>(
      `/admin/entities/relations/recommend?entityType=${entityType}&entityId=${entityId}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 推荐可能的关系
   */
  recommendPossibleRelations: (
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    token: string
  ): Promise<{ items: EntityRelationRecommendation[]; total: number }> => {
    return request<{ items: EntityRelationRecommendation[]; total: number }>(
      `/admin/entities/relations/recommend-relation?sourceType=${sourceType}&sourceId=${sourceId}&targetType=${targetType}&targetId=${targetId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 更新关系强度
   */
  updateRelationStrength: (relationId: number, strength: number, token: string): Promise<EntityRelation> => {
    return request<EntityRelation>(`/admin/entities/relations/${relationId}/strength`, {
      method: 'PUT',
      body: JSON.stringify({ strength }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除关系
   */
  deleteRelation: (relationId: number, token: string): Promise<void> => {
    return request<void>(`/admin/entities/relations/${relationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
