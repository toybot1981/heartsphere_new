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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* 头部操作栏 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              提示词管理
            </h2>
            <p className="text-slate-400 text-sm">管理和优化AI提示词模板，提升生成质量</p>
          </div>
          <Button 
            onClick={handleCreate} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建模板
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜索模板名称..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <select
              value={categoryCode}
              onChange={(e) => {
                setCategoryCode(e.target.value);
                setPage(0);
              }}
              className="pl-12 pr-10 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
              style={{ fontFamily: 'inherit' }}
            >
              <option value="">全部分类</option>
              {categories.map((cat) => (
                <option key={cat.code} value={cat.code} style={{ fontFamily: 'inherit' }}>
                  {cat.name || cat.code}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center gap-3 text-slate-400">
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>加载中...</span>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-lg mb-2">暂无模板</p>
              <p className="text-slate-500 text-sm">点击"创建模板"开始创建您的第一个提示词模板</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const category = categories.find((c) => c.code === template.categoryCode);
            const categoryColors: Record<string, string> = {
              'scenario-generation': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
              'character': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
              'emotion': 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
              'memory': 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
              'intent': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
              'response': 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
            };
            const cardColor = categoryColors[template.categoryCode] || 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
            
            return (
              <div
                key={template.id}
                className={`group relative bg-gradient-to-br ${cardColor} backdrop-blur-sm border rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
              >
                {/* 背景装饰 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                {/* 状态标签 */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                      template.isActive
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}
                  >
                    {template.isActive ? '✓ 启用' : '✗ 禁用'}
                  </span>
                </div>

                {/* 内容区域 */}
                <div className="relative">
                  {/* 分类标签 */}
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/50 rounded-lg">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {category?.name || template.categoryCode}
                    </span>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-300 transition-colors">
                    {template.name}
                  </h3>

                  {/* 描述 */}
                  {template.description && (
                    <p className="text-sm text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  )}

                  {/* 操作按钮 */}
                  <div className="mt-6 space-y-2.5">
                    {/* 上排四个按钮 */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="relative group/tooltip">
                        <button
                          onClick={() => handlePreview(template)}
                          className="w-full flex items-center justify-center px-2.5 py-2.5 text-xs font-medium text-white bg-gradient-to-br from-blue-500/80 to-blue-600/80 hover:from-blue-400 hover:to-blue-500 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-200 hover:scale-105 active:scale-95 border border-blue-400/30 backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                          预览
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900/95 border-r border-b border-slate-700/50 rotate-45"></div>
                        </div>
                      </div>
                      <div className="relative group/tooltip">
                        <button
                          onClick={() => handleOpenGenerate(template)}
                          className="w-full flex items-center justify-center px-2.5 py-2.5 text-xs font-medium text-white bg-gradient-to-br from-purple-500/80 to-purple-600/80 hover:from-purple-400 hover:to-purple-500 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-200 hover:scale-105 active:scale-95 border border-purple-400/30 backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                          AI生成
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900/95 border-r border-b border-slate-700/50 rotate-45"></div>
                        </div>
                      </div>
                      <div className="relative group/tooltip">
                        <button
                          onClick={() => handleEdit(template)}
                          className="w-full flex items-center justify-center px-2.5 py-2.5 text-xs font-medium text-white bg-gradient-to-br from-amber-500/80 to-amber-600/80 hover:from-amber-400 hover:to-amber-500 rounded-xl shadow-lg hover:shadow-amber-500/50 transition-all duration-200 hover:scale-105 active:scale-95 border border-amber-400/30 backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                          编辑
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900/95 border-r border-b border-slate-700/50 rotate-45"></div>
                        </div>
                      </div>
                      <div className="relative group/tooltip">
                        <button
                          onClick={() => handleCopy(template)}
                          className="w-full flex items-center justify-center px-2.5 py-2.5 text-xs font-medium text-white bg-gradient-to-br from-slate-600/80 to-slate-700/80 hover:from-slate-500 hover:to-slate-600 rounded-xl shadow-lg hover:shadow-slate-500/50 transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-500/30 backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                          复制
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900/95 border-r border-b border-slate-700/50 rotate-45"></div>
                        </div>
                      </div>
                    </div>
                    {/* 下排删除按钮 */}
                    <button
                      onClick={() => handleDelete(template)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-gradient-to-br from-red-500/80 to-red-600/80 hover:from-red-400 hover:to-red-500 rounded-xl shadow-lg hover:shadow-red-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-red-400/30 backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>删除</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分页 */}
      {total > pageSize && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-slate-700/50 rounded-xl px-6 py-2.5 transition-all"
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            上一页
          </Button>
          <div className="px-6 py-2.5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl">
            <span className="text-slate-300 font-medium">
              第 <span className="text-blue-400">{page + 1}</span> 页，共 <span className="text-blue-400">{Math.ceil(total / pageSize)}</span> 页
            </span>
          </div>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page + 1 >= Math.ceil(total / pageSize)}
            className="bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-slate-700/50 rounded-xl px-6 py-2.5 transition-all"
          >
            下一页
            <svg className="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
