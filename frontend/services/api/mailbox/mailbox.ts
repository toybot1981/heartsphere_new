/**
 * 跨时空信箱API服务
 * 
 * @author HeartSphere
 * @version 1.0
 */

import {
  MailboxMessage,
  Conversation,
  ConversationMessage,
  NotificationSettings,
  UnreadCount,
  MessageQueryRequest,
  ConversationQueryRequest,
  CreateMessageRequest,
  SendMessageRequest,
  CreateConversationRequest,
  UpdateNotificationSettingsRequest,
  Page,
} from '../../../types/mailbox';

// 使用统一的API配置
import { getApiUrl } from '../config';

const API_BASE = getApiUrl('/mailbox');

/**
 * 统一的API响应解析函数
 * 处理不同的响应格式（ApiResponse包装、直接返回等）
 */
function parseApiResponse<T>(data: any): T {
  // 如果是ApiResponse格式，提取data字段
  if (data && typeof data === 'object' && 'data' in data) {
    // 检查是否是Page格式（有content字段）
    if ('content' in data.data) {
      return data.data as T;
    }
    return data.data as T;
  }
  // 直接返回
  return data as T;
}

/**
 * 获取消息列表
 */
export async function getMessages(
  query: MessageQueryRequest,
  token: string
): Promise<Page<MailboxMessage>> {
  const params = new URLSearchParams();
  // 注意：category需要转换为后端期望的格式
  if (query.category) {
    // MessageCategory枚举值（如 'ESOUL_LETTER'）需要转换为后端API期望的格式（如 'esoul_letter'）
    const categoryCode = query.category.toLowerCase();
    params.append('category', categoryCode);
    console.log('[mailboxApi] 添加分类参数:', { original: query.category, code: categoryCode });
  }
  if (query.isRead !== undefined) params.append('isRead', String(query.isRead));
  if (query.isImportant !== undefined) params.append('isImportant', String(query.isImportant));
  if (query.isStarred !== undefined) params.append('isStarred', String(query.isStarred));
  if (query.startDate) params.append('startDate', query.startDate);
  if (query.endDate) params.append('endDate', query.endDate);
  if (query.keyword) params.append('keyword', query.keyword);
  if (query.page !== undefined) params.append('page', String(query.page));
  if (query.size !== undefined) params.append('size', String(query.size));
  
  console.log('[mailboxApi] 查询参数:', params.toString());

  const response = await fetch(`${API_BASE}/messages?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('获取消息列表失败:', response.status, errorText.substring(0, 200));
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `获取消息列表失败: ${response.statusText}`);
    } catch {
      throw new Error(`获取消息列表失败: ${response.status} ${response.statusText}`);
    }
  }

  // 检查响应内容类型
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return parseApiResponse<Page<MailboxMessage>>(data);
  } else {
    const text = await response.text();
    console.error('收到非JSON响应:', text.substring(0, 200));
    throw new Error('服务器返回了无效的响应格式');
  }
}

/**
 * 获取消息详情
 */
export async function getMessageById(
  messageId: number,
  token: string
): Promise<MailboxMessage> {
  const response = await fetch(`${API_BASE}/messages/${messageId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`获取消息详情失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<MailboxMessage>(data);
}

/**
 * 标记消息为已读
 */
export async function markMessageAsRead(
  messageId: number,
  token: string
): Promise<MailboxMessage> {
  const response = await fetch(`${API_BASE}/messages/${messageId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`标记已读失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<MailboxMessage>(data);
}

/**
 * 标记/取消标记消息为重要
 */
export async function markMessageAsImportant(
  messageId: number,
  isImportant: boolean,
  token: string
): Promise<MailboxMessage> {
  const response = await fetch(`${API_BASE}/messages/${messageId}/important`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isImportant }),
  });

  if (!response.ok) {
    throw new Error(`标记重要失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<MailboxMessage>(data);
}

/**
 * 收藏/取消收藏消息
 */
export async function markMessageAsStarred(
  messageId: number,
  isStarred: boolean,
  token: string
): Promise<MailboxMessage> {
  const response = await fetch(`${API_BASE}/messages/${messageId}/star`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isStarred }),
  });

  if (!response.ok) {
    throw new Error(`收藏消息失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<MailboxMessage>(data);
}

/**
 * 删除消息
 */
export async function deleteMessage(
  messageId: number,
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`删除消息失败: ${response.statusText}`);
  }
}

/**
 * 批量删除消息
 */
export async function batchDeleteMessages(
  messageIds: number[],
  token: string
): Promise<{ deletedCount: number }> {
  const response = await fetch(`${API_BASE}/messages/batch`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageIds }),
  });

  if (!response.ok) {
    throw new Error(`批量删除失败: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 获取未读消息数量
 */
export async function getUnreadCount(
  token: string
): Promise<UnreadCount> {
  const response = await fetch(`${API_BASE}/messages/unread/count`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('获取未读数量失败:', response.status, errorText.substring(0, 200));
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `获取未读数量失败: ${response.statusText}`);
    } catch {
      throw new Error(`获取未读数量失败: ${response.status} ${response.statusText}`);
    }
  }

  // 检查响应内容类型
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return parseApiResponse<UnreadCount>(data);
  } else {
    // 非JSON响应，可能是HTML错误页面
    const text = await response.text();
    console.error('收到非JSON响应:', text.substring(0, 200));
    throw new Error('服务器返回了无效的响应格式');
  }
}

