// 心域连接管理API
import { request } from '../base/request';

/**
 * 共享配置DTO
 */
export interface HeartSphereShareConfigDTO {
  id: number;
  userId: number;
  username?: string;
  userEmail?: string;
  shareType: string; // ALL/WORLD/ERA
  accessType: string; // APPROVAL/FREE
  shareCode: string;
  qrCodeUrl?: string;
  status: string; // ACTIVE/DISABLED/PAUSED
  shareScopes?: ShareScopeDTO[];
  accessCount?: number;
  visitorCount?: number;
  connectionRequestCount?: number;
  approvedRequestCount?: number;
  createdAt?: string;
  updatedAt?: string;
  lastAccessedAt?: string;
}

export interface ShareScopeDTO {
  worldId?: number;
  worldName?: string;
  eraId?: number;
  eraName?: string;
}

/**
 * 连接请求DTO
 */
export interface ConnectionRequestDTO {
  id: number;
  requesterId: number;
  requesterUsername?: string;
  requesterEmail?: string;
  targetUserId?: number;
  targetUsername?: string;
  targetUserEmail?: string;
  shareConfigId?: number;
  shareCode?: string;
  status: string; // PENDING/APPROVED/REJECTED/CANCELLED
  message?: string;
  requestTime?: string;
  processedTime?: string;
  processedBy?: string;
  connectionId?: number;
}

/**
 * 访问记录DTO
 */
export interface AccessRecordDTO {
  id: number;
  visitorId: number;
  visitorUsername?: string;
  visitorEmail?: string;
  ownerId: number;
  ownerUsername?: string;
  ownerEmail?: string;
  connectionId?: number;
  accessType: string; // EXPERIENCE/NORMAL
  accessTime?: string;
  durationSeconds?: number;
  conversationRounds?: number;
  accessedErasCount?: number;
  shareConfigId?: number;
}

/**
 * 暖心留言DTO
 */
export interface WarmMessageDTO {
  id: number;
  senderId: number;
  senderUsername?: string;
  senderEmail?: string;
  receiverId?: number;
  receiverUsername?: string;
  receiverEmail?: string;
  messageType: string; // WARM_MESSAGE/REPLY
  content: string;
  status: string; // PENDING/APPROVED/REJECTED/DELETED
  createdAt?: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewReason?: string;
  connectionId?: number;
  accessRecordId?: number;
  replyToId?: number;
  replyCount?: number;
}

/**
 * 统计数据DTO
 */
export interface HeartSphereConnectionStatisticsDTO {
  totalShareUsers?: number;
  totalConnectionUsers?: number;
  totalAccessUsers?: number;
  activeShareUsers?: number;
  totalShareConfigs?: number;
  activeShareConfigs?: number;
  shareTypeDistribution?: Record<string, number>;
  accessTypeDistribution?: Record<string, number>;
  totalConnectionRequests?: number;
  approvedRequests?: number;
  rejectedRequests?: number;
  pendingRequests?: number;
  connectionSuccessRate?: number;
  totalAccessCount?: number;
  totalAccessDuration?: number;
  averageAccessDuration?: number;
  uniqueVisitors?: number;
  totalMessages?: number;
  approvedMessages?: number;
  rejectedMessages?: number;
  messageTypeDistribution?: Record<string, number>;
  replyRate?: number;
  dailyTrend?: Record<string, number>;
  weeklyTrend?: Record<string, number>;
  monthlyTrend?: Record<string, number>;
}

/**
 * 异常处理记录DTO
 */
