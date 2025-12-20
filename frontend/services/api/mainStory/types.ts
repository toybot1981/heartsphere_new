// 主线剧情（MainStory）相关类型定义

/**
 * 系统预置主线剧情
 */
export interface SystemMainStory {
  id: number;
  name: string;
  description?: string; // 保留以兼容旧数据
  age: number | null;
  role: string | null;
  bio: string | null;
  systemEraId: number;
  eraName: string | null;
  characterId: number | null;
  characterName: string | null;
  firstMessage: string | null;
  systemInstruction: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  themeColor: string | null;
  colorAccent: string | null;
  voiceName: string | null;
  tags: string | null;
  speechStyle: string | null;
  catchphrases: string | null;
  secrets: string | null;
  motivations: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户主线剧情
 */
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

/**
 * 创建用户主线剧情DTO
 */
export interface CreateUserMainStoryDTO {
  systemMainStoryId?: number; // 系统预置主线剧情ID（优先使用）
  eraId: number; // 用户场景ID
  name?: string; // 可选：自定义名称（如果提供会覆盖预置数据的名称）
}

/**
 * 更新用户主线剧情DTO
 */
export interface UpdateUserMainStoryDTO {
  name?: string;
  age?: number;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  themeColor?: string;
  colorAccent?: string;
  firstMessage?: string;
  systemInstruction?: string;
  voiceName?: string;
  tags?: string;
  speechStyle?: string;
  catchphrases?: string;
  secrets?: string;
  motivations?: string;
}

