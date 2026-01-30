import { request } from '../api/request';

/**
 * 技能创建器服务
 * 提供专业技能创建工具的所有API调用方法
 */

export interface SkillCreatorRequest {
  sessionId?: string;
  skillData: Record<string, any>;
}

export interface SkillCreatorResponse {
  sessionId: string;
  success: boolean;
  message: string;
  data?: any;
}

export interface SkillValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface McpToolInfo {
  mcpConfigId: number;
  mcpConfigName: string;
  toolName: string;
  toolDescription?: string;
  toolInputSchema?: any;
}

export interface SkillTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  metadata?: Record<string, any>;
  instruction?: string;
  mcpToolConfig?: string;
  executionConfig?: string;
}

export interface SkillQualityReport {
  totalScore: number;
  descriptionScore: number;
  descriptionLevel: string;
  descriptionSuggestions: string[];
  completenessScore: number;
  missingFields: string[];
  completenessSuggestions: string[];
}

export class SkillCreatorService {
  /**
   * 开始创建流程
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async startCreation(token?: string | null): Promise<SkillCreatorResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await request<SkillCreatorResponse>('/skills/creator/start', {
        method: 'POST',
        headers,
      });
      console.info('[SkillCreatorService] 开始创建流程 响应(完整):', JSON.stringify(response, null, 2));
      return response;
    } catch (error: any) {
      console.error('[SkillCreatorService] 开始创建流程失败:', error);
      throw error;
    }
  }

  /**
   * 保存草稿
   * @param sessionId - 会话ID
   * @param skillData - 技能数据
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async saveDraft(sessionId: string, skillData: Record<string, any>, token?: string | null): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await request<void>('/skills/creator/save-draft', {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId, skillData }),
      });
      console.info('[SkillCreatorService] 保存草稿 成功:', JSON.stringify({ sessionId, keys: Object.keys(skillData || {}) }, null, 2));
    } catch (error: any) {
      console.error('[SkillCreatorService] 保存草稿失败(完整):', error, JSON.stringify({ message: error?.message }, null, 2));
      throw error;
    }
  }

  /**
   * 验证技能
   * @param skillData - 技能数据
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async validateSkill(skillData: Record<string, any>, token?: string | null): Promise<SkillValidationResult> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // request() 返回后端 body 的 data 字段（即 { valid, errors, warnings }），少数情况下可能是整包 { code, data, message }
      const raw = await request<SkillValidationResult | { code: number; data?: SkillValidationResult; message?: string }>(
        '/skills/creator/validate',
        { method: 'POST', headers, body: JSON.stringify({ skillData }) }
      );
      const result: SkillValidationResult =
        raw && typeof raw === 'object' && 'valid' in raw
          ? {
              valid: !!raw.valid,
              errors: Array.isArray((raw as SkillValidationResult).errors) ? (raw as SkillValidationResult).errors : [],
              warnings: Array.isArray((raw as SkillValidationResult).warnings) ? (raw as SkillValidationResult).warnings : [],
            }
          : raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object'
            ? {
                valid: !!(raw.data as SkillValidationResult).valid,
                errors: Array.isArray((raw.data as SkillValidationResult).errors) ? (raw.data as SkillValidationResult).errors : [],
                warnings: Array.isArray((raw.data as SkillValidationResult).warnings) ? (raw.data as SkillValidationResult).warnings : [],
              }
            : { valid: false, errors: ['接口返回格式异常'], warnings: [] };
      console.info('[SkillCreatorService] 验证技能 请求摘要:', JSON.stringify({ keys: Object.keys(skillData || {}) }, null, 2));
      console.info('[SkillCreatorService] 验证技能 结果(完整):', JSON.stringify(result, null, 2));
      return result;
    } catch (error: any) {
      console.error('[SkillCreatorService] 验证技能失败:', error);
      throw error;
    }
  }

  /**
   * 完成创建
   * @param skillData - 技能数据
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async finalizeSkill(skillData: Record<string, any>, token?: string | null): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request<any>('/skills/creator/finalize', {
        method: 'POST',
        headers,
        body: JSON.stringify({ skillData }),
      });
      console.info('[SkillCreatorService] 完成创建 响应(完整):', JSON.stringify(response, null, 2));
      return response;
    } catch (error: any) {
      console.error('[SkillCreatorService] 完成创建失败(完整):', error, JSON.stringify({ message: error?.message, stack: error?.stack }, null, 2));
      throw error;
    }
  }

  /**
   * 获取可用MCP工具列表
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async getMcpTools(token?: string | null): Promise<McpToolInfo[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const data = await request<McpToolInfo[]>(
        '/skills/creator/mcp-tools',
        { method: 'GET', headers }
      );
      const list = Array.isArray(data) ? data : [];
      console.info('[SkillCreatorService] 获取MCP工具列表(完整):', JSON.stringify({ count: list.length, data: list }, null, 2));
      return list;
    } catch (error: any) {
      console.warn('[SkillCreatorService] 获取MCP工具列表失败:', error?.message ?? error);
      return [];
    }
  }

  /**
   * 验证MCP工具可用性
   * @param mcpConfigId - MCP配置ID
   * @param toolNames - 工具名称列表
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async validateMcpTool(mcpConfigId: number, toolNames: string[], token?: string | null): Promise<SkillValidationResult> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request<SkillValidationResult>('/skills/creator/validate-mcp-tool', {
        method: 'POST',
        headers,
        body: JSON.stringify({ mcpConfigId, toolNames }),
      });
      return response;
    } catch (error: any) {
      console.error('[SkillCreatorService] 验证MCP工具失败:', error);
      throw error;
    }
  }

  /**
   * 获取模板列表
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async getTemplates(token?: string | null): Promise<SkillTemplate[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const data = await request<SkillTemplate[]>(
        '/skills/creator/templates',
        { method: 'GET', headers }
      );
      const list = Array.isArray(data) ? data : [];
      console.info('[SkillCreatorService] 获取模板列表(完整):', JSON.stringify({ count: list.length, data: list }, null, 2));
      return list;
    } catch (error: any) {
      console.warn('[SkillCreatorService] 获取模板列表失败:', error?.message ?? error);
      return [];
    }
  }

  /**
   * 根据分类获取模板
   * @param category - 模板分类
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async getTemplatesByCategory(category: string, token?: string | null): Promise<SkillTemplate[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request<SkillTemplate[] | undefined>(
        `/skills/creator/templates/${category}`,
        { method: 'GET', headers }
      );
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error('[SkillCreatorService] 获取分类模板异常:', error);
      return [];
    }
  }

  /**
   * AI生成技能定义
   * @param description - 用户描述
   * @param sessionId - 会话ID
   * @param token - 可选的管理员token
   */
  async generateFromDescription(description: string, sessionId: string, token?: string | null): Promise<Record<string, any>> {
    try {
      console.info('[SkillCreatorService] AI生成技能 请求:', { descriptionLength: description?.length ?? 0, sessionId });
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      let data = await request<Record<string, any>>(
        '/skills/creator/generate-from-description',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ description, sessionId }),
        }
      );
      console.info('[SkillCreatorService] AI生成技能 原始响应(完整):', JSON.stringify(data, null, 2));
      if (!data || typeof data !== 'object') {
        throw new Error('AI生成失败：返回数据无效');
      }
      // 若返回的是整包 { code, data, message }（未解包），则取 data 作为技能定义
      if (data.data != null && typeof data.data === 'object' && (data.skillId == null || data.skillId === '')) {
        console.info('[SkillCreatorService] AI生成技能 解包前 data 字段(完整):', JSON.stringify(data.data, null, 2));
        data = data.data as Record<string, any>;
      }
      console.info('[SkillCreatorService] AI生成技能 成功 返回给调用方(完整):', JSON.stringify(data, null, 2));
      return data;
    } catch (error: any) {
      console.error('[SkillCreatorService] AI生成技能失败(完整):', error?.message ?? error, JSON.stringify({ message: error?.message, stack: error?.stack }, null, 2));
      throw error;
    }
  }

  /**
   * 从Markdown内容解析技能定义
   * @param content - Markdown内容
   * @param sessionId - 会话ID
   * @param token - 可选的管理员token
   */
  async parseFromMdContent(content: string, sessionId: string, token?: string | null): Promise<Record<string, any>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request<Record<string, any>>('/skills/creator/parse-from-content', {
        method: 'POST',
        headers,
        body: JSON.stringify({ content, sessionId }),
      });
      console.info('[SkillCreatorService] 解析Markdown内容 结果(完整):', JSON.stringify(response, null, 2));
      return response;
    } catch (error: any) {
      console.error('[SkillCreatorService] 解析Markdown内容失败(完整):', error, JSON.stringify({ message: error?.message }, null, 2));
      throw error;
    }
  }

  /**
   * 从上传的文件解析技能定义
   * @param file - 文件对象
   * @param sessionId - 会话ID
   * @param token - 可选的管理员token
   */
  async parseFromMdFile(file: File, sessionId: string, token?: string | null): Promise<Record<string, any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request<Record<string, any>>(
        '/skills/creator/parse-from-file',
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );
      const out = response && typeof response === 'object' ? response : {};
      console.info('[SkillCreatorService] 解析文件 结果(完整):', JSON.stringify(out, null, 2));
      return out;
    } catch (error: any) {
      console.error('[SkillCreatorService] 解析文件失败(完整):', error, JSON.stringify({ message: error?.message }, null, 2));
      throw error;
    }
  }

  /**
   * 分析技能质量
   * @param skillData - 技能数据
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async analyzeQuality(skillData: Record<string, any>, token?: string | null): Promise<SkillQualityReport> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request<SkillQualityReport>('/skills/creator/analyze-quality', {
        method: 'POST',
        headers,
        body: JSON.stringify({ skillData }),
      });
      console.info('[SkillCreatorService] 分析技能质量 结果(完整):', JSON.stringify(response, null, 2));
      return response;
    } catch (error: any) {
      console.error('[SkillCreatorService] 分析技能质量失败(完整):', error, JSON.stringify({ message: error?.message }, null, 2));
      throw error;
    }
  }

  /**
   * 增强验证技能
   * @param skillId - 技能ID
   * @param token - 可选的管理员token（如果不提供，request函数会自动从tokenStorage获取）
   */
  async validateEnhanced(skillId: string, token?: string | null): Promise<any> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await request<any>(`/skills/${skillId}/validate-enhanced`, {
        method: 'POST',
        headers,
      });
      return response;
    } catch (error: any) {
      console.error('[SkillCreatorService] 增强验证失败:', error);
      throw error;
    }
  }
}
