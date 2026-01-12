// 数字人教育版类型定义

// 角色类型
export type CharacterType = 
  | 'teaching_assistant' 
  | 'learning_companion' 
  | 'counseling' 
  | 'homework_helper' 
  | 'subject_explainer';

// 难度等级
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// 语言风格
export type LanguageStyle = 'formal' | 'casual' | 'friendly';

// 年龄组
export type AgeGroupSuitability = 'primary_6_12' | 'secondary_13_18';

// 互动类型
export type InteractionType = 
  | 'teaching_dialogue' 
  | 'homework_help' 
  | 'counseling' 
  | 'knowledge_explanation' 
  | 'practice_exercise';

// 理解程度
export type ComprehensionLevel = 'not_understood' | 'partially_understood' | 'well_understood' | 'mastered';

// API 响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

// 分页响应
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

// 数字人角色
export interface EduCharacter {
  id: number;
  name: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  description?: string;
  bio?: string;
  characterType: CharacterType;
  ageGroupSuitability?: AgeGroupSuitability[];
  subjectTags?: string[];
  teachingSpecialty?: string;
  difficultyLevel?: DifficultyLevel;
  languageStyle?: LanguageStyle;
  personalityTraits?: string[];
  firstMessage?: string;
  systemInstruction?: string;
  voiceName?: string;
  themeColor?: string;
  colorAccent?: string;
  studentId?: number;
  teacherId?: number;
  totalInteractions?: number;
  uniqueStudents?: number;
  averageRating?: number;
  isEnabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 创建角色请求
export interface CreateCharacterRequest {
  name: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  description?: string;
  bio?: string;
  characterType: CharacterType;
  ageGroupSuitability?: AgeGroupSuitability[];
  subjectTags?: string[];
  teachingSpecialty?: string;
  difficultyLevel?: DifficultyLevel;
  languageStyle?: LanguageStyle;
  personalityTraits?: string[];
  firstMessage?: string;
  systemInstruction?: string;
  voiceName?: string;
  themeColor?: string;
  colorAccent?: string;
  studentId?: number;
  teacherId?: number;
}

// 更新角色请求
export interface UpdateCharacterRequest {
  name?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  description?: string;
  bio?: string;
  characterType?: CharacterType;
  ageGroupSuitability?: AgeGroupSuitability[];
  subjectTags?: string[];
  teachingSpecialty?: string;
  difficultyLevel?: DifficultyLevel;
  languageStyle?: LanguageStyle;
  personalityTraits?: string[];
  firstMessage?: string;
  systemInstruction?: string;
  voiceName?: string;
  themeColor?: string;
  colorAccent?: string;
  isEnabled?: boolean;
}

// 角色查询参数
export interface CharacterQueryParams {
  characterType?: CharacterType;
  ageGroup?: AgeGroupSuitability;
  subjectTags?: string[];
  difficultyLevel?: DifficultyLevel;
  searchKeyword?: string;
  studentId?: number;
  teacherId?: number;
  isEnabled?: boolean;
  page?: number;
  size?: number;
}

// 角色推荐
export interface CharacterRecommendation {
  character: EduCharacter;
  reason: string;
  relevanceScore: number;
}

// 推荐条件
export interface RecommendationCriteria {
  ageGroup?: AgeGroupSuitability;
  subjectInterests?: string[];
  limit?: number;
  includeHistory?: boolean;
}

// 角色统计
export interface CharacterStatistics {
  characterId: number;
  characterName: string;
  totalInteractions: number;
  uniqueStudents: number;
  averageRating: number;
  totalDurationMinutes: number;
}

// 数字人互动记录
export interface EduCharacterInteraction {
  id: number;
  studentId: number;
  characterId: number;
  interactionType: InteractionType;
  conversationContent?: string; // JSON 格式的对话内容
  learningTopics?: string[];
  comprehensionLevel?: ComprehensionLevel;
  studentRating?: number; // 1-5 星
  studentFeedback?: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

// 记录互动请求
export interface RecordInteractionRequest {
  studentId: number;
  characterId: number;
  interactionType: InteractionType;
  conversationContent?: string; // JSON 格式的对话内容
  learningTopics?: string[];
  comprehensionLevel?: ComprehensionLevel;
  studentRating?: number; // 1-5 星
  studentFeedback?: string;
  startTime?: string;
  endTime?: string;
}

// 互动查询参数
export interface InteractionQueryParams {
  studentId: number;
  characterId?: number;
  interactionType?: InteractionType;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
