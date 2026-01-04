/**
 * Graph智能推荐API
 */
import { request } from '../base/request';

export interface EntityRecommendation {
  entityId: string;
  entityName: string;
  entityType: string;
  description?: string;
  reason: string;
  score: number;
}

export interface RelationRecommendation {
  sourceEntityType: string;
  sourceEntityId: string;
  targetEntityType: string;
  targetEntityId: string;
  relationType: string;
  strength: number;
  reason: string;
  confidence: number;
}

export interface OptimizationSuggestion {
  type: string;
  severity: 'error' | 'warning' | 'info';
  nodeId?: string;
  message: string;
  suggestion: string;
}

export interface RecommendationResponse<T> {
  items: T[];
  total: number;
}

export const adminGraphRecommendationApi = {
  /**
   * 基于上下文的实体推荐
   */
  recommendEntities: (
    entityType: string,
    existingEntityIds: string[],
    context: Record<string, any>,
    token: string
  ): Promise<RecommendationResponse<EntityRecommendation>> => {
    return request<RecommendationResponse<EntityRecommendation>>('/admin/graph/recommendations/entities', {
      method: 'POST',
      body: JSON.stringify({
        entityType,
        existingEntityIds,
        context,
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 关系自动识别
   */
  autoDetectRelations: (
    entities: Array<Record<string, any>>,
    context: Record<string, any>,
    token: string
  ): Promise<RecommendationResponse<RelationRecommendation>> => {
    return request<RecommendationResponse<RelationRecommendation>>('/admin/graph/recommendations/relations', {
      method: 'POST',
      body: JSON.stringify({
        entities,
        context,
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 流程优化建议
   */
  suggestOptimizations: (
    nodes: Array<Record<string, any>>,
    edges: Array<Record<string, any>>,
    token: string
  ): Promise<RecommendationResponse<OptimizationSuggestion>> => {
    return request<RecommendationResponse<OptimizationSuggestion>>('/admin/graph/recommendations/optimizations', {
      method: 'POST',
      body: JSON.stringify({
        nodes,
        edges,
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};
