/**
 * 日记（Journal）相关操作 Hook
 * 封装日记的添加、更新、删除等业务逻辑
 */

import { useCallback, useRef } from 'react';
import { JournalEntry, SyncStatus } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { journalApi } from '../services/api';
import { showSyncErrorToast } from '../utils/toast';
import { syncService } from '../services/sync/SyncService';
import { logger } from '../utils/logger';

/**
 * 日记操作 Hook
 */
export const useJournalHandlers = () => {
  const { state: gameState, dispatch } = useGameState();
  // 使用 ref 来获取最新的 journalEntries 和 userProfile，避免闭包问题
  const journalEntriesRef = useRef(gameState.journalEntries);
  const userProfileRef = useRef(gameState.userProfile);
  
  // 更新 ref
  journalEntriesRef.current = gameState.journalEntries;
  userProfileRef.current = gameState.userProfile;

  /**
   * 添加日记条目
   * 按照同步机制：先本地缓存（syncStatus=0），然后调用API，成功则设为1，失败则设为-1
   */
  const handleAddJournalEntry = useCallback(async (
    title: string,
    content: string,
    imageUrl?: string,
    insight?: string,
    tags?: string
  ) => {
    // 1. 先保存到本地（立即更新UI），同步标识为0（待同步）
    const newEntry: JournalEntry = {
      id: `entry_${Date.now()}`,
      title,
      content,
      timestamp: Date.now(),
      imageUrl,
      insight,
      tags,
      syncStatus: 0 as SyncStatus, // 待同步
    };
    
    // 标记为待同步并保存到本地
    const entryWithSync = syncService.markEntityForSync('journal', newEntry, 'create');
    
    // 立即 dispatch，确保 UI 立即更新
    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: entryWithSync });

    // 2. 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    if (token && currentUserProfile && !currentUserProfile.isGuest) {
      // 异步同步到服务器（不阻塞 UI 更新）
      (async () => {
        try {
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
          // imageUrl 可能为空字符串，需要明确检查 undefined 和 null
          if (imageUrl !== undefined && imageUrl !== null) {
            apiRequestData.imageUrl = imageUrl;
          }
          
          logger.debug('[useJournalHandlers] 创建日记 - API请求', {
            title: apiRequestData.title,
            hasContent: !!apiRequestData.content,
            hasImageUrl: apiRequestData.imageUrl !== undefined,
            hasInsight: !!apiRequestData.insight,
          });
          
          const savedEntry = await journalApi.createJournalEntry(apiRequestData, token);
          
          // API调用成功，标记为同步成功（syncStatus=1）
          const syncedEntry = syncService.markEntitySynced('journal', entryWithSync, {
            ...savedEntry,
            id: savedEntry.id.toString(),
            timestamp: new Date(savedEntry.entryDate || Date.now()).getTime(),
          } as JournalEntry);
          
          // 使用 ref 获取最新的 entries，更新本地状态（使用服务器返回的ID和insight）
          const updatedEntries = journalEntriesRef.current.map(e => 
            e.id === entryWithSync.id 
              ? { 
                  ...syncedEntry,
                  id: savedEntry.id.toString(),
                  insight: savedEntry.insight || e.insight // 保留服务器返回的insight，如果没有则保留本地的
                }
              : e
          );
          logger.debug(`[useJournalHandlers] 创建日记成功，同步到本地状态，数量: ${updatedEntries.length}`);
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedEntries });
        } catch (error) {
          logger.error('Failed to sync journal entry with server', error);
          // API调用失败，标记为同步失败（syncStatus=-1）
          const errorMessage = error instanceof Error ? error.message : String(error);
          const failedEntry = syncService.markEntitySyncFailed('journal', entryWithSync, errorMessage);
          
          // 更新本地状态
          const updatedEntries = journalEntriesRef.current.map(e => 
            e.id === entryWithSync.id ? failedEntry : e
          );
          logger.warn(`[useJournalHandlers] 创建日记同步失败，更新本地状态，数量: ${updatedEntries.length}`);
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedEntries });
          
          showSyncErrorToast('日志');
        }
      })();
    }
  }, [dispatch]);

  /**
   * 更新日记条目
   * 按照同步机制：先本地缓存（syncStatus=0），然后调用API，成功则设为1，失败则设为-1
   */
  const handleUpdateJournalEntry = useCallback(async (updatedEntry: JournalEntry) => {
    // 1. 先保存到本地（立即更新UI），同步标识为0（待同步）
    logger.debug(`[useJournalHandlers] 更新日记条目: ${updatedEntry.id}`, {
      insightLength: updatedEntry.insight?.length || 0,
      insightPreview: updatedEntry.insight?.substring(0, 50) || 'null',
    });
    
    const entryWithSync: JournalEntry = {
      ...updatedEntry,
      syncStatus: 0 as SyncStatus, // 待同步
    };
    
    // 标记为待同步并保存到本地
    const markedEntry = syncService.markEntityForSync('journal', entryWithSync, 'update');
    
    const updatedEntries = journalEntriesRef.current.map(e => e.id === updatedEntry.id ? markedEntry : e);
    logger.debug(`[useJournalHandlers] 立即更新UI，条目数量: ${updatedEntries.length}`);
    dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedEntries });

    // 2. 异步同步到服务器（如果已登录且不是临时ID）
    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    const isTemporaryId = updatedEntry.id.startsWith('entry_');
    if (token && currentUserProfile && !currentUserProfile.isGuest && !isTemporaryId) {
      (async () => {
        try {
          const apiRequestData: any = {
            title: updatedEntry.title,
            content: updatedEntry.content,
            entryDate: new Date(updatedEntry.timestamp).toISOString()
          };
          if (updatedEntry.tags) {
            apiRequestData.tags = updatedEntry.tags;
          }
          // imageUrl 可能为空字符串，需要明确检查 undefined 和 null
          if (updatedEntry.imageUrl !== undefined && updatedEntry.imageUrl !== null) {
            apiRequestData.imageUrl = updatedEntry.imageUrl;
          }
          // 注意：insight的处理逻辑
          // 如果updatedEntry.insight是undefined，尝试从本地缓存中获取原有的insight值
          let insightToSend: string | null | undefined = updatedEntry.insight;
          if (insightToSend === undefined) {
            const originalEntry = journalEntriesRef.current.find(e => e.id === updatedEntry.id);
            insightToSend = originalEntry?.insight;
          }
          
          // 总是包含insight字段，即使为null或undefined（JSON序列化时undefined会被省略，null会被保留）
          if (insightToSend !== undefined) {
            apiRequestData.insight = insightToSend !== null ? insightToSend : null;
          }
          
          logger.debug(`[useJournalHandlers] 更新日记 - API请求: ${updatedEntry.id}`, {
            hasImageUrl: apiRequestData.imageUrl !== undefined,
            hasInsight: apiRequestData.insight !== undefined,
          });
          
          const savedEntry = await journalApi.updateJournalEntry(updatedEntry.id, apiRequestData, token);
          
          // API调用成功，标记为同步成功（syncStatus=1）
          const syncedEntry = syncService.markEntitySynced('journal', markedEntry, {
            ...savedEntry,
            id: savedEntry.id.toString(),
            timestamp: new Date(savedEntry.entryDate || Date.now()).getTime(),
          } as JournalEntry);
          
          // 更新成功，同步服务器返回的所有字段到本地状态（包括insight）
          const finalEntries = journalEntriesRef.current.map(e => 
            e.id === updatedEntry.id 
              ? { 
                  ...syncedEntry,
                  insight: savedEntry.insight !== undefined ? savedEntry.insight : e.insight, // 服务器返回的insight优先，如果为undefined则保留本地
                  tags: savedEntry.tags !== undefined ? savedEntry.tags : e.tags, // 同时更新tags
                  title: savedEntry.title || e.title,
                  content: savedEntry.content || e.content
                }
              : e
          );
          logger.debug(`[useJournalHandlers] 更新日记成功，同步到本地状态，数量: ${finalEntries.length}`);
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: finalEntries });
        } catch (error) {
          logger.error('Failed to sync journal entry with server', error);
          // API调用失败，标记为同步失败（syncStatus=-1）
          const errorMessage = error instanceof Error ? error.message : String(error);
          const failedEntry = syncService.markEntitySyncFailed('journal', markedEntry, errorMessage);
          
          // 更新本地状态
          const updatedFailedEntries = journalEntriesRef.current.map(e => 
            e.id === updatedEntry.id ? failedEntry : e
          );
          logger.warn(`[useJournalHandlers] 更新日记同步失败，更新本地状态，数量: ${updatedFailedEntries.length}`);
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedFailedEntries });
          
          showSyncErrorToast('日志');
        }
      })();
    }
  }, [dispatch]);

  /**
   * 删除日记条目
   * 按照同步机制：先调用后台API删除，成功则删除本地缓存，失败则保留本地缓存
   */
  const handleDeleteJournalEntry = useCallback(async (id: string) => {
    logger.debug(`[useJournalHandlers] 开始删除日志条目: ${id}`);
    
    // 保存删除前的完整条目列表，以便失败时恢复
    const entriesBeforeDelete = [...journalEntriesRef.current];
    
    // 检查要删除的条目是否存在
    const entryToDelete = entriesBeforeDelete.find(e => e.id === id);
    if (!entryToDelete) {
      logger.error(`[useJournalHandlers] 日志条目未找到，无法删除: ${id}`);
      return;
    }
    
    logger.debug('[useJournalHandlers] 找到要删除的条目:', {
      id: entryToDelete.id,
      title: entryToDelete.title,
      timestamp: entryToDelete.timestamp
    });

    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    // 检查是否为临时ID（临时ID格式：entry_时间戳）
    const isTemporaryId = id.startsWith('entry_');
    
    // 如果是已登录用户且不是临时ID，需要先删除服务器数据，再删除本地
    if (token && currentUserProfile && !currentUserProfile.isGuest && !isTemporaryId) {
      logger.debug(`[useJournalHandlers] 开始删除服务器数据: ${id}`);
      try {
        await syncService.deleteEntity('journal', id);
        logger.debug('[useJournalHandlers] API删除成功');
        
        // 2. 服务器删除成功后，删除本地状态（syncService已处理）
        const remainingEntries = entriesBeforeDelete.filter(e => e.id !== id);
        logger.debug(`[useJournalHandlers] 删除成功，剩余条目数量: ${remainingEntries.length}`);
        dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: remainingEntries });
      } catch (error) {
        logger.error('[useJournalHandlers] API删除失败', error);
        showSyncErrorToast('日志删除失败，请重试');
        return;
      }
    } else {
      // 对于临时 ID 或访客用户，直接删除本地状态
      if (isTemporaryId) {
        logger.debug('[useJournalHandlers] 仅删除本地缓存（临时ID）');
      } else if (!token || !currentUserProfile || currentUserProfile.isGuest) {
        logger.debug('[useJournalHandlers] 仅删除本地缓存（访客用户）');
      } else {
        logger.warn('[useJournalHandlers] 意外情况：已登录用户但未调用API删除');
      }
      
      const remainingEntries = entriesBeforeDelete.filter(e => e.id !== id);
      console.log('[useJournalHandlers] 本地删除:');
      console.log('  - 删除前条目数:', entriesBeforeDelete.length);
      console.log('  - 删除后条目数:', remainingEntries.length);
      console.log('  - 删除后条目ID列表:', remainingEntries.map(e => e.id));
      
      console.log('========== [useJournalHandlers] 准备dispatch SET_JOURNAL_ENTRIES (删除-本地删除) ==========');
      console.log('[useJournalHandlers] 剩余条目数量:', remainingEntries.length);
      remainingEntries.forEach((entry, index) => {
        console.log(`[useJournalHandlers] dispatch前的条目 ${index + 1}:`, {
          id: entry.id,
          title: entry.title,
          hasInsight: entry.insight !== undefined && entry.insight !== null,
          insightValue: entry.insight,
          syncStatus: entry.syncStatus,
        });
      });
      console.log('========================================================');
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: remainingEntries });
      
      console.log('[useJournalHandlers] ✅ 本地删除完成');
    }
    console.log('=== [useJournalHandlers] 删除日志条目结束 ===');
  }, [dispatch]);

  return {
    handleAddJournalEntry,
    handleUpdateJournalEntry,
    handleDeleteJournalEntry,
  };
};

