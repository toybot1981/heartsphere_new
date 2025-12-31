import { request } from '../base/request';

// ========== DTO Types ==========

export interface MemorySystemDashboard {
  systemStatus: string;
  serviceAvailability: number;
  lastUpdatedAt: string;
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  totalMemories: number;
  shortTermMemories: number;
  longTermMemories: number;
  totalExtractions: number;
  totalRetrievals: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  cacheHitRate: number;
  userGrowthTrend?: Record<string, number>;
  usageTrend?: Record<string, number>;
  performanceTrend?: Record<string, number>;
  redisStatus?: {
    connected: boolean;
    usedMemory: number;
    totalMemory: number;
    activeSessions: number;
    totalKeys: number;
  };
  mongoStatus?: {
    connected: boolean;
    totalDocuments: number;
    totalCollections: number;
    databaseSize: number;
  };
}

export interface MemoryConfig {
  id?: number;
  configKey: string;
  configValue: any;
  configType: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UserMemory {
  id: string;
  userId: number;
  username?: string;
  memoryType: string;
  contentPreview: string;
  importance: string;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
}

export interface SessionInfo {
  sessionId: string;
  userId: number;
  username?: string;
  createdAt: string;
  lastActivityAt: string;
  messageCount: number;
  status: string;
  expiresAt?: string;
  durationSeconds?: number;
}

export interface MemoryStatistics {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  activeUsers30d: number;
  newUsersToday: number;
  userRetentionRate: number;
  memoryTypeDistribution: Record<string, number>;
  memoryTypeGrowth: Record<string, number>;
  memoryTypeUsageRate: Record<string, number>;
  totalMemoriesCreated: number;
  totalExtractions: number;
  totalRetrievals: number;
  usageTrend: Record<string, number>;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  errorRate: number;
  cacheHitRate: number;
  redisMemoryUsage: number;
  mongoStorageUsage: number;
  totalStorageUsage: number;
}

export interface UserSearchResult {
  userId: number;
  username: string;
  email: string;
  memoryCount: number;
  lastActivityAt?: string;
}

export interface RedisCacheStats {
  totalKeys: number;
  memoryUsed: number;
  memoryTotal: number;
  keyTypeDistribution: Record<string, number>;
  hitRate: number;
  missRate: number;
}

export interface LongTermMemoryStats {
  totalMemories: number;
  typeCounts: Record<string, number>;
  distribution: Record<string, number>;
  trends: Array<Record<string, any>>;
}

export interface ExtractionTask {
  taskId: string;
  userId: number;
  status: string;
  extractedCount: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ExtractionConfig {
  enableLLMExtraction: boolean;
  enableRuleBasedExtraction: boolean;
  batchSize: number;
  maxRetries: number;
  extractionRules: Record<string, any>;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  errorRate: number;
  totalRequests: number;
  responseTimeTrend: Record<string, number>;
  errorRateTrend: Record<string, number>;
}

// ========== API Methods ==========

export const adminMemoryApi = {
  // 系统概览
  getDashboard: async (token: string): Promise<MemorySystemDashboard> => {
    return request<MemorySystemDashboard>('/admin/memory/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 基础配置管理
  getConfigs: async (token: string, configType?: string, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (configType) params.append('configType', configType);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return request(`/admin/memory/configs?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getConfig: async (token: string, configId: number): Promise<MemoryConfig> => {
    return request<MemoryConfig>(`/admin/memory/config/${configId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  saveConfig: async (token: string, config: MemoryConfig): Promise<MemoryConfig> => {
    return request<MemoryConfig>('/admin/memory/config', {
      method: 'POST',
      body: JSON.stringify(config),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  deleteConfig: async (token: string, configId: number): Promise<void> => {
    await request(`/admin/memory/config/${configId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 用户记忆管理
  searchUsers: async (token: string, keyword?: string, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return request(`/admin/memory/users?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getUserMemories: async (token: string, userId: number, memoryType?: string, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (memoryType) params.append('memoryType', memoryType);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return request(`/admin/memory/user/${userId}/memories?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getMemoryDetail: async (token: string, memoryId: string): Promise<UserMemory> => {
    return request<UserMemory>(`/admin/memory/memory/${memoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deleteMemory: async (token: string, memoryId: string, reason?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);
    await request(`/admin/memory/memory/${memoryId}?${params}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 短时记忆管理
  getSessions: async (
    token: string,
    userId?: number,
    status?: string,
    startDate?: string,
    endDate?: string,
    page = 0,
    size = 20
  ) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return request(`/admin/memory/sessions?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getSessionDetail: async (token: string, sessionId: string): Promise<SessionInfo> => {
    return request<SessionInfo>(`/admin/memory/session/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  terminateSession: async (token: string, sessionId: string, reason?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);
    await request(`/admin/memory/session/${sessionId}/terminate?${params}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  cleanupExpiredSessions: async (token: string): Promise<number> => {
    return request<number>('/admin/memory/sessions/cleanup', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getRedisCacheStats: async (token: string): Promise<RedisCacheStats> => {
    return request<RedisCacheStats>('/admin/memory/cache/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  clearCache: async (token: string, cacheType?: string, pattern?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (cacheType) params.append('cacheType', cacheType);
    if (pattern) params.append('pattern', pattern);
    await request(`/admin/memory/cache/clear?${params}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 长时记忆管理
  getLongTermMemoryStats: async (token: string): Promise<LongTermMemoryStats> => {
    return request<LongTermMemoryStats>('/admin/memory/longterm/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  queryLongTermMemories: async (
    token: string,
    userId?: number,
    memoryType?: string,
    startTime?: string,
    endTime?: string,
    keyword?: string,
    page = 0,
    size = 20
  ) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (memoryType) params.append('memoryType', memoryType);
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    if (keyword) params.append('keyword', keyword);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return request(`/admin/memory/longterm/memories?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getExtractionTasks: async (token: string, userId?: number, status?: string, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return request(`/admin/memory/extraction/tasks?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getExtractionConfig: async (token: string): Promise<ExtractionConfig> => {
    return request<ExtractionConfig>('/admin/memory/extraction/config', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  updateExtractionConfig: async (token: string, config: ExtractionConfig): Promise<void> => {
    await request('/admin/memory/extraction/config', {
      method: 'POST',
      body: JSON.stringify(config),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // 统计分析
  getStatistics: async (token: string, startDate?: string, endDate?: string): Promise<MemoryStatistics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<MemoryStatistics>(`/admin/memory/statistics?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getPerformanceMetrics: async (token: string, startDate?: string, endDate?: string): Promise<PerformanceMetrics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<PerformanceMetrics>(`/admin/memory/performance?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 数据维护
  cleanupData: async (token: string, cleanupType: string, conditions?: Record<string, any>): Promise<number> => {
    return request<number>(`/admin/memory/maintenance/cleanup?cleanupType=${cleanupType}`, {
      method: 'POST',
      body: JSON.stringify(conditions),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  archiveData: async (token: string, archiveType: string, beforeDate: string): Promise<number> => {
    return request<number>(`/admin/memory/maintenance/archive?archiveType=${archiveType}&beforeDate=${beforeDate}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

