/**
 * 剧本相关业务Hook
 * 封装剧本相关的状态操作和业务逻辑
 */

import { useCallback, useMemo } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { CustomScenario } from '../types';
import { scriptApi, presetScriptApi } from '../services/api';
import { getToken } from '../services/api/base/tokenStorage';

export const useScripts = () => {
  const { state, dispatch } = useGameState();

  // 获取所有自定义剧本
  const customScenarios = useMemo(() => state.customScenarios, [state.customScenarios]);

  // 获取当前选中的剧本
  const currentScenario = useMemo(() => {
    if (!state.selectedScenarioId) return null;
    return customScenarios.find(scenario => scenario.id === state.selectedScenarioId) || null;
  }, [state.selectedScenarioId, customScenarios]);

  // 获取正在编辑的剧本
  const editingScenario = useMemo(() => {
    if (!state.editingScenarioId) return null;
    return customScenarios.find(scenario => scenario.id === state.editingScenarioId) || null;
  }, [state.editingScenarioId, customScenarios]);

  // 添加剧本
  const addScenario = useCallback((scenario: CustomScenario) => {
    dispatch({ type: 'ADD_CUSTOM_SCENARIO', payload: scenario });
  }, [dispatch]);

  // 更新剧本
  const updateScenario = useCallback((scenarioId: string, updates: Partial<CustomScenario>) => {
    dispatch({ type: 'UPDATE_CUSTOM_SCENARIO', payload: { scenarioId, updates } });
  }, [dispatch]);

  // 删除剧本
  const removeScenario = useCallback((scenarioId: string) => {
    dispatch({ type: 'REMOVE_CUSTOM_SCENARIO', payload: scenarioId });
  }, [dispatch]);

  // 设置选中的剧本
  const setSelectedScenario = useCallback((scenarioId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: scenarioId });
  }, [dispatch]);

  // 设置正在编辑的剧本
  const setEditingScenario = useCallback((scenarioId: string | null) => {
    dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: scenarioId });
  }, [dispatch]);

  // 从后端加载剧本
  const loadScriptsFromBackend = useCallback(async (worldId?: number, eraId?: number) => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('[useScripts] 未找到token，无法加载剧本');
        return;
      }

      let scripts;
      if (eraId) {
        scripts = await scriptApi.getScriptsByEraId(eraId, token);
      } else if (worldId) {
        scripts = await scriptApi.getScriptsByWorldId(worldId, token);
      } else {
        scripts = await scriptApi.getAllScripts(token);
      }

      return scripts;
    } catch (error) {
      console.error('[useScripts] 加载剧本失败:', error);
      throw error;
    }
  }, []);

  // 加载预置剧本
  const loadPresetScripts = useCallback(async (eraId?: number) => {
    try {
      const scripts = eraId
        ? await presetScriptApi.getByEraId(eraId)
        : await presetScriptApi.getAll();
      return scripts;
    } catch (error) {
      console.error('[useScripts] 加载预置剧本失败:', error);
      throw error;
    }
  }, []);

  return {
    // 数据
    customScenarios,
    currentScenario,
    editingScenario,
    
    // 方法
    addScenario,
    updateScenario,
    removeScenario,
    setSelectedScenario,
    setEditingScenario,
    loadScriptsFromBackend,
    loadPresetScripts
  };
};

