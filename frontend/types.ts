
// This file includes legacy types like 'Persona' to prevent errors in unused components,
// but the main application logic relies on the 'WorldScene' architecture.
export interface Persona {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  eras: Character[];
}

export interface Character {
  id: string;
  name: string;
  age: number;
  era?: string; // Legacy support
  role: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  systemInstruction: string;
  themeColor: string;
  colorAccent: string;
  firstMessage: string;
  voiceName: string;

  // --- New Deep Personality Fields ---
  mbti?: string;             // e.g., "INFJ"
  tags?: string[];           // e.g., "Tsundere", "Hacker", "Cat Lover"
  speechStyle?: string;      // e.g., "Short, coded, uses slang"
  catchphrases?: string[];   // e.g., "Interesting.", "Baka!"
  secrets?: string;          // Hidden depth not known to user initially
  motivations?: string;      // Current goal driving the character
  relationships?: string;    // Text description of connections with others
}

export interface Message {
  id:string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: number;
  // 技能信息（当角色触发技能时显示）
  skillId?: string;      // 技能ID
  skillName?: string;    // 技能名称
}

export interface StoryOptionEffect {
  type: 'favorability' | 'event' | 'item';
  target: string; // 角色ID（favorability）或事件ID（event）或物品ID（item）
  value?: number; // 好感度变化值（仅用于 favorability，可以是正数或负数）
}

export interface StoryOptionCondition {
  type: 'favorability' | 'event' | 'item' | 'time';
  target: string; // 角色ID（favorability）或事件ID（event）或物品ID（item）或时间ID（time）
  operator: '>=' | '<=' | '==' | '!=' | '>' | '<' | 'has' | 'not_has'; // 比较运算符
  value?: number | string; // 比较值（favorability用数字，其他用字符串）
}

export interface StoryOption {
  id: string;
  text: string;
  nextNodeId: string;
  effects?: StoryOptionEffect[]; // 选择此选项时的状态影响
  conditions?: StoryOptionCondition[]; // 显示此选项需要满足的条件（所有条件都需要满足）
  hidden?: boolean; // 如果为true，即使条件满足也不显示（用于隐藏选项）
}

export interface StoryNode {
  id: string;
  title: string;
  prompt: string;
  backgroundHint?: string;
  options: StoryOption[];
  characterIds?: string[]; // 该节点涉及的角色ID列表
  focusCharacterId?: string; // 该节点主要聚焦的角色ID
  nodeType?: 'fixed' | 'ai-dynamic' | 'ending'; // 节点类型：fixed=固定内容，ai-dynamic=AI动态生成，ending=结局节点
  // 多角色对话支持
  multiCharacterDialogue?: Array<{
    characterId: string;
    content: string; // 该角色的对话内容
    order?: number; // 显示顺序
  }>;
  // 随机事件
  randomEvents?: Array<{
    id: string;
    probability: number; // 0-1之间的概率
    effect: StoryOptionEffect; // 触发的事件效果
  }>;
  // 时间系统
  timeLimit?: number; // 限时时间（秒），如果设置，超过时间后自动跳转到timeoutNodeId
  timeoutNodeId?: string; // 超时后跳转的节点ID
  // AI辅助选项生成
  aiGenerateOptions?: boolean; // 是否使用AI生成额外选项
  aiOptionPrompt?: string; // AI生成选项的提示词
}

export interface CustomScenario {
  id: string;
  sceneId: string; // Belongs to a specific scene
  title: string;
  description: string;
  nodes: Record<string, StoryNode>;
  startNodeId: string;
  author: string;
  participatingCharacters?: string[]; // 参与该剧本的角色ID列表
}

export interface EraMemory {
  id: string;
  content: string; // Text memory
  imageUrl?: string; // Optional photo
  timestamp: number;
}

