/**
 * 初始化向导逻辑 Hook
 * 管理初始化向导的显示状态和数据同步
 */

import { useState, useRef, useEffect } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { worldApi, eraApi, characterApi, scriptApi, userMainStoryApi } from '../services/api';
import { convertBackendMainStoryToCharacter } from '../utils/dataTransformers';
import { WorldScene } from '../types';

interface InitializationData {
  token: string;
  userId: number;
  worldId: number;
}

export const useInitializationWizard = () => {
  const { state: gameState, dispatch } = useGameState();
  const [showInitializationWizard, setShowInitializationWizard] = useState(false);
  const [initializationData, setInitializationData] = useState<InitializationData | null>(null);
  const initializationWizardProcessedRef = useRef(false);

  // 监听初始化向导状态变化，用于调试和自动清理
  useEffect(() => {
    console.log('[App] 初始化向导状态变化:', {
      showInitializationWizard,
      hasInitializationData: !!initializationData,
      currentScreen: gameState.currentScreen,
      initializationData: initializationData ? {
        userId: initializationData.userId,
        worldId: initializationData.worldId,
        tokenExists: !!initializationData.token
      } : null
    });
    
    // 如果初始化向导状态为 true，但没有数据，或者不在正确的页面，自动清理
    if (showInitializationWizard && (!initializationData || (gameState.currentScreen !== 'entryPoint' && gameState.currentScreen !== 'profileSetup'))) {
      console.warn('[App] 检测到初始化向导状态不一致，自动清理:', {
        showInitializationWizard,
        hasInitializationData: !!initializationData,
        currentScreen: gameState.currentScreen
      });
      setShowInitializationWizard(false);
      setInitializationData(null);
      initializationWizardProcessedRef.current = false; // 重置标记
    }
    
    // 如果已经处理过初始化向导，但状态仍然为 true，且不在正确的页面，强制清理
    if (initializationWizardProcessedRef.current && showInitializationWizard && gameState.currentScreen !== 'entryPoint' && gameState.currentScreen !== 'profileSetup') {
      console.warn('[App] 检测到初始化向导已处理但仍在显示，强制清理');
      setShowInitializationWizard(false);
      setInitializationData(null);
      initializationWizardProcessedRef.current = false;
    }
  }, [showInitializationWizard, initializationData, gameState.currentScreen]);

  const handleWizardComplete = async () => {
    console.log('[初始化向导] 完成初始化，开始同步数据');
    setShowInitializationWizard(false);
    setInitializationData(null);
    initializationWizardProcessedRef.current = false; // 重置标记
    
    // 显示友好的过渡效果
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // 重新加载数据，确保新创建的场景、角色和剧本都能显示
        console.log('[初始化向导] 开始重新加载数据...');
        const worlds = await worldApi.getAllWorlds(token);
        const eras = await eraApi.getAllEras(token);
        const characters = await characterApi.getAllCharacters(token);
        const scripts = await scriptApi.getAllScripts(token);
        const userMainStories = await userMainStoryApi.getAll(token);
        
        console.log('[初始化向导] 数据加载完成:', {
          worlds: worlds.length,
          eras: eras.length,
          characters: characters.length,
          scripts: scripts.length,
          userMainStories: userMainStories.length
        });
        
        // 更新游戏状态
        // 重新构建 userWorldScenes
        const erasByWorldId = new Map<number, typeof eras[0][]>();
        eras.forEach(era => {
          const worldId = era.worldId;
          if (worldId) {
            if (!erasByWorldId.has(worldId)) {
              erasByWorldId.set(worldId, []);
            }
            erasByWorldId.get(worldId)?.push(era);
          }
        });
        
        const charactersByEraId = new Map<number, typeof characters[0][]>();
        characters.forEach(char => {
          const eraId = char.eraId;
          if (eraId) {
            if (!charactersByEraId.has(eraId)) {
              charactersByEraId.set(eraId, []);
            }
            charactersByEraId.get(eraId)?.push(char);
          }
        });
        
        // 按场景分组剧本
        const scriptsByEraId = new Map<number, typeof scripts[0][]>();
        scripts.forEach(script => {
          const eraId = script.eraId;
          if (eraId) {
            if (!scriptsByEraId.has(eraId)) {
              scriptsByEraId.set(eraId, []);
            }
            scriptsByEraId.get(eraId)?.push(script);
          }
        });
        
        // 按场景分组用户主线剧情
        const mainStoriesByEraId = new Map<number, typeof userMainStories[0]>();
        userMainStories.forEach(mainStory => {
          const eraId = mainStory.eraId;
          if (eraId) {
            mainStoriesByEraId.set(eraId, mainStory);
          }
        });
        
        const userWorldScenes: WorldScene[] = [];
        worlds.forEach(world => {
          const worldEras = erasByWorldId.get(world.id) || [];
          worldEras.forEach(era => {
            const eraCharacters = charactersByEraId.get(era.id) || [];
            const eraScripts = scriptsByEraId.get(era.id) || [];
            const eraMainStory = mainStoriesByEraId.get(era.id);
            
            userWorldScenes.push({
              id: era.id.toString(),
              name: era.name,
              description: era.description,
              imageUrl: era.imageUrl || '',
              systemEraId: era.systemEraId || undefined,
              characters: eraCharacters.map(char => ({
                id: char.id.toString(),
                name: char.name,
                age: char.age || 0,
                role: char.role || '',
                bio: char.bio || '',
                avatarUrl: char.avatarUrl || '',
                backgroundUrl: char.backgroundUrl || '',
                themeColor: char.themeColor || 'blue-500',
                colorAccent: char.colorAccent || '#3b82f6',
                firstMessage: char.firstMessage || '',
                systemInstruction: char.systemInstruction || '',
                voiceName: char.voiceName || 'Aoede',
                mbti: char.mbti || 'INFJ',
                tags: char.tags ? (typeof char.tags === 'string' ? char.tags.split(',').filter(tag => tag.trim()) : (Array.isArray(char.tags) ? char.tags : [])) : [],
                speechStyle: char.speechStyle || '',
                catchphrases: char.catchphrases ? (typeof char.catchphrases === 'string' ? char.catchphrases.split(',').filter(phrase => phrase.trim()) : (Array.isArray(char.catchphrases) ? char.catchphrases : [])) : [],
                secrets: char.secrets || '',
                motivations: char.motivations || '',
                relationships: char.relationships || ''
              })),
              mainStory: eraMainStory ? convertBackendMainStoryToCharacter(eraMainStory) : undefined,
              scripts: eraScripts.map(script => ({
                id: script.id.toString(),
                title: script.title,
                description: script.description || null,
                content: script.content,
                sceneCount: script.sceneCount || 0,
                eraId: script.eraId || null,
                worldId: script.worldId || null,
                characterIds: script.characterIds || null,
                tags: script.tags || null,
              })),
            });
          });
        });
        
        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: userWorldScenes });
        dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: Date.now() });
        
        console.log('[初始化向导] 数据同步完成，页面已更新');
      } catch (error) {
        console.error('[初始化向导] 数据同步失败，使用页面刷新:', error);
        // 如果数据同步失败，使用页面刷新作为后备方案
        window.location.reload();
      }
    } else {
      // 如果没有 token，直接刷新页面
      window.location.reload();
    }
  };

  const handleWizardCancel = () => {
    console.log('[初始化向导] 取消初始化');
    setShowInitializationWizard(false);
    setInitializationData(null);
    initializationWizardProcessedRef.current = false; // 重置标记
  };

  const shouldShowWizard = showInitializationWizard && 
                           initializationData && 
                           (gameState.currentScreen === 'entryPoint' || gameState.currentScreen === 'profileSetup');

  return {
    showInitializationWizard,
    setShowInitializationWizard,
    initializationData,
    setInitializationData,
    initializationWizardProcessedRef,
    shouldShowWizard,
    handleWizardComplete,
    handleWizardCancel,
  };
};





