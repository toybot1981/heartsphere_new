/**
 * AI 服务占位符 - Admin 前端版本
 * 简化版本，仅提供必要的接口
 */

import type { AppSettings } from '../../types';

/**
 * AI 服务 - Admin 前端版本
 * 通过 adminApi 调用后端 AI 服务
 */
import { adminApi } from '../api';

export const aiService = {
  /**
   * 更新配置（简化版，仅用于兼容）
   */
  updateConfigFromAppSettings(settings: AppSettings): void {
    console.log('[aiService] 配置已更新:', settings);
    // Admin 前端的 AI 配置通过 adminApi.aiConfig 管理
  },

  /**
   * 生成图片（通过 adminApi 调用后端）
   */
  async generateImage(request: {
    prompt: string;
    model?: string;
    size?: string;
    quality?: string;
    token?: string;
  }): Promise<{ url: string }> {
    // 通过 imageApi 或 adminApi 调用后端图片生成 API
    // 这里需要根据实际的 API 端点调整
    const { imageApi } = await import('../api');
    const result = await imageApi.uploadBase64Image('', 'generated', request.token || undefined);
    if (result.success && result.url) {
      return { url: result.url };
    } else {
      throw new Error(result.error || 'Failed to generate image');
    }
  },

  /**
   * 生成主故事（通过 adminApi 调用后端）
   */
  async generateMainStory(request: {
    eraId: number;
    characterIds?: number[];
    token?: string;
  }): Promise<any> {
    // 通过 adminApi 调用后端主故事生成 API
    // 这里需要根据实际的 API 端点调整
    throw new Error('主故事生成功能需要通过后端 API 实现');
  },
};