/**
 * 搜索消息
 */
export async function searchMessages(
  keyword: string,
  query: MessageQueryRequest,
  token: string
): Promise<Page<MailboxMessage>> {
  return getMessages({ ...query, keyword }, token);
}

// ==================== 对话相关 ====================

/**
 * 获取对话列表
 */
export async function getConversations(
  query: ConversationQueryRequest,
  token: string
): Promise<Page<Conversation>> {
  const params = new URLSearchParams();
  if (query.conversationType) params.append('conversationType', query.conversationType);
  if (query.page) params.append('page', String(query.page));
  if (query.size) params.append('size', String(query.size));

  const response = await fetch(`${API_BASE}/conversations?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('获取对话列表失败:', response.status, errorText.substring(0, 200));
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `获取对话列表失败: ${response.statusText}`);
    } catch {
      throw new Error(`获取对话列表失败: ${response.status} ${response.statusText}`);
    }
  }

  // 检查响应内容类型
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return parseApiResponse<Page<Conversation>>(data);
  } else {
    const text = await response.text();
    console.error('收到非JSON响应:', text.substring(0, 200));
    throw new Error('服务器返回了无效的响应格式');
  }
}

/**
 * 获取对话详情
 */
export async function getConversationById(
  conversationId: number,
  token: string
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`获取对话详情失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<Conversation>(data);
}

/**
 * 创建对话
 */
export async function createConversation(
  request: CreateConversationRequest,
  token: string
): Promise<{ conversationId: number; success: boolean }> {
  const response = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`创建对话失败: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 获取对话消息列表
 */
export async function getConversationMessages(
  conversationId: number,
  page: number = 0,
  size: number = 20,
  beforeMessageId?: number,
  token?: string
): Promise<Page<ConversationMessage>> {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  params.append('size', String(size));
  if (beforeMessageId) params.append('beforeMessageId', String(beforeMessageId));

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages?${params.toString()}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`获取对话消息失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<Page<ConversationMessage>>(data);
}

/**
 * 发送对话消息
 */
export async function sendConversationMessage(
  conversationId: number,
  request: SendMessageRequest,
  token: string
): Promise<{ messageId: number; success: boolean }> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`发送消息失败: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 标记对话为已读
 */
export async function markConversationAsRead(
  conversationId: number,
  token: string
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`标记对话已读失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<Conversation>(data);
}

/**
 * 置顶/取消置顶对话
 */
export async function pinConversation(
  conversationId: number,
  pinned: boolean,
  token: string
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/pin`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pinned }),
  });

  if (!response.ok) {
    throw new Error(`置顶对话失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<Conversation>(data);
}

/**
 * 设置对话免打扰
 */
export async function muteConversation(
  conversationId: number,
  muted: boolean,
  token: string
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/mute`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ muted }),
  });

  if (!response.ok) {
    throw new Error(`设置免打扰失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<Conversation>(data);
}

/**
 * 删除对话
 */
export async function deleteConversation(
  conversationId: number,
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`删除对话失败: ${response.statusText}`);
  }
}

// ==================== 提醒设置相关 ====================

/**
 * 获取提醒设置
 */
export async function getNotificationSettings(
  token: string
): Promise<NotificationSettings> {
  const response = await fetch(`${API_BASE}/notification-settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`获取提醒设置失败: ${response.statusText}`);
  }

  const data = await response.json();
  return parseApiResponse<NotificationSettings>(data);
}

/**
 * 更新提醒设置
 */
export async function updateNotificationSettings(
  settings: UpdateNotificationSettingsRequest,
  token: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/notification-settings`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`更新提醒设置失败: ${response.statusText}`);
  }

  return response.json();
}

