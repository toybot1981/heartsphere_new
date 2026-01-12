// 数字人角色管理 API
import { request } from './request';
import type {
  EduCharacter,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CharacterQueryParams,
  CharacterRecommendation,
  RecommendationCriteria,
  CharacterStatistics,
  PageResponse,
} from '../../types/digitalHuman';

/**
 * 数字人角色管理 API
 */
export const digitalHumanApi = {
  /**
   * 创建数字人角色
   */
  createCharacter: (data: CreateCharacterRequest): Promise<EduCharacter> => {
    return request<EduCharacter>('/characters', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取数字人角色列表（支持多条件筛选、分页）
   */
  getCharacters: (params?: CharacterQueryParams): Promise<PageResponse<EduCharacter>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.characterType) {
      queryParams.append('characterType', params.characterType);
    }
    if (params?.ageGroup) {
      queryParams.append('ageGroup', params.ageGroup);
    }
    if (params?.subjectTags && params.subjectTags.length > 0) {
      params.subjectTags.forEach(tag => {
        queryParams.append('subjectTags', tag);
      });
    }
    if (params?.difficultyLevel) {
      queryParams.append('difficultyLevel', params.difficultyLevel);
    }
    if (params?.searchKeyword) {
      queryParams.append('searchKeyword', params.searchKeyword);
    }
    if (params?.studentId !== undefined) {
      queryParams.append('studentId', params.studentId.toString());
    }
    if (params?.teacherId !== undefined) {
      queryParams.append('teacherId', params.teacherId.toString());
    }
    if (params?.isEnabled !== undefined) {
      queryParams.append('isEnabled', params.isEnabled.toString());
    }
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/characters?${queryString}` : '/characters';
    
    return request<PageResponse<EduCharacter>>(url);
  },

  /**
   * 根据ID获取数字人角色详情
   */
  getCharacterById: (id: number): Promise<EduCharacter> => {
    return request<EduCharacter>(`/characters/${id}`);
  },

  /**
   * 获取推荐数字人角色
   */
  getRecommendations: (
    studentId: number,
    criteria?: RecommendationCriteria
  ): Promise<CharacterRecommendation[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('studentId', studentId.toString());
    
    if (criteria?.ageGroup) {
      queryParams.append('ageGroup', criteria.ageGroup);
    }
    if (criteria?.subjectInterests && criteria.subjectInterests.length > 0) {
      criteria.subjectInterests.forEach(subject => {
        queryParams.append('subjectInterests', subject);
      });
    }
    if (criteria?.limit !== undefined) {
      queryParams.append('limit', criteria.limit.toString());
    }
    if (criteria?.includeHistory !== undefined) {
      queryParams.append('includeHistory', criteria.includeHistory.toString());
    }

    return request<CharacterRecommendation[]>(`/characters/recommendations?${queryParams.toString()}`);
  },

  /**
   * 获取数字人角色统计信息
   */
  getCharacterStatistics: (id: number): Promise<CharacterStatistics> => {
    return request<CharacterStatistics>(`/characters/${id}/statistics`);
  },

  /**
   * 更新数字人角色信息
   */
  updateCharacter: (id: number, data: UpdateCharacterRequest): Promise<EduCharacter> => {
    return request<EduCharacter>(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除数字人角色（软删除）
   */
  deleteCharacter: (id: number): Promise<void> => {
    return request<void>(`/characters/${id}`, {
      method: 'DELETE',
    });
  },
};
