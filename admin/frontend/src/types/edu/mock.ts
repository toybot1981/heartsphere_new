// 管理后台 Mock 数据
import type { Student, Teacher, Scene, Character, Course } from './index';

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    username: '小明',
    email: 'xiaoming@example.com',
    grade: '三年级',
    school: '阳光小学',
    ageGroup: 'elementary',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'student-2',
    username: '小红',
    email: 'xiaohong@example.com',
    grade: '四年级',
    school: '阳光小学',
    ageGroup: 'elementary',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'student-3',
    username: '李华',
    email: 'lihua@example.com',
    grade: '初一',
    school: '实验中学',
    ageGroup: 'middle',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    username: '张老师',
    email: 'zhang@example.com',
    school: '阳光小学',
    subject: '语文',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'teacher-2',
    username: '王老师',
    email: 'wang@example.com',
    school: '实验中学',
    subject: '数学',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockScenes: Scene[] = [
  {
    id: 'scene-1',
    name: '古代中国',
    description: '探索古代中国的历史和文化',
    ageGroup: 'elementary',
    createdBy: 'student-1',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'scene-2',
    name: '太空探索',
    description: '学习太阳系和宇宙的知识',
    ageGroup: 'elementary',
    createdBy: 'student-2',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'scene-3',
    name: '编程世界',
    description: '学习编程和算法',
    ageGroup: 'middle',
    createdBy: 'student-3',
    createdAt: '2024-01-04T00:00:00Z',
  },
];

export const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: '孔子',
    description: '古代伟大的思想家和教育家',
    role: 'teacher',
    createdBy: 'student-1',
    createdAt: '2024-01-02T01:00:00Z',
  },
  {
    id: 'char-2',
    name: '宇航员小智',
    description: '友好的宇航员，帮助探索太空',
    role: 'guide',
    createdBy: 'student-2',
    createdAt: '2024-01-03T01:00:00Z',
  },
];

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    name: '中国历史入门',
    description: '通过场景和角色学习中国历史',
    ageGroup: 'elementary',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-2'],
    createdAt: '2024-01-05T00:00:00Z',
  },
];

export const mockAnalytics = {
  totalLearningTime: 150,
  sceneCount: 2,
  characterCount: 3,
  homeworkCompletionRate: 0.85,
  averageGrade: 92,
};