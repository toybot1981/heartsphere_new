import React, { useState, useEffect } from 'react';
import { Button } from "../components/Button";
import { adminApi } from '../services/api';
import { showAlert, showConfirm } from "../utils/dialog";
import type {
  PromptTemplate,
  PromptCategory,
  PromptRenderResponse,
  PromptGenerateResponse,
} from '../services/api/admin/promptTypes';

interface PromptManagementProps {
  adminToken: string | null;
  onReload?: () => Promise<void>;
}

export const PromptManagement: React.FC<PromptManagementProps> = ({ adminToken, onReload }) => {
  // 状态管理
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [previewResponse, setPreviewResponse] = useState<PromptRenderResponse | null>(null);
  const [generateResponse, setGenerateResponse] = useState<PromptGenerateResponse | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // 筛选和搜索
  const [keyword, setKeyword] = useState('');
  const [categoryCode, setCategoryCode] = useState<string>('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 编辑表单数据
  const [formData, setFormData] = useState<Partial<PromptTemplate>>({
    name: '',
    categoryCode: '',
    description: '',
    systemPrompt: '',
    userPrompt: '',
    variables: {},
    exampleData: {},
    isActive: true,
  });

  // 生成表单数据
  const [generateFormData, setGenerateFormData] = useState<{
    variables: Record<string, any>;
    context: string;
  }>({
    variables: {},
    context: '',
  });

  // 加载分类列表
  const loadCategories = async () => {
    if (!adminToken) return;
    try {
      const cats = await adminApi.prompt.getCategories(adminToken);
      setCategories(cats);
    } catch (error: any) {
      console.error('加载分类失败:', error);
    }
  };

  // 加载模板列表
  const loadTemplates = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.prompt.getTemplates(
        {
          categoryCode: categoryCode || undefined,
          keyword: keyword || undefined,
          page,
          size: pageSize,
        },
        adminToken
      );
      setTemplates(response.templates);
      setTotal(response.totalElements);
    } catch (error: any) {
      showAlert('加载模板列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [adminToken]);

  useEffect(() => {
    loadTemplates();
  }, [adminToken, keyword, categoryCode, page]);

  // 创建模板
  const handleCreate = () => {
    setFormData({
      name: '',
      categoryCode: categories[0]?.code || '',
      description: '',
      systemPrompt: '',
      userPrompt: '',
      variables: {},
      exampleData: {},
      isActive: true,
    });
    setSelectedTemplate(null);
    setShowEditModal(true);
  };

  // 编辑模板
  const handleEdit = (template: PromptTemplate) => {
    setFormData({
      name: template.name,
      categoryCode: template.categoryCode,
      description: template.description || '',
      systemPrompt: template.systemPrompt || '',
      userPrompt: template.userPrompt || '',
      variables: template.variables || {},
      exampleData: template.exampleData || {},
      isActive: template.isActive,
    });
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  // 保存模板
  const handleSave = async () => {
    if (!adminToken) return;
    if (!formData.name || !formData.categoryCode) {
      showAlert('请填写模板名称和分类', '验证失败', 'error');
      return;
    }

    try {
      if (selectedTemplate) {
        await adminApi.prompt.updateTemplate(selectedTemplate.id, formData, adminToken);
        showAlert('模板更新成功', '成功', 'success');
      } else {
        await adminApi.prompt.createTemplate(formData, adminToken);
        showAlert('模板创建成功', '成功', 'success');
      }
      setShowEditModal(false);
      await loadTemplates();
    } catch (error: any) {
      showAlert('保存失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  // 删除模板
  const handleDelete = async (template: PromptTemplate) => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      `确定要删除模板"${template.name}"吗？此操作不可恢复。`,
      '删除模板',
      'danger'
    );
    if (!confirmed) return;

    try {
      await adminApi.prompt.deleteTemplate(template.id, adminToken);
      showAlert('模板已删除', '成功', 'success');
      await loadTemplates();
    } catch (error: any) {
      showAlert('删除失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  // 复制模板
  const handleCopy = async (template: PromptTemplate) => {
    if (!adminToken) return;
    try {
      await adminApi.prompt.copyTemplate(template.id, adminToken);
      showAlert('模板已复制', '成功', 'success');
      await loadTemplates();
    } catch (error: any) {
      showAlert('复制失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  // 预览模板
  const handlePreview = async (template: PromptTemplate) => {
    if (!adminToken) return;
    try {
      const response = await adminApi.prompt.previewTemplate(template.id, adminToken);
      setPreviewResponse(response);
      setSelectedTemplate(template);
      setShowPreviewModal(true);
    } catch (error: any) {
      showAlert('预览失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  // 打开AI生成模态框
  const handleOpenGenerate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    // 初始化变量值
    const vars: Record<string, any> = {};
    if (template.variables) {
      Object.keys(template.variables).forEach((key) => {
        const varDef = template.variables![key];
        if (varDef && typeof varDef === 'object' && 'defaultValue' in varDef) {
          vars[key] = varDef.defaultValue || '';
        } else {
          vars[key] = '';
        }
      });
    }
    setGenerateFormData({
      variables: vars,
      context: '',
    });
    setShowGenerateModal(true);
  };

  // AI生成提示词
  const handleGenerate = async () => {
    if (!adminToken || !selectedTemplate) return;
    try {
      const response = await adminApi.prompt.generatePrompt(
        {
          templateId: selectedTemplate.id,
          variables: generateFormData.variables,
          context: generateFormData.context || undefined,
        },
        adminToken
      );
      setGenerateResponse(response);
    } catch (error: any) {
      showAlert('AI生成失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  // 渲染模板变量输入
  const renderVariableInputs = (template: PromptTemplate) => {
    if (!template.variables || Object.keys(template.variables).length === 0) {
      return <p className="text-gray-400 text-sm">此模板没有定义变量</p>;
    }

    return Object.keys(template.variables).map((key) => {
      const varDef = template.variables![key];
      const varInfo = typeof varDef === 'object' ? varDef : { type: 'string', description: '' };
      const value = generateFormData.variables[key] || '';

      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {key}
            {varInfo.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {varInfo.description && (
            <p className="text-xs text-gray-400 mb-1">{varInfo.description}</p>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setGenerateFormData({
                ...generateFormData,
                variables: { ...generateFormData.variables, [key]: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
            placeholder={`输入 ${key} 的值`}
          />
        </div>
      );
    });
  };

  return (
    <div className="p-6">
      {/* 头部操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">提示词管理</h2>
        <div className="flex gap-2">
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            + 创建模板
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="搜索模板名称..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0);
          }}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white"
        />
        <select
          value={categoryCode}
          onChange={(e) => {
            setCategoryCode(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white"
          style={{ fontFamily: 'inherit' }}
        >
          <option value="">全部分类</option>
          {categories.map((cat) => (
            <option key={cat.code} value={cat.code} style={{ fontFamily: 'inherit' }}>
              {cat.name || cat.code}
            </option>
          ))}
        </select>
      </div>

      {/* 模板列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">加载中...</div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400">暂无模板</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-400">
                    {categories.find((c) => c.code === template.categoryCode)?.name || template.categoryCode}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    template.isActive
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-gray-600/20 text-gray-400'
                  }`}
                >
                  {template.isActive ? '启用' : '禁用'}
                </span>
              </div>
              {template.description && (
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{template.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-4">
                <Button
                  onClick={() => handlePreview(template)}
                  className="flex-1 min-w-[60px] bg-blue-600 hover:bg-blue-700 text-xs py-1 px-2"
                >
                  预览
                </Button>
                <Button
                  onClick={() => handleOpenGenerate(template)}
                  className="flex-1 min-w-[60px] bg-purple-600 hover:bg-purple-700 text-xs py-1 px-2"
                >
                  AI生成
                </Button>
                <Button
                  onClick={() => handleEdit(template)}
                  className="flex-1 min-w-[60px] bg-yellow-600 hover:bg-yellow-700 text-xs py-1 px-2"
                >
                  编辑
                </Button>
                <Button
                  onClick={() => handleCopy(template)}
                  className="flex-1 min-w-[60px] bg-gray-600 hover:bg-gray-700 text-xs py-1 px-2"
                >
                  复制
                </Button>
                <Button
                  onClick={() => handleDelete(template)}
                  className="flex-1 min-w-[60px] bg-red-600 hover:bg-red-700 text-xs py-1 px-2"
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {total > pageSize && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          >
            上一页
          </Button>
          <span className="text-gray-400">
            第 {page + 1} 页，共 {Math.ceil(total / pageSize)} 页
          </span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page + 1 >= Math.ceil(total / pageSize)}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          >
            下一页
          </Button>
        </div>
      )}

      {/* 编辑/创建模态框 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {selectedTemplate ? '编辑模板' : '创建模板'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">模板名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类 *</label>
                <select
                  value={formData.categoryCode}
                  onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  style={{ fontFamily: 'inherit' }}
                >
                  <option value="">请选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.code} value={cat.code} style={{ fontFamily: 'inherit' }}>
                      {cat.name || cat.code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">系统提示词模板</label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white font-mono text-sm"
                  rows={8}
                  placeholder="例如：你是一个{{role}}，请分析用户的消息：{{userMessage}}"
                />
                <div className="mt-2 p-3 bg-slate-900 rounded border border-slate-700">
                  <p className="text-xs font-semibold text-gray-300 mb-2">支持的语法：</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• 变量：{'{{variableName}}'} 或 {'{{variableName|defaultValue}}'}</li>
                    <li>• 条件：{'{{#if condition}}...{{/if}}'} 或 {'{{#if condition}}...{{else}}...{{/if}}'}</li>
                    <li>• 循环：{'{{#each items}}...{{/each}}'}</li>
                    <li>• 循环变量：{'{{this}}'}, {'{{@index}}'}, {'{{@first}}'}, {'{{@last}}'}</li>
                  </ul>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">用户提示词模板</label>
                <textarea
                  value={formData.userPrompt}
                  onChange={(e) => setFormData({ ...formData, userPrompt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white font-mono text-sm"
                  rows={8}
                  placeholder="例如：文本内容：{{text}}"
                />
                <div className="mt-2 p-3 bg-slate-900 rounded border border-slate-700">
                  <p className="text-xs font-semibold text-gray-300 mb-2">示例：</p>
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap">
{`{{#if hasContext}}
上下文：{{context}}
{{/if}}

{{#each items}}
  {{@index}}. {{name}}
{{/each}}`}
                  </pre>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">示例数据（JSON格式）</label>
                <textarea
                  value={JSON.stringify(formData.exampleData || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({ ...formData, exampleData: parsed });
                    } catch {
                      // 忽略JSON解析错误
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white font-mono text-sm"
                  rows={4}
                  placeholder='{"variableName": "value"}'
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm">启用此模板</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => setShowEditModal(false)}
                className="bg-slate-700 hover:bg-slate-600"
              >
                取消
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                保存
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 预览模态框 */}
      {showPreviewModal && selectedTemplate && previewResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">模板预览：{selectedTemplate.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">系统提示词（渲染后）</label>
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {previewResponse.systemPrompt || '(空)'}
                  </pre>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">用户提示词（渲染后）</label>
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {previewResponse.userPrompt || '(空)'}
                  </pre>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowPreviewModal(false)}
                className="bg-slate-700 hover:bg-slate-600"
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI生成模态框 */}
      {showGenerateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">AI生成提示词：{selectedTemplate.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">变量值</label>
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  {renderVariableInputs(selectedTemplate)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">上下文信息（可选）</label>
                <textarea
                  value={generateFormData.context}
                  onChange={(e) =>
                    setGenerateFormData({ ...generateFormData, context: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  rows={3}
                  placeholder="输入额外的上下文信息，帮助AI更好地生成提示词"
                />
              </div>
              {generateResponse && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">AI生成的系统提示词</label>
                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {generateResponse.generatedSystemPrompt}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">AI生成的用户提示词</label>
                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {generateResponse.generatedUserPrompt}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGenerateResponse(null);
                }}
                className="bg-slate-700 hover:bg-slate-600"
              >
                关闭
              </Button>
              <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700">
                {generateResponse ? '重新生成' : '生成'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
