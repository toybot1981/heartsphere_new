import { useState, useEffect, useCallback } from 'react';
import { quickConnectApi } from '../services/api/quickconnect';
import type {
  QuickConnectCharacter,
  GetQuickConnectCharactersParams,
  FilterType,
} from '../services/api/quickconnect/types';
import { useQuickConnectCache } from './useQuickConnectCache';

interface QuickConnectState {
  characters: QuickConnectCharacter[];
  filteredCharacters: QuickConnectCharacter[];
  searchQuery: string;
  filterType: FilterType;
  selectedSceneIds: number[];
  sortBy: 'frequency' | 'recent' | 'name' | 'favorite';
  isLoading: boolean;
  isSearching: boolean;
  viewMode: 'grid' | 'list' | 'compact';
  error: string | null;
  totalCount: number;
  favoriteCount: number;
  recentCount: number;
}

/**
 * 快速连接Hook
 * 管理快速连接的状态和操作
 */
export const useQuickConnect = () => {
  const cache = useQuickConnectCache();
  
  const [state, setState] = useState<QuickConnectState>({
    characters: [],
    filteredCharacters: [],
    searchQuery: '',
    filterType: 'all',
    selectedSceneIds: [],
    sortBy: 'frequency',
    isLoading: false,
    isSearching: false,
    viewMode: 'grid',
    error: null,
    totalCount: 0,
    favoriteCount: 0,
    recentCount: 0,
  });
  
  /**
   * 加载E-SOUL列表（带缓存）
   */
  const loadCharacters = useCallback(async (params?: GetQuickConnectCharactersParams) => {
    const filter = params?.filter || state.filterType;
    const sceneId = params?.sceneId;
    const sortBy = params?.sortBy || state.sortBy;
    const search = params?.search || state.searchQuery || undefined;
    
    // 检查缓存
    const cacheKey = cache.generateCacheKey(filter, sceneId, sortBy, search);
    const cachedData = cache.getCache(cacheKey);
    
    if (cachedData) {
      setState(prev => ({
        ...prev,
        characters: cachedData.characters,
        filteredCharacters: cachedData.characters,
        totalCount: cachedData.totalCount,
        favoriteCount: cachedData.favoriteCount,
        recentCount: cachedData.recentCount,
        isLoading: false,
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await quickConnectApi.getQuickConnectCharacters({
        filter,
        sceneId,
        sortBy,
        limit: params?.limit || 50,
        offset: params?.offset || 0,
        search,
      });
      
      // 缓存结果
      cache.setCache(cacheKey, {
        characters: response.characters,
        totalCount: response.totalCount,
        favoriteCount: response.favoriteCount,
        recentCount: response.recentCount,
      });
      
      setState(prev => ({
        ...prev,
        characters: response.characters,
        filteredCharacters: response.characters,
        totalCount: response.totalCount,
        favoriteCount: response.favoriteCount,
        recentCount: response.recentCount,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('[useQuickConnect] 加载失败:', error);
      setState(prev => ({
        ...prev,
        error: error.message || '加载失败，请重试',
        isLoading: false,
      }));
    }
  }, [state.filterType, state.sortBy, state.searchQuery, cache]);
  
  /**
   * 搜索E-SOUL
   */
  const searchCharacters = useCallback(async (query: string) => {
    if (!query.trim()) {
      // 如果搜索为空，重新加载列表
      await loadCharacters({ search: '' });
      return;
    }
    
    setState(prev => ({ ...prev, isSearching: true, error: null }));
    
    try {
      const response = await quickConnectApi.searchCharacters(
        query,
        state.filterType === 'favorite' ? 'favorite' : state.filterType === 'recent' ? 'recent' : 'all',
        50
      );
      
      setState(prev => ({
        ...prev,
        filteredCharacters: response.characters,
        totalCount: response.totalCount,
        isSearching: false,
      }));
    } catch (error: any) {
      console.error('[useQuickConnect] 搜索失败:', error);
      setState(prev => ({
        ...prev,
        error: error.message || '搜索失败，请重试',
        isSearching: false,
      }));
    }
  }, [state.filterType, loadCharacters]);
  
  /**
   * 切换筛选
   */
  const setFilter = useCallback((filter: FilterType) => {
    setState(prev => ({ ...prev, filterType: filter }));
    loadCharacters({ filter });
  }, [loadCharacters]);
  
  /**
   * 设置场景筛选
   */
  const setSelectedSceneIds = useCallback((sceneIds: number[]) => {
    setState(prev => ({ ...prev, selectedSceneIds: sceneIds }));
    if (sceneIds.length > 0) {
      // 如果选择了场景，应用场景筛选
      loadCharacters({ filter: 'scene', sceneId: sceneIds[0] });
    } else {
      // 如果清空场景筛选，重新加载
      loadCharacters({ filter: state.filterType });
    }
  }, [loadCharacters, state.filterType]);
  
  /**
   * 切换排序
   */
  const setSortBy = useCallback((sortBy: 'frequency' | 'recent' | 'name' | 'favorite') => {
    setState(prev => ({ ...prev, sortBy }));
    loadCharacters({ sortBy });
  }, [loadCharacters]);
  
  /**
   * 切换收藏状态
   */
  const toggleFavorite = useCallback(async (character: QuickConnectCharacter) => {
    // 乐观更新
    const wasFavorite = character.isFavorite;
    setState(prev => ({
      ...prev,
      characters: prev.characters.map(c =>
        c.characterId === character.characterId
          ? { ...c, isFavorite: !c.isFavorite }
          : c
      ),
      filteredCharacters: prev.filteredCharacters.map(c =>
        c.characterId === character.characterId
          ? { ...c, isFavorite: !c.isFavorite }
          : c
      ),
    }));
    
    // 清除相关缓存
    cache.clearCache();
    
    try {
      await quickConnectApi.toggleFavorite({
        characterId: character.characterId,
      });
      
      // 更新统计
      setState(prev => ({
        ...prev,
        favoriteCount: wasFavorite ? prev.favoriteCount - 1 : prev.favoriteCount + 1,
      }));
    } catch (error: any) {
      console.error('[useQuickConnect] 切换收藏失败:', error);
      // 回滚状态
      setState(prev => ({
        ...prev,
        characters: prev.characters.map(c =>
          c.characterId === character.characterId
            ? { ...c, isFavorite: wasFavorite }
            : c
        ),
        filteredCharacters: prev.filteredCharacters.map(c =>
          c.characterId === character.characterId
            ? { ...c, isFavorite: wasFavorite }
            : c
        ),
      }));
      throw error;
    }
  }, [cache]);
  
  /**
   * 调整收藏顺序
   */
  const reorderFavorites = useCallback(async (items: Array<{ characterId: number; sortOrder: number }>) => {
    try {
      await quickConnectApi.reorderFavorites(items);
      // 重新加载列表以获取最新排序
      await loadCharacters({ filter: 'favorite', sortBy: 'favorite' });
    } catch (error: any) {
      console.error('[useQuickConnect] 调整收藏顺序失败:', error);
      throw error;
    }
  }, [loadCharacters]);
  
  /**
   * 设置搜索关键词
   */
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    if (query.trim()) {
      searchCharacters(query);
    } else {
      loadCharacters({ search: '' });
    }
  }, [searchCharacters, loadCharacters]);
  
  /**
   * 设置视图模式
   */
  const setViewMode = useCallback((mode: 'grid' | 'list' | 'compact') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);
  
  // 初始化加载（只在组件首次挂载时加载）
  useEffect(() => {
    loadCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return {
    ...state,
    loadCharacters,
    searchCharacters,
    setFilter,
    setSortBy,
    toggleFavorite,
    setSearchQuery,
    setViewMode,
    setSelectedSceneIds,
    reorderFavorites,
    clearCache: cache.clearCache, // 暴露清除缓存方法
  };
};

