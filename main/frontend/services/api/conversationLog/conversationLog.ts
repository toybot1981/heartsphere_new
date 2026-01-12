// 对话日志 API
import { request } from '../base/request';
import type { ConversationLog } from '../recycleBin/types';

/**
 * 对话日志API
 */
export const conversationLogApi = {
  /**
   * 获取对话日志列表
   */
  getConversationLogs: async (token: string): Promise<ConversationLog[]> => {
    return request<ConversationLog[]>('/conversation-logs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据会话ID获取对话日志
   */
  getConversationLogBySessionId: async (sessionId: string, token: string): Promise<ConversationLog | null> => {
    try {
      return await request<ConversationLog>(`/conversation-logs/session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      return null;
    }
  },

  /**
   * 创建或更新对话日志
   */
  createOrUpdateConversationLog: async (
    characterId: number,
    sessionId: string,
    lastMessagePreview: string,
    messageCount: number,
    token: string
  ): Promise<ConversationLog> => {
    return request<ConversationLog>('/conversation-logs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId,
        sessionId,
        lastMessagePreview,
        messageCount,
        lastMessageAt: new Date().toISOString(),
      }),
    });
  },

  /**
   * 删除对话日志到回收站
   */
  deleteConversationLog: async (id: number, token: string): Promise<void> => {
    return request<void>(`/conversation-logs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};


