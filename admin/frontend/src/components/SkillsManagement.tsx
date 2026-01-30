import React, { useState, useEffect } from 'react';
import { SkillService, type SkillDefinition } from '../services/skill/SkillService';
import { executeSkillForTest, isSkillTestExecutionConfigured, type SkillExecutionResultDTO } from '../services/skill/SkillTestExecutionService';
import { SkillCreator } from './skill/SkillCreator';
import { Button } from "./Button";
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';

interface SkillsManagementProps {
  adminToken: string | null;
}

export const SkillsManagement: React.FC<SkillsManagementProps> = ({ adminToken }) => {
  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillDefinition | null>(null);
  
  const skillService = new SkillService();

  // 表单状态
  const [formData, setFormData] = useState<Partial<SkillDefinition>>({
    skillId: '',
    name: '',
    description: '',
    category: '',
    skillType: 'ACTIVE',
    executionType: 'RULE_BASED',
    // 已移除：functionSchema (废弃，改用 mcpToolConfig)
    executionConfig: '',
    autoTriggerKeywords: '',
    maxUsagePerDay: -1,
    version: '1.0.0',
    author: '',
    isSystemSkill: false,
    // 新增字段
    license: '',
    compatibility: '',
    metadata: '',
    skillContent: '',
    mcpToolConfig: '',
  });

  useEffect(() => {
    loadSkills();
  }, [adminToken]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const allSkills = await skillService.getAllSkills(undefined, adminToken);
      setSkills(allSkills);
    } catch (err: any) {
      setError(err.message || '加载技能失败');
      console.error('加载技能失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const [showProfessionalCreator, setShowProfessionalCreator] = useState(false);
  const [editingSkillIdForCreator, setEditingSkillIdForCreator] = useState<string | null>(null);

  // 技能测试弹窗
  const [testModalSkill, setTestModalSkill] = useState<SkillDefinition | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testLog, setTestLog] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<SkillExecutionResultDTO | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const skillTestConfigured = isSkillTestExecutionConfigured();

  const handleCreate = () => {
    setFormData({
      skillId: '',
      name: '',
      description: '',
      category: '',
      skillType: 'ACTIVE',
      executionType: 'RULE_BASED',
      // 已移除：functionSchema (废弃，改用 mcpToolConfig)
      executionConfig: '',
      autoTriggerKeywords: '',
      maxUsagePerDay: -1,
      version: '1.0.0',
      author: '',
      isSystemSkill: false,
      // 新增字段
      license: '',
      compatibility: '',
      metadata: '',
      skillContent: '',
      mcpToolConfig: '',
    });
    setEditingSkill(null);
    setShowCreateDialog(true);
  };

  const handleOpenProfessionalCreator = () => {
    setShowProfessionalCreator(true);
  };

  const handleEdit = (skill: SkillDefinition) => {
    setEditingSkillIdForCreator(skill.skillId);
    setShowProfessionalCreator(true);
  };

  const openTestModal = (skill: SkillDefinition) => {
    setTestModalSkill(skill);
    setTestInput('');
    setTestLog([]);
    setTestResult(null);
    setTestLoading(false);
  };

  const closeTestModal = () => {
    setTestModalSkill(null);
    setTestInput('');
    setTestLog([]);
    setTestResult(null);
    setTestLoading(false);
  };

  const runSkillTest = async () => {
    if (!testModalSkill || testLoading) return;
    setTestLoading(true);
    setTestLog([]);
    setTestResult(null);

    const appendLog = (line: string) => {
      setTestLog((prev) => [...prev, `${new Date().toLocaleTimeString('zh-CN')} ${line}`]);
    };

    const result = await executeSkillForTest({
      skillId: testModalSkill.skillId,
      inputText: testInput,
      parameters: {},
      onLog: appendLog,
    });

    setTestResult(result ?? null);
    setTestLoading(false);
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm(`确定要删除技能 "${skillId}" 吗？`)) {
      return;
    }

    try {
      await skillService.deleteSkill(skillId, adminToken);
      await loadSkills();
    } catch (err: any) {
      alert(err.message || '删除技能失败');
      console.error('删除技能失败:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      // 仅支持指令驱动，保存时统一为 RULE_BASED
      const payload = { ...formData, executionType: 'RULE_BASED' } as SkillDefinition;
      if (editingSkill) {
        await skillService.updateSkill(editingSkill.skillId, payload, adminToken);
      } else {
        if (!formData.skillId || !formData.name) {
          alert('请填写技能ID和名称');
          return;
        }
        await skillService.createSkill(payload, adminToken);
      }
      setShowCreateDialog(false);
      setEditingSkill(null);
      await loadSkills();
    } catch (err: any) {
      alert(err.message || (editingSkill ? '更新技能失败' : '创建技能失败'));
      console.error('保存技能失败:', err);
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = !searchTerm || 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.skillId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  if (loading && skills.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-400">加载中...</div>
      </div>
    );
  }

  if (showProfessionalCreator) {
    return (
      <SkillCreator
        adminToken={adminToken}
        onClose={() => {
          setShowProfessionalCreator(false);
          setEditingSkillIdForCreator(null);
        }}
        onSuccess={() => {
          setShowProfessionalCreator(false);
          setEditingSkillIdForCreator(null);
          loadSkills();
        }}
        editingSkillId={editingSkillIdForCreator}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">技能管理</h2>
        <div className="flex gap-2">
          <Button onClick={handleOpenProfessionalCreator} variant="primary">
            ✨ 专业创建器
          </Button>
          <Button onClick={handleCreate} variant="secondary">
            + 创建技能
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="mb-6 flex gap-4">
        <InputGroup label="搜索">
          <TextInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索技能名称、ID或描述..."
            className="w-64"
          />
        </InputGroup>
        <InputGroup label="分类">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="">全部</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </InputGroup>
      </div>

      {/* 技能列表 */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 whitespace-nowrap min-w-[200px]">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 whitespace-nowrap min-w-[180px]">名称</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 whitespace-nowrap min-w-[120px]">分类</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 whitespace-nowrap min-w-[100px]">类型</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 whitespace-nowrap min-w-[120px]">执行类型</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 whitespace-nowrap min-w-[80px]">版本</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 whitespace-nowrap min-w-[100px]">系统技能</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 whitespace-nowrap min-w-[120px]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    {searchTerm || selectedCategory ? '没有找到匹配的技能' : '暂无技能，点击"创建技能"开始创建'}
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-300 font-mono whitespace-nowrap min-w-[200px]">{skill.skillId}</td>
                    <td className="px-4 py-3 text-sm text-white min-w-[180px]">{skill.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap min-w-[120px]">{skill.category || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap min-w-[100px]">{skill.skillType || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap min-w-[120px]">{skill.executionType || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap min-w-[80px]">{skill.version || '-'}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap min-w-[100px]">
                      {skill.isSystemSkill ? (
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">系统</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">自定义</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap min-w-[160px]">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openTestModal(skill)}
                          variant="ghost"
                          className="text-sm text-emerald-400 hover:text-emerald-300"
                        >
                          测试
                        </Button>
                        <Button
                          onClick={() => handleEdit(skill)}
                          variant="ghost"
                          className="text-sm"
                        >
                          编辑
                        </Button>
                        {!skill.isSystemSkill && (
                          <Button
                            onClick={() => handleDelete(skill.skillId)}
                            variant="ghost"
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            删除
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 技能测试弹窗 */}
      {testModalSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                技能测试：{testModalSkill.name}（{testModalSkill.skillId}）
              </h3>
              <Button variant="ghost" onClick={closeTestModal} className="text-slate-400 hover:text-white">
                关闭
              </Button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {!skillTestConfigured && (
                <div className="p-3 bg-amber-950/30 border border-amber-800 rounded-lg text-amber-200 text-sm">
                  未配置 Main 后端地址，无法执行测试。请在环境变量中设置 <code className="bg-slate-800 px-1 rounded">VITE_MAIN_BACKEND_URL</code>（如 http://localhost:8081），可选 <code className="bg-slate-800 px-1 rounded">VITE_MAIN_API_KEY</code>。
                </div>
              )}
              <InputGroup label="输入内容（将作为参数传入技能）">
                <TextArea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="输入测试内容，例如：今天北京天气怎么样？"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                />
              </InputGroup>
              <div className="flex justify-end">
                <Button
                  onClick={runSkillTest}
                  disabled={testLoading || !skillTestConfigured}
                  variant="primary"
                  className="text-sm"
                >
                  {testLoading ? '执行中…' : '执行技能'}
                </Button>
              </div>
              {testLog.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">执行过程</label>
                  <pre className="p-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 text-sm overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {testLog.join('\n')}
                  </pre>
                </div>
              )}
              {testResult && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">执行结果</label>
                  <div
                    className={`p-3 rounded-lg border text-sm ${
                      testResult.success
                        ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                        : 'bg-red-950/30 border-red-800 text-red-200'
                    }`}
                  >
                    {testResult.success ? (
                      <pre className="whitespace-pre-wrap break-words">
                        {typeof testResult.result === 'object'
                          ? JSON.stringify(testResult.result, null, 2)
                          : String(testResult.result ?? '')}
                      </pre>
                    ) : (
                      <p>{testResult.errorMessage ?? '执行失败'}</p>
                    )}
                    {testResult.executionTimeMs != null && (
                      <p className="mt-2 text-slate-500 text-xs">耗时: {testResult.executionTimeMs} ms</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 创建/编辑对话框 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                {editingSkill ? '编辑技能' : '创建技能'}
              </h3>

              <div className="space-y-4">
                <InputGroup label="技能ID *" required>
                  <TextInput
                    value={formData.skillId || ''}
                    onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                    placeholder="例如: test-skill"
                    disabled={!!editingSkill}
                  />
                </InputGroup>

                <InputGroup label="名称 *" required>
                  <TextInput
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="技能显示名称"
                  />
                </InputGroup>

                <InputGroup label="描述">
                  <TextArea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="技能描述"
                    rows={3}
                  />
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="分类">
                    <TextInput
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="例如: test, utility"
                    />
                  </InputGroup>

                  <InputGroup label="技能类型">
                    <select
                      value={formData.skillType || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="ACTIVE">主动技能</option>
                      <option value="PASSIVE">被动技能</option>
                    </select>
                  </InputGroup>
                </div>

                {/* 执行配置：仅支持指令驱动（与 Claude Skill 一致），无需选择 */}
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="最大每日使用次数">
                    <TextInput
                      type="number"
                      value={formData.maxUsagePerDay || -1}
                      onChange={(e) => setFormData({ ...formData, maxUsagePerDay: parseInt(e.target.value) || -1 })}
                      placeholder="-1 表示无限制"
                    />
                  </InputGroup>
                  <div />
                </div>
                <p className="text-slate-500 text-sm mb-2">
                  技能由 AI 按指令执行，与 Claude Skill 一致。仅需多步骤 workflow 时可填写下方执行参数。
                </p>
                <InputGroup label="执行参数（可选）">
                  <TextArea
                    value={formData.executionConfig || ''}
                    onChange={(e) => setFormData({ ...formData, executionConfig: e.target.value })}
                    placeholder='例如: {"workflow": {"default": {"steps": ["step1", "step2"]}}}'
                    rows={3}
                  />
                </InputGroup>

                <InputGroup label="自动触发关键词">
                  <TextInput
                    value={formData.autoTriggerKeywords || ''}
                    onChange={(e) => setFormData({ ...formData, autoTriggerKeywords: e.target.value })}
                    placeholder="用逗号分隔，例如: 帮助,help,assist"
                  />
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="版本">
                    <TextInput
                      value={formData.version || '1.0.0'}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="1.0.0"
                    />
                  </InputGroup>

                  <InputGroup label="作者">
                    <TextInput
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="作者名称"
                    />
                  </InputGroup>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSystemSkill"
                    checked={formData.isSystemSkill || false}
                    onChange={(e) => setFormData({ ...formData, isSystemSkill: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isSystemSkill" className="text-sm text-slate-300">
                    系统技能（系统技能不可删除）
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingSkill(null);
                  }}
                  variant="ghost"
                >
                  取消
                </Button>
                <Button onClick={handleSubmit} variant="primary">
                  {editingSkill ? '更新' : '创建'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
