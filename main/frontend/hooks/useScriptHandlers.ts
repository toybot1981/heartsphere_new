/**
 * 剧本（Script/Scenario）相关操作 Hook
 * 封装剧本的保存、删除、编辑、播放等业务逻辑
 */

import { useCallback } from 'react';
import { CustomScenario, Character } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { scriptApi, eraApi, worldApi, characterApi, userMainStoryApi } from '../services/api';
import { getWorldIdForSceneId } from '../utils/sceneMapping';
import { aiService } from '../services/ai/AIService';
import { showAlert, showConfirm } from '../utils/dialog';
import { WORLD_SCENES } from '../constants';
import { convertErasToWorldScenes } from '../utils/dataTransformers';

/**
 * 剧本操作 Hook
 */
export const useScriptHandlers = () => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 保存剧本
   * 直接保存到服务器，不进行本地缓存
   */
  const handleSaveScenario = useCallback(async (scenario: CustomScenario) => {
    if (!gameState.selectedSceneId && !gameState.editingScenarioId) return;
    
    const sceneId = gameState.selectedSceneId || gameState.customScenarios.find(s => s.id === scenario.id)?.sceneId;
    if (!sceneId) return;

    const token = localStorage.getItem('auth_token');
    const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
    
    if (!token || isGuest) {
      showAlert('请先登录才能保存剧本', '需要登录', 'warning');
      return;
    }

    try {
      // 获取当前场景信息，以便获取 worldId 和 eraId
      const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
        ? [...gameState.userWorldScenes, ...gameState.customScenes]
        : [...WORLD_SCENES, ...gameState.customScenes];
      const currentScene = allScenes.find(s => s.id === sceneId);
      const worldId = currentScene?.worldId || getWorldIdForSceneId(sceneId);
      
      // 提取 eraId（场景ID中的数字部分）
      const numericMatch = sceneId.match(/\d+$/);
      const eraId = numericMatch ? parseInt(numericMatch[0], 10) : null;

      // 将 CustomScenario 转换为 CreateScriptDTO 或 UpdateScriptDTO
      const scriptContent = JSON.stringify(scenario);
      const isNumericId = /^\d+$/.test(scenario.id);
      
      if (isNumericId) {
        // 更新现有剧本
        const scriptId = parseInt(scenario.id, 10);
        await scriptApi.updateScript(scriptId, {
          title: scenario.title,
          description: scenario.description || null,
          content: scriptContent,
          sceneCount: Object.keys(scenario.nodes || {}).length,
          characterIds: null, // 可以从 scenario 中提取角色ID
          tags: null,
          worldId: worldId,
          eraId: eraId || undefined,
        }, token);
      } else {
        // 创建新剧本
        const createdScript = await scriptApi.createScript({
          title: scenario.title,
          description: scenario.description || null,
          content: scriptContent,
          sceneCount: Object.keys(scenario.nodes || {}).length,
          characterIds: null,
          tags: null,
          worldId: worldId,
          eraId: eraId || undefined,
        }, token);
      }

      // 刷新场景列表，从服务器获取最新数据
      const worlds = await worldApi.getAllWorlds(token);
      const eras = await eraApi.getAllEras(token);
      const characters = await characterApi.getAllCharacters(token);
      const scripts = await scriptApi.getAllScripts(token);
      const userMainStories = await userMainStoryApi.getAll(token);
      
      const updatedUserWorldScenes = convertErasToWorldScenes(
        worlds,
        eras,
        characters,
        scripts,
        userMainStories
      );

      // 保留原有的 memories
      const scenesWithMemories = updatedUserWorldScenes.map(scene => {
        const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
        return {
          ...scene,
          memories: existingScene?.memories
        };
      });

      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
      dispatch({ type: 'SET_CUSTOM_SCENARIOS', payload: [] }); // 清空本地缓存
      
      const newScreen = gameState.currentScreen === 'builder' ? 'characterSelection' : gameState.currentScreen;
      if (newScreen !== gameState.currentScreen) {
        dispatch({ type: 'SET_CURRENT_SCREEN', payload: newScreen });
      }
      dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: null });
    } catch (error: any) {
      console.error('[useScriptHandlers] 剧本保存失败:', error);
      const errorMessage = error.message || '未知错误';
      showAlert(`剧本保存失败: ${errorMessage}`, '保存失败', 'error');
      throw error;
    }
  }, [gameState, dispatch]);

  /**
   * 删除剧本
   * 直接从服务器删除，不进行本地缓存操作
   */
  const handleDeleteScenario = useCallback(async (scenarioId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    
    const token = localStorage.getItem('auth_token');
    const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
    
    if (!token || isGuest) {
      showAlert('请先登录才能删除剧本', '需要登录', 'warning');
      return;
    }

    const confirmed = await showConfirm("确定要删除这个剧本吗？删除后将移至回收站，可以随时恢复。", '删除剧本', 'warning');
    if (confirmed) {
      try {
        const isNumericId = /^\d+$/.test(scenarioId);
        if (!isNumericId) {
          showAlert('无效的剧本ID', '错误', 'error');
          return;
        }

        // 直接从服务器删除
        await scriptApi.deleteScript(parseInt(scenarioId, 10), token);

        // 刷新场景列表，从服务器获取最新数据
        const worlds = await worldApi.getAllWorlds(token);
        const eras = await eraApi.getAllEras(token);
        const characters = await characterApi.getAllCharacters(token);
        const scripts = await scriptApi.getAllScripts(token);
        const userMainStories = await userMainStoryApi.getAll(token);
        
        const updatedUserWorldScenes = convertErasToWorldScenes(
          worlds,
          eras,
          characters,
          scripts,
          userMainStories
        );

        // 保留原有的 memories
        const scenesWithMemories = updatedUserWorldScenes.map(scene => {
          const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
          return {
            ...scene,
            memories: existingScene?.memories
          };
        });

        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
        dispatch({ type: 'SET_CUSTOM_SCENARIOS', payload: [] }); // 清空本地缓存
        
        // 更新编辑和选中状态
        const scenarioIdStr = String(scenarioId);
        const newEditingScenarioId = String(gameState.editingScenarioId) === scenarioIdStr ? null : gameState.editingScenarioId;
        if (newEditingScenarioId !== gameState.editingScenarioId) {
          dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: newEditingScenarioId });
        }
        const newSelectedScenarioId = String(gameState.selectedScenarioId) === scenarioIdStr ? null : gameState.selectedScenarioId;
        if (newSelectedScenarioId !== gameState.selectedScenarioId) {
          dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: newSelectedScenarioId });
        }
      } catch (error: any) {
        console.error('[useScriptHandlers] 剧本删除失败:', error);
        const errorMessage = error.message || '未知错误';
        showAlert(`剧本删除失败: ${errorMessage}`, '删除失败', 'error');
      }
    }
  }, [gameState, dispatch]);

  /**
   * 编辑剧本
   */
  const handleEditScenario = useCallback((scenario: CustomScenario, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: scenario.id });
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'builder' });
  }, [dispatch]);

  /**
   * 播放剧本
   */
  const handlePlayScenario = useCallback((scenario: CustomScenario) => {
    let startNode = scenario.nodes[scenario.startNodeId];
    
    // Fallback if startNodeId is invalid
    if (!startNode) {
      const firstKey = Object.keys(scenario.nodes)[0];
      if (firstKey) {
        startNode = scenario.nodes[firstKey];
      } else {
        showAlert("错误：该剧本没有有效节点。", '错误', 'error');
        return;
      }
    }
    
    // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
    const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
      ? [...gameState.userWorldScenes, ...gameState.customScenes]
      : [...WORLD_SCENES, ...gameState.customScenes];
    const scene = allScenes.find(s => s.id === gameState.selectedSceneId);
    const sceneImage = scene?.imageUrl || 'https://picsum.photos/seed/default_bg/1080/1920';

    const narrator: Character = {
      id: `narrator_${scenario.id}`,
      name: '旁白',
      age: 0,
      role: 'Narrator',
      bio: 'AI Narrator',
      avatarUrl: sceneImage, 
      backgroundUrl: sceneImage, 
      systemInstruction: 'You are the narrator.',
      themeColor: 'gray-500',
      colorAccent: '#6b7280',
      firstMessage: startNode.prompt || '...', 
      voiceName: 'Kore'
    };

    aiService.resetSession(narrator.id);

    // 检查是否是从后端加载的剧本（通过检查ID是否为数字字符串）
    const isFromBackendScript = /^\d+$/.test(scenario.id);
    
    // 查找是否已存在相同的scenario（避免重复添加）
    const existingScenario = gameState.customScenarios.find(s => {
      return String(s.id) === String(scenario.id);
    });
    
    // 使用已存在的scenario（如果存在），否则使用传入的scenario
    const scenarioToUse = existingScenario || scenario;
    
    // 使用scenarioToUse来获取startNode，确保节点数据是最新的
    const actualStartNode = scenarioToUse.nodes[scenarioToUse.startNodeId];
    const actualStartNodeId = actualStartNode ? scenarioToUse.startNodeId : (Object.keys(scenarioToUse.nodes)[0] || '');
    
    // 检查是否已有历史记录（保留上次退出时的内容）
    const existingHistory = gameState.history[narrator.id] || [];
    const hasExistingHistory = existingHistory.length > 0;
    
    // 如果是从后端script转换来的，需要临时添加到customScenarios中（但标记为临时，不会被持久化）
    // 对于手动创建的剧本，如果已存在则不做任何修改（避免复制）
    let updatedCustomScenarios = gameState.customScenarios;
    if (isFromBackendScript) {
      // 后端script转换的scenario：临时添加到customScenarios中以便ChatWindow访问
      // 如果已经存在（可能是之前添加的），则更新它；否则添加
      const existingIndex = updatedCustomScenarios.findIndex(s => String(s.id) === String(scenarioToUse.id));
      if (existingIndex >= 0) {
        // 更新已存在的临时scenario
        updatedCustomScenarios = updatedCustomScenarios.map((s, idx) => 
          idx === existingIndex ? scenarioToUse : s
        );
      } else {
        // 添加新的临时scenario
        updatedCustomScenarios = [...updatedCustomScenarios, scenarioToUse];
      }
    }
    // 对于手动创建的剧本：
    // - 如果 existingScenario 存在，说明已经在 customScenarios 中，不做任何修改（避免复制）
    // - 如果 existingScenario 不存在，也不应该在 handlePlayScenario 中添加（应该在 handleSaveScenario 中保存）
    // 所以这里不添加手动创建的剧本，避免复制
    
    // 重要：确保 customScenarios 中没有重复的相同ID的scenario（防止意外复制）
    // 对所有类型的scenario都进行去重检查
    const duplicateCount = updatedCustomScenarios.filter(s => String(s.id) === String(scenarioToUse.id)).length;
    if (duplicateCount > 1) {
      console.warn('[useScriptHandlers] ⚠️ 警告：发现重复的scenario ID，正在去重:', {
        scenarioId: scenarioToUse.id,
        scenarioTitle: scenarioToUse.title,
        duplicateCount,
        isFromBackendScript,
        willDeduplicate: true
      });
      // 去重：只保留第一个出现的scenario（保留原有的）
      const seenIds = new Set<string>();
      updatedCustomScenarios = updatedCustomScenarios.filter(s => {
        const id = String(s.id);
        if (seenIds.has(id)) {
          return false; // 重复的，移除
        }
        seenIds.add(id);
        return true;
      });
    }
    
    // 对于手动创建的剧本，额外确保：如果 existingScenario 存在，updatedCustomScenarios 必须保持不变
    if (!isFromBackendScript && existingScenario) {
      // 手动创建的剧本已存在，强制使用原有的列表，不进行任何添加或修改
      // 这确保即使有bug也不会复制
      const finalCount = updatedCustomScenarios.filter(s => String(s.id) === String(scenarioToUse.id)).length;
      if (finalCount !== 1) {
        console.error('[useScriptHandlers] ❌ 错误：手动创建的剧本去重后数量异常:', {
          scenarioId: scenarioToUse.id,
          finalCount,
          willReset: true
        });
        // 如果去重后仍然异常，强制使用原始列表（但去重）
        const seenIds2 = new Set<string>();
        updatedCustomScenarios = gameState.customScenarios.filter(s => {
          const id = String(s.id);
          if (seenIds2.has(id)) return false;
          seenIds2.add(id);
          return true;
        });
      }
    }
    
    // 确定起始节点：如果有历史记录，尝试从currentScenarioState恢复；否则使用startNode
    let currentNodeId = actualStartNodeId || startNode.id;
    if (hasExistingHistory && gameState.currentScenarioState?.scenarioId === String(scenarioToUse.id)) {
      // 如果有历史记录且是同一个scenario，尝试恢复节点
      const savedNodeId = gameState.currentScenarioState.currentNodeId;
      if (scenarioToUse.nodes[savedNodeId]) {
        currentNodeId = savedNodeId;
      }
    }
    
    dispatch({ type: 'SET_CUSTOM_SCENARIOS', payload: updatedCustomScenarios });
    dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: narrator.id });
    dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: narrator });
    dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: String(scenarioToUse.id) });
    dispatch({ type: 'SET_CURRENT_SCENARIO_STATE', payload: { scenarioId: String(scenarioToUse.id), currentNodeId } });
    dispatch({ type: 'SET_HISTORY', payload: { 
      ...gameState.history, 
      [narrator.id]: hasExistingHistory ? existingHistory : []
    }});
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'chat' });
  }, [gameState, dispatch]);

  /**
   * 编辑后端剧本
   */
  const handleEditScript = useCallback(async (script: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!gameState.userProfile || gameState.userProfile.isGuest) {
      console.warn('[useScriptHandlers] 编辑剧本失败: 用户未登录或为游客');
      showAlert('请先登录才能编辑剧本', '需要登录', 'warning');
      return;
    }
    
    // 检查 script 对象是否有效
    if (!script || script.id === undefined || script.id === null) {
      console.error('[useScriptHandlers] 无效的剧本对象:', {
        script: script,
        scriptType: typeof script,
        scriptKeys: script ? Object.keys(script) : [],
        timestamp: new Date().toISOString()
      });
      showAlert('剧本数据无效，无法编辑', '错误', 'error');
      return;
    }
    
    // 直接设置 editingScript，使用 UserScriptEditor 组件
    dispatch({ type: 'SET_EDITING_SCRIPT', payload: script });
    
  }, [gameState, dispatch]);

  /**
   * 删除后端剧本
   */
  const handleDeleteScript = useCallback(async (script: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!gameState.userProfile || gameState.userProfile.isGuest) {
      showAlert('请先登录才能删除剧本', '需要登录', 'warning');
      return;
    }
    
    // 检查 script 对象是否有效
    if (!script || script.id === undefined || script.id === null) {
      console.error('无效的剧本对象:', script);
      showAlert('剧本数据无效，无法删除', '错误', 'error');
      return;
    }
    
    const confirmed = await showConfirm("确定要删除这个剧本吗？删除后将移至回收站，可以随时恢复。", '删除剧本', 'warning');
    if (confirmed) {
      // 1. 先删除本地（立即更新UI）
      const currentSceneId = gameState.selectedSceneId || '';
      const updatedUserWorldScenes = gameState.userWorldScenes.map(scene => {
        if (scene.id === currentSceneId) {
          return {
            ...scene,
            scripts: (scene.scripts || []).filter(s => String(s.id) !== String(script.id))
          };
        }
        return scene;
      });
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });

      // 2. 异步同步到服务器
      const token = localStorage.getItem('auth_token');
      if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
        try {
          // 确保 script.id 是数字
          const scriptId = typeof script.id === 'string' ? parseInt(script.id, 10) : script.id;
          if (isNaN(scriptId)) {
            throw new Error('无效的剧本ID');
          }
          await scriptApi.deleteScript(scriptId, token);
          showAlert('剧本已删除', '删除成功', 'success');
        } catch (error) {
          console.error('Error deleting script from server:', error);
          showAlert('剧本删除同步失败，请检查网络连接或稍后重试。', '同步失败', 'error');
        }
      }
    }
  }, [gameState, dispatch]);

  return {
    handleSaveScenario,
    handleDeleteScenario,
    handleEditScenario,
    handlePlayScenario,
    handleEditScript,
    handleDeleteScript,
  };
};

