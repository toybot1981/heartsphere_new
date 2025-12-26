// 记录相关API
import { request } from '../base/request';
import type {
  JournalEntry,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
} from './types';

/**
 * 记录相关API
 */
export const journalApi = {
  /**
   * 获取所有记录
   * @param token - 用户token
   */
  getAllJournalEntries: (token: string): Promise<JournalEntry[]> => {
    console.log('[journalApi] 开始获取日志列表');
    try {
      const result = request<JournalEntry[]>('/journal-entries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('[journalApi] 获取日志列表请求已发送');
      return result;
    } catch (error) {
      console.error('[journalApi] 获取日志列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取单个记录
   * @param id - 记录ID
   * @param token - 用户token
   */
  getJournalEntryById: (id: string, token: string): Promise<JournalEntry> => {
    console.log(`[journalApi] 开始获取日志记录，ID: ${id}`);
    try {
      const result = request<JournalEntry>(`/journal-entries/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[journalApi] 获取日志记录请求已发送，ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`[journalApi] 获取日志记录失败，ID: ${id}`, error);
      throw error;
    }
  },

  /**
   * 创建记录
   * @param data - 记录数据
   * @param token - 用户token
   */
  createJournalEntry: async (
    data: CreateJournalEntryRequest,
    token: string
  ): Promise<JournalEntry> => {
    console.log('[journalApi] 开始创建新日志');
    console.log('[journalApi] 创建日志参数:', {
      title: data.title,
      contentLength: data.content.length,
      entryDate: data.entryDate,
    });

    try {
      // 确保data是一个有效的对象
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data provided to createJournalEntry');
      }

      // 确保title和content存在
      if (!data.title || !data.content) {
        throw new Error('Title and content are required fields');
      }

      // 打印完整的请求参数
      console.log('========== [journalApi] 创建日记 - 完整请求参数 ==========');
      console.log('[journalApi] API端点: POST /api/journal-entries');
      console.log('[journalApi] 请求体 (JSON):', JSON.stringify(data, null, 2));
      console.log('[journalApi] 请求参数详情:', {
        title: data.title,
        content: data.content ? `长度: ${data.content.length}字符` : 'null',
        entryDate: data.entryDate,
        tags: (data as any).tags || 'null',
        insight: (data as any).insight ? `长度: ${(data as any).insight.length}字符` : 'null',
        imageUrl: (data as any).imageUrl !== undefined ? ((data as any).imageUrl ? `值: ${(data as any).imageUrl.substring(0, 100)}...` : '空字符串') : '未包含在请求中',
      });
      console.log('[journalApi] Token:', token ? `存在 (${token.substring(0, 20)}...)` : '不存在');
      console.log('========================================================');

      // 构建requestOptions - 将data转换为JSON字符串
      const requestOptions: RequestInit = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      console.log('[journalApi] 调用request函数');
      console.log('[journalApi] requestOptions:', {
        method: requestOptions.method,
        hasBody: !!requestOptions.body,
        bodyType: typeof requestOptions.body,
        isObject: typeof requestOptions.body === 'object',
        headers: requestOptions.headers,
      });

      const result = await request<JournalEntry>(
        '/journal-entries',
        requestOptions
      );

      console.log('[journalApi] 创建日志成功');
      console.log('[journalApi] 创建日志结果:', {
        id: result.id,
        title: result.title,
        contentLength: result.content.length,
        entryDate: result.entryDate,
        hasInsight: !!result.insight,
        insightLength: result.insight ? result.insight.length : 0,
        hasImageUrl: !!(result as any).imageUrl,
        imageUrl: (result as any).imageUrl ? (result as any).imageUrl.substring(0, 100) + '...' : 'null',
      });

      return result;
    } catch (error) {
      console.error('[journalApi] 创建日志失败:', error);
      console.error(
        '[journalApi] 错误详情:',
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
      throw error;
    }
  },

  /**
   * 更新记录
   * @param id - 记录ID
   * @param data - 记录数据
   * @param token - 用户token
   */
  updateJournalEntry: (
    id: string,
    data: UpdateJournalEntryRequest,
    token: string
  ): Promise<JournalEntry> => {
    console.log('[journalApi] 开始更新日志');
    console.log('[journalApi] 更新日志参数:', {
      id: id,
      title: data.title,
      contentLength: data.content.length,
      entryDate: data.entryDate,
      hasInsight: !!data.insight,
    });
    
    // 打印完整的请求参数
    console.log('========== [journalApi] 更新日记 - 完整请求参数 ==========');
    console.log(`[journalApi] API端点: PUT /api/journal-entries/${id}`);
    console.log('[journalApi] 请求体 (JSON):', JSON.stringify(data, null, 2));
    console.log('[journalApi] 请求参数详情:', {
      id: id,
      title: data.title,
      content: data.content ? `长度: ${data.content.length}字符` : 'null',
      entryDate: data.entryDate,
      tags: (data as any).tags || 'null',
      insight: (data as any).insight !== undefined && (data as any).insight !== null
        ? `长度: ${(data as any).insight.length}字符, 值: ${(data as any).insight.substring(0, 100)}${(data as any).insight.length > 100 ? '...' : ''}`
        : 'null',
      imageUrl: (data as any).imageUrl !== undefined ? ((data as any).imageUrl ? `值: ${(data as any).imageUrl.substring(0, 100)}...` : '空字符串') : '未包含在请求中',
    });
    console.log('[journalApi] Token:', token ? `存在 (${token.substring(0, 20)}...)` : '不存在');
    console.log('========================================================');
    
    try {
      const result = request<JournalEntry>(`/journal-entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[journalApi] 更新日志请求已发送，ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`[journalApi] 更新日志失败，ID: ${id}`, error);
      throw error;
    }
  },

  /**
   * 删除记录
   * @param id - 记录ID
   * @param token - 用户token
   */
  deleteJournalEntry: async (
    id: string,
    token: string
  ): Promise<void> => {
    console.log('=== [journalApi] 开始删除日志条目 ===');
    console.log('[journalApi] 删除参数:');
    console.log('  - ID:', id);
    console.log('  - ID类型:', typeof id);
    console.log('  - Token存在:', !!token);
    console.log('  - API路径: /journal-entries/' + id);

    try {
      const result = await request<void>(`/journal-entries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[journalApi] ✅ API删除请求成功');
      console.log('[journalApi] 响应结果:', result);
      console.log('=== [journalApi] 删除日志条目完成 ===');
      return result;
    } catch (error) {
      console.error('[journalApi] ❌ API删除请求失败');
      console.error('[journalApi] 错误信息:', error);
      console.error('[journalApi] 错误详情:', {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.log('=== [journalApi] 删除日志条目失败 ===');
      throw error;
    }
  },
};

