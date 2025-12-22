# 第一阶段优化策略详细方案

## 📋 目录
1. [App.tsx 状态管理重构](#1-apptsx-状态管理重构)
2. [api.ts API模块拆分](#2-apits-api模块拆分)
3. [实施步骤](#3-实施步骤)
4. [迁移检查清单](#4-迁移检查清单)

---

## 1. App.tsx 状态管理重构

### 1.1 当前问题分析

**状态统计：**
- 81个状态变量（useState）
- 93个hooks调用（useEffect, useMemo, useCallback等）
- 状态分散，难以追踪
- 业务逻辑与UI逻辑混合

**核心状态分类：**
```typescript
// 1. 用户相关状态
- userProfile
- profileNickname
- showGuestNicknameModal
- showLoginModal

// 2. 游戏状态
- gameState (包含大量嵌套状态)
  - currentScreen
  - selectedSceneId
  - selectedCharacterId
  - selectedScenarioId
  - editingScenarioId
  - editingScript
  - history
  - customAvatars
  - customCharacters
  - customScenarios
  - customScenes
  - userWorldScenes
  - journalEntries
  - activeJournalEntryId
  - mailbox
  - sceneMemories
  - debugLogs
  - worldStyle
  - pageScrollPositions

// 3. UI模态框状态
- showSettingsModal
- showEraCreator
- showCharacterCreator
- showMainStoryEditor
- showMailbox
- showEraMemory
- showRecycleBin
- showMembershipModal
- showInitializationWizard

// 4. 编辑状态
- editingScene
- editingMainStory
- editingMainStorySceneId
- editingCharacter
- editingCharacterSceneId
- memoryScene
- currentMembership
- initializationData

// 5. 设置状态
- settings (嵌套大量配置)
```

### 1.2 重构方案

#### 方案A：Context API + useReducer（推荐）

**优势：**
- React原生方案，无需额外依赖
- 状态集中管理，易于追踪
- 支持中间件模式（如日志、持久化）
- 性能优化（useMemo, useCallback）

**目录结构：**
```
frontend/
├── contexts/
│   ├── GameStateContext.tsx          # 主游戏状态
│   ├── AuthContext.tsx                # 认证状态
│   ├── UIModalContext.tsx             # UI模态框状态
│   ├── EditorContext.tsx              # 编辑器状态
│   └── SettingsContext.tsx            # 设置状态
├── hooks/
│   ├── useGameState.ts                # 游戏状态hooks
│   ├── useAuth.ts                     # 认证hooks
│   ├── useChat.ts                     # 聊天hooks
│   ├── useJournal.ts                  # 日记hooks
│   ├── useScenes.ts                   # 场景hooks
│   ├── useCharacters.ts               # 角色hooks
│   ├── useScripts.ts                  # 剧本hooks
│   └── useModals.ts                   # 模态框hooks
├── reducers/
│   ├── gameStateReducer.ts            # 游戏状态reducer
│   ├── authReducer.ts                 # 认证reducer
│   └── uiReducer.ts                   # UI状态reducer
└── App.tsx                            # 主入口（<200行）
```

#### 1.3 详细实现方案

##### Step 1: 创建状态类型定义

**文件：`contexts/types/gameState.types.ts`**
```typescript
// 将GameState拆分为更细粒度的类型
export interface UserState {
  userProfile: UserProfile | null;
  profileNickname: string;
  isGuest: boolean;
}

export interface SceneState {
  selectedSceneId: string | null;
  userWorldScenes: WorldScene[];
  customScenes: WorldScene[];
  sceneMemories: Record<string, EraMemory[]>;
}

export interface CharacterState {
  selectedCharacterId: string | null;
  customCharacters: Record<string, Character>;
  customAvatars: Record<string, string>;
  generatingAvatarId: string | null;
}

export interface ScriptState {
  selectedScenarioId: string | null;
  editingScenarioId: string | null;
  editingScript: any | null;
  customScenarios: CustomScenario[];
}

export interface JournalState {
  journalEntries: JournalEntry[];
  activeJournalEntryId: string | null;
}

export interface NavigationState {
  currentScreen: string;
  history: Record<string, any>;
  pageScrollPositions: Record<string, number>;
}

export interface GameState {
  user: UserState;
  scenes: SceneState;
  characters: CharacterState;
  scripts: ScriptState;
  journal: JournalState;
  navigation: NavigationState;
  mailbox: Mail[];
  lastLoginTime: number;
  worldStyle: string;
  debugLogs: DebugLog[];
  showWelcomeOverlay: boolean;
}
```

##### Step 2: 创建Reducer

**文件：`reducers/gameStateReducer.ts`**
```typescript
import { GameState, GameStateAction } from '../contexts/types/gameState.types';

export type GameStateAction =
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_SELECTED_SCENE'; payload: string | null }
  | { type: 'SET_SELECTED_CHARACTER'; payload: string | null }
  | { type: 'SET_CURRENT_SCREEN'; payload: string }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_SCENES'; payload: WorldScene[] }
  | { type: 'SET_EDITING_SCRIPT'; payload: any | null }
  // ... 更多action类型

export const gameStateReducer = (state: GameState, action: GameStateAction): GameState => {
  switch (action.type) {
    case 'SET_USER_PROFILE':
      return {
        ...state,
        user: { ...state.user, userProfile: action.payload }
      };
    
    case 'SET_SELECTED_SCENE':
      return {
        ...state,
        scenes: { ...state.scenes, selectedSceneId: action.payload }
      };
    
    case 'SET_CURRENT_SCREEN':
      return {
        ...state,
        navigation: { ...state.navigation, currentScreen: action.payload }
      };
    
    // ... 更多case处理
    
    default:
      return state;
  }
};
```

##### Step 3: 创建Context

**文件：`contexts/GameStateContext.tsx`**
```typescript
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { GameState } from './types/gameState.types';
import { gameStateReducer } from '../reducers/gameStateReducer';
import { DEFAULT_GAME_STATE } from './constants/defaultState';

interface GameStateContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameStateAction>;
  // 便捷方法
  setUserProfile: (profile: UserProfile | null) => void;
  setSelectedScene: (sceneId: string | null) => void;
  setCurrentScreen: (screen: string) => void;
  // ... 更多便捷方法
}

const GameStateContext = createContext<GameStateContextValue | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameStateReducer, DEFAULT_GAME_STATE);

  // 便捷方法
  const setUserProfile = useCallback((profile: UserProfile | null) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  }, []);

  const setSelectedScene = useCallback((sceneId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SCENE', payload: sceneId });
  }, []);

  const setCurrentScreen = useCallback((screen: string) => {
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: screen });
  }, []);

  const value = useMemo(() => ({
    state,
    dispatch,
    setUserProfile,
    setSelectedScene,
    setCurrentScreen,
    // ... 更多便捷方法
  }), [state, setUserProfile, setSelectedScene, setCurrentScreen]);

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  return context;
};
```

##### Step 4: 创建专用Hooks

**文件：`hooks/useScenes.ts`**
```typescript
import { useGameState } from '../contexts/GameStateContext';
import { useCallback, useMemo } from 'react';
import { eraApi } from '../services/api/era';

export const useScenes = () => {
  const { state, dispatch } = useGameState();
  const { scenes } = state;

  const loadScenes = useCallback(async (token: string) => {
    try {
      const systemEras = await eraApi.getSystemEras();
      // 处理场景数据
      dispatch({ type: 'UPDATE_SCENES', payload: systemEras });
    } catch (error) {
      console.error('加载场景失败:', error);
    }
  }, [dispatch]);

  const selectScene = useCallback((sceneId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SCENE', payload: sceneId });
  }, [dispatch]);

  const currentScene = useMemo(() => {
    if (!scenes.selectedSceneId) return null;
    return [...scenes.userWorldScenes, ...scenes.customScenes]
      .find(s => s.id === scenes.selectedSceneId);
  }, [scenes]);

  return {
    scenes: scenes.userWorldScenes,
    customScenes: scenes.customScenes,
    selectedSceneId: scenes.selectedSceneId,
    currentScene,
    loadScenes,
    selectScene,
  };
};
```

**文件：`hooks/useCharacters.ts`**
```typescript
import { useGameState } from '../contexts/GameStateContext';
import { useCallback, useMemo } from 'react';
import { characterApi } from '../services/api/character';

export const useCharacters = () => {
  const { state, dispatch } = useGameState();
  const { characters } = state;

  const loadCharacters = useCallback(async (sceneId?: string) => {
    try {
      const systemCharacters = await characterApi.getSystemCharacters(sceneId);
      // 处理角色数据
      dispatch({ type: 'UPDATE_CHARACTERS', payload: systemCharacters });
    } catch (error) {
      console.error('加载角色失败:', error);
    }
  }, [dispatch]);

  const selectCharacter = useCallback((characterId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CHARACTER', payload: characterId });
  }, [dispatch]);

  const currentCharacter = useMemo(() => {
    if (!characters.selectedCharacterId) return null;
    return Object.values(characters.customCharacters)
      .find(c => c.id === characters.selectedCharacterId);
  }, [characters]);

  return {
    characters: Object.values(characters.customCharacters),
    selectedCharacterId: characters.selectedCharacterId,
    currentCharacter,
    loadCharacters,
    selectCharacter,
  };
};
```

**文件：`hooks/useScripts.ts`**
```typescript
import { useGameState } from '../contexts/GameStateContext';
import { useCallback } from 'react';
import { scriptApi } from '../services/api/script';

export const useScripts = () => {
  const { state, dispatch } = useGameState();
  const { scripts } = state;

  const loadScripts = useCallback(async (token: string, sceneId?: string) => {
    try {
      const userScripts = await scriptApi.getAllScripts(token);
      // 过滤场景相关的剧本
      const filteredScripts = sceneId 
        ? userScripts.filter(s => s.eraId?.toString() === sceneId)
        : userScripts;
      dispatch({ type: 'UPDATE_SCRIPTS', payload: filteredScripts });
    } catch (error) {
      console.error('加载剧本失败:', error);
    }
  }, [dispatch]);

  const editScript = useCallback((script: any) => {
    dispatch({ type: 'SET_EDITING_SCRIPT', payload: script });
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'userScriptEditor' });
  }, [dispatch]);

  const createScript = useCallback((sceneId: string, worldId: number) => {
    const newScript = {
      id: null,
      title: '新剧本',
      content: JSON.stringify({
        startNodeId: 'start',
        nodes: {
          start: {
            id: 'start',
            title: '开始',
            content: '这是故事的开始...',
            choices: []
          }
        }
      }, null, 2),
      sceneCount: 1,
      eraId: parseInt(sceneId.replace('era_', '')),
      worldId,
    };
    dispatch({ type: 'SET_EDITING_SCRIPT', payload: newScript });
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'userScriptEditor' });
  }, [dispatch]);

  return {
    scripts: scripts.customScenarios,
    editingScript: scripts.editingScript,
    loadScripts,
    editScript,
    createScript,
  };
};
```

##### Step 5: 创建UI模态框Context

**文件：`contexts/UIModalContext.tsx`**
```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';

interface UIModalState {
  settings: boolean;
  eraCreator: boolean;
  characterCreator: boolean;
  mainStoryEditor: boolean;
  mailbox: boolean;
  eraMemory: boolean;
  recycleBin: boolean;
  membership: boolean;
  initializationWizard: boolean;
  login: boolean;
}

interface UIModalContextValue {
  modals: UIModalState;
  openModal: (modal: keyof UIModalState) => void;
  closeModal: (modal: keyof UIModalState) => void;
  closeAllModals: () => void;
}

const UIModalContext = createContext<UIModalContextValue | undefined>(undefined);

const INITIAL_MODAL_STATE: UIModalState = {
  settings: false,
  eraCreator: false,
  characterCreator: false,
  mainStoryEditor: false,
  mailbox: false,
  eraMemory: false,
  recycleBin: false,
  membership: false,
  initializationWizard: false,
  login: false,
};

export const UIModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<UIModalState>(INITIAL_MODAL_STATE);

  const openModal = useCallback((modal: keyof UIModalState) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = useCallback((modal: keyof UIModalState) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(INITIAL_MODAL_STATE);
  }, []);

  return (
    <UIModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
      {children}
    </UIModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(UIModalContext);
  if (!context) {
    throw new Error('useModals must be used within UIModalProvider');
  }
  return context;
};
```

##### Step 6: 重构后的App.tsx

**文件：`App.tsx`（重构后，<200行）**
```typescript
import React, { Suspense } from 'react';
import { GameStateProvider } from './contexts/GameStateContext';
import { UIModalProvider } from './contexts/UIModalContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { GameRouter } from './components/GameRouter';
import { GlobalDialogs } from './utils/dialog';
import { LoadingScreen } from './components/LoadingScreen';

// 代码分割
const AdminScreen = React.lazy(() => import('./admin/AdminScreen').then(m => ({ default: m.AdminScreen })));
const MobileApp = React.lazy(() => import('./mobile/MobileApp').then(m => ({ default: m.MobileApp })));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GameStateProvider>
        <SettingsProvider>
          <UIModalProvider>
            <Suspense fallback={<LoadingScreen />}>
              <GameRouter />
              <GlobalDialogs />
            </Suspense>
          </UIModalProvider>
        </SettingsProvider>
      </GameStateProvider>
    </AuthProvider>
  );
};

export default App;
```

---

## 2. api.ts API模块拆分

### 2.1 当前问题分析

**API统计：**
- 29个导出的API对象
- 3,143行代码
- 大量重复的CRUD操作代码
- 类型定义分散

**API分类：**
```typescript
// 1. 管理后台API
- adminApi (包含worlds, eras, characters, mainStories, scripts等)

// 2. 认证API
- authApi
- wechatApi

// 3. 核心业务API
- worldApi
- eraApi (场景)
- characterApi (角色)
- scriptApi (剧本)
- journalApi (日记)
- userMainStoryApi (用户主线剧情)
- presetMainStoryApi (预置主线剧情)
- presetScriptApi (预置剧本)

// 4. 功能API
- membershipApi (会员)
- resourceApi (资源)
- noteSyncApi (笔记同步)
- paymentApi (支付)
- imageApi (图片)
- recycleBinApi (回收站)
```

### 2.2 拆分方案

#### 目录结构：
```
frontend/services/api/
├── index.ts                    # 统一导出
├── base/
│   ├── request.ts             # 基础请求函数
│   ├── types.ts                # 通用类型
│   └── crudFactory.ts          # CRUD工厂函数
├── admin/
│   ├── index.ts               # adminApi统一导出
│   ├── auth.ts                # 管理员认证
│   ├── world.ts               # 系统世界管理
│   ├── era.ts                 # 系统场景管理
│   ├── character.ts           # 系统角色管理
│   ├── script.ts              # 系统剧本管理
│   ├── mainStory.ts           # 系统主线剧情管理
│   ├── config.ts              # 系统配置
│   ├── resource.ts            # 系统资源
│   ├── inviteCode.ts          # 邀请码
│   └── subscriptionPlan.ts    # 订阅计划
├── auth/
│   ├── index.ts               # authApi统一导出
│   ├── login.ts               # 用户登录
│   └── wechat.ts              # 微信登录
├── world/
│   ├── index.ts               # worldApi统一导出
│   └── world.ts               # 世界相关API
├── scene/                     # 场景模块（era）
│   ├── index.ts               # eraApi统一导出
│   └── era.ts                 # 场景相关API
├── character/                 # 角色模块
│   ├── index.ts               # characterApi统一导出
│   └── character.ts           # 角色相关API
├── script/                     # 剧本模块
│   ├── index.ts               # scriptApi统一导出
│   ├── script.ts               # 用户剧本API
│   ├── preset.ts               # 预置剧本API
│   └── system.ts              # 系统剧本API（管理后台）
├── mainStory/                  # 主线剧情模块
│   ├── index.ts               # mainStoryApi统一导出
│   ├── user.ts                 # 用户主线剧情API
│   ├── preset.ts               # 预置主线剧情API
│   └── system.ts               # 系统主线剧情API（管理后台）
├── journal/                    # 日记模块
│   ├── index.ts               # journalApi统一导出
│   └── journal.ts              # 日记相关API
├── membership/                 # 会员模块
│   ├── index.ts               # membershipApi统一导出
│   └── membership.ts           # 会员相关API
├── resource/                   # 资源模块
│   ├── index.ts               # resourceApi统一导出
│   ├── resource.ts             # 资源API
│   └── image.ts                # 图片API
├── sync/                       # 同步模块
│   ├── index.ts               # syncApi统一导出
│   ├── noteSync.ts             # 笔记同步API
│   └── recycleBin.ts           # 回收站API
└── payment/                    # 支付模块
    ├── index.ts               # paymentApi统一导出
    └── payment.ts              # 支付相关API
```

### 2.3 详细实现方案

#### Step 1: 创建基础请求和类型

**文件：`services/api/base/request.ts`**
```typescript
const API_BASE_URL = 'http://localhost:8081/api';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
    signal: options.signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

**文件：`services/api/base/types.ts`**
```typescript
// 通用响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 通用实体类型
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}
```

**文件：`services/api/base/crudFactory.ts`**
```typescript
import { request } from './request';

export interface CrudApiConfig<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  basePath: string;
  getToken?: () => string | null;
}

export function createCrudApi<T extends { id: number }, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>(
  config: CrudApiConfig<T, CreateDTO, UpdateDTO>
) {
  const { basePath, getToken } = config;

  const getAuthHeaders = () => {
    const token = getToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    // 获取所有
    getAll: async (): Promise<T[]> => {
      return request<T[]>(basePath, {
        headers: getAuthHeaders(),
      });
    },

    // 根据ID获取
    getById: async (id: number): Promise<T> => {
      return request<T>(`${basePath}/${id}`, {
        headers: getAuthHeaders(),
      });
    },

    // 创建
    create: async (data: CreateDTO): Promise<T> => {
      return request<T>(basePath, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
    },

    // 更新
    update: async (id: number, data: UpdateDTO): Promise<T> => {
      return request<T>(`${basePath}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
    },

    // 删除
    delete: async (id: number): Promise<void> => {
      return request<void>(`${basePath}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    },
  };
}
```

#### Step 2: 场景模块（Era）

**文件：`services/api/scene/era.ts`**
```typescript
import { request } from '../base/request';

export interface Era {
  id: number;
  name: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  systemWorldId?: number;
}

export interface CreateEraDTO {
  name: string;
  description: string;
  startYear?: number | null;
  endYear?: number | null;
  imageUrl?: string | null;
  systemWorldId?: number;
}

export interface UpdateEraDTO extends Partial<CreateEraDTO> {
  isActive?: boolean;
  sortOrder?: number;
}

// 用户场景API（公共API，不需要认证）
export const eraApi = {
  // 获取所有系统预置场景
  getSystemEras: async (): Promise<Era[]> => {
    return request<Era[]>('/eras/system');
  },

  // 根据世界ID获取场景
  getErasByWorldId: async (worldId: number): Promise<Era[]> => {
    return request<Era[]>(`/eras/system?worldId=${worldId}`);
  },

  // 获取用户场景（需要认证）
  getUserEras: async (token: string): Promise<Era[]> => {
    return request<Era[]>('/eras/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 创建用户场景
  createUserEra: async (data: CreateEraDTO, token: string): Promise<Era> => {
    return request<Era>('/eras/user', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 更新用户场景
  updateUserEra: async (id: number, data: UpdateEraDTO, token: string): Promise<Era> => {
    return request<Era>(`/eras/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 删除用户场景
  deleteUserEra: async (id: number, token: string): Promise<void> => {
    return request<void>(`/eras/user/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
```

**文件：`services/api/scene/index.ts`**
```typescript
export * from './era';
export { eraApi } from './era';
```

#### Step 3: 角色模块（Character）

**文件：`services/api/character/character.ts`**
```typescript
import { request } from '../base/request';

export interface Character {
  id: number;
  name: string;
  description: string;
  age: number | null;
  gender: string | null;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  themeColor: string | null;
  colorAccent: string | null;
  firstMessage: string | null;
  systemInstruction: string | null;
  voiceName: string | null;
  tags: string | null;
  speechStyle: string | null;
  catchphrases: string | null;
  secrets: string | null;
  motivations: string | null;
  systemEraId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharacterDTO {
  name: string;
  description?: string;
  age?: number | null;
  gender?: string | null;
  role?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  themeColor?: string | null;
  colorAccent?: string | null;
  firstMessage?: string | null;
  systemInstruction?: string | null;
  voiceName?: string | null;
  tags?: string | null;
  speechStyle?: string | null;
  catchphrases?: string | null;
  secrets?: string | null;
  motivations?: string | null;
  systemEraId?: number;
  systemCharacterId?: number; // 如果从预置角色创建
}

export interface UpdateCharacterDTO extends Partial<CreateCharacterDTO> {}

// 用户角色API（公共API，不需要认证）
export const characterApi = {
  // 获取所有系统预置角色
  getSystemCharacters: async (eraId?: number): Promise<Character[]> => {
    const url = eraId ? `/characters/system?eraId=${eraId}` : '/characters/system';
    return request<Character[]>(url);
  },

  // 获取用户角色（需要认证）
  getUserCharacters: async (token: string, eraId?: number): Promise<Character[]> => {
    const url = eraId ? `/characters/user?eraId=${eraId}` : '/characters/user';
    return request<Character[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 创建用户角色
  createUserCharacter: async (data: CreateCharacterDTO, token: string): Promise<Character> => {
    return request<Character>('/characters/user', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 更新用户角色
  updateUserCharacter: async (id: number, data: UpdateCharacterDTO, token: string): Promise<Character> => {
    return request<Character>(`/characters/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 删除用户角色
  deleteUserCharacter: async (id: number, token: string): Promise<void> => {
    return request<void>(`/characters/user/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
```

**文件：`services/api/character/index.ts`**
```typescript
export * from './character';
export { characterApi } from './character';
```

#### Step 4: 剧本模块（Script）

**文件：`services/api/script/script.ts`**
```typescript
import { request } from '../base/request';

export interface Script {
  id: number;
  title: string;
  description: string | null;
  content: string;
  sceneCount: number;
  characterIds: string | null;
  tags: string | null;
  worldId: number;
  eraId: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScriptDTO {
  title: string;
  description?: string | null;
  content: string;
  sceneCount?: number;
  characterIds?: string | null;
  tags?: string | null;
  worldId: number;
  eraId?: number | null;
  systemScriptId?: number; // 如果从预置剧本创建
}

export interface UpdateScriptDTO extends Partial<CreateScriptDTO> {}

// 用户剧本API
export const scriptApi = {
  // 获取所有用户剧本
  getAllScripts: async (token: string): Promise<Script[]> => {
    return request<Script[]>('/scripts', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 根据场景ID获取剧本
  getScriptsByEraId: async (eraId: number, token: string): Promise<Script[]> => {
    return request<Script[]>(`/scripts/era/${eraId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 根据ID获取剧本
  getScriptById: async (id: number, token: string): Promise<Script> => {
    return request<Script>(`/scripts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 创建剧本
  createScript: async (data: CreateScriptDTO, token: string): Promise<Script> => {
    return request<Script>('/scripts', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 更新剧本
  updateScript: async (id: number, data: UpdateScriptDTO, token: string): Promise<Script> => {
    return request<Script>(`/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 删除剧本
  deleteScript: async (id: number, token: string): Promise<void> => {
    return request<void>(`/scripts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
```

**文件：`services/api/script/preset.ts`**
```typescript
import { request } from '../base/request';
import { Script } from './script';

// 预置剧本API（公共API，不需要认证）
export const presetScriptApi = {
  // 获取所有系统预置剧本
  getAll: async (): Promise<Script[]> => {
    return request<Script[]>('/scripts/preset');
  },

  // 根据场景ID获取预置剧本
  getByEraId: async (eraId: number): Promise<Script[]> => {
    return request<Script[]>(`/scripts/preset?eraId=${eraId}`);
  },

  // 根据ID获取预置剧本
  getById: async (id: number): Promise<Script> => {
    return request<Script>(`/scripts/preset/${id}`);
  },
};
```

**文件：`services/api/script/index.ts`**
```typescript
export * from './script';
export { scriptApi } from './script';
export { presetScriptApi } from './preset';
```

#### Step 5: 主线剧情模块（MainStory）

**文件：`services/api/mainStory/user.ts`**
```typescript
import { request } from '../base/request';

export interface UserMainStory {
  id: number;
  name: string;
  age: number | null;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  themeColor: string | null;
  colorAccent: string | null;
  firstMessage: string | null;
  systemInstruction: string | null;
  voiceName: string | null;
  tags: string | null;
  speechStyle: string | null;
  catchphrases: string | null;
  secrets: string | null;
  motivations: string | null;
  userId: number;
  eraId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserMainStoryDTO {
  systemMainStoryId?: number;
  eraId: number;
  name?: string;
}

export interface UpdateUserMainStoryDTO {
  name?: string;
  age?: number | null;
  role?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  themeColor?: string | null;
  colorAccent?: string | null;
  firstMessage?: string | null;
  systemInstruction?: string | null;
  voiceName?: string | null;
  tags?: string | null;
  speechStyle?: string | null;
  catchphrases?: string | null;
  secrets?: string | null;
  motivations?: string | null;
}

// 用户主线剧情API
export const userMainStoryApi = {
  // 获取当前用户的所有主线剧情
  getAll: async (token: string): Promise<UserMainStory[]> => {
    return request<UserMainStory[]>('/user-main-stories', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 根据场景ID获取主线剧情
  getByEraId: async (eraId: number, token: string): Promise<UserMainStory | null> => {
    return request<UserMainStory | null>(`/user-main-stories/era/${eraId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 根据ID获取主线剧情
  getById: async (id: number, token: string): Promise<UserMainStory> => {
    return request<UserMainStory>(`/user-main-stories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 创建主线剧情
  create: async (data: CreateUserMainStoryDTO, token: string): Promise<UserMainStory> => {
    return request<UserMainStory>('/user-main-stories', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 更新主线剧情
  update: async (id: number, data: UpdateUserMainStoryDTO, token: string): Promise<UserMainStory> => {
    return request<UserMainStory>(`/user-main-stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 删除主线剧情
  delete: async (id: number, token: string): Promise<void> => {
    return request<void>(`/user-main-stories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
```

**文件：`services/api/mainStory/preset.ts`**
```typescript
import { request } from '../base/request';
import { UserMainStory } from './user';

// 预置主线剧情API（公共API，不需要认证）
export const presetMainStoryApi = {
  // 获取所有系统预置主线剧情
  getAll: async (): Promise<UserMainStory[]> => {
    return request<UserMainStory[]>('/main-stories/preset');
  },

  // 根据场景ID获取预置主线剧情
  getByEraId: async (eraId: number): Promise<UserMainStory | null> => {
    return request<UserMainStory | null>(`/main-stories/preset?eraId=${eraId}`);
  },

  // 根据ID获取预置主线剧情
  getById: async (id: number): Promise<UserMainStory> => {
    return request<UserMainStory>(`/main-stories/preset/${id}`);
  },
};
```

**文件：`services/api/mainStory/index.ts`**
```typescript
export * from './user';
export { userMainStoryApi } from './user';
export { presetMainStoryApi } from './preset';
```

#### Step 6: 统一导出

**文件：`services/api/index.ts`**
```typescript
// 场景模块
export * from './scene';
export { eraApi } from './scene';

// 角色模块
export * from './character';
export { characterApi } from './character';

// 剧本模块
export * from './script';
export { scriptApi, presetScriptApi } from './script';

// 主线剧情模块
export * from './mainStory';
export { userMainStoryApi, presetMainStoryApi } from './mainStory';

// 认证模块
export * from './auth';
export { authApi, wechatApi } from './auth';

// 世界模块
export * from './world';
export { worldApi } from './world';

// 日记模块
export * from './journal';
export { journalApi } from './journal';

// 会员模块
export * from './membership';
export { membershipApi } from './membership';

// 资源模块
export * from './resource';
export { resourceApi, imageApi } from './resource';

// 同步模块
export * from './sync';
export { noteSyncApi, recycleBinApi } from './sync';

// 支付模块
export * from './payment';
export { paymentApi } from './payment';

// 管理后台模块
export * from './admin';
export { adminApi } from './admin';

// Token存储
export { tokenStorage } from './base/tokenStorage';
```

---

## 3. 实施步骤

### 阶段1：准备工作（1-2天）

1. **创建新目录结构**
   ```bash
   mkdir -p frontend/contexts/{types,constants}
   mkdir -p frontend/hooks
   mkdir -p frontend/reducers
   mkdir -p frontend/services/api/{base,admin,auth,world,scene,character,script,mainStory,journal,membership,resource,sync,payment}
   ```

2. **备份当前代码**
   ```bash
   git checkout -b refactor/phase1-state-management
   git commit -m "Backup before refactoring"
   ```

### 阶段2：API模块拆分（3-5天）

1. **创建基础文件**
   - `services/api/base/request.ts`
   - `services/api/base/types.ts`
   - `services/api/base/crudFactory.ts`

2. **按模块拆分API**
   - 场景模块（era）
   - 角色模块（character）
   - 剧本模块（script）
   - 主线剧情模块（mainStory）
   - 其他模块...

3. **更新导入**
   - 逐步更新所有使用旧API的文件
   - 使用查找替换工具批量更新

### 阶段3：状态管理重构（5-7天）

1. **创建类型定义**
   - `contexts/types/gameState.types.ts`
   - `contexts/constants/defaultState.ts`

2. **创建Reducer**
   - `reducers/gameStateReducer.ts`
   - `reducers/authReducer.ts`
   - `reducers/uiReducer.ts`

3. **创建Context**
   - `contexts/GameStateContext.tsx`
   - `contexts/AuthContext.tsx`
   - `contexts/UIModalContext.tsx`
   - `contexts/SettingsContext.tsx`

4. **创建专用Hooks**
   - `hooks/useScenes.ts`
   - `hooks/useCharacters.ts`
   - `hooks/useScripts.ts`
   - `hooks/useJournal.ts`
   - `hooks/useChat.ts`

5. **重构App.tsx**
   - 逐步迁移状态到Context
   - 使用新的Hooks替换旧的useState
   - 简化组件逻辑

### 阶段4：测试和优化（2-3天）

1. **功能测试**
   - 测试所有核心功能
   - 修复发现的bug

2. **性能优化**
   - 使用React.memo优化组件
   - 使用useMemo和useCallback优化计算

3. **代码清理**
   - 删除未使用的代码
   - 更新注释和文档

---

## 4. 迁移检查清单

### API模块拆分检查清单

- [ ] 所有API模块已拆分到独立文件
- [ ] 类型定义已提取到types文件
- [ ] 基础请求函数已创建
- [ ] CRUD工厂函数已实现
- [ ] 所有导入已更新
- [ ] 旧api.ts文件已删除或标记为deprecated
- [ ] 所有使用旧API的组件已更新

### 状态管理重构检查清单

- [ ] 所有状态类型已定义
- [ ] Reducer已创建并测试
- [ ] Context已创建并测试
- [ ] 专用Hooks已创建
- [ ] App.tsx已简化（<200行）
- [ ] 所有组件已更新使用新的Hooks
- [ ] 性能优化已完成
- [ ] 所有功能测试通过

### 代码质量检查清单

- [ ] 无TypeScript错误
- [ ] 无ESLint警告
- [ ] 代码已格式化
- [ ] 注释已更新
- [ ] 文档已更新

---

## 5. 预期收益

### 代码可维护性
- ✅ 文件大小减少：App.tsx从4,460行减少到<200行
- ✅ 职责清晰：每个文件只负责一个功能模块
- ✅ 易于定位问题：状态和API调用集中管理

### 开发效率
- ✅ 新功能开发更快：使用专用Hooks和API模块
- ✅ 代码复用性提高：CRUD工厂和通用Hooks
- ✅ 类型安全：完整的TypeScript类型定义

### 性能优化
- ✅ 减少不必要的重渲染：使用useMemo和useCallback
- ✅ 代码分割：按需加载组件
- ✅ 状态更新优化：集中管理减少更新次数

---

## 6. 风险控制

### 风险1：功能回归
**应对措施：**
- 分阶段迁移，每个阶段完成后进行完整测试
- 保留旧代码作为备份，直到新代码稳定
- 使用Git分支管理，方便回滚

### 风险2：性能问题
**应对措施：**
- 使用React DevTools监控性能
- 使用useMemo和useCallback优化
- 必要时使用React.memo

### 风险3：团队学习成本
**应对措施：**
- 编写详细的迁移文档
- 提供代码示例
- 进行代码审查和培训

---

生成时间：2025-12-20
版本：v1.0

