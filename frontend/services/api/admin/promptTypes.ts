/**
 * 提示词管理相关类型定义
 */

export interface PromptCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: number;
  name: string;
  categoryCode: string;
  categoryName?: string;
  description?: string;
  systemPrompt?: string;
  userPrompt?: string;
  variables?: Record<string, any>;
  exampleData?: Record<string, any>;
  version: number;
  isActive: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVariable {
  id: number;
  templateId: number;
  variableName: string;
  variableType: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  defaultValue?: string;
  isRequired: boolean;
  validationRule?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PromptRenderRequest {
  templateId: number;
  variables: Record<string, any>;
}

export interface PromptRenderResponse {
  systemPrompt: string;
  userPrompt: string;
  usedVariables: Record<string, any>;
}

export interface PromptGenerateRequest {
  templateId: number;
  variables: Record<string, any>;
  context?: string;
}

export interface PromptGenerateResponse {
  generatedSystemPrompt: string;
  generatedUserPrompt: string;
  originalSystemPrompt: string;
  originalUserPrompt: string;
  suggestedVariables: Record<string, any>;
}

export interface PromptTemplateListRequest {
  categoryCode?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface PromptTemplateListResponse {
  templates: PromptTemplate[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