// ==================== E-SOUL来信相关 ====================

/**
 * 触发E-SOUL来信（测试用）
 */
export async function triggerESoulLetter(
  token: string,
  letterType?: 'GREETING' | 'CARE' | 'SHARE' | 'REMINDER'
): Promise<{ success: boolean; messageId?: number; message?: string }> {
  const params = new URLSearchParams();
  if (letterType) {
    params.append('letterType', letterType);
  }

  const response = await fetch(`${API_BASE}/esoul-letters?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('触发E-SOUL来信失败:', response.status, errorText.substring(0, 200));
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `触发E-SOUL来信失败: ${response.statusText}`);
    } catch {
      throw new Error(`触发E-SOUL来信失败: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  return parseApiResponse<{ success: boolean; messageId?: number; message?: string }>(data);
}

/**
 * 回复E-SOUL来信
 */
export async function replyToESoulLetter(
  messageId: number,
  content: string,
  replyType: 'quick' | 'full' = 'full',
  token: string
): Promise<{ success: boolean; conversationId?: number }> {
  const response = await fetch(`${API_BASE}/esoul-letters/${messageId}/reply`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, replyType }),
  });

  if (!response.ok) {
    throw new Error(`回复来信失败: ${response.statusText}`);
  }

  return response.json();
}

// ==================== 共鸣消息相关 ====================

/**
 * 回复共鸣消息
 */
export async function replyToResonanceMessage(
  messageId: number,
  content: string,
  replyType: 'quick' | 'full' = 'full',
  token: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/resonance-messages/${messageId}/reply`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, replyType }),
  });

  if (!response.ok) {
    throw new Error(`回复共鸣消息失败: ${response.statusText}`);
  }

  return response.json();
}

// ==================== 系统消息相关 ====================

/**
 * 回复系统消息（用于系统对话）
 */
export async function replyToSystemMessage(
  messageId: number,
  content: string,
  token: string
): Promise<{ success: boolean; systemReply?: any }> {
  const response = await fetch(`${API_BASE}/system-messages/${messageId}/reply`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(`回复系统消息失败: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 创建消息（用于迁移等场景）
 */
export async function createMessage(
  request: CreateMessageRequest,
  token: string
): Promise<MailboxMessage> {
  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('创建消息失败:', response.status, errorText.substring(0, 200));
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `创建消息失败: ${response.statusText}`);
    } catch {
      throw new Error(`创建消息失败: ${response.status} ${response.statusText}`);
    }
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return parseApiResponse<MailboxMessage>(data);
  } else {
    const text = await response.text();
    console.error('收到非JSON响应:', text.substring(0, 200));
    throw new Error('服务器返回了无效的响应格式');
  }
}

/**
 * 获取消息的回复列表
 */
export async function getMessageReplies(
  messageId: number,
  token: string
): Promise<MailboxMessage[]> {
  const response = await fetch(`${API_BASE}/messages/${messageId}/replies`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('获取回复列表失败:', response.status, errorText.substring(0, 200));
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `获取回复列表失败: ${response.statusText}`);
    } catch {
      throw new Error(`获取回复列表失败: ${response.status} ${response.statusText}`);
    }
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    // 回复列表可能是数组，也可能是ApiResponse包装
    if (Array.isArray(data)) {
      return data;
    }
    return parseApiResponse<MailboxMessage[]>(data);
  } else {
    const text = await response.text();
    console.error('收到非JSON响应:', text.substring(0, 200));
    throw new Error('服务器返回了无效的响应格式');
  }
}

/**
 * 导出所有API函数
 */
export const mailboxApi = {
  // 消息相关
  getMessages,
  getMessageById,
  getMessageReplies,
  createMessage,
  markMessageAsRead,
  markMessageAsImportant,
  markMessageAsStarred,
  deleteMessage,
  batchDeleteMessages,
  getUnreadCount,
  searchMessages,
  
  // 对话相关
  getConversations,
  getConversationById,
  createConversation,
  getConversationMessages,
  sendConversationMessage,
  markConversationAsRead,
  pinConversation,
  muteConversation,
  deleteConversation,
  
  // 提醒设置相关
  getNotificationSettings,
  updateNotificationSettings,
  
  // E-SOUL来信相关
  triggerESoulLetter,
  replyToESoulLetter,
  
  // 共鸣消息相关
  replyToResonanceMessage,
  
  // 系统消息相关
  replyToSystemMessage,
};

