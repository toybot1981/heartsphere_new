// 记录相关API
import { request } from '../base/request';
import { logger } from '../../../utils/logger';
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
    logger.debug('[journalApi] 获取日志列表');
    try {
      const result = request<JournalEntry[]>('/journal-entries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      logger.debug('[journalApi] 获取日志列表请求已发送');
      return result;
    } catch (error) {
      logger.error('[journalApi] 获取日志列表失败', error);
      throw error;
    }
  },

  /**
   * 获取单个记录
   * @param id - 记录ID
   * @param token - 用户token
   */
  getJournalEntryById: (id: string, token: string): Promise<JournalEntry> => {
    logger.debug(`[journalApi] 获取日志记录: ${id}`);
    try {
      const result = request<JournalEntry>(`/journal-entries/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      logger.debug(`[journalApi] 获取日志记录请求已发送: ${id}`);
      return result;
    } catch (error) {
      logger.error(`[journalApi] 获取日志记录失败: ${id}`, error);
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
    logger.debug('[journalApi] 创建新日志');
    
    try {
      // 确保data是一个有效的对象
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data provided to createJournalEntry');
      }

      // 确保title和content存在
      if (!data.title || !data.content) {
        throw new Error('Title and content are required fields');
      }

      // 构建requestOptions - 将data转换为JSON字符串
      const requestOptions: RequestInit = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      logger.debug('[journalApi] 创建日志条目');

      const result = await request<JournalEntry>(
        '/journal-entries',
        requestOptions
      );

      logger.debug(`[journalApi] 创建日志成功: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('[journalApi] 创建日志失败', error);
      throw error;
    }
  },

  /**
   * 更新记录
   * @param id - 记录ID
   * @param data - 记录数据
   * @param token - 用户token
   */
  updateJournalEntry: async (
    id: string,
    data: UpdateJournalEntryRequest,
    token: string
  ): Promise<JournalEntry> => {
    logger.debug(`[journalApi] 更新日志: ${id}`, {
      id: id,
      title: data.title,
      contentLength: data.content.length,
      entryDate: data.entryDate,
      hasInsight: !!data.insight,
    });
    
    try {
      const result = await request<JournalEntry>(`/journal-entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      logger.debug(`[journalApi] 更新日志成功: ${id}`);
      return result;
    } catch (error) {
      logger.error(`[journalApi] 更新日志失败: ${id}`, error);
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
    logger.debug(`[journalApi] 删除日志条目: ${id}`);

    try {
      const result = await request<void>(`/journal-entries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.debug(`[journalApi] 删除日志条目成功: ${id}`);
      return result;
    } catch (error) {
      logger.error(`[journalApi] 删除日志条目失败: ${id}`, error);
      throw error;
    }
  },
};

