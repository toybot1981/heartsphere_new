/**
 * 提示词模板API服务
 * 用于从后端获取提示词模板
 */

import { request } from '../base/request';

export interface PromptRenderResponse {
  systemPrompt: string;
  userPrompt: string;
  usedVariables?: Record<string, any>;
}

export interface PromptRenderRequest {
  categoryCode: string;
  variables?: Record<string, any>;
  defaultSystemPrompt?: string;
  defaultUserPrompt?: string;
}

/**
 * 渲染提示词模板
 * @param categoryCode 分类代码（如：scenario-generation）
 * @param variables 变量值（可选）
 * @param defaultSystemPrompt 默认系统提示词（模板不存在时使用）
 * @param defaultUserPrompt 默认用户提示词（模板不存在时使用）
 */
export async function renderPromptTemplate(
  categoryCode: string,
  variables?: Record<string, any>,
  defaultSystemPrompt?: string,
  defaultUserPrompt?: string
): Promise<PromptRenderResponse | null> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('categoryCode', categoryCode);
    if (defaultSystemPrompt) {
      queryParams.append('defaultSystemPrompt', defaultSystemPrompt);
    }
    if (defaultUserPrompt) {
      queryParams.append('defaultUserPrompt', defaultUserPrompt);
    }

    const response = await request<{
      success: boolean;
      message: string;
      data: PromptRenderResponse;
    }>(`/prompts/render?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables || {}),
    });

    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('[PromptApi] 获取提示词失败:', error);
    return null;
  }
}
