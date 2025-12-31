/**
 * 跨时空信箱类型定义
 * 
 * @author HeartSphere
 * @version 1.0
 */

/**
 * 消息类型枚举
 */
export enum MessageType {
  // E-SOUL来信类型
  ESOUL_GREETING = 'esoul_greeting',
  ESOUL_CARE = 'esoul_care',
  ESOUL_SHARE = 'esoul_share',
  ESOUL_REMINDER = 'esoul_reminder',
  
  // 共鸣消息类型
  RESONANCE_LIKE = 'resonance_like',
  RESONANCE_COMMENT = 'resonance_comment',
  RESONANCE_MESSAGE = 'resonance_message',
  RESONANCE_SHARE = 'resonance_share',
  RESONANCE_CONNECTION_REQUEST = 'resonance_connection_request',
  
  // 系统消息类型
  SYSTEM_NOTIFICATION = 'system_notification',
  SYSTEM_FEEDBACK = 'system_feedback',
  SYSTEM_DIALOGUE = 'system_dialogue',
  
  // 用户消息类型
  USER_PRIVATE_MESSAGE = 'user_private_message',
  USER_REPLY = 'user_reply',
  USER_INTERACTION = 'user_interaction',
}

/**
 * 消息分类枚举
 */
export enum MessageCategory {
  ESOUL_LETTER = 'esoul_letter',
  RESONANCE = 'resonance',
  SYSTEM = 'system',
  USER_MESSAGE = 'user_message',
}

/**
 * 发送者类型枚举
 */
export enum SenderType {
  ESOUL = 'esoul',
  HEARTSPHERE = 'heartsphere',
  SYSTEM = 'system',
  USER = 'user',
}

/**
 * 对话类型枚举
 */
export enum ConversationType {
  USER_TO_USER = 'user_to_user',
  USER_TO_SYSTEM = 'user_to_system',
}

/**
 * 跨时空信箱消息
 */
export interface MailboxMessage {
  id: number;
  receiverId: number;
  
  // 发送者信息
  senderType: SenderType;
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
  
  // 消息信息
  messageType: MessageType;
  messageCategory: MessageCategory;
  title?: string;
  content: string;
  contentData?: string; // JSON格式的扩展数据
  
  // 状态标识
  isRead: boolean;
  isImportant: boolean;
  isStarred: boolean;
  
  // 关联信息
  relatedId?: number;
  relatedType?: string;
  replyToId?: number;
  
  // 时间戳
  createdAt: string; // ISO 8601格式
  readAt?: string;
  deletedAt?: string;
}

/**
 * 对话
 */
export interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  conversationType: ConversationType;
  
  // 最后消息信息
  lastMessageId?: number;
  lastMessageAt?: string;
  
  // 参与者1的状态
  unreadCount1: number;
  isPinned1: boolean;
  isMuted1: boolean;
  
  // 参与者2的状态
  unreadCount2: number;
  isPinned2: boolean;
  isMuted2: boolean;
  
  createdAt: string;
  updatedAt: string;
  
  // 前端显示用的扩展字段（可能需要从后端DTO扩展）
  participant2Name?: string;
  lastMessageContent?: string;
  unreadCount?: number; // 当前用户的未读数量（计算字段）
  isPinned?: boolean; // 当前用户是否置顶（计算字段）
  isMuted?: boolean; // 当前用户是否免打扰（计算字段）
}

/**
 * 对话消息
 */
export interface ConversationMessage {
  id: number;
  conversationId: number;
  
  // 发送者信息
  senderId: number;
  senderType: 'user' | 'system';
  
  // 消息内容
  messageType: string; // 'text', 'image', 'voice', 'emoji'等
  content: string;
  contentData?: string; // JSON格式的扩展数据
  
  // 回复信息
  replyToId?: number;
  
  // 状态
  isEdited: boolean;
  isDeleted: boolean;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * 提醒设置
 */
export interface NotificationSettings {
  id: number;
  userId: number;
  
  // 总开关
  enableNotifications: boolean;
  
  // 分类开关
  esoulLetterEnabled: boolean;
  resonanceEnabled: boolean;
  systemMessageEnabled: boolean;
  userMessageEnabled: boolean;
  
  // 免打扰时间
  quietHoursStart?: string; // HH:mm格式
  quietHoursEnd?: string;
  
  // 其他设置
  soundEnabled: boolean;
  
  updatedAt: string;
}

/**
 * 未读消息统计
 */
export interface UnreadCount {
  totalUnread: number;
  total?: number; // 兼容字段
  categoryUnread?: Record<string, number>; // 分类未读数量Map
  // 兼容字段（如果后端直接返回这些字段）
  esoulLetter?: number;
  resonance?: number;
  system?: number;
  userMessage?: number;
  esoulLetter: number;
  resonance: number;
  system: number;
  userMessage: number;
}

/**
 * 消息查询请求
 */
export interface MessageQueryRequest {
  category?: MessageCategory;
  isRead?: boolean;
  isImportant?: boolean;
  isStarred?: boolean;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

/**
 * 对话查询请求
 */
export interface ConversationQueryRequest {
  conversationType?: ConversationType;
  page?: number;
  size?: number;
}

/**
 * 分页响应
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * 聚合消息（共鸣消息聚合）
 */
export interface AggregatedMessage extends MailboxMessage {
  aggregated: true;
  count: number;
  previewItems: MailboxMessage[];
}

/**
 * 创建消息请求
 */
export interface CreateMessageRequest {
  receiverId: number;
  senderType: SenderType;
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
  messageType: MessageType;
  messageCategory: MessageCategory;
  title?: string;
  content: string;
  contentData?: any;
  relatedId?: number;
  relatedType?: string;
  replyToId?: number;
}

/**
 * 发送对话消息请求
 */
export interface SendMessageRequest {
  content: string;
  messageType?: string;
  contentData?: any;
  replyToId?: number;
}

/**
 * 创建对话请求
 */
export interface CreateConversationRequest {
  participantId: number;
  initialMessage: string;
}

/**
 * 更新提醒设置请求
 */
export interface UpdateNotificationSettingsRequest {
  enableNotifications?: boolean;
  esoulLetterEnabled?: boolean;
  resonanceEnabled?: boolean;
  systemMessageEnabled?: boolean;
  userMessageEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  soundEnabled?: boolean;
}

