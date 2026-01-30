/**
 * 记忆类型映射工具
 * 建立 hsmem memory_type 与 Backend MemoryType 的映射关系
 */

import { MemoryType } from '../types/MemoryTypes';

/**
 * hsmem memory_type 到 Backend MemoryType 的映射
 */
export const HSMEM_TO_BACKEND_TYPE_MAP: Record<string, MemoryType> = {
  'preference': MemoryType.PREFERENCE,
  'habit': MemoryType.HABIT,
  'personal_info': MemoryType.PERSONAL_INFO,
  'text_memory': MemoryType.CONVERSATION_TOPIC,
  'document': MemoryType.CREATED_CONTENT,
  'general': MemoryType.CONVERSATION_TOPIC,
  // 扩展类型
  'event': MemoryType.IMPORTANT_MOMENT,
  'asset': MemoryType.PERSONAL_INFO,
  'work': MemoryType.CONVERSATION_TOPIC,
};

/**
 * Backend MemoryType 到 hsmem memory_type 的映射
 */
export const BACKEND_TO_HSMEM_TYPE_MAP: Record<MemoryType, string> = {
  [MemoryType.PERSONAL_INFO]: 'personal_info',
  [MemoryType.PREFERENCE]: 'preference',
  [MemoryType.HABIT]: 'habit',
  [MemoryType.PERSONALITY]: 'personal_info',
  [MemoryType.IMPORTANT_MOMENT]: 'event',
  [MemoryType.EMOTIONAL_EXPERIENCE]: 'event',
  [MemoryType.EMOTION_PATTERN]: 'preference',
  [MemoryType.EMOTIONAL_PREFERENCE]: 'preference',
  [MemoryType.FREQUENT_CHARACTER]: 'general',
  [MemoryType.CONVERSATION_TOPIC]: 'text_memory',
  [MemoryType.INTERACTION_PREFERENCE]: 'preference',
  [MemoryType.CONVERSATION_STYLE]: 'preference',
  [MemoryType.CREATED_CONTENT]: 'document',
  [MemoryType.FOCUSED_CONTENT]: 'document',
  [MemoryType.FAVORITED_CONTENT]: 'document',
  [MemoryType.SHARED_CONTENT]: 'document',
  [MemoryType.GROWTH_TRAJECTORY]: 'general',
  [MemoryType.MILESTONE]: 'event',
  [MemoryType.ACHIEVEMENT]: 'event',
  [MemoryType.REFLECTION]: 'text_memory',
};

/**
 * 将 hsmem memory_type 转换为 Backend MemoryType
 */
export function mapHSMemToBackendType(hsmemType: string): MemoryType {
  return HSMEM_TO_BACKEND_TYPE_MAP[hsmemType] || MemoryType.CONVERSATION_TOPIC;
}

/**
 * 将 Backend MemoryType 转换为 hsmem memory_type
 */
export function mapBackendToHSMemType(backendType: MemoryType): string {
  return BACKEND_TO_HSMEM_TYPE_MAP[backendType] || 'general';
}

/**
 * 识别记忆类型（基于关键词）
 */
export function identifyMemoryType(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Event 关键词
  if (/\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(text) || 
      /今天|昨天|明天|上周|下周|去年|今年/.test(lowerText) ||
      /事件|里程碑|纪念日|生日|节日/.test(lowerText)) {
    return 'event';
  }
  
  // Habit 关键词
  if (/每天|经常|总是|习惯|usually|always|every day|regularly/.test(lowerText)) {
    return 'habit';
  }
  
  // Preference 关键词
  if (/喜欢|爱|偏好|prefer|like|love|favorite|讨厌|不喜欢/.test(lowerText)) {
    return 'preference';
  }
  
  // Asset 关键词
  if (/资产|财产|拥有|购买|房子|车|股票|投资/.test(lowerText)) {
    return 'asset';
  }
  
  // Work 关键词
  if (/工作|职业|公司|同事|项目|任务|职位|薪资/.test(lowerText)) {
    return 'work';
  }
  
  // Personal Info 关键词
  if (/我叫|我是|年龄|岁|住在|来自|职业是/.test(lowerText)) {
    return 'personal_info';
  }
  
  return 'general';
}
