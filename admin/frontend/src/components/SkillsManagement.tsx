import React, { useState, useEffect } from 'react';
import { SkillService, type SkillDefinition } from '../services/skill/SkillService';
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
    functionSchema: '',
    executionConfig: '',
    autoTriggerKeywords: '',
    maxUsagePerDay: -1,
    version: '1.0.0',
    author: '',
    isSystemSkill: false,
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

  const handleCreate = () => {
    setFormData({
      skillId: '',
      name: '',
      description: '',
      category: '',
      skillType: 'ACTIVE',
      executionType: 'RULE_BASED',
      functionSchema: '',
      executionConfig: '',
      autoTriggerKeywords: '',
      maxUsagePerDay: -1,
      version: '1.0.0',
      author: '',
      isSystemSkill: false,
    });
    setEditingSkill(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (skill: SkillDefinition) => {
    setFormData({
      skillId: skill.skillId,
      name: skill.name,
      description: skill.description,
      category: skill.category || '',
      skillType: skill.skillType || 'ACTIVE',
      executionType: skill.executionType || 'RULE_BASED',
      functionSchema: skill.functionSchema || '',
      executionConfig: '',
      autoTriggerKeywords: skill.autoTriggerKeywords || '',
      maxUsagePerDay: skill.maxUsagePerDay || -1,
      version: skill.version || '1.0.0',
      author: skill.author || '',
      isSystemSkill: skill.isSystemSkill || false,
    });
    setEditingSkill(skill);
    setShowCreateDialog(true);
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
      if (editingSkill) {
        // 更新技能
        await skillService.updateSkill(editingSkill.skillId, formData as SkillDefinition, adminToken);
      } else {
        // 创建技能
        if (!formData.skillId || !formData.name) {
          alert('请填写技能ID和名称');
          return;
        }
        await skillService.createSkill(formData as SkillDefinition, adminToken);
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">技能管理</h2>
        <Button onClick={handleCreate} variant="primary">
          + 创建技能
        </Button>
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
                    <td className="px-4 py-3 text-sm whitespace-nowrap min-w-[120px]">
                      <div className="flex gap-2">
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

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="执行类型">
                    <select
                      value={formData.executionType || 'RULE_BASED'}
                      onChange={(e) => setFormData({ ...formData, executionType: e.target.value })}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="RULE_BASED">规则 based</option>
                      <option value="SCRIPT">脚本</option>
                      <option value="API">API</option>
                      <option value="GRAPH">Graph</option>
                      <option value="DATABASE">数据库</option>
                    </select>
                  </InputGroup>

                  <InputGroup label="最大每日使用次数">
                    <TextInput
                      type="number"
                      value={formData.maxUsagePerDay || -1}
                      onChange={(e) => setFormData({ ...formData, maxUsagePerDay: parseInt(e.target.value) || -1 })}
                      placeholder="-1 表示无限制"
                    />
                  </InputGroup>
                </div>

                <InputGroup label="Function Schema (JSON)">
                  <TextArea
                    value={formData.functionSchema || ''}
                    onChange={(e) => setFormData({ ...formData, functionSchema: e.target.value })}
                    placeholder='{"type":"object","properties":{...}}'
                    rows={5}
                  />
                </InputGroup>

                <InputGroup label="执行配置 (JSON)">
                  <TextArea
                    value={formData.executionConfig || ''}
                    onChange={(e) => setFormData({ ...formData, executionConfig: e.target.value })}
                    placeholder='{"rule":"echo"}'
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
