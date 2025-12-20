/**
 * 游戏状态管理类型定义
 * 用于Context API和Reducer的状态管理
 */

import { GameState, AppSettings, UserProfile, WorldScene, Character, Message, CustomScenario, JournalEntry, Mail, EraMemory, DebugLog } from '../../types';

/**
 * 游戏状态Action类型
 */
export type GameStateAction =
  // 屏幕导航
  | { type: 'SET_CURRENT_SCREEN'; payload: GameState['currentScreen'] }
  | { type: 'NAVIGATE_TO_SCREEN'; payload: { screen: GameState['currentScreen']; params?: any } }
  
  // 用户资料
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  
  // 场景选择
  | { type: 'SET_SELECTED_SCENE_ID'; payload: string | null }
  | { type: 'SET_SELECTED_CHARACTER_ID'; payload: string | null }
  | { type: 'SET_SELECTED_SCENARIO_ID'; payload: string | null }
  
  // 编辑状态
  | { type: 'SET_EDITING_SCENARIO_ID'; payload: string | null }
  | { type: 'SET_EDITING_SCRIPT'; payload: any | null }
  | { type: 'SET_TEMP_STORY_CHARACTER'; payload: Character | null }
  
  // 对话历史
  | { type: 'SET_HISTORY'; payload: Record<string, Message[]> }
  | { type: 'ADD_MESSAGE'; payload: { sceneId: string; message: Message } }
  | { type: 'CLEAR_HISTORY'; payload: string } // sceneId
  
  // 自定义头像
  | { type: 'SET_CUSTOM_AVATARS'; payload: Record<string, string> }
  | { type: 'SET_AVATAR'; payload: { characterId: string; avatarUrl: string } }
  | { type: 'SET_GENERATING_AVATAR_ID'; payload: string | null }
  
  // 角色管理
  | { type: 'SET_CUSTOM_CHARACTERS'; payload: Record<string, Character[]> }
  | { type: 'ADD_CHARACTER_TO_SCENE'; payload: { sceneId: string; character: Character } }
  | { type: 'UPDATE_CHARACTER_IN_SCENE'; payload: { sceneId: string; characterId: string; updates: Partial<Character> } }
  | { type: 'REMOVE_CHARACTER_FROM_SCENE'; payload: { sceneId: string; characterId: string } }
  
  // 剧本管理
  | { type: 'SET_CUSTOM_SCENARIOS'; payload: CustomScenario[] }
  | { type: 'ADD_CUSTOM_SCENARIO'; payload: CustomScenario }
  | { type: 'UPDATE_CUSTOM_SCENARIO'; payload: { scenarioId: string; updates: Partial<CustomScenario> } }
  | { type: 'REMOVE_CUSTOM_SCENARIO'; payload: string } // scenarioId
  
  // 场景管理
  | { type: 'SET_CUSTOM_SCENES'; payload: WorldScene[] }
  | { type: 'SET_USER_WORLD_SCENES'; payload: WorldScene[] }
  | { type: 'ADD_USER_WORLD_SCENE'; payload: WorldScene }
  | { type: 'UPDATE_USER_WORLD_SCENE'; payload: { sceneId: string; updates: Partial<WorldScene> } }
  | { type: 'REMOVE_USER_WORLD_SCENE'; payload: string } // sceneId
  
  // 日记管理
  | { type: 'SET_JOURNAL_ENTRIES'; payload: JournalEntry[] }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_JOURNAL_ENTRY'; payload: { entryId: string; updates: Partial<JournalEntry> } }
  | { type: 'REMOVE_JOURNAL_ENTRY'; payload: string } // entryId
  | { type: 'SET_ACTIVE_JOURNAL_ENTRY_ID'; payload: string | null }
  
  // 当前剧本状态
  | { type: 'SET_CURRENT_SCENARIO_STATE'; payload: { scenarioId: string; currentNodeId: string } | undefined }
  
  // 设置
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  
  // 邮箱
  | { type: 'SET_MAILBOX'; payload: Mail[] }
  | { type: 'ADD_MAIL'; payload: Mail }
  | { type: 'REMOVE_MAIL'; payload: string } // mailId
  
  // 场景记忆
  | { type: 'SET_SCENE_MEMORIES'; payload: Record<string, EraMemory[]> }
  | { type: 'ADD_SCENE_MEMORY'; payload: { sceneId: string; memory: EraMemory } }
  | { type: 'REMOVE_SCENE_MEMORY'; payload: { sceneId: string; memoryId: string } }
  
  // 其他
  | { type: 'SET_LAST_LOGIN_TIME'; payload: number }
  | { type: 'SET_DEBUG_LOGS'; payload: DebugLog[] }
  | { type: 'ADD_DEBUG_LOG'; payload: DebugLog }
  | { type: 'SET_SHOW_WELCOME_OVERLAY'; payload: boolean }
  | { type: 'SET_WORLD_STYLE'; payload: GameState['worldStyle'] }
  | { type: 'SET_PAGE_SCROLL_POSITION'; payload: { pageId: string; position: number } }
  
  // 批量更新
  | { type: 'BATCH_UPDATE'; payload: Partial<GameState> }
  
  // 重置状态
  | { type: 'RESET_STATE'; payload?: GameState };

/**
 * 游戏状态Context类型
 */
export interface GameStateContextType {
  state: GameState;
  dispatch: React.Dispatch<GameStateAction>;
  
  // 便捷方法
  setCurrentScreen: (screen: GameState['currentScreen']) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setSelectedSceneId: (sceneId: string | null) => void;
  setSelectedCharacterId: (characterId: string | null) => void;
  setSelectedScenarioId: (scenarioId: string | null) => void;
  
  // 场景相关
  addUserWorldScene: (scene: WorldScene) => void;
  updateUserWorldScene: (sceneId: string, updates: Partial<WorldScene>) => void;
  removeUserWorldScene: (sceneId: string) => void;
  
  // 角色相关
  addCharacterToScene: (sceneId: string, character: Character) => void;
  updateCharacterInScene: (sceneId: string, characterId: string, updates: Partial<Character>) => void;
  removeCharacterFromScene: (sceneId: string, characterId: string) => void;
  
  // 对话相关
  addMessage: (sceneId: string, message: Message) => void;
  clearHistory: (sceneId: string) => void;
  
  // 设置相关
  updateSettings: (updates: Partial<AppSettings>) => void;
}