export interface WorldScene {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  characters: Character[];
  mainStory?: Character;
  scripts?: Array<{
    id: string;
    title: string;
    description?: string | null;
    content: string;
    sceneCount: number;
    eraId?: number | null;
    worldId?: number | null;
    characterIds?: string | null;
    tags?: string | null;
  }>; // 剧本列表
  memories?: EraMemory[]; // Personal memories specific to this era
  scenes?: any[]; // Scenes for this era
  worldId?: number; // Associated world ID
  systemEraId?: number; // 关联的系统预置场景ID（如果是从预置场景创建的）
}

export type AIProvider = 'gemini' | 'openai' | 'qwen' | 'doubao';

// 对话风格类型
export type DialogueStyle = 
  | 'mobile-chat'      // 📱 即时网聊
  | 'visual-novel'     // 📖 沉浸小说
  | 'stage-script'     // 🎭 剧本独白
  | 'poetic';          // 📜 诗意留白


// 世界风格类型
export type WorldStyle = 'anime' | 'realistic' | 'cyberpunk' | 'fantasy' | 'steampunk' | 'minimalist' | 'watercolor' | 'oil-painting';

// 风格描述映射
export const WORLD_STYLE_DESCRIPTIONS: Record<WorldStyle, { name: string; description: string; promptSuffix: string }> = {
  anime: {
    name: '二次元',
    description: '现代中国动漫风格，充满活力的色彩和细腻的表情',
    promptSuffix: 'Style: Modern Chinese Anime (Manhua), vibrant colors, detailed eyes, expressive emotions, cinematic lighting.'
  },
  realistic: {
    name: '写实风格',
    description: '高度写实的照片级渲染，真实的光影和质感',
    promptSuffix: 'Style: Photorealistic, highly detailed, realistic lighting and textures, professional photography quality.'
  },
  cyberpunk: {
    name: '赛博朋克',
    description: '赛博朋克未来主义，霓虹灯、科技感、暗黑美学',
    promptSuffix: 'Style: Cyberpunk, neon lights, futuristic technology, dark aesthetic, Blade Runner inspired, high-tech low-life atmosphere.'
  },
  fantasy: {
    name: '奇幻风格',
    description: '魔幻世界，魔法元素，史诗般的场景',
    promptSuffix: 'Style: Fantasy art, magical elements, epic scenes, mystical atmosphere, high fantasy aesthetic, detailed world-building.'
  },
  steampunk: {
    name: '蒸汽朋克',
    description: '维多利亚场景与蒸汽机械的完美结合',
    promptSuffix: 'Style: Steampunk, Victorian era aesthetics, brass and copper machinery, gears and cogs, retro-futuristic technology.'
  },
  minimalist: {
    name: '极简主义',
    description: '简洁优雅，留白艺术，现代设计',
    promptSuffix: 'Style: Minimalist, clean lines, elegant simplicity, modern design, ample white space, refined aesthetics.'
  },
  'watercolor': {
    name: '水彩画风',
    description: '柔和的水彩笔触，梦幻的色彩渐变',
    promptSuffix: 'Style: Watercolor painting, soft brushstrokes, dreamy color gradients, artistic and ethereal, flowing pigments.'
  },
  'oil-painting': {
    name: '油画风格',
    description: '古典油画质感，丰富的笔触和层次',
    promptSuffix: 'Style: Oil painting, classical art, rich brushstrokes and texture, Renaissance or Baroque inspired, artistic depth.'
  }
};

export interface ModelConfig {
  apiKey: string;
  baseUrl?: string; // Optional for custom endpoints
  modelName: string;      // Text Model
  imageModel?: string;    // Image Generation Model
  videoModel?: string;    // Video Generation Model
}

export interface AppSettings {
  autoGenerateAvatars: boolean;
  autoGenerateStoryScenes: boolean;
  autoGenerateJournalImages: boolean; // New setting for journal
  debugMode: boolean; 
  dialogueStyle?: DialogueStyle; // 对话风格配置
  showNoteSync?: boolean; // 是否显示笔记同步按钮
  
  // Modality Routing Settings
  textProvider: AIProvider;
  imageProvider: AIProvider;
  videoProvider: AIProvider; // New Video Support
  audioProvider: AIProvider;
  enableFallback: boolean; // If true, try other providers on error

