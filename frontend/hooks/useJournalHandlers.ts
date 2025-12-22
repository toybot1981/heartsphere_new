/**
 * 日记（Journal）相关操作 Hook
 * 封装日记的添加、更新、删除等业务逻辑
 */

import { useCallback, useRef } from 'react';
import { JournalEntry } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { journalApi } from '../services/api';
import { showSyncErrorToast } from '../utils/toast';

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
   */
  const handleAddJournalEntry = useCallback(async (
    title: string,
    content: string,
    imageUrl?: string,
    insight?: string,
    tags?: string
  ) => {
    // 1. 先保存到本地（立即更新UI）
    const newEntry: JournalEntry = {
      id: `entry_${Date.now()}`,
      title,
      content,
      timestamp: Date.now(),
      imageUrl,
      insight,
      tags
    };
    
    // 立即 dispatch，确保 UI 立即更新
    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: newEntry });

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
          
          const savedEntry = await journalApi.createJournalEntry(apiRequestData, token);
          
          // 使用 ref 获取最新的 entries，更新本地状态（使用服务器返回的ID）
          const updatedEntries = journalEntriesRef.current.map(e => 
            e.id === newEntry.id 
              ? { ...e, id: savedEntry.id.toString() }
              : e
          );
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedEntries });
        } catch (error) {
          console.error('Failed to sync journal entry with server:', error);
          showSyncErrorToast('日志');
        }
      })();
    }
  }, [dispatch]);

  /**
   * 更新日记条目
   */
  const handleUpdateJournalEntry = useCallback(async (updatedEntry: JournalEntry) => {
    // 1. 先保存到本地（立即更新UI）
    const updatedEntries = journalEntriesRef.current.map(e => e.id === updatedEntry.id ? updatedEntry : e);
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
          
          await journalApi.updateJournalEntry(updatedEntry.id, apiRequestData, token);
          // 更新成功，不需要日志（根据重构要求，只保留错误日志）
        } catch (error) {
          console.error('Failed to sync journal entry with server:', error);
          showSyncErrorToast('日志');
        }
      })();
    }
  }, [dispatch]);

  /**
   * 删除日记条目
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
        // 1. 先删除服务器数据（确保服务器和缓存同步）
        console.log('[useJournalHandlers] 📡 调用API删除，ID:', id, 'Token:', token ? '存在' : '不存在');
        const deleteResult = await journalApi.deleteJournalEntry(id, token);
        console.log('[useJournalHandlers] ✅ API删除成功，响应:', deleteResult);
        
        // 2. 服务器删除成功后，删除本地状态
        const remainingEntries = entriesBeforeDelete.filter(e => e.id !== id);
        console.log('[useJournalHandlers] 📝 更新本地缓存:');
        console.log('  - 删除前条目数:', entriesBeforeDelete.length);
        console.log('  - 删除后条目数:', remainingEntries.length);
        console.log('  - 删除后条目ID列表:', remainingEntries.map(e => e.id));
        
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

