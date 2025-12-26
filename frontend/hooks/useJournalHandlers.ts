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
            console.log('[useJournalHandlers] 包含imageUrl字段在请求中:', imageUrl ? `值: ${imageUrl.substring(0, 100)}...` : '空字符串');
          } else {
            console.log('[useJournalHandlers] imageUrl字段未包含在请求中（值为:', imageUrl, ')');
          }
          
          // 打印API请求参数
          console.log('========== [useJournalHandlers] 创建日记 - API请求参数 ==========');
          console.log('[useJournalHandlers] API: POST /api/journal-entries');
          console.log('[useJournalHandlers] 请求参数:', JSON.stringify(apiRequestData, null, 2));
          console.log('[useJournalHandlers] 参数详情:', {
            title: apiRequestData.title,
            content: apiRequestData.content ? `长度: ${apiRequestData.content.length}字符` : 'null',
            entryDate: apiRequestData.entryDate,
            tags: apiRequestData.tags || 'null',
            insight: apiRequestData.insight ? `长度: ${apiRequestData.insight.length}字符` : 'null',
            imageUrl: apiRequestData.imageUrl !== undefined ? (apiRequestData.imageUrl ? `值: ${apiRequestData.imageUrl.substring(0, 100)}...` : '空字符串') : '未包含在请求中',
          });
          console.log('[useJournalHandlers] Token:', token ? '存在' : '不存在');
          console.log('========================================================');
          
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
          console.log('========== [useJournalHandlers] 准备dispatch SET_JOURNAL_ENTRIES (创建-同步成功) ==========');
          updatedEntries.forEach((entry, index) => {
            console.log(`[useJournalHandlers] dispatch前的条目 ${index + 1}:`, {
              id: entry.id,
              title: entry.title,
              hasInsight: entry.insight !== undefined && entry.insight !== null,
              insightValue: entry.insight,
              insightLength: entry.insight ? entry.insight.length : 0,
              syncStatus: entry.syncStatus,
              fullEntry: entry,
            });
          });
          console.log('========================================================');
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedEntries });
        } catch (error) {
          console.error('Failed to sync journal entry with server:', error);
          // API调用失败，标记为同步失败（syncStatus=-1）
          const errorMessage = error instanceof Error ? error.message : String(error);
          const failedEntry = syncService.markEntitySyncFailed('journal', entryWithSync, errorMessage);
          
          // 更新本地状态
          const updatedEntries = journalEntriesRef.current.map(e => 
            e.id === entryWithSync.id ? failedEntry : e
          );
          console.log('========== [useJournalHandlers] 准备dispatch SET_JOURNAL_ENTRIES (创建-同步失败) ==========');
          updatedEntries.forEach((entry, index) => {
            console.log(`[useJournalHandlers] dispatch前的条目 ${index + 1}:`, {
              id: entry.id,
              title: entry.title,
              hasInsight: entry.insight !== undefined && entry.insight !== null,
              insightValue: entry.insight,
              insightLength: entry.insight ? entry.insight.length : 0,
              syncStatus: entry.syncStatus,
              fullEntry: entry,
            });
          });
          console.log('========================================================');
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
    console.log('[useJournalHandlers] handleUpdateJournalEntry - 接收到的updatedEntry:', {
      id: updatedEntry.id,
      hasInsight: updatedEntry.insight !== undefined && updatedEntry.insight !== null,
      insightLength: updatedEntry.insight?.length || 0,
      insightPreview: updatedEntry.insight?.substring(0, 50) || 'null'
    });
    
    const entryWithSync: JournalEntry = {
      ...updatedEntry,
      syncStatus: 0 as SyncStatus, // 待同步
    };
    
    // 标记为待同步并保存到本地
    const markedEntry = syncService.markEntityForSync('journal', entryWithSync, 'update');
    
    const updatedEntries = journalEntriesRef.current.map(e => e.id === updatedEntry.id ? markedEntry : e);
    console.log('[useJournalHandlers] handleUpdateJournalEntry - 更新后的entries中该条目的insight:', 
      updatedEntries.find(e => e.id === updatedEntry.id)?.insight?.substring(0, 50) || 'null');
    console.log('========== [useJournalHandlers] 准备dispatch SET_JOURNAL_ENTRIES (更新-立即更新UI) ==========');
    updatedEntries.forEach((entry, index) => {
      console.log(`[useJournalHandlers] dispatch前的条目 ${index + 1}:`, {
        id: entry.id,
        title: entry.title,
        hasInsight: entry.insight !== undefined && entry.insight !== null,
        insightValue: entry.insight,
        insightLength: entry.insight ? entry.insight.length : 0,
        syncStatus: entry.syncStatus,
        fullEntry: entry,
      });
    });
    console.log('========================================================');
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
            console.log('[useJournalHandlers] 包含imageUrl字段在更新请求中:', updatedEntry.imageUrl ? `值: ${updatedEntry.imageUrl.substring(0, 100)}...` : '空字符串');
          } else {
            console.log('[useJournalHandlers] imageUrl字段未包含在更新请求中（值为:', updatedEntry.imageUrl, ')');
          }
          // 注意：insight的处理逻辑
          // 1. 如果insight是undefined，表示用户没有修改，应该传递原有的insight值（如果有的话）
          // 2. 如果insight是null，表示用户想清空，应该传递null或空字符串
          // 3. 如果insight是字符串（包括空字符串），应该传递该值
          // 关键：为了确保后端能正确区分"未修改"和"清空"，我们总是传递insight字段
          // 如果updatedEntry.insight是undefined，尝试从本地缓存中获取原有的insight值
          let insightToSend: string | null | undefined = updatedEntry.insight;
          if (insightToSend === undefined) {
            // 如果未定义，尝试从本地缓存中获取原有的insight
            const originalEntry = journalEntriesRef.current.find(e => e.id === updatedEntry.id);
            insightToSend = originalEntry?.insight;
            console.log('[useJournalHandlers] insight未定义，使用原有值:', insightToSend ? `长度: ${insightToSend.length}` : 'null/undefined');
          }
          
          // 总是包含insight字段，即使为null或undefined（JSON序列化时undefined会被省略，null会被保留）
          if (insightToSend !== undefined) {
            apiRequestData.insight = insightToSend !== null ? insightToSend : null;
            console.log('[useJournalHandlers] 包含insight字段在请求中:', insightToSend !== null ? `长度: ${insightToSend.length}` : 'null');
          } else {
            console.log('[useJournalHandlers] insight字段未包含在请求中（值为undefined，且本地缓存中也没有）');
          }
          
          // 打印API请求参数
          console.log('========== [useJournalHandlers] 更新日记 - API请求参数 ==========');
          console.log(`[useJournalHandlers] API: PUT /api/journal-entries/${updatedEntry.id}`);
          console.log('[useJournalHandlers] 请求参数:', JSON.stringify(apiRequestData, null, 2));
          console.log('[useJournalHandlers] 参数详情:', {
            id: updatedEntry.id,
            title: apiRequestData.title,
            content: apiRequestData.content ? `长度: ${apiRequestData.content.length}字符` : 'null',
            entryDate: apiRequestData.entryDate,
            tags: apiRequestData.tags || 'null',
            insight: apiRequestData.insight !== undefined && apiRequestData.insight !== null 
              ? `长度: ${apiRequestData.insight.length}字符, 值: ${apiRequestData.insight.substring(0, 100)}${apiRequestData.insight.length > 100 ? '...' : ''}` 
              : 'null',
          });
          console.log('[useJournalHandlers] Token:', token ? '存在' : '不存在');
          console.log('========================================================');
          
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
          console.log('========== [useJournalHandlers] 准备dispatch SET_JOURNAL_ENTRIES (更新-同步成功) ==========');
          finalEntries.forEach((entry, index) => {
            console.log(`[useJournalHandlers] dispatch前的条目 ${index + 1}:`, {
              id: entry.id,
              title: entry.title,
              hasInsight: entry.insight !== undefined && entry.insight !== null,
              insightValue: entry.insight,
              insightLength: entry.insight ? entry.insight.length : 0,
              syncStatus: entry.syncStatus,
              fullEntry: entry,
            });
          });
          console.log('========================================================');
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: finalEntries });
          console.log('[useJournalHandlers] 服务器更新后，同步到本地状态完成，insight:', savedEntry.insight ? `长度: ${savedEntry.insight.length}` : 'null');
        } catch (error) {
          console.error('Failed to sync journal entry with server:', error);
          // API调用失败，标记为同步失败（syncStatus=-1）
          const errorMessage = error instanceof Error ? error.message : String(error);
          const failedEntry = syncService.markEntitySyncFailed('journal', markedEntry, errorMessage);
          
          // 更新本地状态
          const updatedFailedEntries = journalEntriesRef.current.map(e => 
            e.id === updatedEntry.id ? failedEntry : e
          );
          console.log('========== [useJournalHandlers] 准备dispatch SET_JOURNAL_ENTRIES (更新-同步失败) ==========');
          updatedFailedEntries.forEach((entry, index) => {
            console.log(`[useJournalHandlers] dispatch前的条目 ${index + 1}:`, {
              id: entry.id,
              title: entry.title,
              hasInsight: entry.insight !== undefined && entry.insight !== null,
              insightValue: entry.insight,
              insightLength: entry.insight ? entry.insight.length : 0,
              syncStatus: entry.syncStatus,
              fullEntry: entry,
            });
          });
          console.log('========================================================');
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
    console.log('=== [useJournalHandlers] 开始删除日志条目 ===');
    console.log('[useJournalHandlers] 删除ID:', id);
    console.log('[useJournalHandlers] 删除ID类型:', typeof id);
    
    // 保存删除前的完整条目列表，以便失败时恢复
    const entriesBeforeDelete = [...journalEntriesRef.current];
    console.log('[useJournalHandlers] 删除前的缓存条目数量:', entriesBeforeDelete.length);
    console.log('[useJournalHandlers] 删除前的缓存条目ID列表:', entriesBeforeDelete.map(e => e.id));
    
    // 检查要删除的条目是否存在
    const entryToDelete = entriesBeforeDelete.find(e => e.id === id);
    if (!entryToDelete) {
      console.error('[useJournalHandlers] ❌ 日志条目未找到，无法删除');
      console.error('[useJournalHandlers] 查找的ID:', id);
      console.error('[useJournalHandlers] 当前所有条目ID:', entriesBeforeDelete.map(e => ({ id: e.id, type: typeof e.id })));
      return;
    }
    
    console.log('[useJournalHandlers] ✅ 找到要删除的条目:', {
      id: entryToDelete.id,
      title: entryToDelete.title,
      timestamp: entryToDelete.timestamp
    });

    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    // 检查是否为临时ID（临时ID格式：entry_时间戳）
    const isTemporaryId = id.startsWith('entry_');
    
    console.log('[useJournalHandlers] 删除条件检查:');
    console.log('  - token存在:', !!token);
    console.log('  - userProfile存在:', !!currentUserProfile);
    console.log('  - 是否访客:', currentUserProfile?.isGuest);
    console.log('  - 是否为临时ID:', isTemporaryId);
    console.log('  - ID值:', id);
    
    // 如果是已登录用户且不是临时ID，需要先删除服务器数据，再删除本地
    if (token && currentUserProfile && !currentUserProfile.isGuest && !isTemporaryId) {
      console.log('[useJournalHandlers] 🔄 开始删除服务器数据...');
      try {
        // 1. 先调用后台API删除
        console.log('[useJournalHandlers] 📡 调用API删除，ID:', id, 'Token:', token ? '存在' : '不存在');
        await syncService.deleteEntity('journal', id);
        console.log('[useJournalHandlers] ✅ API删除成功');
        
        // 2. 服务器删除成功后，删除本地状态（syncService已处理）
        const remainingEntries = entriesBeforeDelete.filter(e => e.id !== id);
        console.log('[useJournalHandlers] 📝 更新本地缓存:');
        console.log('  - 删除前条目数:', entriesBeforeDelete.length);
        console.log('  - 删除后条目数:', remainingEntries.length);
        console.log('  - 删除后条目ID列表:', remainingEntries.map(e => e.id));
        
        console.log('========== [useJournalHandlers] 准备dispatch SET_JOURNAL_ENTRIES (删除-同步成功) ==========');
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
        
        // 验证删除后的状态
        setTimeout(() => {
          const currentEntries = journalEntriesRef.current;
          console.log('[useJournalHandlers] 🔍 删除后验证 - 当前缓存条目数:', currentEntries.length);
          console.log('[useJournalHandlers] 🔍 删除后验证 - 当前缓存条目ID列表:', currentEntries.map(e => e.id));
          const stillExists = currentEntries.some(e => e.id === id);
          if (stillExists) {
            console.error('[useJournalHandlers] ❌ 警告：删除后条目仍然存在于缓存中！');
          } else {
            console.log('[useJournalHandlers] ✅ 确认：条目已从缓存中删除');
          }
        }, 100);
        
        console.log('[useJournalHandlers] ✅ 删除流程完成（服务器+缓存）');
      } catch (error) {
        console.error('[useJournalHandlers] ❌ API删除失败:', error);
        console.error('[useJournalHandlers] 错误详情:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        console.log('[useJournalHandlers] 📝 保持本地缓存不变（删除前条目数:', entriesBeforeDelete.length, '）');
        // 删除失败，不更新本地状态，保持原样
        showSyncErrorToast('日志删除失败，请重试');
        return; // 直接返回，不执行本地删除
      }
    } else {
      // 对于临时 ID 或访客用户，直接删除本地状态
      if (isTemporaryId) {
        console.log('[useJournalHandlers] 📝 仅删除本地缓存（临时ID，未同步到服务器）');
      } else if (!token || !currentUserProfile || currentUserProfile.isGuest) {
        console.log('[useJournalHandlers] 📝 仅删除本地缓存（访客用户）');
      } else {
        console.error('[useJournalHandlers] ⚠️ 意外情况：已登录用户但未调用API删除');
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

