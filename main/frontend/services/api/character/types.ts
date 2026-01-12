// 角色（Character）相关类型定义

/**
 * 系统预置角色
 */
export interface SystemCharacter {
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
  mbti: string | null;
  tags: string | null;
  speechStyle: string | null;
  catchphrases: string | null;
  secrets: string | null;
  motivations: string | null;
  relationships: string | null;
  systemEraId: number | null;
  isActive: boolean;
  sortOrder: number;
}

/**
 * 用户角色
 */
export interface UserCharacter {
  id: number;
  name: string;
  description: string;
  age: number;
  gender: string;
  role: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  themeColor: string;
  colorAccent: string;
  firstMessage: string;
  systemInstruction: string;
  voiceName: string;
  mbti: string;
  tags: string;
  speechStyle: string;
  catchphrases: string;
  secrets: string;
  motivations: string;
  relationships: string;
  worldId: number;
  eraId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建角色DTO
 */
export interface CreateCharacterDTO {
  name: string;
  description: string;
  age?: number;
  gender?: string;
  worldId: number;
  eraId?: number | null;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  themeColor?: string;
  colorAccent?: string;
  firstMessage?: string;
  systemInstruction?: string;
  voiceName?: string;
  mbti?: string;
  tags?: string;
  speechStyle?: string;
  catchphrases?: string;
  secrets?: string;
  motivations?: string;
  relationships?: string;
  systemCharacterId?: number; // 如果从预置角色创建
}

/**
 * 更新角色DTO
 */
export interface UpdateCharacterDTO {
  name?: string;
  description?: string;
  age?: number;
  gender?: string;
  worldId?: number;
  eraId?: number | null;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  themeColor?: string;
  colorAccent?: string;
  firstMessage?: string;
  systemInstruction?: string;
  voiceName?: string;
  mbti?: string;
  tags?: string;
  speechStyle?: string;
  catchphrases?: string;
  secrets?: string;
  motivations?: string;
  relationships?: string;
}

