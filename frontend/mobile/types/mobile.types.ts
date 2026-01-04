/**
 * Mobile版本类型定义
 * 定义Mobile版本专用的类型接口
 * Phase 5: 类型安全增强
 */

import { GameState, GameStateAction, Character, WorldScene, JournalEntry, CustomScenario } from '../../types';
import { Message, ScenarioState } from '../../types/chat';

/**
 * Screen组件Props基础接口
 */
export interface MobileScreenPropsBase {
  gameState: GameState;
  dispatch: (action: GameStateAction) => void;
}

/**
 * ProfileSetupScreen Props
 */
export interface MobileProfileSetupScreenProps {
  onGuestEnter: (nickname: string) => void;
  onLogin: () => void;
}

/**
 * EntryPointScreen Props
 */
export interface MobileEntryPointScreenProps extends MobileScreenPropsBase {
  onNavigate: (screen: GameState['currentScreen']) => void;
  onOpenSettings: () => void;
  nickname: string;
  avatarUrl?: string;
  currentStyle: string;
  onStyleChange: (style: string) => void;
  isGuest: boolean;
  onGuestEnter: (nickname: string) => void;
  onOpenQuickConnect?: () => void; // 打开快速连接（心域连接）
  onLoginSuccess?: (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
}

/**
 * RealWorldScreen Props
 */
export interface MobileRealWorldScreenProps extends MobileScreenPropsBase {
  entries: JournalEntry[];
  onAddEntry: (title: string, content: string, imageUrl?: string, insight?: string, tags?: string) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onExplore: (entry: JournalEntry) => void;
  onConsultMirror: (content: string, recentContext: string[]) => Promise<string | null>;
  autoGenerateImage: boolean;
  onSwitchToPC: () => void;
  userName?: string;
}

/**
 * SceneSelectionScreen Props
 */
export interface MobileSceneSelectionScreenProps extends MobileScreenPropsBase {
  scenes: WorldScene[];
  onSelectScene: (sceneId: string) => void;
  onCreateScene: () => void;
}

/**
 * CharacterSelectionScreen Props
 */
export interface MobileCharacterSelectionScreenProps extends MobileScreenPropsBase {
  scene: WorldScene;
  characters: Character[];
  scenarios: CustomScenario[];
  onBack: () => void;
  onSelectCharacter: (char: Character) => void;
  onPlayScenario: (scenario: CustomScenario) => void;
  onAddCharacter: () => void;
  onAddScenario: () => void;
}

/**
 * ChatWindowScreen Props
 */
export interface MobileChatWindowScreenProps extends MobileScreenPropsBase {
  character: Character;
  customScenario?: CustomScenario;
  history: Message[];
  scenarioState?: ScenarioState;
  settings: GameState['settings'];
  userProfile: NonNullable<GameState['userProfile']>;
  activeJournalEntryId?: string | null;
  onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  onUpdateScenarioState: (nodeId: string) => void;
  onBack: () => void;
}

/**
 * ConnectionSpaceScreen Props
 */
export interface MobileConnectionSpaceScreenProps extends MobileScreenPropsBase {
  characters: Character[];
  userProfile: NonNullable<GameState['userProfile']>;
  onConnect: (char: Character) => void;
  onBack: () => void;
}

/**
 * ProfileScreen Props
 */
export interface MobileProfileScreenProps extends MobileScreenPropsBase {
  userProfile: NonNullable<GameState['userProfile']>;
  journalEntries: JournalEntry[];
  mailbox: GameState['mailbox'];
  history: GameState['history'];
  onOpenSettings: () => void;
  onLogout: () => void;
  onUpdateProfile: (profile: GameState['userProfile']) => void;
  onNavigateToScene: (sceneId: string) => void;
  onNavigateToCharacter: (characterId: string, sceneId: string) => void;
  onNavigateToJournal: () => void;
}

/**
 * ScenarioBuilderScreen Props
 */
export interface MobileScenarioBuilderScreenProps extends MobileScreenPropsBase {
  onSave: (scenario: CustomScenario) => void;
  onCancel: () => void;
}

/**
 * SharedHeartSphereScreen Props
 */
export interface MobileSharedHeartSphereScreenProps extends MobileScreenPropsBase {
  onBack: () => void;
  onSelectScene: (sceneId: string) => void;
}

/**
 * SharedCharacterSelectionScreen Props
 */
export interface MobileSharedCharacterSelectionScreenProps extends MobileScreenPropsBase {
  currentScene: WorldScene;
  onBack: () => void;
  onCharacterSelect: (character: Character) => void;
}

/**
 * SharedChatWindowScreen Props
 */
export interface MobileSharedChatWindowScreenProps extends MobileScreenPropsBase {
  character: Character;
  history: Message[];
  settings: GameState['settings'];
  userProfile: NonNullable<GameState['userProfile']>;
  onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  onBack: () => void;
}
