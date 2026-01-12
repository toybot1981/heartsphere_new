// 用户类型
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export type AgeGroup = 'elementary' | 'middle';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  ageGroup?: AgeGroup; // 仅学生有
  avatar?: string;
  createdAt: string;
}

export interface Student extends User {
  role: 'student';
  ageGroup: AgeGroup;
  grade?: string;
  school?: string;
  parentId?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  school?: string;
  subject?: string;
}

export interface Parent extends User {
  role: 'parent';
  childrenIds: string[];
}

// 场景和角色
export interface Scene {
  id: string;
  name: string;
  description: string;
  ageGroup: AgeGroup;
  thumbnail?: string;
  characters: Character[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  role: string;
  sceneId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 课程和作业
export interface Course {
  id: string;
  name: string;
  description: string;
  ageGroup: AgeGroup;
  teacherId: string;
  studentIds: string[];
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  courseId: string;
  studentId: string;
  teacherId: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'graded';
  submission?: string;
  grade?: number;
  feedback?: string;
  dueDate: string;
  submittedAt?: string;
  createdAt: string;
}

// 学习记录
export interface LearningRecord {
  id: string;
  studentId: string;
  activityType: 'scene_creation' | 'character_creation' | 'ai_conversation' | 'homework' | 'counseling';
  activityId: string;
  duration: number; // 分钟
  createdAt: string;
}

// 情绪记录
export interface EmotionRecord {
  id: string;
  studentId: string;
  emotion: 'happy' | 'sad' | 'anxious' | 'frustrated' | 'excited' | 'calm';
  intensity: number; // 1-10
  context?: string;
  createdAt: string;
}

// 心理辅导会话
export interface CounselingSession {
  id: string;
  studentId: string;
  characterId: string;
  messages: CounselingMessage[];
  emotionRecords: EmotionRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CounselingMessage {
  id: string;
  role: 'student' | 'counselor';
  content: string;
  timestamp: string;
}

// 数据分析
export interface Analytics {
  studentId: string;
  totalLearningTime: number;
  sceneCount: number;
  characterCount: number;
  homeworkCompletionRate: number;
  averageGrade: number;
  emotionTrend: EmotionTrend[];
  activityDistribution: ActivityDistribution[];
}

export interface EmotionTrend {
  date: string;
  averageIntensity: number;
  dominantEmotion: string;
}

export interface ActivityDistribution {
  type: string;
  count: number;
  percentage: number;
}

// 重新导出数字人相关类型
export * from './digitalHuman';