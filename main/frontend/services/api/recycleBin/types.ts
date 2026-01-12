// 回收站API类型定义

/**
 * 对话日志
 */
export interface ConversationLog {
  id: number;
  userId: number;
  characterId: number;
  sessionId: string;
  characterName: string;
  characterAvatarUrl?: string;
  lastMessagePreview?: string;
  messageCount: number;
  firstMessageAt?: string;
  lastMessageAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 回收站数据
 */
export interface RecycleBinData {
  characters: Array<any>;
  worlds: Array<any>;
  eras: Array<any>;
  scripts: Array<any>;
  conversationLogs: ConversationLog[];
}

