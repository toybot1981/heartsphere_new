/**
 * 默认游戏状态常量
 * 用于初始化GameState
 */

import { GameState } from '../../types';

export const DEFAULT_GAME_STATE: GameState = {
  currentScreen: 'profileSetup',
  userProfile: null,
  selectedSceneId: null,
  selectedCharacterId: null,
  selectedScenarioId: null,
  tempStoryCharacter: null,
  editingScenarioId: null,
  editingScript: null,
  history: {},
  customAvatars: {},
  generatingAvatarId: null,
  customCharacters: {},
  customScenarios: [],
  customScenes: [],
  userWorldScenes: [],
  journalEntries: [],
  activeJournalEntryId: null,
  settings: {
    autoGenerateAvatars: false,
    autoGenerateStoryScenes: false,
    autoGenerateJournalImages: false,
    debugMode: false,
    showNoteSync: false,
    dialogueStyle: 'mobile-chat',
    textProvider: 'gemini',
    imageProvider: 'gemini',
    videoProvider: 'gemini',
    audioProvider: 'gemini',
    enableFallback: true,
    geminiConfig: {
      apiKey: '',
      modelName: 'gemini-2.5-flash',
      imageModel: 'gemini-2.5-flash-image',
      videoModel: 'veo-3.1-fast-generate-preview'
    },
    openaiConfig: {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      modelName: 'gpt-4o',
      imageModel: 'dall-e-3'
    },
    qwenConfig: {
      apiKey: '',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      modelName: 'qwen-max',
      imageModel: 'qwen-image-plus',
      videoModel: 'wanx-video'
    },
    doubaoConfig: {
      apiKey: '',
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      modelName: 'ep-...',
      imageModel: 'doubao-image-v1',
      videoModel: 'doubao-video-v1'
    }
  },
  mailbox: [],
  lastLoginTime: Date.now(),
  sceneMemories: {},
  debugLogs: [],
  showWelcomeOverlay: false,
  worldStyle: 'anime',
  pageScrollPositions: {}
};

