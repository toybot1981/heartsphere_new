/**
 * 日记（Journal）相关操作 Hook
 * 封装日记的添加、更新、删除等业务逻辑
 */

import { useCallback } from 'react';
import { JournalEntry } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { journalApi } from '../services/api';
import { showSyncErrorToast } from '../utils/toast';

/**
 * 日记操作 Hook
 */
export const useJournalHandlers = () => {
  const { state: gameState, dispatch } = useGameState();

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
    
    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: newEntry });

    // 2. 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
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
          
          // 更新本地状态（使用服务器返回的ID）
          const updatedEntries = gameState.journalEntries.map(e => 
            e.id === newEntry.id 
              ? { ...e, id: savedEntry.id.toString() }
              : e
          );
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedEntries });
          
          console.log('Journal entry synced with server:', savedEntry.id);
        } catch (error) {
          console.error('Failed to sync journal entry with server:', error);
          showSyncErrorToast('日志');
        }
      })();
    }
  }, [gameState, dispatch]);

  /**
   * 更新日记条目
   */
  const handleUpdateJournalEntry = useCallback(async (updatedEntry: JournalEntry) => {
    // 1. 先保存到本地（立即更新UI）
    const updatedEntries = gameState.journalEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedEntries });

    // 2. 异步同步到服务器（如果已登录且ID是数字）
    const token = localStorage.getItem('auth_token');
    const isNumericId = /^\d+$/.test(updatedEntry.id);
    if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
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
          console.log('Journal entry synced with server:', updatedEntry.id);
        } catch (error) {
          console.error('Failed to sync journal entry with server:', error);
          showSyncErrorToast('日志');
        }
      })();
    }
  }, [gameState, dispatch]);

  /**
   * 删除日记条目
   */
  const handleDeleteJournalEntry = useCallback(async (id: string) => {
    // 1. 先删除本地（立即更新UI）
    const remainingEntries = gameState.journalEntries.filter(e => e.id !== id);
    dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: remainingEntries });

    // 2. 异步同步到服务器（如果已登录且ID是数字）
    const token = localStorage.getItem('auth_token');
    const isNumericId = /^\d+$/.test(id);
    if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
      (async () => {
        try {
          await journalApi.deleteJournalEntry(id, token);
          console.log('Journal entry deleted from server:', id);
        } catch (error) {
          console.error('Failed to delete journal entry from server:', error);
          showSyncErrorToast('日志删除');
        }
      })();
    }
  }, [gameState, dispatch]);

  return {
    handleAddJournalEntry,
    handleUpdateJournalEntry,
    handleDeleteJournalEntry,
  };
};

