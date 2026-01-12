// Graph执行相关的TypeScript类型定义

/**
 * Graph执行请求
 */
export interface GraphExecutionRequest {
  initialState?: Record<string, any>;
}

/**
 * Graph执行DTO
 */
export interface GraphExecutionDTO {
  id: number;
  executionId: string;
  graphId: number;
  status: 'RUNNING' | 'WAITING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  currentNodeId?: string;
  waitType?: 'CHOICE' | 'WAIT' | 'USER_INPUT';
  waitingNodeId?: string;
  stepCount?: number;
  state?: Record<string, any>;
  contextData?: Record<string, any>;
  errorMessage?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Graph执行选择请求（用于ChoiceNode）
 */
export interface GraphExecutionChoiceRequest {
  choiceId?: string;  // 兼容旧版本
  optionId?: string;  // 选项ID（新版本）
  choiceValue?: any;
  additionalData?: Record<string, any>;
}
