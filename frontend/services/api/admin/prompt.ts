/**
 * 提示词管理API客户端
 */

import { request } from '../base/request';
import type {
  PromptCategory,
  PromptTemplate,
  PromptTemplateListRequest,
  PromptTemplateListResponse,
  PromptRenderRequest,
  PromptRenderResponse,
  PromptGenerateRequest,
  PromptGenerateResponse,
} from './promptTypes';

export const promptApi = {
  // ==================== 模板管理 ====================
  
  /**
   * 获取模板列表
   */
  async getTemplates(
    params: PromptTemplateListRequest,
    token: string
  ): Promise<PromptTemplateListResponse> {
    const queryParams = new URLSearchParams();
    if (params.categoryCode) queryParams.append('categoryCode', params.categoryCode);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    queryParams.append('page', String(params.page || 0));
    queryParams.append('size', String(params.size || 20));
    
    return request<PromptTemplateListResponse>(
      `/admin/prompts/templates?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  
  /**
   * 获取模板详情
   */
  async getTemplateById(id: number, token: string): Promise<PromptTemplate> {
    return request<PromptTemplate>(
      `/admin/prompts/templates/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  
  /**
   * 创建模板
   */
  async createTemplate(template: Partial<PromptTemplate>, token: string): Promise<PromptTemplate> {
    return request<PromptTemplate>(
      '/admin/prompts/templates',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      }
    );
  },
  
  /**
   * 更新模板
   */
  async updateTemplate(
    id: number,
    template: Partial<PromptTemplate>,
    token: string
  ): Promise<PromptTemplate> {
    return request<PromptTemplate>(
      `/admin/prompts/templates/${id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      }
    );
  },
  
  /**
   * 删除模板
   */
  async deleteTemplate(id: number, token: string): Promise<void> {
    return request<void>(
      `/admin/prompts/templates/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  
  /**
   * 复制模板
   */
  async copyTemplate(id: number, token: string): Promise<PromptTemplate> {
    return request<PromptTemplate>(
      `/admin/prompts/templates/${id}/copy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  
  // ==================== 模板渲染 ====================
  
  /**
   * 渲染模板
   */
  async renderTemplate(renderRequest: PromptRenderRequest, token: string): Promise<PromptRenderResponse> {
    return request<PromptRenderResponse>(
      `/admin/prompts/templates/${renderRequest.templateId}/render`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(renderRequest),
      }
    );
  },
  
  /**
   * 预览模板
   */
  async previewTemplate(id: number, token: string): Promise<PromptRenderResponse> {
    return request<PromptRenderResponse>(
      `/admin/prompts/templates/${id}/preview`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  
  // ==================== AI生成 ====================
  
  /**
   * AI生成提示词
   */
  async generatePrompt(
    generateRequest: PromptGenerateRequest,
    token: string
  ): Promise<PromptGenerateResponse> {
    return request<PromptGenerateResponse>(
      `/admin/prompts/templates/${generateRequest.templateId}/generate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateRequest),
      }
    );
  },
  
  // ==================== 分类管理 ====================
  
  /**
   * 获取所有分类
   */
  async getCategories(token: string): Promise<PromptCategory[]> {
    return request<PromptCategory[]>(
      '/admin/prompts/categories',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  
  /**
   * 创建分类
   */
  async createCategory(category: Partial<PromptCategory>, token: string): Promise<PromptCategory> {
    return request<PromptCategory>(
      '/admin/prompts/categories',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      }
    );
  },
  
  /**
   * 更新分类
   */
  async updateCategory(
    id: number,
    category: Partial<PromptCategory>,
    token: string
  ): Promise<PromptCategory> {
    return request<PromptCategory>(
      `/admin/prompts/categories/${id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      }
    );
  },
  
  /**
   * 删除分类
   */
  async deleteCategory(id: number, token: string): Promise<void> {
    return request<void>(
      `/admin/prompts/categories/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};
