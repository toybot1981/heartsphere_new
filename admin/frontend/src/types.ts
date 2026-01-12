/**
 * 共享类型定义
 */

// StoryOptionEffect 类型定义
export interface StoryOptionEffect {
  type: 'favorability' | 'event' | 'item';
  target: string;
  value?: number;
}

// StoryOptionCondition 类型定义
export interface StoryOptionCondition {
  type: 'favorability' | 'event' | 'item' | 'time';
  target: string;
  operator: '>=' | '<=' | '==' | '!=' | '>' | '<' | 'has' | 'not_has';
  value?: number | string;
}

// StoryOption 类型定义
export interface StoryOption {
  id: string;
  text: string;
  nextNodeId: string;
  effects?: StoryOptionEffect[];
  conditions?: StoryOptionCondition[];
  hidden?: boolean;
}

// StoryNode 类型定义
export type StoryNode = {
  id: string;
  title: string;
  prompt: string;
  backgroundHint?: string;
  options: StoryOption[];
  characterIds?: string[];
  focusCharacterId?: string;
  nodeType?: 'fixed' | 'ai-dynamic' | 'ending';
  multiCharacterDialogue?: Array<{
    characterId: string;
    content: string;
    order?: number;
  }>;
  randomEvents?: Array<{
    id: string;
    probability: number;
    effect: StoryOptionEffect;
  }>;
  timeLimit?: number;
  timeoutNodeId?: string;
  aiGenerateOptions?: boolean;
  aiOptionPrompt?: string;
};

// CustomScenario 类型定义
export interface CustomScenario {
  id: string;
  sceneId: string;
  title: string;
  description: string;
  nodes: Record<string, StoryNode>;
  startNodeId: string;
  author: string;
  participatingCharacters?: string[];
}

// AppSettings 类型定义（简化版）
export interface AppSettings {
  aiModel?: string;
  aiProvider?: string;
  imageModel?: string;
  [key: string]: any;
}