  // Provider Configurations
  geminiConfig: ModelConfig;
  openaiConfig: ModelConfig;
  qwenConfig: ModelConfig;
  doubaoConfig: ModelConfig;
}

export interface UserProfile {
  id?: string;
  nickname: string;
  avatarUrl: string;
  phoneNumber?: string;
  isGuest: boolean; // True if not logged in/registered
  wechatOpenid?: string; // 微信OpenID，用于判断是否已绑定微信
  isFounder?: boolean; // 是否为心域创始人
}

export interface JournalEcho {
  characterName: string;
  text: string;
  timestamp: number;
  imageUrl?: string; 
}

// 同步状态类型
export type SyncStatus = 0 | 1 | -1; // 0: 待同步, 1: 同步成功, -1: 同步失败

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  imageUrl?: string; // Mind Projection
  echo?: JournalEcho; // Echoes of Wisdom
  insight?: string; // Mirror of Truth (本我镜像)
  tags?: string; // 标签（逗号分隔，如：#灵感,#梦境,#工作）
  syncStatus?: SyncStatus; // 同步状态：0-待同步，1-同步成功，-1-同步失败
  lastSyncTime?: number; // 最后同步时间
  syncError?: string; // 同步错误信息
}

export interface Mail {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  subject: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  themeColor: string;
  type?: string; // 信件类型：user_feedback, admin_reply, ai_generated
  parentLetterId?: string; // 父信件ID（用于回复）
}

// 跨时空信箱类型（新架构）- 从 mailbox.ts 导入
export * from './types/mailbox';

// Debug Logging Structure
export interface DebugLog {
  id: string;
  timestamp: number;
  provider: string;
  model?: string; // Specific model name used
  method: string;
  type: string;
  data: any;
}

export interface GameState {
  currentScreen: 'profileSetup' | 'entryPoint' | 'realWorld' | 'sceneSelection' | 'characterSelection' | 'chat' | 'builder' | 'connectionSpace' | 'admin' | 'mobileProfile' | 'profile' | 'sharedHeartSphere' | 'sharedCharacterSelection' | 'sharedChat';
  userProfile: UserProfile | null;
  selectedSceneId: string | null;
  selectedCharacterId: string | null;
  selectedScenarioId: string | null;
  
  // New field to hold the temporary narrator character for scenarios
  tempStoryCharacter: Character | null;

  editingScenarioId: string | null;
  editingScript: any | null; // 正在编辑的剧本（后端script对象）
  history: Record<string, Message[]>; 
  customAvatars: Record<string, string>; 
  generatingAvatarId: string | null; 
  
  // Custom characters added to scenes (Map: sceneId -> Character[])
  customCharacters: Record<string, Character[]>;

  customScenarios: CustomScenario[];
  customScenes: WorldScene[];
  userWorldScenes: WorldScene[]; // 用户从后端获取的世界场景
  journalEntries: JournalEntry[];
  activeJournalEntryId: string | null; // Track which entry is currently being "explored"
  currentScenarioState?: {
    scenarioId: string;
    currentNodeId: string;
    // 状态追踪
    favorability?: Record<string, number>; // 角色ID -> 好感度值（0-100）
    events?: string[]; // 已触发的事件ID列表
    items?: string[]; // 已收集的物品ID列表
    // 时间系统
    startTime?: number; // 剧本开始时间（时间戳）
    currentTime?: number; // 当前时间（时间戳，相对于startTime的秒数）
    // 探索地图（用于可视化）
    visitedNodes?: string[]; // 已访问的节点ID列表
  };
  settings: AppSettings;
  mailbox: Mail[]; // Chronos Mailbox
  lastLoginTime: number; // For tracking offline duration
  sceneMemories: Record<string, EraMemory[]>; // Map sceneId -> memories
  
  debugLogs: DebugLog[]; // Store runtime logs
  showWelcomeOverlay: boolean; // 是否显示首次登录欢迎蒙层
  worldStyle: WorldStyle; // 当前世界风格设定
  pageScrollPositions: Record<string, number>; // 保存每个页面的滚动位置，key为页面标识符（如'characterSelection:sceneId'）
}