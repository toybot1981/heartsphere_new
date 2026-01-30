import React, { useState, useEffect } from 'react';
import { toolApi, ToolConfig } from '../services/api/admin/tools';
import { Button } from './Button';
import { showAlert, showConfirm } from '../utils/dialog';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export const MentisToolManagement: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<ToolConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [testingToolName, setTestingToolName] = useState<string | null>(null);
  
  // 筛选和搜索
  const [category, setCategory] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  
  // 工具分类列表
  const categories = [
    { value: '', label: '全部' },
    { value: 'browser', label: '浏览器' },
    { value: 'terminal', label: '终端' },
    { value: 'filesystem', label: '文件系统' },
    { value: 'code', label: '代码执行' },
    { value: 'system', label: '系统' },
    { value: 'mcp', label: 'MCP' },
  ];

  useEffect(() => {
    loadTools();
  }, [adminToken, category, keyword]);

  const loadTools = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const response = await toolApi.getTools(
        {
          category: category || undefined,
          keyword: keyword || undefined,
        },
        adminToken
      );
      setTools(response.tools || []);
    } catch (error: any) {
      console.error('Failed to load tools:', error);
      showAlert('加载工具列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tool: ToolConfig) => {
    setEditingTool({ ...tool });
    setShowForm(true);
  };

  const handleSave = async (tool: ToolConfig) => {
    if (!adminToken) return;
    try {
      await toolApi.updateToolConfig(tool.toolName, tool, adminToken);
      showAlert('工具配置保存成功', '成功', 'success');
      setShowForm(false);
      setEditingTool(null);
      await loadTools();
    } catch (error: any) {
      console.error('Failed to save tool config:', error);
      showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
    }
  };

  const handleTest = async (toolName: string) => {
    setTestingToolName(toolName);
  };

  const handleInitialize = async () => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      '确定要初始化工具配置吗？这将为所有已注册的工具创建默认配置。',
      '初始化工具配置',
      'warning'
    );
    if (!confirmed) return;

    try {
      await toolApi.initializeToolConfigs(adminToken);
      showAlert('工具配置初始化成功', '成功', 'success');
      await loadTools();
    } catch (error: any) {
      console.error('Failed to initialize tool configs:', error);
      showAlert('初始化失败: ' + (error.message || '未知错误'), '初始化失败', 'error');
    }
  };

  if (loading) {
    return <div className="text-white p-4">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Mentis 工具管理</h2>
        <div className="flex gap-2">
          <Button onClick={handleInitialize} variant="secondary" size="sm">
            初始化配置
          </Button>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索工具名称或描述..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {showForm && editingTool && (
        <ToolConfigForm
          tool={editingTool}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingTool(null);
          }}
        />
      )}

      {testingToolName && (
        <ToolTestDialog
          toolName={testingToolName}
          onClose={() => setTestingToolName(null)}
          adminToken={adminToken}
        />
      )}

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                工具名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                描述
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                分类
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {tools.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                  暂无工具配置
                </td>
              </tr>
            ) : (
              tools.map((tool) => (
                <tr key={tool.toolName} className="hover:bg-slate-750">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {tool.toolName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {tool.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                      {tool.category || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tool.isActive ? (
                      <span className="text-green-400">启用</span>
                    ) : (
                      <span className="text-red-400">禁用</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tool)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleTest(tool.toolName)}
                      className="text-green-400 hover:text-green-300"
                    >
                      测试
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 工具配置表单组件
const ToolConfigForm: React.FC<{
  tool: ToolConfig;
  onSave: (tool: ToolConfig) => void;
  onCancel: () => void;
}> = ({ tool, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ToolConfig>(tool);
  const [jsonErrors, setJsonErrors] = useState<{ [key: string]: string | null }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证 JSON 格式
    const errors: { [key: string]: string | null } = {};
    if (formData.parametersSchema) {
      try {
        JSON.parse(formData.parametersSchema);
        errors.parametersSchema = null;
      } catch (e) {
        errors.parametersSchema = '参数模式 JSON 格式错误';
      }
    }
    if (formData.instructionTemplate) {
      try {
        JSON.parse(formData.instructionTemplate);
        errors.instructionTemplate = null;
      } catch (e) {
        errors.instructionTemplate = '指令模板 JSON 格式错误';
      }
    }
    
    setJsonErrors(errors);
    
    if (Object.values(errors).some(err => err !== null)) {
      showAlert('请修正 JSON 格式错误后再保存', '验证失败', 'error');
      return;
    }
    
    onSave(formData);
  };

  const formatJson = (field: 'parametersSchema' | 'instructionTemplate') => {
    const value = formData[field];
    if (!value) return;
    try {
      const parsed = JSON.parse(value);
      setFormData({ ...formData, [field]: JSON.stringify(parsed, null, 2) });
      setJsonErrors({ ...jsonErrors, [field]: null });
    } catch (e) {
      setJsonErrors({ ...jsonErrors, [field]: '无法格式化：JSON 格式错误' });
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        编辑工具配置: {tool.toolName}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">工具名称</label>
          <input
            type="text"
            value={formData.toolName}
            disabled
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-400 cursor-not-allowed"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">描述</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            rows={3}
            placeholder="工具描述"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">分类</label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            placeholder="browser, terminal, filesystem, code, system, mcp"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">提示词模板分类代码</label>
          <input
            type="text"
            value={formData.promptTemplateCategory || ''}
            onChange={(e) => setFormData({ ...formData, promptTemplateCategory: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            placeholder="mentis.tool.{toolName}.prompt"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-300">参数模式 (JSON Schema)</label>
            <button
              type="button"
              onClick={() => formatJson('parametersSchema')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              格式化
            </button>
          </div>
          <textarea
            value={formData.parametersSchema || ''}
            onChange={(e) => setFormData({ ...formData, parametersSchema: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-700 border rounded text-white font-mono text-sm ${
              jsonErrors.parametersSchema ? 'border-red-500' : 'border-slate-600'
            }`}
            rows={8}
            placeholder='{"type": "object", "properties": {...}}'
          />
          {jsonErrors.parametersSchema && (
            <p className="mt-1 text-xs text-red-400">{jsonErrors.parametersSchema}</p>
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-300">指令模板 (JSON)</label>
            <button
              type="button"
              onClick={() => formatJson('instructionTemplate')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              格式化
            </button>
          </div>
          <textarea
            value={formData.instructionTemplate || ''}
            onChange={(e) => setFormData({ ...formData, instructionTemplate: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-700 border rounded text-white font-mono text-sm ${
              jsonErrors.instructionTemplate ? 'border-red-500' : 'border-slate-600'
            }`}
            rows={6}
            placeholder='{"type": "default", "description": "..."}'
          />
          {jsonErrors.instructionTemplate && (
            <p className="mt-1 text-xs text-red-400">{jsonErrors.instructionTemplate}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">脚本模板</label>
          <textarea
            value={formData.scriptTemplate || ''}
            onChange={(e) => setFormData({ ...formData, scriptTemplate: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white font-mono text-sm"
            rows={8}
            placeholder="# Python 脚本模板&#10;# 变量: {code}"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive ?? true}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="mr-2"
          />
          <label className="text-sm text-slate-300">启用</label>
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit">保存</Button>
          <Button type="button" onClick={onCancel} variant="secondary">
            取消
          </Button>
        </div>
      </form>
    </div>
  );
};

// 工具测试对话框
const ToolTestDialog: React.FC<{
  toolName: string;
  onClose: () => void;
  adminToken: string | null;
}> = ({ toolName, onClose, adminToken }) => {
  const [parameters, setParameters] = useState<string>('{}');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!adminToken) return;
    
    // 验证 JSON 格式
    let parsedParams: Record<string, any>;
    try {
      parsedParams = JSON.parse(parameters);
      setJsonError(null);
    } catch (e) {
      setJsonError('参数 JSON 格式错误');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      const result = await toolApi.testTool(toolName, { parameters: parsedParams }, adminToken);
      setTestResult(result);
    } catch (error: any) {
      console.error('Failed to test tool:', error);
      setTestResult({
        success: false,
        error: error.message || '测试失败',
      });
    } finally {
      setTesting(false);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(parameters);
      setParameters(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e) {
      setJsonError('无法格式化：JSON 格式错误');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">测试工具: {toolName}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-300">工具参数 (JSON)</label>
              <button
                type="button"
                onClick={formatJson}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                格式化
              </button>
            </div>
            <textarea
              value={parameters}
              onChange={(e) => {
                setParameters(e.target.value);
                setJsonError(null);
              }}
              className={`w-full px-3 py-2 bg-slate-700 border rounded text-white font-mono text-sm ${
                jsonError ? 'border-red-500' : 'border-slate-600'
              }`}
              rows={8}
              placeholder='{"param1": "value1", "param2": "value2"}'
            />
            {jsonError && (
              <p className="mt-1 text-xs text-red-400">{jsonError}</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleTest} disabled={testing}>
              {testing ? '测试中...' : '执行测试'}
            </Button>
            <Button onClick={onClose} variant="secondary">
              关闭
            </Button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-slate-700 rounded">
              <h4 className="text-sm font-medium text-white mb-2">测试结果</h4>
              <div className={`text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.success ? '✓ 成功' : '✗ 失败'}
              </div>
              {testResult.message && (
                <div className="mt-2 text-sm text-slate-300">{testResult.message}</div>
              )}
              {testResult.error && (
                <div className="mt-2 text-sm text-red-400">{testResult.error}</div>
              )}
              {testResult.result && (
                <div className="mt-2 text-sm text-slate-300">
                  <pre className="bg-slate-800 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
