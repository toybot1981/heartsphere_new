import { request } from '../request';

export interface ScriptInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  script: string;
  type: string;
  timeout?: number;
  requires?: string[];
  parameters?: ScriptParameter[];
  permissions?: string[];
  environments?: string[];
  confirmRequired?: boolean;
  riskLevel?: string;
}

export interface ScriptParameter {
  name: string;
  type: string;
  defaultValue?: any;
  required?: boolean;
  description?: string;
  values?: string[];
}

export interface ScriptExecutionRequest {
  scriptId: string;
  parameters?: Record<string, any>;
}

export interface ScriptExecutionResponse {
  id: number;
  scriptId: string;
  scriptName: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  finishedAt?: string;
  durationSeconds?: number;
  exitCode?: number;
  error?: string;
}

export interface DevOpsStatistics {
  totalExecutions: number;
  successExecutions: number;
  failedExecutions: number;
  runningExecutions: number;
  runningTasks: RunningTaskInfo[];
}

export interface RunningTaskInfo {
    executionId: number;
    scriptName: string;
    status: string;
}

// ==================== 部署流程相关接口 ====================

export interface DeploymentPipeline {
    id?: number;
    name: string;
    description?: string;
    environment: string;
    project?: string; // main, admin, company, edu, mentis, shared, 或 "" 表示通用
    isTemplate?: boolean;
    createdById?: number;
    createdByUsername?: string;
    steps?: PipelineStep[];
    createdAt?: string;
    updatedAt?: string;
}

export interface PipelineStep {
    id?: number;
    pipelineId?: number;
    name: string;
    scriptId: string;
    scriptName?: string;
    order: number;
    dependsOn?: number[];
    parameters?: Record<string, any>;
    condition?: string;
    parallel?: boolean;
    required?: boolean;
}

export interface PipelineExecution {
    id: number;
    pipelineId: number;
    pipelineName?: string;
    status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    startedAt: string;
    finishedAt?: string;
    executedById?: number;
    executedByUsername?: string;
    stepExecutions?: PipelineStepExecution[];
    durationSeconds?: number;
    totalSteps?: number;
    completedSteps?: number;
    successSteps?: number;
    failedSteps?: number;
}

export interface PipelineStepExecution {
    id: number;
    pipelineExecutionId: number;
    stepId: number;
    stepName?: string;
    scriptId?: string;
    scriptName?: string;
    scriptExecutionId?: number;
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'CANCELLED';
    startedAt?: string;
    finishedAt?: string;
    error?: string;
    durationSeconds?: number;
}

export interface PipelineExecutionRequest {
    pipelineId: number;
    parameters?: Record<string, any>;
    skipSteps?: number[];
}

/**
 * DevOps 工作台 API
 */
