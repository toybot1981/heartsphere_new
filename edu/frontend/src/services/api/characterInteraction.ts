// 数字人互动记录 API
import { request } from './request';
import type {
  EduCharacterInteraction,
  RecordInteractionRequest,
  InteractionQueryParams,
  PageResponse,
} from '../../types/digitalHuman';

/**
 * 数字人互动记录 API
 */
export const characterInteractionApi = {
  /**
   * 记录学生与数字人的互动
   */
  recordInteraction: (data: RecordInteractionRequest): Promise<EduCharacterInteraction> => {
    return request<EduCharacterInteraction>('/character-interactions', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取互动历史（支持筛选、分页）
   */
  getInteractions: (params: InteractionQueryParams): Promise<PageResponse<EduCharacterInteraction>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('studentId', params.studentId.toString());
    
    if (params.characterId !== undefined) {
      queryParams.append('characterId', params.characterId.toString());
    }
    if (params.interactionType) {
      queryParams.append('interactionType', params.interactionType);
    }
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }

    return request<PageResponse<EduCharacterInteraction>>(`/character-interactions?${queryParams.toString()}`);
  },

  /**
   * 获取互动详情
   */
  getInteractionById: (id: number): Promise<EduCharacterInteraction> => {
    return request<EduCharacterInteraction>(`/character-interactions/${id}`);
  },

  /**
   * 获取学生的互动历史（便捷端点）
   */
  getStudentInteractions: (
    studentId: number,
    params?: Omit<InteractionQueryParams, 'studentId'>
  ): Promise<PageResponse<EduCharacterInteraction>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.characterId !== undefined) {
      queryParams.append('characterId', params.characterId.toString());
    }
    if (params?.interactionType) {
      queryParams.append('interactionType', params.interactionType);
    }
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/character-interactions/students/${studentId}?${queryString}`
      : `/character-interactions/students/${studentId}`;

    return request<PageResponse<EduCharacterInteraction>>(url);
  },
};
