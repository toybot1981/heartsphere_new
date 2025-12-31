/**
 * 心域连接模块类型定义
 */

/**
 * 快速连接角色DTO
 */
export interface QuickConnectCharacter {
  characterId: number;
  characterName: string;
  avatarUrl: string;
  sceneId: number;  // 场景ID（对应world_id）
  sceneName: string;  // 场景名称（对应world名称）
  themeColor: string;
  colorAccent: string;
  bio?: string;  // 角色简介
  tags?: string;  // 标签列表（逗号分隔）
  
  // 收藏相关
  isFavorite: boolean;  // 是否收藏
  
  // 访问历史相关
  lastAccessTime?: number;  // 最后访问时间（时间戳）
  accessCount: number;  // 访问次数
  totalConversationTime?: number;  // 总对话时长（秒）
  lastConversationTime?: number;  // 最后对话时间（时间戳）
  
  // 在线状态（如果支持）
  isOnline?: boolean;
  
  // 未读消息（如果支持）
  hasUnreadMessages?: boolean;
  unreadMessageCount?: number;
  
  // 推荐相关
  importance?: number;  // 重要性评分（0-1）
  recommendationScore?: number;  // 推荐分数
}

/**
 * 收藏DTO
 */
export interface Favorite {
  id: number;
  userId: number;
  characterId: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  character?: QuickConnectCharacter;
}

/**
 * 访问历史DTO
 */
export interface AccessHistory {
  id: number;
  userId: number;
  characterId: number;
  accessTime: string;
  accessDuration: number;  // 访问时长（秒）
  conversationRounds: number;  // 对话轮数
  sessionId?: string;  // 会话ID
  character?: QuickConnectCharacter;
}

/**
 * 访问统计信息
 */
export interface AccessStatistics {
  userId: number;
  characterId: number;
  accessCount: number;
  lastAccessTime?: string;
  totalDuration: number;  // 总访问时长（秒）
  totalConversationRounds: number;  // 总对话轮数
}

/**
 * 获取快速连接列表请求参数
 */
export interface GetQuickConnectCharactersParams {
  filter?: 'all' | 'favorite' | 'recent' | 'scene';
  sceneId?: number;
  sortBy?: 'frequency' | 'recent' | 'name' | 'favorite';
  limit?: number;
  offset?: number;
  search?: string;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * 获取快速连接列表响应
 */
export interface GetQuickConnectCharactersResponse {
  characters: QuickConnectCharacter[];
  totalCount: number;
  favoriteCount: number;
  recentCount: number;
  pagination: PaginationInfo;
}

/**
 * 搜索E-SOUL响应
 */
export interface SearchCharactersResponse {
  characters: QuickConnectCharacter[];
  totalCount: number;
  searchQuery: string;
  highlightedFields?: Record<string, {
    name?: number[];
    sceneName?: number[];
    tags?: number[];
  }>;
}

/**
 * 添加收藏请求
 */
export interface AddFavoriteRequest {
  characterId: number;
  sortOrder?: number;
}

/**
 * 切换收藏请求
 */
export interface ToggleFavoriteRequest {
  characterId: number;
  sortOrder?: number;
}

/**
 * 调整收藏顺序请求项
 */
export interface FavoriteReorderItem {
  characterId: number;
  sortOrder: number;
}

/**
 * 记录访问历史请求
 */
export interface RecordAccessRequest {
  characterId: number;
  accessDuration?: number;  // 访问时长（秒）
  conversationRounds?: number;  // 对话轮数
  sessionId?: string;  // 会话ID
}



