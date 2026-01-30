/**
 * 知识资产反馈处理工具
 * 用于在 ChatWindow 中收集用户对 AI 回复的反馈
 */

import { memoryApi } from '../../../services/api/memory/memory';
import { getToken } from '../../../services/api/base/tokenStorage';
import { logger } from '../../../utils/logger';

export interface FeedbackOptions {
  messageId: string;
  assistantMessageId?: string;
  assetIds?: number[];  // 本次对话注入的资产 ID 列表
  feedbackType: 'positive' | 'negative';
  comment?: string;
}

/**
 * 提交资产反馈
 * 当用户点击"有帮助/没帮助"按钮时调用
 */
export const submitAssetFeedback = async (options: FeedbackOptions): Promise<void> => {
  const { messageId, assetIds = [], feedbackType, comment } = options;
  
  const token = getToken();
  if (!token) {
    logger.warn('[submitAssetFeedback] 未登录，无法提交反馈');
    return;
  }
  
  if (assetIds.length === 0) {
    logger.info('[submitAssetFeedback] 没有关联的资产，跳过反馈提交');
    return;
  }
  
  try {
    // 为每个资产提交反馈
    for (const assetId of assetIds) {
      await memoryApi.submitAssetFeedback(assetId, feedbackType, token, comment);
      logger.info('[submitAssetFeedback] 资产反馈已提交', {
        assetId,
        feedbackType,
        hasComment: !!comment,
      });
    }
  } catch (error) {
    logger.error('[submitAssetFeedback] 提交反馈失败:', error);
    // 不中断主流程
  }
};

/**
 * 从调试信息中提取资产 ID
 * 用于确定哪些资产参与了本次对话
 */
export const extractAssetIdsFromDebugInfo = (debugInfo: any): number[] => {
  if (!debugInfo || !debugInfo.retrieval || !debugInfo.retrieval.results) {
    return [];
  }
  
  return debugInfo.retrieval.results
    .filter((item: any) => item.source === 'character_asset')
    .map((item: any) => item.id)
    .filter((id: any) => typeof id === 'number' && id > 0);
};
