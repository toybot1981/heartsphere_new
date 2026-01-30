/**
 * 场景创建向导相关的类型定义
 */

export interface PresetEra {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
}

export interface PresetCharacter {
  id: number;
  name: string;
  description: string | null;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  age: number | null;
  gender: string | null;
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
}

export interface PresetMainStory {
  id: number;
  name: string;
  description?: string;
  bio: string | null;
  age: number | null;
  role: string | null;
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
}

export interface PresetScript {
  id: number;
  title: string;
  description: string | null;
  content: string;
  sceneCount: number | null;
  systemEraId: number | null;
}

export interface SelectedItem {
  id: number;
  originalName: string;
  customName: string;
  data: any;
}
