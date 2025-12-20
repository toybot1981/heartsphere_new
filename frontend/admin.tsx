import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import { AdminScreen } from './admin/AdminScreen';
import { GameState } from './types';
import { storageService } from './services/storage';
import { showConfirm } from './utils/dialog';

// 创建初始的 GameState（admin 页面只需要基本结构）
const initialGameState: GameState = {
  currentScreen: 'entryPoint',
  selectedSceneId: null,
  selectedCharacterId: null,
  tempStoryCharacter: null,
  selectedScenarioId: null,
  currentScenarioState: null,
  history: {},
  journalEntries: [],
  customScenarios: [],
  customScenes: [],
  customCharacters: {},
  sceneMemories: {},
  mailbox: [],
  userProfile: null,
  settings: {
    geminiConfig: {
      apiKey: '',
      modelName: 'gemini-2.5-flash',
      imageModel: '',
      videoModel: ''
    },
    openaiConfig: {
      apiKey: '',
      baseUrl: '',
      modelName: 'gpt-4o'
    },
    qwenConfig: {
      apiKey: '',
      modelName: 'qwen-max',
      imageModel: '',
      videoModel: ''
    },
    doubaoConfig: {
      apiKey: '',
      modelName: '',
      baseUrl: ''
    },
    textProvider: 'gemini',
    imageProvider: 'gemini',
    videoProvider: 'gemini',
    audioProvider: 'gemini',
    debugMode: false,
    autoGenerateAvatars: false,
    enableFallback: true,
    autoGenerateJournalImages: false
  },
  worldStyle: 'anime',
  lastLoginTime: Date.now()
};

const AdminApp: React.FC = () => {
  const [gameState, setGameState] = React.useState<GameState>(initialGameState);

  // 加载保存的设置
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedState = await storageService.loadState();
        if (savedState?.settings) {
          setGameState(prev => ({
            ...prev,
            settings: savedState.settings
          }));
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };
    loadSettings();
  }, []);

  return (
    <AdminScreen
      gameState={gameState}
      onUpdateGameState={(newState) => {
        setGameState(newState);
        // 保存设置
        if (newState.settings) {
          storageService.saveState({ ...gameState, settings: newState.settings });
        }
      }}
      onResetWorld={async () => {
        const confirmed = await showConfirm('确定要重置所有数据吗？此操作不可恢复！', '重置数据', 'danger');
        if (confirmed) {
          storageService.clearMemory();
          setGameState(initialGameState);
        }
      }}
      onBack={() => {
        window.close();
      }}
    />
  );
};

const rootElement = document.getElementById('admin-root');
if (!rootElement) {
  throw new Error("Could not find admin root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);


