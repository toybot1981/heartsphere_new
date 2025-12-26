/**
 * 游戏状态Reducer
 * 处理所有GameState相关的状态更新
 */

import { GameState } from '../types';
import { GameStateAction } from '../contexts/types/gameState.types';
import { DEFAULT_GAME_STATE } from '../contexts/constants/defaultState';

export const gameStateReducer = (state: GameState, action: GameStateAction): GameState => {
  switch (action.type) {
    // 屏幕导航
    case 'SET_CURRENT_SCREEN':
      return { ...state, currentScreen: action.payload };
    
    case 'NAVIGATE_TO_SCREEN':
      return { ...state, currentScreen: action.payload.screen };
    
    // 用户资料
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfile: state.userProfile
          ? { ...state.userProfile, ...action.payload }
          : null
      };
    
    // 场景选择
    case 'SET_SELECTED_SCENE_ID':
      return { ...state, selectedSceneId: action.payload };
    
    case 'SET_SELECTED_CHARACTER_ID':
      return { ...state, selectedCharacterId: action.payload };
    
    case 'SET_SELECTED_SCENARIO_ID':
      return { ...state, selectedScenarioId: action.payload };
    
    // 编辑状态
    case 'SET_EDITING_SCENARIO_ID':
      return { ...state, editingScenarioId: action.payload };
    
    case 'SET_EDITING_SCRIPT':
      return { ...state, editingScript: action.payload };
    
    case 'SET_TEMP_STORY_CHARACTER':
      return { ...state, tempStoryCharacter: action.payload };
    
    // 对话历史
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    
    case 'ADD_MESSAGE': {
      const { sceneId, message } = action.payload;
      const currentHistory = state.history[sceneId] || [];
      return {
        ...state,
        history: {
          ...state.history,
          [sceneId]: [...currentHistory, message]
        }
      };
    }
    
    case 'CLEAR_HISTORY': {
      const { [action.payload]: _, ...restHistory } = state.history;
      return { ...state, history: restHistory };
    }
    
    // 自定义头像
    case 'SET_CUSTOM_AVATARS':
      return { ...state, customAvatars: action.payload };
    
    case 'SET_AVATAR': {
      const { characterId, avatarUrl } = action.payload;
      return {
        ...state,
        customAvatars: {
          ...state.customAvatars,
          [characterId]: avatarUrl
        }
      };
    }
    
    case 'SET_GENERATING_AVATAR_ID':
      return { ...state, generatingAvatarId: action.payload };
    
    // 角色管理
    case 'SET_CUSTOM_CHARACTERS':
      return { ...state, customCharacters: action.payload };
    
    case 'ADD_CHARACTER_TO_SCENE': {
      const { sceneId, character } = action.payload;
      const currentCharacters = state.customCharacters[sceneId] || [];
      return {
        ...state,
        customCharacters: {
          ...state.customCharacters,
          [sceneId]: [...currentCharacters, character]
        }
      };
    }
    
    case 'UPDATE_CHARACTER_IN_SCENE': {
      const { sceneId, characterId, updates } = action.payload;
      const currentCharacters = state.customCharacters[sceneId] || [];
      return {
        ...state,
        customCharacters: {
          ...state.customCharacters,
          [sceneId]: currentCharacters.map(char =>
            char.id === characterId ? { ...char, ...updates } : char
          )
        }
      };
    }
    
    case 'REMOVE_CHARACTER_FROM_SCENE': {
      const { sceneId, characterId } = action.payload;
      const currentCharacters = state.customCharacters[sceneId] || [];
      return {
        ...state,
        customCharacters: {
          ...state.customCharacters,
          [sceneId]: currentCharacters.filter(char => char.id !== characterId)
        }
      };
    }
    
    // 剧本管理
    case 'SET_CUSTOM_SCENARIOS':
      return { ...state, customScenarios: action.payload };
    
    case 'ADD_CUSTOM_SCENARIO':
      return {
        ...state,
        customScenarios: [...state.customScenarios, action.payload]
      };
    
    case 'UPDATE_CUSTOM_SCENARIO': {
      const { scenarioId, updates } = action.payload;
      return {
        ...state,
        customScenarios: state.customScenarios.map(scenario =>
          scenario.id === scenarioId ? { ...scenario, ...updates } : scenario
        )
      };
    }
    
    case 'REMOVE_CUSTOM_SCENARIO':
      return {
        ...state,
        customScenarios: state.customScenarios.filter(
          scenario => scenario.id !== action.payload
        )
      };
    
    // 场景管理
    case 'SET_CUSTOM_SCENES':
      return { ...state, customScenes: action.payload };
    
    case 'SET_USER_WORLD_SCENES':
      return { ...state, userWorldScenes: action.payload };
    
    case 'ADD_USER_WORLD_SCENE':
      return {
        ...state,
        userWorldScenes: [...state.userWorldScenes, action.payload]
      };
    
    case 'UPDATE_USER_WORLD_SCENE': {
      const { sceneId, updates } = action.payload;
      return {
        ...state,
        userWorldScenes: state.userWorldScenes.map(scene =>
          scene.id === sceneId ? { ...scene, ...updates } : scene
        )
      };
    }
    
    case 'REMOVE_USER_WORLD_SCENE':
      return {
        ...state,
        userWorldScenes: state.userWorldScenes.filter(
          scene => scene.id !== action.payload
        )
      };
    
    // 日记管理
    case 'SET_JOURNAL_ENTRIES':
      console.log('========== [gameStateReducer] SET_JOURNAL_ENTRIES ==========');
      console.log('[gameStateReducer] 接收到的条目数量:', action.payload.length);
      console.log('[gameStateReducer] 完整的 payload:', JSON.stringify(action.payload, null, 2));
      action.payload.forEach((entry, index) => {
        console.log(`[gameStateReducer] 条目 ${index + 1} 详细信息:`, {
          id: entry.id,
          title: entry.title,
          content: entry.content ? `长度: ${entry.content.length}` : 'null',
          hasInsight: entry.insight !== undefined && entry.insight !== null,
          insightType: typeof entry.insight,
          insightValue: entry.insight,
          insightLength: entry.insight ? entry.insight.length : 0,
          insightPreview: entry.insight ? entry.insight.substring(0, 50) + '...' : 'null/undefined',
          tags: entry.tags,
          timestamp: entry.timestamp,
          imageUrl: entry.imageUrl,
          syncStatus: entry.syncStatus,
          lastSyncTime: entry.lastSyncTime,
          syncError: entry.syncError,
          // 打印完整的条目对象（用于调试）
          fullEntry: entry,
        });
      });
      console.log('========================================================');
      return { ...state, journalEntries: action.payload };
    
    case 'ADD_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: [...state.journalEntries, action.payload]
      };
    
    case 'UPDATE_JOURNAL_ENTRY': {
      const { entryId, updates } = action.payload;
      return {
        ...state,
        journalEntries: state.journalEntries.map(entry =>
          entry.id === entryId ? { ...entry, ...updates } : entry
        )
      };
    }
    
    case 'REMOVE_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: state.journalEntries.filter(
          entry => entry.id !== action.payload
        )
      };
    
    case 'SET_ACTIVE_JOURNAL_ENTRY_ID':
      return { ...state, activeJournalEntryId: action.payload };
    
    // 当前剧本状态
    case 'SET_CURRENT_SCENARIO_STATE':
      return { ...state, currentScenarioState: action.payload };
    
    // 设置
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    // 邮箱
    case 'SET_MAILBOX':
      return { ...state, mailbox: action.payload };
    
    case 'ADD_MAIL':
      return {
        ...state,
        mailbox: [...state.mailbox, action.payload]
      };
    
    case 'REMOVE_MAIL':
      return {
        ...state,
        mailbox: state.mailbox.filter(mail => mail.id !== action.payload)
      };
    
    // 场景记忆
    case 'SET_SCENE_MEMORIES':
      return { ...state, sceneMemories: action.payload };
    
    case 'ADD_SCENE_MEMORY': {
      const { sceneId, memory } = action.payload;
      const currentMemories = state.sceneMemories[sceneId] || [];
      return {
        ...state,
        sceneMemories: {
          ...state.sceneMemories,
          [sceneId]: [...currentMemories, memory]
        }
      };
    }
    
    case 'REMOVE_SCENE_MEMORY': {
      const { sceneId, memoryId } = action.payload;
      const currentMemories = state.sceneMemories[sceneId] || [];
      return {
        ...state,
        sceneMemories: {
          ...state.sceneMemories,
          [sceneId]: currentMemories.filter(mem => mem.id !== memoryId)
        }
      };
    }
    
    // 其他
    case 'SET_LAST_LOGIN_TIME':
      return { ...state, lastLoginTime: action.payload };
    
    case 'SET_DEBUG_LOGS':
      return { ...state, debugLogs: action.payload };
    
    case 'ADD_DEBUG_LOG':
      return {
        ...state,
        debugLogs: [...state.debugLogs, action.payload]
      };
    
    case 'SET_SHOW_WELCOME_OVERLAY':
      return { ...state, showWelcomeOverlay: action.payload };
    
    case 'SET_WORLD_STYLE':
      return { ...state, worldStyle: action.payload };
    
    case 'SET_PAGE_SCROLL_POSITION': {
      const { pageId, position } = action.payload;
      return {
        ...state,
        pageScrollPositions: {
          ...state.pageScrollPositions,
          [pageId]: position
        }
      };
    }
    
    // 批量更新
    case 'BATCH_UPDATE':
      return { ...state, ...action.payload };
    
    // 重置状态
    case 'RESET_STATE':
      return action.payload || DEFAULT_GAME_STATE;
    
    default:
      return state;
  }
};