export const adminDevOpsApi = {
  /**
   * 获取脚本列表
   */
  getScripts: async (token: string, category?: string): Promise<ScriptInfo[]> => {
    const url = category 
      ? `/devops/scripts?category=${category}`
      : '/devops/scripts';
    return request<ScriptInfo[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取脚本详情
   */
  getScript: async (token: string, scriptId: string): Promise<ScriptInfo> => {
    return request<ScriptInfo>(`/devops/scripts/${scriptId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 执行脚本
   */
  executeScript: async (
    token: string,
    scriptId: string,
    parameters?: Record<string, any>
  ): Promise<ScriptExecutionResponse> => {
    return request<ScriptExecutionResponse>(
      `/devops/scripts/${scriptId}/execute`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters || {}),
      }
    );
  },

  /**
   * 获取执行状态
   */
  getExecutionStatus: async (
    token: string,
    executionId: number
  ): Promise<ScriptExecutionResponse> => {
    return request<ScriptExecutionResponse>(
      `/devops/executions/${executionId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 获取执行历史
   */
  getExecutionHistory: async (
    token: string,
    page: number = 0,
    size: number = 20,
    filters?: {
      scriptId?: string;
      status?: string;
      executedById?: number;
      startTime?: string;
      endTime?: string;
    }
  ): Promise<{
    content: ScriptExecutionResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> => {
    let url = `/devops/executions?page=${page}&size=${size}`;
    if (filters) {
      if (filters.scriptId) url += `&scriptId=${encodeURIComponent(filters.scriptId)}`;
      if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.executedById) url += `&executedById=${filters.executedById}`;
      if (filters.startTime) url += `&startTime=${encodeURIComponent(filters.startTime)}`;
      if (filters.endTime) url += `&endTime=${encodeURIComponent(filters.endTime)}`;
    }
    return request(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取统计数据
   */
  getStatistics: async (token: string): Promise<DevOpsStatistics> => {
    return request<DevOpsStatistics>('/devops/statistics', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取执行详情（包含日志内容）
   */
  getExecutionDetail: async (
    token: string,
    executionId: number
  ): Promise<ScriptExecutionDetail> => {
    return request<ScriptExecutionDetail>(
      `/devops/executions/${executionId}/detail`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 取消执行
   */
  cancelExecution: async (
    token: string,
    executionId: number
  ): Promise<{ message: string }> => {
    return request<{ message: string }>(
      `/devops/executions/${executionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 获取所有定时任务
   */
  getScheduledTasks: async (token: string): Promise<ScheduledTask[]> => {
    return request<ScheduledTask[]>('/devops/scheduled-tasks', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取定时任务详情
   */
  getScheduledTask: async (
    token: string,
    taskId: number
  ): Promise<ScheduledTask> => {
    return request<ScheduledTask>(`/devops/scheduled-tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建定时任务
   */
  createScheduledTask: async (
    token: string,
    task: ScheduledTask
  ): Promise<ScheduledTask> => {
    return request<ScheduledTask>('/devops/scheduled-tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
  },

  /**
   * 更新定时任务
   */
  updateScheduledTask: async (
    token: string,
    taskId: number,
    task: ScheduledTask
  ): Promise<ScheduledTask> => {
    return request<ScheduledTask>(`/devops/scheduled-tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
  },

  /**
   * 删除定时任务
   */
  deleteScheduledTask: async (
    token: string,
    taskId: number
  ): Promise<{ message: string }> => {
    return request<{ message: string }>(
      `/devops/scheduled-tasks/${taskId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 启用定时任务
   */
  enableScheduledTask: async (
    token: string,
    taskId: number
  ): Promise<ScheduledTask> => {
    return request<ScheduledTask>(
      `/devops/scheduled-tasks/${taskId}/enable`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 禁用定时任务
   */
  disableScheduledTask: async (
    token: string,
    taskId: number
  ): Promise<ScheduledTask> => {
    return request<ScheduledTask>(
      `/devops/scheduled-tasks/${taskId}/disable`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },

  // ==================== 部署流程 API ====================

  /**
   * 获取所有流程模板
   */
  getPipelines: async (token: string, options?: { environment?: string; project?: string }): Promise<DeploymentPipeline[]> => {
    let url = '/devops/pipelines';
    const params = new URLSearchParams();
    if (options?.environment) {
      params.append('environment', options.environment);
    }
    if (options?.project) {
      params.append('project', options.project);
    }
    if (params.toString()) {
      url += '?' + params.toString();
    }
    return request<DeploymentPipeline[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取所有项目列表
   */
  getProjects: async (token: string): Promise<string[]> => {
    return request<string[]>('/devops/pipelines/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取流程模板详情
   */
  getPipeline: async (token: string, pipelineId: number): Promise<DeploymentPipeline> => {
    return request<DeploymentPipeline>(`/devops/pipelines/${pipelineId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建流程模板
   */
  createPipeline: async (token: string, pipeline: DeploymentPipeline): Promise<DeploymentPipeline> => {
    return request<DeploymentPipeline>('/devops/pipelines', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: pipeline,
    });
  },

  /**
   * 更新流程模板
   */
  updatePipeline: async (token: string, pipelineId: number, pipeline: DeploymentPipeline): Promise<DeploymentPipeline> => {
    return request<DeploymentPipeline>(`/devops/pipelines/${pipelineId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: pipeline,
    });
  },

  /**
   * 删除流程模板
   */
  deletePipeline: async (token: string, pipelineId: number): Promise<void> => {
    return request<void>(`/devops/pipelines/${pipelineId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 执行流程
   * 注意：后端返回 PipelineExecutionResponse，包含 executionId 字段
   */
  executePipeline: async (token: string, executionRequest: PipelineExecutionRequest): Promise<{ executionId: number; status: string; message?: string }> => {
    return request<{ executionId: number; status: string; message?: string }>(`/devops/pipelines/${executionRequest.pipelineId}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(executionRequest),
    });
  },

  /**
   * 获取流程执行状态
   */
  getPipelineExecutionStatus: async (token: string, executionId: number): Promise<PipelineExecution> => {
    console.log('[API] getPipelineExecutionStatus 请求:', { executionId });
    try {
      const response = await request<PipelineExecution>(`/devops/pipelines/executions/${executionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('[API] getPipelineExecutionStatus 响应:', {
        id: response.id,
        status: response.status,
        stepExecutions: response.stepExecutions,
        stepExecutionsLength: response.stepExecutions?.length,
        totalSteps: response.totalSteps,
        completedSteps: response.completedSteps,
        rawResponse: response,
      });
      if (response.stepExecutions) {
        console.log('[API] stepExecutions 详情:', response.stepExecutions);
      } else {
        console.warn('[API] ⚠️ stepExecutions 为空或未定义');
      }
      return response;
    } catch (error) {
      console.error('[API] getPipelineExecutionStatus 错误:', error);
      throw error;
    }
  },

  /**
   * 获取流程执行详情
   */
  getPipelineExecutionDetail: async (token: string, executionId: number): Promise<PipelineExecution> => {
    console.log('[API] getPipelineExecutionDetail 请求:', { executionId });
    try {
      const response = await request<PipelineExecution>(`/devops/pipelines/executions/${executionId}/detail`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('[API] getPipelineExecutionDetail 响应:', {
        id: response.id,
        status: response.status,
        stepExecutions: response.stepExecutions,
        stepExecutionsLength: response.stepExecutions?.length,
        rawResponse: response,
      });
      return response;
    } catch (error) {
      console.error('[API] getPipelineExecutionDetail 错误:', error);
      throw error;
    }
  },

  /**
   * 取消流程执行
   */
  cancelPipelineExecution: async (token: string, executionId: number): Promise<void> => {
    return request<void>(`/devops/pipelines/executions/${executionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取流程执行历史
   */
  getPipelineExecutionHistory: async (
    token: string,
    page: number = 0,
    size: number = 20,
    pipelineId?: number,
    executedById?: number
  ): Promise<{ content: PipelineExecution[]; totalElements: number; totalPages: number }> => {
    let url = `/devops/pipelines/executions?page=${page}&size=${size}`;
    if (pipelineId) url += `&pipelineId=${pipelineId}`;
    if (executedById) url += `&executedById=${executedById}`;
    
    return request<{ content: PipelineExecution[]; totalElements: number; totalPages: number }>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // ==================== 环境变量 API ====================

  /**
   * 获取所有环境变量
   */
  getAllEnvironmentVariables: async (token: string, environment?: string): Promise<EnvironmentVariable[]> => {
    let url = '/devops/environment-variables';
    if (environment) url += `?environment=${environment}`;
    return request<EnvironmentVariable[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取环境变量详情
   */
  getEnvironmentVariable: async (token: string, id: number, showValue: boolean = false): Promise<EnvironmentVariable> => {
    return request<EnvironmentVariable>(`/devops/environment-variables/${id}?showValue=${showValue}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建环境变量
   */
  createEnvironmentVariable: async (token: string, variable: EnvironmentVariable): Promise<EnvironmentVariable> => {
    return request<EnvironmentVariable>('/devops/environment-variables', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variable),
    });
  },

  /**
   * 更新环境变量
   */
  updateEnvironmentVariable: async (token: string, id: number, variable: EnvironmentVariable): Promise<EnvironmentVariable> => {
    return request<EnvironmentVariable>(`/devops/environment-variables/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variable),
    });
  },

  /**
   * 删除环境变量
   */
  deleteEnvironmentVariable: async (token: string, id: number): Promise<void> => {
    return request<void>(`/devops/environment-variables/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 解析环境变量（用于脚本执行）
   */
  resolveEnvironmentVariables: async (
    token: string,
    project?: string,
    module?: string,
    pipelineId?: number,
    environment?: string
  ): Promise<Record<string, string>> => {
    let url = '/devops/environment-variables/resolve?';
    const params: string[] = [];
    if (project) params.push(`project=${project}`);
    if (module) params.push(`module=${module}`);
    if (pipelineId) params.push(`pipelineId=${pipelineId}`);
    if (environment) params.push(`environment=${environment}`);
    url += params.join('&');
    
    return request<Record<string, string>>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // ==================== 远程服务器 API ====================

  /**
   * 获取所有远程服务器
   */
  getAllRemoteServers: async (token: string): Promise<RemoteServer[]> => {
    return request<RemoteServer[]>('/devops/remote-servers', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取启用的远程服务器
   */
  getEnabledRemoteServers: async (token: string): Promise<RemoteServer[]> => {
    return request<RemoteServer[]>('/devops/remote-servers/enabled', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取远程服务器详情
   */
  getRemoteServer: async (token: string, id: number): Promise<RemoteServer> => {
    return request<RemoteServer>(`/devops/remote-servers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建远程服务器
   */
  createRemoteServer: async (token: string, server: RemoteServer): Promise<RemoteServer> => {
    return request<RemoteServer>('/devops/remote-servers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });
  },

  /**
   * 更新远程服务器
   */
  updateRemoteServer: async (token: string, id: number, server: RemoteServer): Promise<RemoteServer> => {
    return request<RemoteServer>(`/devops/remote-servers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });
  },

  /**
   * 设置 SSH 密钥
   */
  setRemoteServerSshKey: async (token: string, id: number, privateKey: string, passphrase?: string): Promise<void> => {
    return request<void>(`/devops/remote-servers/${id}/ssh-key`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ privateKey, passphrase }),
    });
  },

  /**
   * 测试服务器连接
   */
  testRemoteServerConnection: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/devops/remote-servers/${id}/test-connection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 删除远程服务器
   */
  deleteRemoteServer: async (token: string, id: number): Promise<void> => {
    return request<void>(`/devops/remote-servers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// ==================== 远程服务器相关接口 ====================

export interface RemoteServer {
  id?: number;
  name: string;
  description?: string;
  host: string;
  port: number;
  username: string;
  deployPath?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastConnectionTest?: string;
  lastConnectionResult?: string;
}

export interface ScriptExecutionDetail extends ScriptExecutionResponse {
  parameters?: string;
  logContent?: string;
}

export interface ScheduledTask {
  id?: number;
  name: string;
  scriptId: string;
  scriptName?: string;
  cronExpression: string;
  enabled?: boolean;
  parameters?: string;
  lastExecutedAt?: string;
  nextExecutionTime?: string;
  executionCount?: number;
  successCount?: number;
  failureCount?: number;
}

// ==================== 部署流程相关接口 ====================

export interface DeploymentPipeline {
  id?: number;
  name: string;
  description?: string;
  environment: string;
  isTemplate?: boolean;
  createdById?: number;
  createdByUsername?: string;
  steps?: PipelineStep[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineStep {
  id?: number;
  pipelineId?: number;
  name: string;
  scriptId: string;
  scriptName?: string;
  order: number;
  dependsOn?: number[];
  parameters?: Record<string, any>;
  condition?: string;
  parallel?: boolean;
  required?: boolean;
}

export interface PipelineExecution {
  id: number;
  pipelineId: number;
  pipelineName?: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  finishedAt?: string;
  executedById?: number;
  executedByUsername?: string;
  stepExecutions?: PipelineStepExecution[];
  durationSeconds?: number;
  totalSteps?: number;
  completedSteps?: number;
  successSteps?: number;
  failedSteps?: number;
}

export interface PipelineStepExecution {
  id: number;
  pipelineExecutionId: number;
  stepId: number;
  stepName?: string;
  scriptId?: string;
  scriptName?: string;
  scriptExecutionId?: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'CANCELLED';
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  durationSeconds?: number;
}

export interface PipelineExecutionRequest {
  pipelineId: number;
  parameters?: Record<string, any>;
  skipSteps?: number[];
  environmentVariables?: Record<string, string>;
}
