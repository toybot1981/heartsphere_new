/**
 * 日记（Journal）相关操作 Hook
 * 封装日记的添加、更新、删除等业务逻辑
 */

import { useCallback, useRef, useEffect } from 'react';
import { JournalEntry } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { journalApi } from '../services/api';
import { showSyncErrorToast } from '../utils/toast';
import { showAlert } from '../utils/dialog';
import { logger } from '../utils/logger';
import { JournalMemoryIntegration } from '../services/journal-memory-integration';

/**
 * 日记操作 Hook
 */
export const useJournalHandlers = () => {
  const { state: gameState, dispatch } = useGameState();
  // 使用 ref 来获取最新的 journalEntries 和 userProfile，避免闭包问题
  const journalEntriesRef = useRef(gameState.journalEntries);
  const userProfileRef = useRef(gameState.userProfile);
  // 防止重复提交
  const isCreatingRef = useRef(false);
  // 日记记忆集成服务
  const journalMemoryIntegrationRef = useRef<JournalMemoryIntegration | null>(null);
  
  // 更新 ref
  journalEntriesRef.current = gameState.journalEntries;
  userProfileRef.current = gameState.userProfile;

  // 初始化日记记忆集成服务
  useEffect(() => {
    const userProfile = gameState.userProfile;
    if (userProfile && !userProfile.isGuest && userProfile.id) {
      journalMemoryIntegrationRef.current = new JournalMemoryIntegration({
        enabled: true, // 可以根据设置开启/关闭
        autoExtract: true,
        aiEnhanced: true, // 使用AI增强提取
        userId: userProfile.id,
      });
    } else {
      journalMemoryIntegrationRef.current = null;
    }
  }, [gameState.userProfile?.id]);

  /**
   * 添加日记条目
   * 直接调用后台API，成功后从服务器重新获取所有日志
   */
  const handleAddJournalEntry = useCallback(async (
    title: string,
    content: string,
    imageUrl?: string,
    insight?: string,
    tags?: string
  ) => {
    // 防止重复提交
    if (isCreatingRef.current) {
      logger.warn('[useJournalHandlers] 正在创建中，跳过重复请求');
      return;
    }

    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    
    if (!token || !currentUserProfile || currentUserProfile.isGuest) {
      showAlert('请先登录', '提示', 'warning');
      return;
    }

    isCreatingRef.current = true;
    try {
      // 准备API请求数据
      const apiRequestData: any = {
        title,
        content,
        entryDate: new Date().toISOString()
      };
      if (tags) {
        apiRequestData.tags = tags;
      }
      if (insight) {
        apiRequestData.insight = insight;
      }
      if (imageUrl !== undefined && imageUrl !== null) {
        apiRequestData.imageUrl = imageUrl;
      }
      
      logger.debug('[useJournalHandlers] 创建日记 - API请求', {
        title: apiRequestData.title,
        hasContent: !!apiRequestData.content,
        hasImageUrl: apiRequestData.imageUrl !== undefined,
        hasInsight: !!apiRequestData.insight,
      });
      
      // 直接调用API创建
      await journalApi.createJournalEntry(apiRequestData, token);
      
      // 创建成功后，从服务器重新获取所有日志
      const allEntries = await journalApi.getAllJournalEntries(token);
      const mappedEntries = allEntries.map(entry => ({
        id: entry.id.toString(),
        title: entry.title,
        content: entry.content,
        timestamp: new Date(entry.entryDate).getTime(),
        imageUrl: entry.imageUrl || undefined,
        insight: entry.insight || undefined,
        tags: entry.tags || undefined,
      } as JournalEntry));
      
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: mappedEntries });
      
      logger.debug('[useJournalHandlers] 日记创建成功，已从服务器重新加载', {
        totalEntries: mappedEntries.length,
      });

      // 从新创建的日记中提取记忆
      const newEntry = mappedEntries.find(e => 
        e.title === title && 
        Math.abs(e.timestamp - Date.now()) < 5000 // 5秒内的新条目
      );
      
      if (newEntry && journalMemoryIntegrationRef.current) {
        // 异步提取记忆，不阻塞主流程
        journalMemoryIntegrationRef.current.extractMemoriesFromJournal(newEntry)
          .catch(err => {
            logger.error('[useJournalHandlers] 提取记忆失败', err);
          });
      }
    } catch (error) {
      logger.error('[useJournalHandlers] 日记创建失败', error);
      showSyncErrorToast('日记');
    } finally {
      isCreatingRef.current = false;
    }
  }, [dispatch]);

  /**
   * 更新日记条目
   * 直接调用后台API，成功后从服务器重新获取所有日志
   */
  const handleUpdateJournalEntry = useCallback(async (updatedEntry: JournalEntry) => {
    logger.debug(`[useJournalHandlers] 更新日记条目: ${updatedEntry.id}`, {
      insightLength: updatedEntry.insight?.length || 0,
      insightPreview: updatedEntry.insight?.substring(0, 50) || 'null',
    });

    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    
    if (!token || !currentUserProfile || currentUserProfile.isGuest) {
      showAlert('请先登录', '提示', 'warning');
      return;
    }

    // 检查是否为临时ID
    const isTemporaryId = updatedEntry.id.startsWith('entry_');
    if (isTemporaryId) {
      logger.warn('[useJournalHandlers] 临时ID无法更新，跳过');
      return;
    }

    try {
      const apiRequestData: any = {
        title: updatedEntry.title,
        content: updatedEntry.content,
        entryDate: new Date(updatedEntry.timestamp).toISOString()
      };
      if (updatedEntry.tags) {
        apiRequestData.tags = updatedEntry.tags;
      }
      if (updatedEntry.imageUrl !== undefined && updatedEntry.imageUrl !== null) {
        apiRequestData.imageUrl = updatedEntry.imageUrl;
      }
      // 总是包含insight字段
      if (updatedEntry.insight !== undefined) {
        apiRequestData.insight = updatedEntry.insight !== null ? updatedEntry.insight : null;
      }
      
      logger.debug(`[useJournalHandlers] 更新日记 - API请求: ${updatedEntry.id}`, {
        hasImageUrl: apiRequestData.imageUrl !== undefined,
        hasInsight: apiRequestData.insight !== undefined,
      });
      
      // 直接调用API更新
      await journalApi.updateJournalEntry(updatedEntry.id, apiRequestData, token);
      
      // 更新成功后，从服务器重新获取所有日志
      const allEntries = await journalApi.getAllJournalEntries(token);
      const mappedEntries = allEntries.map(entry => ({
        id: entry.id.toString(),
        title: entry.title,
        content: entry.content,
        timestamp: new Date(entry.entryDate).getTime(),
        imageUrl: entry.imageUrl || undefined,
        insight: entry.insight || undefined,
        tags: entry.tags || undefined,
      } as JournalEntry));
      
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: mappedEntries });
      
      logger.debug(`[useJournalHandlers] 更新日记成功，已从服务器重新加载`, {
        totalEntries: mappedEntries.length,
      });

      // 从更新的日记中提取记忆
      const updatedEntryFromServer = mappedEntries.find(e => e.id === updatedEntry.id);
      
      if (updatedEntryFromServer && journalMemoryIntegrationRef.current) {
        // 异步提取记忆，不阻塞主流程
        journalMemoryIntegrationRef.current.extractMemoriesFromJournal(updatedEntryFromServer)
          .catch(err => {
            logger.error('[useJournalHandlers] 提取记忆失败', err);
          });
      }
    } catch (error) {
      logger.error('[useJournalHandlers] 更新日记失败', error);
      showSyncErrorToast('日志');
    }
  }, [dispatch]);

  /**
   * 删除日记条目
   * 直接调用后台API删除，成功后从服务器重新获取所有日志
   */
  const handleDeleteJournalEntry = useCallback(async (id: string) => {
    logger.debug(`[useJournalHandlers] 开始删除日志条目: ${id}`);

    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    
    if (!token || !currentUserProfile || currentUserProfile.isGuest) {
      showAlert('请先登录', '提示', 'warning');
      return;
    }

    // 检查是否为临时ID
    const isTemporaryId = id.startsWith('entry_');
    if (isTemporaryId) {
      logger.warn('[useJournalHandlers] 临时ID无法删除，跳过');
      return;
    }

    try {
      // 直接调用API删除
      await journalApi.deleteJournalEntry(id, token);
      logger.debug('[useJournalHandlers] API删除成功');
      
      // 删除成功后，从服务器重新获取所有日志
      const allEntries = await journalApi.getAllJournalEntries(token);
      const mappedEntries = allEntries.map(entry => ({
        id: entry.id.toString(),
        title: entry.title,
        content: entry.content,
        timestamp: new Date(entry.entryDate).getTime(),
        imageUrl: entry.imageUrl || undefined,
        insight: entry.insight || undefined,
        tags: entry.tags || undefined,
      } as JournalEntry));
      
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: mappedEntries });
      
      logger.debug(`[useJournalHandlers] 删除成功，已从服务器重新加载`, {
        totalEntries: mappedEntries.length,
      });
    } catch (error) {
      logger.error('[useJournalHandlers] API删除失败', error);
      showSyncErrorToast('日志删除失败，请重试');
    }
  }, [dispatch]);

  return {
    handleAddJournalEntry,
    handleUpdateJournalEntry,
    handleDeleteJournalEntry,
  };
};

