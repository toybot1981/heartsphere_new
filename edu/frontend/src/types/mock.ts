// Mock 数据文件，用于原型开发

import type {
  Student,
  Teacher,
  Parent,
  Scene,
  Character,
  Course,
  Homework,
  LearningRecord,
  EmotionRecord,
  CounselingSession,
  Analytics,
} from './index';

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    username: '小明',
    email: 'xiaoming@example.com',
    role: 'student',
    ageGroup: 'elementary',
    grade: '三年级',
    school: '阳光小学',
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'student-2',
    username: '小红',
    email: 'xiaohong@example.com',
    role: 'student',
    ageGroup: 'elementary',
    grade: '四年级',
    school: '阳光小学',
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'student-3',
    username: '李华',
    email: 'lihua@example.com',
    role: 'student',
    ageGroup: 'middle',
    grade: '初一',
    school: '实验中学',
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    username: '张老师',
    email: 'zhang@example.com',
    role: 'teacher',
    school: '阳光小学',
    subject: '语文',
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'teacher-2',
    username: '王老师',
    email: 'wang@example.com',
    role: 'teacher',
    school: '实验中学',
    subject: '数学',
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockParents: Parent[] = [
  {
    id: 'parent-1',
    username: '明爸',
    email: 'mingba@example.com',
    role: 'parent',
    childrenIds: ['student-1'],
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockScenes: Scene[] = [
  {
    id: 'scene-1',
    name: '古代中国',
    description: '探索古代中国的历史和文化',
    ageGroup: 'elementary',
    thumbnail: undefined,
    characters: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    createdBy: 'student-1',
  },
  {
    id: 'scene-2',
    name: '太空探索',
    description: '学习太阳系和宇宙的知识',
    ageGroup: 'elementary',
    thumbnail: undefined,
    characters: [],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    createdBy: 'student-2',
  },
  {
    id: 'scene-3',
    name: '编程世界',
    description: '学习编程和算法',
    ageGroup: 'middle',
    thumbnail: undefined,
    characters: [],
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
    createdBy: 'student-3',
  },
];

export const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: '孔子',
    description: '古代伟大的思想家和教育家',
    avatar: undefined,
    role: 'teacher',
    sceneId: 'scene-1',
    createdAt: '2024-01-02T01:00:00Z',
    updatedAt: '2024-01-02T01:00:00Z',
    createdBy: 'student-1',
  },
  {
    id: 'char-2',
    name: '宇航员小智',
    description: '友好的宇航员，帮助探索太空',
    avatar: undefined,
    role: 'guide',
    sceneId: 'scene-2',
    createdAt: '2024-01-03T01:00:00Z',
    updatedAt: '2024-01-03T01:00:00Z',
    createdBy: 'student-2',
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
    scenes: [mockScenes[0]],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

export const mockHomework: Homework[] = [
  {
    id: 'hw-1',
    title: '完成历史场景设计',
    description: '创建一个关于古代中国的场景，并添加至少一个角色',
    courseId: 'course-1',
    studentId: 'student-1',
    teacherId: 'teacher-1',
    status: 'submitted',
    submission: '我已经完成了场景设计，包括宫殿和孔子角色',
    grade: 95,
    feedback: '设计得很好！角色形象生动，场景描述详细。',
    dueDate: '2024-01-10T23:59:59Z',
    submittedAt: '2024-01-09T14:30:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'hw-2',
    title: '太空知识问答',
    description: '回答关于太阳系的10个问题',
    courseId: 'course-1',
    studentId: 'student-2',
    teacherId: 'teacher-1',
    status: 'in_progress',
    dueDate: '2024-01-12T23:59:59Z',
    createdAt: '2024-01-06T00:00:00Z',
  },
];

export const mockLearningRecords: LearningRecord[] = [
  {
    id: 'lr-1',
    studentId: 'student-1',
    activityType: 'scene_creation',
    activityId: 'scene-1',
    duration: 30,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'lr-2',
    studentId: 'student-1',
    activityType: 'character_creation',
    activityId: 'char-1',
    duration: 20,
    createdAt: '2024-01-02T01:00:00Z',
  },
];

export const mockEmotionRecords: EmotionRecord[] = [
  {
    id: 'er-1',
    studentId: 'student-1',
    emotion: 'happy',
    intensity: 8,
    context: '完成了场景创作',
    createdAt: '2024-01-02T01:30:00Z',
  },
  {
    id: 'er-2',
    studentId: 'student-2',
    emotion: 'anxious',
    intensity: 6,
    context: '作业有点难',
    createdAt: '2024-01-07T10:00:00Z',
  },
];

export const mockCounselingSessions: CounselingSession[] = [
  {
    id: 'cs-1',
    studentId: 'student-2',
    characterId: 'char-3',
    messages: [
      {
        id: 'msg-1',
        role: 'student',
        content: '我感觉作业有点难，有点担心',
        timestamp: '2024-01-07T10:00:00Z',
      },
      {
        id: 'msg-2',
        role: 'counselor',
        content: '我理解你的担心。每个人学习时都会遇到困难，这很正常。我们可以一起看看具体哪里有问题。',
        timestamp: '2024-01-07T10:01:00Z',
      },
    ],
    emotionRecords: [mockEmotionRecords[1]],
    createdAt: '2024-01-07T10:00:00Z',
    updatedAt: '2024-01-07T10:05:00Z',
  },
];

export const mockAnalytics: Analytics = {
  studentId: 'student-1',
  totalLearningTime: 150, // 分钟
  sceneCount: 2,
  characterCount: 3,
  homeworkCompletionRate: 0.85,
  averageGrade: 92,
  emotionTrend: [
    { date: '2024-01-01', averageIntensity: 7, dominantEmotion: 'happy' },
    { date: '2024-01-02', averageIntensity: 8, dominantEmotion: 'excited' },
    { date: '2024-01-03', averageIntensity: 6, dominantEmotion: 'calm' },
  ],
  activityDistribution: [
    { type: 'scene_creation', count: 5, percentage: 30 },
    { type: 'character_creation', count: 8, percentage: 48 },
    { type: 'ai_conversation', count: 3, percentage: 18 },
    { type: 'homework', count: 1, percentage: 4 },
  ],
};