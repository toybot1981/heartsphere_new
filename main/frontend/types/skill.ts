/**
 * 技能系统相关的 TypeScript 类型定义
 */

/**
 * 技能执行记录
 */
export interface SkillExecutionRecord {
  id: number;
  conversationId: number;
  skillId: number;
  skillName?: string;
  userId: number;
  roleId?: number;
  
  // 评估信息
  evaluationContext?: any;
  evaluationTimestamp?: string;
  keywordMatches?: string[];
  semanticScore?: number;
  contextScore?: number;
  memoryScore?: number;
  compositeScore?: number;
  
  // 决策信息
  decision: 'APPLIED' | 'REJECTED';
  rejectionReason?: string;
  
  // 执行信息
  executionParameters?: any;
  executionStatus: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  executionTimestamp?: string;
  executionDurationMs?: number;
  executionResult?: any;
  errorMessage?: string;
  resourceUsage?: any;
  
  // 关联信息
  relatedMemoryIds?: number[];
  relatedConversationTurnId?: number;
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
}

/**
 * 技能应用结果
 */
export interface SkillApplicationResult {
  appliedSkills: Array<{
    skillId: number;
    skillName: string;
    score: number;
  }>;
  rejectedSkills: Array<{
    skillId: number;
    skillName: string;
    reason: string;
  }>;
  errors: Array<{
    skillName: string;
    message: string;
  }>;
}

/**
 * 技能统计信息
 */
export interface SkillStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageScore: number;
  skillUsageCount: Record<number, number>;
  topSkills: Array<{
    skillId: number;
    skillName: string;
    count: number;
  }>;
}

/**
 * 技能调试信息
 */
export interface SkillDebugInfo {
  records: SkillExecutionRecord[];
  statistics?: SkillStatistics;
  lastUpdate?: string;
}