export interface ExceptionHandlingRecordDTO {
  id: number;
  exceptionType: string;
  exceptionContent: string;
  relatedUserId?: number;
  relatedDataId?: number;
  severity: string; // HIGH/MEDIUM/LOW
  status: string; // PENDING/PROCESSING/RESOLVED
  handlerId?: number;
  handlerName?: string;
  handleResult?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 投诉DTO
 */
export interface ComplaintDTO {
  id: number;
  userId: number;
  username?: string;
  userEmail?: string;
  complaintType: string;
  complaintContent: string;
  status: string; // PENDING/PROCESSING/RESOLVED
  handlerId?: number;
  handlerName?: string;
  handleResult?: string;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  content: T[];
  total: number;
  page: number;
  size: number;
}

/**
 * 心域连接管理API
 */
export const adminHeartSphereConnectionApi = {
  // ========== 共享配置管理 ==========
  
  /**
   * 获取共享配置列表
   */
  getShareConfigs: async (
    token: string,
    params?: {
      userId?: number;
      shareType?: string;
      status?: string;
      search?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<HeartSphereShareConfigDTO>> => {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.shareType) queryParams.append('shareType', params.shareType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    // 后端直接返回 Map 格式：{ content: [...], total: number, page: number, size: number }
    const pageData = await request<{
      content: HeartSphereShareConfigDTO[];
      total: number;
      page: number;
      size: number;
    }>(
      `/admin/heartsphere-connection/share-configs?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // 转换 Spring Data Page 格式到前端 PageResponse 格式
    return {
      content: pageData.content || [],
      total: pageData.total || 0,
      page: pageData.page || 0,
      size: pageData.size || 20,
    };
  },

  /**
   * 获取共享配置详情
   */
  getShareConfigDetail: async (id: number, token: string): Promise<HeartSphereShareConfigDTO> => {
    // 后端直接返回 DTO，不是包装格式
    return request<HeartSphereShareConfigDTO>(
      `/admin/heartsphere-connection/share-configs/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 禁用共享配置
   */
  disableShareConfig: async (id: number, reason?: string, token?: string): Promise<{ success: boolean }> => {
    const response = await request<{ success: boolean; data?: any; message?: string }>(
      `/admin/heartsphere-connection/share-configs/${id}/disable`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.success) {
      throw new Error(response.message || '禁用共享配置失败');
    }
    
    return { success: true };
  },

  /**
   * 启用共享配置
   */
  enableShareConfig: async (id: number, token: string): Promise<{ success: boolean }> => {
    const response = await request<{ success: boolean; data?: any; message?: string }>(
      `/admin/heartsphere-connection/share-configs/${id}/enable`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.success) {
      throw new Error(response.message || '启用共享配置失败');
    }
    
    return { success: true };
  },

  /**
   * 暂停共享配置
   */
  pauseShareConfig: (id: number, reason?: string, token?: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      `/admin/heartsphere-connection/share-configs/${id}/pause`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 删除共享配置
   */
  deleteShareConfig: (id: number, reason?: string, token?: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      `/admin/heartsphere-connection/share-configs/${id}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 批量禁用共享配置
   */
  batchDisableShareConfigs: (
    configIds: number[],
    reason?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      '/admin/heartsphere-connection/share-configs/batch-disable',
      {
        method: 'POST',
        body: JSON.stringify({ configIds, reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 批量删除共享配置
   */
  batchDeleteShareConfigs: (
    configIds: number[],
    reason?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      '/admin/heartsphere-connection/share-configs/batch-delete',
      {
        method: 'POST',
        body: JSON.stringify({ configIds, reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  // ========== 连接请求管理 ==========

  /**
   * 获取连接请求列表
   */
  getConnectionRequests: async (
    token: string,
    params?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      requesterId?: number;
      targetUserId?: number;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<ConnectionRequestDTO>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.requesterId) queryParams.append('requesterId', params.requesterId.toString());
    if (params?.targetUserId) queryParams.append('targetUserId', params.targetUserId.toString());
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    // 后端直接返回 Map 格式：{ requests: [...], total: number, page: number, size: number }
    const pageData = await request<{
      requests: ConnectionRequestDTO[];
      total: number;
      page: number;
      size: number;
    }>(
      `/admin/heartsphere-connection/connection-requests?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      content: pageData.requests || [],
      total: pageData.total || 0,
      page: pageData.page || 0,
      size: pageData.size || 20,
    };
  },

  /**
   * 获取连接请求详情
   */
  getConnectionRequestDetail: async (id: number, token: string): Promise<ConnectionRequestDTO> => {
    // 后端直接返回 DTO，不是包装格式
    return request<ConnectionRequestDTO>(
      `/admin/heartsphere-connection/connection-requests/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 审核通过连接请求
   */
  approveConnectionRequest: (
    id: number,
    adminNote?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      `/admin/heartsphere-connection/connection-requests/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ adminNote }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 拒绝连接请求
   */
  rejectConnectionRequest: (
    id: number,
    reason: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      `/admin/heartsphere-connection/connection-requests/${id}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 批量审核连接请求
   */
  batchApproveConnectionRequests: (
    requestIds: number[],
    adminNote?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      '/admin/heartsphere-connection/connection-requests/batch-approve',
      {
        method: 'POST',
        body: JSON.stringify({ requestIds, adminNote }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 批量拒绝连接请求
   */
  batchRejectConnectionRequests: (
    requestIds: number[],
    reason: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      '/admin/heartsphere-connection/connection-requests/batch-reject',
      {
        method: 'POST',
        body: JSON.stringify({ requestIds, reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  // ========== 访问记录管理 ==========

  /**
   * 获取访问记录列表
   */
  getAccessRecords: async (
    token: string,
    params?: {
      visitorId?: number;
      ownerId?: number;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<AccessRecordDTO>> => {
    const queryParams = new URLSearchParams();
    if (params?.visitorId) queryParams.append('visitorId', params.visitorId.toString());
    if (params?.ownerId) queryParams.append('ownerId', params.ownerId.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    // 后端直接返回 Map 格式：{ records: [...], total: number, page: number, size: number }
    const pageData = await request<{
      records: AccessRecordDTO[];
      total: number;
      page: number;
      size: number;
    }>(
      `/admin/heartsphere-connection/access-records?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      content: pageData.records || [],
      total: pageData.total || 0,
      page: pageData.page || 0,
      size: pageData.size || 20,
    };
  },

  /**
   * 获取访问记录详情
   */
  getAccessRecordDetail: async (id: number, token: string): Promise<AccessRecordDTO> => {
    // 后端直接返回 DTO，不是包装格式
    return request<AccessRecordDTO>(
      `/admin/heartsphere-connection/access-records/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 导出访问记录
   */
  exportAccessRecords: (
    token: string,
    params?: {
      visitorId?: number;
      ownerId?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AccessRecordDTO[]> => {
    const queryParams = new URLSearchParams();
    if (params?.visitorId) queryParams.append('visitorId', params.visitorId.toString());
    if (params?.ownerId) queryParams.append('ownerId', params.ownerId.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    return request<AccessRecordDTO[]>(
      `/admin/heartsphere-connection/access-records/export?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // ========== 留言管理 ==========

  /**
   * 获取留言列表
   */
  getWarmMessages: async (
    token: string,
    params?: {
      senderId?: number;
      receiverId?: number;
      messageType?: string;
      status?: string;
      search?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<WarmMessageDTO>> => {
    const queryParams = new URLSearchParams();
    if (params?.senderId) queryParams.append('senderId', params.senderId.toString());
    if (params?.receiverId) queryParams.append('receiverId', params.receiverId.toString());
    if (params?.messageType) queryParams.append('messageType', params.messageType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    // 后端直接返回 Map 格式：{ messages: [...], total: number, page: number, size: number }
    const pageData = await request<{
      messages: WarmMessageDTO[];
      total: number;
      page: number;
      size: number;
    }>(
      `/admin/heartsphere-connection/warm-messages?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      content: pageData.messages || [],
      total: pageData.total || 0,
      page: pageData.page || 0,
      size: pageData.size || 20,
    };
  },

  /**
   * 获取留言详情
   */
  getWarmMessageDetail: async (id: number, token: string): Promise<WarmMessageDTO> => {
    // 后端直接返回 DTO，不是包装格式
    return request<WarmMessageDTO>(
      `/admin/heartsphere-connection/warm-messages/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 审核留言
   */
  reviewWarmMessage: (
    id: number,
    status: string,
    reason?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      `/admin/heartsphere-connection/warm-messages/${id}/review`,
      {
        method: 'POST',
        body: JSON.stringify({ status, reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 删除留言
   */
  deleteWarmMessage: (id: number, reason?: string, token?: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      `/admin/heartsphere-connection/warm-messages/${id}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 批量审核留言
   */
  batchReviewWarmMessages: (
    messageIds: number[],
    status: string,
    reason?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      '/admin/heartsphere-connection/warm-messages/batch-review',
      {
        method: 'POST',
        body: JSON.stringify({ messageIds, status, reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 批量删除留言
   */
  batchDeleteWarmMessages: (
    messageIds: number[],
    reason?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      '/admin/heartsphere-connection/warm-messages/batch-delete',
      {
        method: 'POST',
        body: JSON.stringify({ messageIds, reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  // ========== 数据统计 ==========

  /**
   * 获取统计数据
   */
  getStatistics: async (
    token: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<HeartSphereConnectionStatisticsDTO> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    // 后端直接返回 DTO，不是包装格式
    return request<HeartSphereConnectionStatisticsDTO>(
      `/admin/heartsphere-connection/statistics?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 获取趋势数据
   */
  getTrendData: (
    token: string,
    period: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Record<string, any>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    return request<Record<string, any>>(
      `/admin/heartsphere-connection/trend-data?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // ========== 异常处理 ==========

  /**
   * 获取异常情况列表
   */
  getExceptionRecords: async (
    token: string,
    params?: {
      exceptionType?: string;
      status?: string;
      severity?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<ExceptionHandlingRecordDTO>> => {
    const queryParams = new URLSearchParams();
    if (params?.exceptionType) queryParams.append('exceptionType', params.exceptionType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    // 后端直接返回 Map 格式：{ records: [...], total: number, page: number, size: number }
    const pageData = await request<{
      records: ExceptionHandlingRecordDTO[];
      total: number;
      page: number;
      size: number;
    }>(
      `/admin/heartsphere-connection/exceptions?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      content: pageData.records || [],
      total: pageData.total || 0,
      page: pageData.page || 0,
      size: pageData.size || 20,
    };
  },

  /**
   * 处理异常情况
   */
  handleException: (
    id: number,
    handleResult: string,
    adminNote?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      `/admin/heartsphere-connection/exceptions/${id}/handle`,
      {
        method: 'POST',
        body: JSON.stringify({ handleResult, adminNote }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 获取投诉列表
   */
  getComplaints: async (
    token: string,
    params?: {
      status?: string;
      userId?: number;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<ComplaintDTO>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    // 后端直接返回 Map 格式：{ complaints: [...], total: number, page: number, size: number }
    const pageData = await request<{
      complaints: ComplaintDTO[];
      total: number;
      page: number;
      size: number;
    }>(
      `/admin/heartsphere-connection/complaints?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      content: pageData.complaints || [],
      total: pageData.total || 0,
      page: pageData.page || 0,
      size: pageData.size || 20,
    };
  },

  /**
   * 处理投诉
   */
  handleComplaint: (
    id: number,
    handleResult: string,
    adminNote?: string,
    token?: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(
      `/admin/heartsphere-connection/complaints/${id}/handle`,
      {
        method: 'POST',
        body: JSON.stringify({ handleResult, adminNote }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },
};


