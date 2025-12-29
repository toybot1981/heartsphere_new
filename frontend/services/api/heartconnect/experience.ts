/**
 * 体验模式API服务
 */

import { request } from '../base/request';

/**
 * 暖心留言DTO
 */
export interface WarmMessage {
  id: number;
  shareConfigId: number;
  visitorId: number;
  visitorName?: string;
  message: string;
  createdAt: number;
}

/**
 * 创建暖心留言
 */
export async function createWarmMessage(
  shareConfigId: number,
  message: string
): Promise<WarmMessage> {
  const response = await request<WarmMessage>(
    `/heartconnect/experience/${shareConfigId}/warm-message`,
    {
      method: 'POST',
      body: { message },
    }
  );
  return response;
}

/**
 * 获取暖心留言列表（主人查看）
 */
export async function getWarmMessages(shareConfigId: number): Promise<WarmMessage[]> {
  const response = await request<WarmMessage[]>(
    `/heartconnect/experience/${shareConfigId}/warm-messages`
  );
  return response;
}

/**
 * 记录体验摘要（可选）
 */
export async function recordExperienceSummary(
  shareConfigId: number,
  summary: {
    duration: number;
    visitedScenes?: number[];
    interactedCharacters?: number[];
  }
): Promise<void> {
  await request<void>(`/heartconnect/experience/${shareConfigId}/summary`, {
    method: 'POST',
    body: summary,
  });
}

