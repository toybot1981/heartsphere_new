/**
 * ChatWindow 组件相关的类型定义
 */

import { Character, Message, CustomScenario, AppSettings, UserProfile, JournalEcho } from '../../types';

/**
 * 剧本场景状态
 */
export interface ScenarioState {
  currentNodeId: string;
  favorability?: Record<string, number>;
  events?: string[];
  items?: string[];
  visitedNodes?: string[];
  currentTime?: number;
  startTime?: number;
}

/**
 * 剧本场景状态更新
 */
export interface ScenarioStateUpdates {
  favorability?: Record<string, number>;
  events?: string[];
  items?: string[];
  visitedNodes?: string[];
  currentTime?: number;
}

/**
 * ChatWindow 核心 Props
 */
export interface ChatWindowCoreProps {
  character: Character;
  history: Message[];
  settings: AppSettings;
  userProfile: UserProfile;
  onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  onBack: (echo?: JournalEcho) => void;
}

/**
 * ChatWindow 剧本相关 Props
 */
export interface ChatWindowScenarioProps {
  customScenario?: CustomScenario;
  scenarioState?: ScenarioState;
  onUpdateScenarioState?: (nodeId: string) => void;
  onUpdateScenarioStateData?: (updates: ScenarioStateUpdates) => void;
  participatingCharacters?: Character[];
}

/**
 * ChatWindow 日记相关 Props
 */
export interface ChatWindowJournalProps {
  activeJournalEntryId: string | null;
}

/**
 * ChatWindow 完整 Props
 */
export type ChatWindowProps = ChatWindowCoreProps & 
  ChatWindowScenarioProps & 
  ChatWindowJournalProps;

