/**
 * 构建Screen组件Props的辅助函数
 * 根据不同的Screen类型，构建对应的Props对象
 */

import { GameState, GameStateAction, Character, WorldScene, CustomScenario, JournalEntry, Message } from '../../types';
import {
  MobileEntryPointScreenProps,
  MobileRealWorldScreenProps,
  MobileSceneSelectionScreenProps,
  MobileCharacterSelectionScreenProps,
  MobileChatWindowScreenProps,
  MobileConnectionSpaceScreenProps,
  MobileProfileScreenProps,
  MobileScenarioBuilderScreenProps,
  MobileSharedHeartSphereScreenProps,
  MobileSharedCharacterSelectionScreenProps,
  MobileSharedChatWindowScreenProps,
} from '../types/mobile.types';

/**
 * Screen Props构建器接口
 */

export interface ScreenPropsBuilder {
  gameState: GameState;
  dispatch: (action: GameStateAction) => void;
  handlers: {
    // Navigation handlers
    handleNavigate: (screen: GameState['currentScreen']) => void;
    handleSelectScene: (sceneId: string) => void;
    handleSelectCharacter: (char: Character) => void;
    handlePlayScenario: (scenario: CustomScenario) => void;
    handleBack: () => void;
    
    // Data handlers
    handleAddEntry: (title: string, content: string, imageUrl?: string, insight?: string, tags?: string) => void;
    handleUpdateEntry: (entry: JournalEntry) => void;
    handleDeleteEntry: (id: string) => void;
    handleExplore: (entry: JournalEntry) => void;
    handleSaveScenario: (scenario: CustomScenario) => void;
    
        // UI handlers
        handleOpenSettings: () => void;
        handleOpenLoginModal: () => void;
        handleOpenEraCreator: () => void;
        handleOpenCharacterCreator: () => void;
        handleOpenScenarioBuilder: () => void;
        handleOpenQuickConnect: () => void;
        handleLogout: () => void;
        handleSwitchToPC: () => void;
        handleLoginSuccess: (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: WorldScene[]) => Promise<void>;
    
    // Other handlers
    handleConsultMirror: (content: string, recentContext: string[]) => Promise<string | null>;
  };
  computed: {
    allScenes: WorldScene[];
    currentScene: WorldScene | undefined;
    currentSceneChars: Character[];
    currentSceneScenarios: CustomScenario[];
    activeCharacter: Character | undefined;
  };
}

/**
 * 构建Screen组件的Props
 * 根据currentScreen类型返回对应的Props对象
 */
