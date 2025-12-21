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

    // 2. 异步同步到服务器（如果已登录且ID是数字）
    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    const isNumericId = /^\d+$/.test(updatedEntry.id);
    if (token && currentUserProfile && !currentUserProfile.isGuest && isNumericId) {
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
    // 保存删除前的完整条目列表，以便失败时恢复
    const entriesBeforeDelete = [...journalEntriesRef.current];
    
    // 检查要删除的条目是否存在
    const entryToDelete = entriesBeforeDelete.find(e => e.id === id);
    if (!entryToDelete) {
      console.error('[useJournalHandlers] Journal entry not found for deletion:', id);
      return;
    }

    // 1. 先删除本地（立即更新UI）
    const remainingEntries = entriesBeforeDelete.filter(e => e.id !== id);
    dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: remainingEntries });

    // 2. 异步同步到服务器（如果已登录且ID是数字）
    const token = localStorage.getItem('auth_token');
    const currentUserProfile = userProfileRef.current;
    const isNumericId = /^\d+$/.test(id);
    
    // 如果是临时 ID（非数字），不需要同步到服务器
    if (token && currentUserProfile && !currentUserProfile.isGuest && isNumericId) {
      try {
        await journalApi.deleteJournalEntry(id, token);
        // 删除成功，不需要日志（根据重构要求，只保留错误日志）
      } catch (error) {
        console.error('[useJournalHandlers] Failed to delete journal entry from server:', error);
        // 删除失败，恢复本地条目（使用删除前的完整列表）
        dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: entriesBeforeDelete });
        showSyncErrorToast('日志删除失败，已恢复');
      }
    } else {
      // 对于临时 ID 或访客用户，不需要同步，直接删除即可
      if (!token || !currentUserProfile || currentUserProfile.isGuest) {
        console.error('[useJournalHandlers] Guest user or no token, skipping server sync for deletion');
      } else if (!isNumericId) {
        console.error('[useJournalHandlers] Non-numeric ID, skipping server sync for deletion:', id);
      }
    }
  }, [dispatch]);

  return {
    handleAddJournalEntry,
    handleUpdateJournalEntry,
    handleDeleteJournalEntry,
  };
};

