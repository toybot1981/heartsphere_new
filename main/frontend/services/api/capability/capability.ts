/**
 * 能力体系 API 客户端
 * 连接到后端的能力体系服务
 */

import { request } from '../base/request';
import { logger } from '../../../utils/logger';

/**
 * 能力档案
 */
export interface CapabilityProfile {
  id?: number;
  characterId: number;
  skillDimensionScore: number;
  memoryDimensionScore: number;
  consciousnessDimensionScore: number;
  collaborationDimensionScore: number;
  relationshipDimensionScore: number;
  mentorshipCapabilityScore: number;
  companionshipCapabilityScore: number;
  overallScore: number;
}

/**
 * 能力经验值
 */
export interface CapabilityExperience {
  id?: number;
  characterId: number;
  skillExperience: number;
  memoryExperience: number;
  consciousnessExperience: number;
  collaborationExperience: number;
  relationshipExperience: number;
  mentorshipExperience: number;
  companionshipExperience: number;
  totalExperience: number;
}

/**
 * 能力等级
 */
export interface CapabilityLevels {
  skill: number;
  memory: number;
  consciousness: number;
  relationship: number;
  mentorship: number;
  companionship: number;
  overall: number;
}

/**
 * 关系能力评估结果
 */
export interface RelationshipCapabilityAssessment {
  characterId: number;
  mentorshipScore: number;
  companionshipScore: number;
  relationshipScore: number;
  mentorshipDetails?: any;
  companionshipDetails?: any;
  assessmentId?: number;
}

/**
 * 全面能力评估结果
 */
export interface FullCapabilityAssessment {
  characterId: number;
  skillScore: number;
  memoryScore: number;
  consciousnessScore: number;
  collaborationScore: number;
  relationshipScore: number;
  mentorshipScore: number;
  companionshipScore: number;
  overallScore: number;
  relationshipDetails?: RelationshipCapabilityAssessment;
}

/**
 * 能力雷达图数据
 */
export interface RadarChartData {
  characterId: number;
  dimensions: RadarDimension[];
  overallScore: number;
}

export interface RadarDimension {
  name: string;
  code: string;
  score: number;
  maxScore: number;
  subDimensions?: RadarSubDimension[];
}

export interface RadarSubDimension {
  name: string;
  code: string;
  score: number;
}

/**
 * 能力成长轨迹数据
 */
export interface GrowthTrajectoryData {
  characterId: number;
  userId: number;
  growthPoints: GrowthPoint[];
  totalExperience: number;
  growthSpeed: number;
}

export interface GrowthPoint {
  timestamp: string;
  skillScore: number;
  memoryScore: number;
  consciousnessScore: number;
  collaborationScore: number;
  relationshipScore: number;
  overallScore: number;
}

/**
 * 能力协同统计
 */
export interface SynergyStatistics {
  characterId: number;
  totalSynergies: number;
  averageEffect: number;
  synergyTypeStats: Record<string, number>;
}

export const capabilityApi = {
  /**
   * 获取角色能力档案
   */
  getCapabilityProfile: async (characterId: number): Promise<CapabilityProfile> => {
    try {
      const response = await request<CapabilityProfile>(
        `/capability/v1/character/${characterId}/profile`, // 注意：不包含 /api，因为 request.ts 中的 API_BASE_URL 已经包含了 /api
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 获取能力档案失败:', error);
      throw error;
    }
  },

  /**
   * 整合关系维度能力
   */
  integrateRelationshipCapability: async (
    characterId: number,
    userId: number
  ): Promise<RelationshipCapabilityAssessment> => {
    try {
      const response = await request<RelationshipCapabilityAssessment>(
        `/capability/v1/character/${characterId}/relationship/integrate?userId=${userId}`, // 注意：不包含 /api
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 整合关系维度能力失败:', error);
      throw error;
    }
  },

  /**
   * 获取能力经验值
   */
  getCapabilityExperience: async (characterId: number): Promise<CapabilityExperience> => {
    try {
      const response = await request<CapabilityExperience>(
        `/capability/v1/character/${characterId}/experience`, // 注意：不包含 /api
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 获取能力经验值失败:', error);
      throw error;
    }
  },

  /**
   * 获取能力等级
   */
  getCapabilityLevels: async (characterId: number): Promise<CapabilityLevels> => {
    try {
      const response = await request<CapabilityLevels>(
        `/capability/v1/character/${characterId}/levels`, // 注意：不包含 /api
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 获取能力等级失败:', error);
      throw error;
    }
  },

  /**
   * 同步成长事件
   */
  syncGrowthEvents: async (characterId: number, userId: number): Promise<number> => {
    try {
      const response = await request<number>(
        `/capability/v1/character/${characterId}/sync-growth-events?userId=${userId}`, // 注意：不包含 /api
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 同步成长事件失败:', error);
      throw error;
    }
  },

  /**
   * 评估关系维度能力
   */
  assessRelationshipCapability: async (
    characterId: number,
    userId: number
  ): Promise<RelationshipCapabilityAssessment> => {
    try {
      const response = await request<RelationshipCapabilityAssessment>(
        `/capability/v1/character/${characterId}/relationship/assess?userId=${userId}`, // 注意：不包含 /api
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 评估关系维度能力失败:', error);
      throw error;
    }
  },

  /**
   * 全面能力评估
   */
  assessAllCapabilities: async (
    characterId: number,
    userId: number
  ): Promise<FullCapabilityAssessment> => {
    try {
      const response = await request<FullCapabilityAssessment>(
        `/capability/v1/character/${characterId}/assess?userId=${userId}`, // 注意：不包含 /api
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 全面能力评估失败:', error);
      throw error;
    }
  },

  /**
   * 获取能力雷达图数据
   */
  getRadarChartData: async (characterId: number): Promise<RadarChartData> => {
    try {
      const response = await request<RadarChartData>(
        `/capability/v1/character/${characterId}/visualization/radar`, // 注意：不包含 /api
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 获取雷达图数据失败:', error);
      throw error;
    }
  },

  /**
   * 获取能力成长轨迹数据
   */
  getGrowthTrajectoryData: async (
    characterId: number,
    userId: number
  ): Promise<GrowthTrajectoryData> => {
    try {
      const response = await request<GrowthTrajectoryData>(
        `/capability/v1/character/${characterId}/visualization/growth-trajectory?userId=${userId}`, // 注意：不包含 /api
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      logger.error('[capabilityApi] 获取成长轨迹数据失败:', error);
      throw error;
    }
  },
};