export const buildScreenProps = (
  screen: GameState['currentScreen'],
  builder: ScreenPropsBuilder
): Record<string, unknown> | null => {
  const { gameState, dispatch, handlers, computed } = builder;

  switch (screen) {
    case 'profileSetup':
      // ProfileSetup不需要通过buildScreenProps构建，它使用独立的Props
      return null;

    case 'entryPoint':
      if (!gameState.userProfile) return null;
      return {
        gameState,
        dispatch,
        onNavigate: handlers.handleNavigate,
        onOpenSettings: handlers.handleOpenSettings,
        nickname: gameState.userProfile.nickname || '',
        avatarUrl: gameState.userProfile.avatarUrl,
        currentStyle: gameState.worldStyle,
        onStyleChange: (style: string) => {
          dispatch({ type: 'SET_WORLD_STYLE', payload: style });
        },
        isGuest: gameState.userProfile.isGuest || false,
        onGuestEnter: (nickname: string) => {
          dispatch({
            type: 'SET_USER_PROFILE',
            payload: { nickname, avatarUrl: '', isGuest: true, id: `guest_${Date.now()}` }
          });
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
        },
        onLoginSuccess: handlers.handleLoginSuccess,
      } as MobileEntryPointScreenProps;

    case 'realWorld':
      return {
        gameState,
        dispatch,
        entries: gameState.journalEntries,
        onAddEntry: handlers.handleAddEntry,
        onUpdateEntry: handlers.handleUpdateEntry,
        onDeleteEntry: handlers.handleDeleteEntry,
        onExplore: handlers.handleExplore,
        onConsultMirror: handlers.handleConsultMirror,
        autoGenerateImage: gameState.settings.autoGenerateJournalImages,
        onSwitchToPC: handlers.handleSwitchToPC,
        userName: gameState.userProfile?.nickname,
      } as MobileRealWorldScreenProps;

    case 'sceneSelection':
      // 确保scenes始终是一个数组，即使为空
      const scenes = computed.allScenes || [];
      return {
        gameState,
        dispatch,
        scenes: scenes,
        onSelectScene: handlers.handleSelectScene,
        onCreateScene: handlers.handleOpenEraCreator,
      } as MobileSceneSelectionScreenProps;

    case 'characterSelection':
      if (!computed.currentScene) return null;
      return {
        gameState,
        dispatch,
        scene: computed.currentScene,
        characters: computed.currentSceneChars,
        scenarios: computed.currentSceneScenarios,
        onBack: handlers.handleBack,
        onSelectCharacter: handlers.handleSelectCharacter,
        onPlayScenario: handlers.handlePlayScenario,
        onAddCharacter: handlers.handleOpenCharacterCreator,
        onAddScenario: handlers.handleOpenScenarioBuilder,
      } as MobileCharacterSelectionScreenProps;

    case 'chat':
      if (!computed.activeCharacter) return null;
      return {
        gameState,
        dispatch,
        character: computed.activeCharacter,
        customScenario: gameState.selectedScenarioId
          ? gameState.customScenarios.find(s => s.id === gameState.selectedScenarioId)
          : undefined,
        history: gameState.history[computed.activeCharacter.id] || [],
        scenarioState: gameState.currentScenarioState,
        settings: gameState.settings,
        userProfile: gameState.userProfile!,
        activeJournalEntryId: gameState.activeJournalEntryId,
        onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => {
          const updatedHistory = typeof msgs === 'function' 
            ? msgs(gameState.history[computed.activeCharacter!.id] || [])
            : msgs;
          dispatch({
            type: 'SET_HISTORY',
            payload: { ...gameState.history, [computed.activeCharacter!.id]: updatedHistory }
          });
        },
        onUpdateScenarioState: (nodeId: string) => {
          dispatch({
            type: 'UPDATE_SCENARIO_STATE',
            payload: { ...gameState.currentScenarioState!, currentNodeId: nodeId }
          });
        },
        onBack: () => {
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'characterSelection' });
          dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
          dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: null });
        },
      } as MobileChatWindowScreenProps;

    case 'connectionSpace':
      if (!gameState.userProfile) return null;
      // 确保allScenes是数组
      const connectionScenes = Array.isArray(computed.allScenes) ? computed.allScenes : [];
      // 收集所有角色
      const allCharacters = connectionScenes.flatMap(s => [
        ...(s.characters || []),
        ...(gameState.customCharacters[s.id] || [])
      ]);
      console.log('[buildScreenProps] connectionSpace - scenes:', connectionScenes.length, 'characters:', allCharacters.length);
      return {
        gameState,
        dispatch,
        characters: allCharacters,
        userProfile: gameState.userProfile,
        onConnect: (char: Character) => {
          const s = connectionScenes.find(sc =>
            [...(sc.characters || []), ...(gameState.customCharacters[sc.id] || [])].some(c => c.id === char.id)
          );
          if (s) {
            dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: s.id });
            dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: char.id });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'chat' });
          }
        },
        onBack: () => {
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' });
        },
      } as MobileConnectionSpaceScreenProps;

    case 'mobileProfile':
    case 'profile':
      if (!gameState.userProfile) return null;
      return {
        gameState,
        dispatch,
        userProfile: gameState.userProfile,
        journalEntries: gameState.journalEntries,
        mailbox: gameState.mailbox,
        history: gameState.history,
        onOpenSettings: handlers.handleOpenSettings,
        onLogout: handlers.handleLogout,
        onUpdateProfile: (profile: NonNullable<GameState['userProfile']>) => {
          dispatch({ type: 'SET_USER_PROFILE', payload: profile });
        },
        onNavigateToScene: (sceneId: string) => {
          dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' });
        },
        onNavigateToCharacter: (characterId: string, sceneId: string) => {
          dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
          dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: characterId });
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'chat' });
        },
        onNavigateToJournal: () => {
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'realWorld' });
        },
      } as MobileProfileScreenProps;

    case 'builder':
      return {
        gameState,
        dispatch,
        onSave: handlers.handleSaveScenario,
        onCancel: () => {
          // 关闭builder，回到之前的screen（可以在gameState中保存previousScreen）
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' });
        },
      } as MobileScenarioBuilderScreenProps;

    case 'sharedHeartSphere':
      return {
        gameState,
        dispatch,
        onBack: handlers.handleBack,
        onSelectScene: handlers.handleSelectScene,
      } as MobileSharedHeartSphereScreenProps;

    case 'sharedCharacterSelection':
      if (!computed.currentScene) return null;
      return {
        gameState,
        dispatch,
        currentScene: computed.currentScene,
        onBack: handlers.handleBack,
        onCharacterSelect: handlers.handleSelectCharacter,
      } as MobileSharedCharacterSelectionScreenProps;

    case 'sharedChat':
      if (!computed.activeCharacter) return null;
      return {
        gameState,
        dispatch,
        character: computed.activeCharacter,
        history: gameState.history[computed.activeCharacter.id] || [],
        settings: gameState.settings,
        userProfile: gameState.userProfile!,
        onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => {
          const updatedHistory = typeof msgs === 'function' 
            ? msgs(gameState.history[computed.activeCharacter!.id] || [])
            : msgs;
          dispatch({
            type: 'SET_HISTORY',
            payload: { ...gameState.history, [computed.activeCharacter!.id]: updatedHistory }
          });
        },
        onBack: handlers.handleBack,
      } as MobileSharedChatWindowScreenProps;

    default:
      return null;
  }
};
