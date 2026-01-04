/**
 * Graph执行日志类型定义
 */

export interface ExecutionLogDTO {
  id: number;
  executionId: string;
  graphId: number;
  nodeId: string;
  nodeType: string;
  logType: string;
  message: string;
  stateSnapshot?: Record<string, any>;
  errorMessage?: string;
  executionTimeMs?: number;
  stepNumber?: number;
  createdAt: string;
}

export interface ExecutionLogListResponse {
  logs: ExecutionLogDTO[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

 * Graph执行日志类型定义
 */

export interface ExecutionLogDTO {
  id: number;
  executionId: string;
  graphId: number;
  nodeId: string;
  nodeType: string;
  logType: string;
  message: string;
  stateSnapshot?: Record<string, any>;
  errorMessage?: string;
  executionTimeMs?: number;
  stepNumber?: number;
  createdAt: string;
}

export interface ExecutionLogListResponse {
  logs: ExecutionLogDTO[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
