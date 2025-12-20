/**
 * 角色相关业务Hook
 * 封装角色相关的状态操作和业务逻辑
 */

import { useCallback, useMemo } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { Character } from '../types';
import { characterApi } from '../services/api';
import { getToken } from '../services/api/base/tokenStorage';

export const useCharacters = () => {
  const { state, dispatch } = useGameState();

  // 获取当前场景的角色
  const getSceneCharacters = useCallback((sceneId: string): Character[] => {
    return state.customCharacters[sceneId] || [];
  }, [state.customCharacters]);

  // 获取当前选中场景的角色
  const currentSceneCharacters = useMemo(() => {
    if (!state.selectedSceneId) return [];
    return getSceneCharacters(state.selectedSceneId);
  }, [state.selectedSceneId, getSceneCharacters]);

  // 获取当前选中的角色
  const currentCharacter = useMemo(() => {
    if (!state.selectedCharacterId) return null;
    // 从所有场景中查找角色
    for (const characters of Object.values(state.customCharacters)) {
      const character = characters.find(char => char.id === state.selectedCharacterId);
      if (character) return character;
    }
    return null;
  }, [state.selectedCharacterId, state.customCharacters]);

  // 添加角色到场景
  const addCharacterToScene = useCallback((sceneId: string, character: Character) => {
    dispatch({ type: 'ADD_CHARACTER_TO_SCENE', payload: { sceneId, character } });
  }, [dispatch]);

  // 更新场景中的角色
  const updateCharacterInScene = useCallback((sceneId: string, characterId: string, updates: Partial<Character>) => {
    dispatch({ type: 'UPDATE_CHARACTER_IN_SCENE', payload: { sceneId, characterId, updates } });
  }, [dispatch]);

  // 从场景中删除角色
  const removeCharacterFromScene = useCallback((sceneId: string, characterId: string) => {
    dispatch({ type: 'REMOVE_CHARACTER_FROM_SCENE', payload: { sceneId, characterId } });
  }, [dispatch]);

  // 设置选中的角色
  const setSelectedCharacter = useCallback((characterId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: characterId });
  }, [dispatch]);

  // 从后端加载角色
  const loadCharactersFromBackend = useCallback(async (worldId?: number) => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('[useCharacters] 未找到token，无法加载角色');
        return;
      }

      const characters = worldId
        ? await characterApi.getCharactersByWorldId(worldId, token)
        : await characterApi.getAllCharacters(token);

      // 将后端数据转换为Character格式
      // 注意：这里需要根据实际的数据结构进行转换
      // 暂时返回空数组，实际使用时需要根据后端数据结构调整
      return characters;
    } catch (error) {
      console.error('[useCharacters] 加载角色失败:', error);
      throw error;
    }
  }, []);

  return {
    // 数据
    currentSceneCharacters,
    currentCharacter,
    
    // 方法
    getSceneCharacters,
    addCharacterToScene,
    updateCharacterInScene,
    removeCharacterFromScene,
    setSelectedCharacter,
    loadCharactersFromBackend
  };
};

