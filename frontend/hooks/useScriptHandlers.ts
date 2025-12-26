/**
 * 剧本（Script/Scenario）相关操作 Hook
 * 封装剧本的保存、删除、编辑、播放等业务逻辑
 */

import { useCallback } from 'react';
import { CustomScenario, Character } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { scriptApi } from '../services/api';
import { syncService } from '../services/syncService';
import { aiService } from '../services/ai/AIService';
import { showAlert, showConfirm } from '../utils/dialog';
import { showSyncErrorToast } from '../utils/toast';
import { WORLD_SCENES } from '../constants';

/**
 * 剧本操作 Hook
 */
export const useScriptHandlers = () => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 保存剧本
   */
  const handleSaveScenario = useCallback(async (scenario: CustomScenario) => {
    if (!gameState.selectedSceneId && !gameState.editingScenarioId) return;
    
    const sceneId = gameState.selectedSceneId || gameState.customScenarios.find(s => s.id === scenario.id)?.sceneId;
    if (!sceneId) return;

    const completeScenario = { ...scenario, sceneId };
    
    // Update local state immediately for UI responsiveness
    const exists = gameState.customScenarios.some(s => s.id === scenario.id);
    let newScenarios = [...gameState.customScenarios];
    if (exists) {
      newScenarios = newScenarios.map(s => s.id === scenario.id ? completeScenario : s);
    } else {
      newScenarios.push(completeScenario);
    }
    dispatch({ type: 'SET_CUSTOM_SCENARIOS', payload: newScenarios });
    const newScreen = gameState.currentScreen === 'builder' ? 'characterSelection' : gameState.currentScreen;
    if (newScreen !== gameState.currentScreen) {
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: newScreen });
    }
    dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: null });

    // 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
      (async () => {
        try {
          await syncService.handleLocalDataChange('scenario', completeScenario);
          console.log('Scenario synced with server:', completeScenario.id);
        } catch (error) {
          console.error('Error syncing scenario:', error);
          showSyncErrorToast('剧本');
        }
      })();
    }
  }, [gameState, dispatch]);

  /**
   * 删除剧本
   */
  const handleDeleteScenario = useCallback(async (scenarioId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    const confirmed = await showConfirm("确定要删除这个剧本吗？删除后将移至回收站，可以随时恢复。", '删除剧本', 'warning');
    if (confirmed) {
      // Update local state immediately for UI responsiveness
      // 使用字符串比较确保ID类型一致，删除所有匹配的scenario（防止有重复的相同ID）
      const scenarioIdStr = String(scenarioId);
      const remainingScenarios = gameState.customScenarios.filter(s => String(s.id) !== scenarioIdStr);
      
      console.log('[useScriptHandlers] handleDeleteScenario - 删除scenario:', {
        scenarioId,
        scenarioIdStr,
        beforeCount: gameState.customScenarios.length,
        afterCount: remainingScenarios.length,
        deletedCount: gameState.customScenarios.length - remainingScenarios.length
      });
      
      dispatch({ type: 'SET_CUSTOM_SCENARIOS', payload: remainingScenarios });
      const newEditingScenarioId = String(gameState.editingScenarioId) === scenarioIdStr ? null : gameState.editingScenarioId;
      if (newEditingScenarioId !== gameState.editingScenarioId) {
        dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: newEditingScenarioId });
      }
      const newSelectedScenarioId = String(gameState.selectedScenarioId) === scenarioIdStr ? null : gameState.selectedScenarioId;
      if (newSelectedScenarioId !== gameState.selectedScenarioId) {
        dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: newSelectedScenarioId });
      }

      // Sync with server
      try {
        await scriptApi.deleteScript(parseInt(scenarioId), localStorage.getItem('auth_token') || '');
        console.log('Scenario deleted from server:', scenarioId);
      } catch (error) {
        console.error('Error deleting scenario from server:', error);
        // Show error message to user
        showAlert('剧本删除同步失败，请检查网络连接或稍后重试。', '同步失败', 'error');
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
    
    // 详细调试日志
    console.log('[useScriptHandlers] handlePlayScenario - 查找 existingScenario:', {
      scenarioId: scenario.id,
      scenarioIdType: typeof scenario.id,
      customScenariosCount: gameState.customScenarios.length,
      customScenariosIds: gameState.customScenarios.map(s => ({ id: s.id, idType: typeof s.id, title: s.title })),
      foundExistingScenario: !!existingScenario,
      existingScenarioId: existingScenario?.id,
      existingScenarioNodesCount: existingScenario ? Object.keys(existingScenario.nodes || {}).length : 0
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
          console.log('[useScriptHandlers] 移除重复的scenario:', { id, title: s.title });
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
    
    console.log('[useScriptHandlers] handlePlayScenario - scenario处理:', {
      scenarioId: scenarioToUse.id,
      scenarioTitle: scenarioToUse.title,
      isFromBackendScript,
      existsInCustomScenarios: !!existingScenario,
      usingExistingScenario: !!existingScenario,
      willUpdateCustomScenarios: isFromBackendScript || (!existingScenario && !isFromBackendScript),
      customScenariosCount: gameState.customScenarios.length,
      updatedCustomScenariosCount: updatedCustomScenarios.length,
      hasExistingHistory,
      historyLength: existingHistory.length,
      currentNodeId,
      restoredFromHistory: hasExistingHistory && currentNodeId !== actualStartNodeId,
      nodesCount: Object.keys(scenarioToUse.nodes || {}).length
    });
    
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
    console.log('========== [useScriptHandlers] 编辑后端剧本 ==========');
    console.log('[useScriptHandlers] handleEditScript 调用:', {
      script: script,
      scriptId: script?.id,
      scriptTitle: script?.title,
      sceneId: gameState.selectedSceneId,
      userProfile: gameState.userProfile ? {
        id: gameState.userProfile.id,
        nickname: gameState.userProfile.nickname,
        isGuest: gameState.userProfile.isGuest
      } : null,
      timestamp: new Date().toISOString()
    });
    
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
    console.log('[useScriptHandlers] 准备打开 UserScriptEditor 编辑剧本:', {
      scriptId: script.id,
      scriptTitle: script.title,
      eraId: script.eraId,
      worldId: script.worldId
    });
    
    dispatch({ type: 'SET_EDITING_SCRIPT', payload: script });
    
    console.log('[useScriptHandlers] 已打开 UserScriptEditor 编辑页面');
    console.log('========== [useScriptHandlers] 编辑后端剧本完成 ==========');
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
          console.log('Script deleted from server:', scriptId);
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

