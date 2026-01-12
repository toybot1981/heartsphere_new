// Edu API 统一导出

// 导出 API 配置
export * from './config';

// 导出请求工具
export { request } from './request';
export type { RequestOptions } from './request';

// 导出认证相关 API
export { login, register, logout, checkAuth } from './auth';
export type { LoginRequest, RegisterRequest, AuthResponse } from './auth';

// 导出数字人相关 API
export { digitalHumanApi } from './digitalHuman';
export { characterInteractionApi } from './characterInteraction';

// 导入 API 对象（用于创建 eduApi）
import { digitalHumanApi } from './digitalHuman';
import { characterInteractionApi } from './characterInteraction';

// 导出类型
export type {
  EduCharacter,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CharacterQueryParams,
  CharacterRecommendation,
  RecommendationCriteria,
  CharacterStatistics,
  EduCharacterInteraction,
  RecordInteractionRequest,
  InteractionQueryParams,
  PageResponse,
  ApiResponse,
  CharacterType,
  DifficultyLevel,
  LanguageStyle,
  AgeGroupSuitability,
  InteractionType,
  ComprehensionLevel,
} from '../../types/digitalHuman';

// 导出统一的 API 对象
export const eduApi = {
  digitalHuman: digitalHumanApi,
  characterInteraction: characterInteractionApi,
};
