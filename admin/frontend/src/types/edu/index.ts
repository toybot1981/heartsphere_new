// 管理后台类型定义
export interface Student {
  id: string;
  username: string;
  email: string;
  grade?: string;
  school?: string;
  ageGroup: 'elementary' | 'middle';
  createdAt: string;
}

export interface Teacher {
  id: string;
  username: string;
  email: string;
  school?: string;
  subject?: string;
  createdAt: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  ageGroup: 'elementary' | 'middle';
  createdBy: string;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  createdBy: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  ageGroup: 'elementary' | 'middle';
  teacherId: string;
  studentIds: string[];
  createdAt: string;
}