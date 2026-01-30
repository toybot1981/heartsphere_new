import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { SkillCreatorService, SkillTemplate, McpToolInfo, SkillValidationResult, SkillQualityReport } from '../../services/skill/SkillCreatorService';
import { SkillResourceService, SkillResource } from '../../services/skill/SkillResourceService';
import { SkillService } from '../../services/skill/SkillService';
import { Button } from '../Button';
import { InputGroup, TextInput, TextArea, Select } from '../AdminUIComponents';
import { CreationMethodSelectionStep, AIGenerationStep, FileImportStep, SingleTableView } from './SkillCreatorComponents';

interface SkillCreatorProps {
  adminToken: string | null;
  onClose: () => void;
  onSuccess?: () => void;
  /** 编辑模式：传入技能 ID 时直接加载该技能并进入单表视图 */
  editingSkillId?: string | null;
}

type Step = 'creation-method' | 'ai-generation' | 'file-import' | 'template' | 'basic' | 'metadata' | 'instruction' | 'mcp' | 'execution' | 'resources' | 'preview' | 'single-table';
type CreationMethod = 'ai' | 'file' | 'manual' | null;

export const SkillCreator: React.FC<SkillCreatorProps> = ({ adminToken, onClose, onSuccess, editingSkillId }) => {
  const [currentStep, setCurrentStep] = useState<Step>(editingSkillId ? 'single-table' : 'ai-generation');
  const [resourcesList, setResourcesList] = useState<Array<{ id: number; resourceType: string; resourceName: string; orderIndex?: number }>>([]);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<SkillTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SkillTemplate | null>(null);
  const [mcpTools, setMcpTools] = useState<McpToolInfo[]>([]);
  const [validationResult, setValidationResult] = useState<SkillValidationResult | null>(null);
  const [qualityReport, setQualityReport] = useState<SkillQualityReport | null>(null);
  const [loading, setLoading] = useState(false);
  
  const creatorService = new SkillCreatorService();
  const skillService = new SkillService();
  const isInitializing = useRef(false); // 防止重复初始化
  const hasInitialized = useRef(false); // 跟踪是否已完成初始化

  // 表单数据
  const [formData, setFormData] = useState<Record<string, any>>({
    skillId: '',
    name: '',
    description: '',
    category: '',
    skillType: 'ACTIVE',
    executionType: 'RULE_BASED',
    license: '',
    compatibility: '',
    metadata: '',
    instruction: '',
    mcpToolConfig: '',
    executionConfig: '',
    version: '1.0.0',
    author: '',
    isSystemSkill: false,
  });

  useEffect(() => {
    // 防止 React 严格模式下的重复调用
    if (isInitializing.current || hasInitialized.current) {
      return;
    }
    
    isInitializing.current = true;
    initialize();
    
    // 清理函数：组件卸载时重置标志
    return () => {
      // 注意：这里不重置 hasInitialized，因为初始化完成后不应该再次初始化
      isInitializing.current = false;
    };
  }, []);

  // 编辑模式：加载技能及资源并进入单表视图
  useEffect(() => {
    if (!editingSkillId || !adminToken) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await skillService.getSkillByIdWithResources(editingSkillId, adminToken);
        if (cancelled || !data) return;
        const s = data.skill;
        setFormData(prev => ({
          ...prev,
          skillId: s.skillId,
          name: s.name,
          description: s.description ?? '',
          category: s.category ?? '',
          skillType: s.skillType ?? 'ACTIVE',
          executionType: s.executionType ?? 'RULE_BASED',
          license: s.license ?? '',
          compatibility: s.compatibility ?? '',
          metadata: s.metadata ?? '',
          instruction: s.skillContent ?? '',
          skillContent: s.skillContent ?? '',
          mcpToolConfig: s.mcpToolConfig ?? '',
          executionConfig: s.executionConfig ?? '',
          version: s.version ?? '1.0.0',
          author: s.author ?? '',
          isSystemSkill: s.isSystemSkill ?? false,
        }));
        setResourcesList(data.resources.map(r => ({ id: r.id, resourceType: r.resourceType, resourceName: r.resourceName, orderIndex: r.orderIndex })));
        setCurrentStep('single-table');
      } catch (e) {
        console.error('加载技能失败:', e);
        alert('加载技能失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [editingSkillId, adminToken]);

  const initialize = async () => {
    // 如果已经有 sessionId 或已经初始化过，说明已经初始化过了
    if (sessionId || hasInitialized.current) {
      return;
    }
    
    try {
      setLoading(true);
      // 开始创建流程
      const response = await creatorService.startCreation(adminToken);
      setSessionId(response.sessionId);
      
      // 加载模板
      const templatesList = await creatorService.getTemplates(adminToken);
      setTemplates(templatesList);
      
      // 加载MCP工具
      const tools = await creatorService.getMcpTools(adminToken);
      setMcpTools(tools);
      
      // 标记为已初始化
      hasInitialized.current = true;
    } catch (error: any) {
      console.error('初始化失败:', error);
      // 如果错误是"创建流程已开始"，说明已经初始化过了，可以继续
      if (error.message && error.message.includes('创建流程已开始')) {
        console.warn('创建流程已开始，继续使用现有会话');
        // 标记为已初始化，避免重复调用
        hasInitialized.current = true;
        // 继续加载其他资源
        try {
          const templatesList = await creatorService.getTemplates(adminToken);
          setTemplates(templatesList);
          const tools = await creatorService.getMcpTools(adminToken);
          setMcpTools(tools);
        } catch (loadError) {
          console.error('加载资源失败:', loadError);
        }
      } else {
        alert('初始化失败: ' + (error.message || '未知错误'));
      }
    } finally {
      setLoading(false);
      isInitializing.current = false;
    }
  };

  const handleTemplateSelect = (template: SkillTemplate) => {
    setSelectedTemplate(template);
    // 应用模板
    const newFormData = { ...formData };
    if (template.metadata) {
      Object.assign(newFormData, template.metadata);
    }
    if (template.instruction) {
      newFormData.instruction = template.instruction;
    }
    if (template.mcpToolConfig) {
      newFormData.mcpToolConfig = template.mcpToolConfig;
    }
    if (template.executionConfig) {
      newFormData.executionConfig = template.executionConfig;
    }
    setFormData(newFormData);
    setCurrentStep('basic');
  };

  const handleNext = async () => {
    // 验证当前步骤
    if (currentStep === 'basic') {
      if (!formData.skillId || !formData.name || !formData.description) {
        alert('请填写技能ID、名称和描述');
        return;
      }
    }

    // 保存草稿
    if (sessionId) {
      try {
        await creatorService.saveDraft(sessionId, formData, adminToken);
      } catch (error) {
        console.warn('保存草稿失败:', error);
      }
    }

    // 移动到下一步
    const steps: Step[] = ['creation-method', 'ai-generation', 'file-import', 'template', 'basic', 'metadata', 'instruction', 'mcp', 'execution', 'resources', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: Step[] = ['creation-method', 'ai-generation', 'file-import', 'template', 'basic', 'metadata', 'instruction', 'mcp', 'execution', 'resources', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleValidate = async () => {
    try {
      setLoading(true);
      const result = await creatorService.validateSkill(formData, adminToken);
      setValidationResult(result);
      
      // 同时分析质量
      const quality = await creatorService.analyzeQuality(formData, adminToken);
      setQualityReport(quality);
    } catch (error: any) {
      console.error('验证失败:', error);
      alert('验证失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnalyzeQuality = async () => {
    try {
      setLoading(true);
      const quality = await creatorService.analyzeQuality(formData, adminToken);
      setQualityReport(quality);
    } catch (error: any) {
      console.error('质量分析失败:', error);
      alert('质量分析失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        executionType: 'RULE_BASED',
        skillContent: formData.skillContent ?? formData.instruction,
      };
      const validation = await creatorService.validateSkill(payload, adminToken);
      if (!validation?.valid) {
        setValidationResult(validation ?? { valid: false, errors: [], warnings: [] });
        const errMsg = Array.isArray(validation?.errors) && validation.errors.length > 0
          ? validation.errors.join('；')
          : '请检查技能ID、名称、描述等必填项';
        alert('验证未通过: ' + errMsg);
        return;
      }

      await creatorService.finalizeSkill(payload, adminToken);
      alert('技能创建成功！');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('创建失败:', error);
      alert('创建失败: ' + (error?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreationMethodSelect = (method: CreationMethod) => {
    setCreationMethod(method);
    if (method === 'ai') setCurrentStep('ai-generation');
    else if (method === 'file') setCurrentStep('file-import');
    else if (method === 'manual') setCurrentStep('template');
  };

  const handleBackToGenerate = () => {
    setCurrentStep('ai-generation');
  };

  const handleAIGenerationComplete = (generatedData: Record<string, any>) => {
    if (!generatedData || typeof generatedData !== 'object') {
      console.warn('[技能创建] 前端 handleAIGenerationComplete 收到无效数据(完整):', JSON.stringify(generatedData, null, 2));
      return;
    }
    console.info('[技能创建] 前端 合并到表单(完整):', JSON.stringify(generatedData, null, 2));
    const payload = { ...generatedData };
    if (payload.instruction != null && payload.skillContent == null) {
      payload.skillContent = payload.instruction;
      console.info('[技能创建] 前端 已同步 instruction -> skillContent');
    }
    // 先同步提交 formData，再切换步骤，确保单表视图首次渲染即拿到合并后的数据
    flushSync(() => {
      setFormData(prev => ({ ...prev, ...payload }));
      setResourcesList([]);
    });
    setCurrentStep('single-table');
    console.info('[技能创建] 前端 已切换到单表视图');
  };

  const handleFileImportComplete = (importedData: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...importedData }));
    setResourcesList([]);
    setCurrentStep('single-table');
  };

  const handleSaveFromSingleTable = async () => {
    if (editingSkillId) {
      try {
        setLoading(true);
        const payload = {
          ...formData,
          executionType: 'RULE_BASED' as const,
          skillContent: formData.skillContent ?? formData.instruction,
        };
        await skillService.updateSkill(editingSkillId, payload, adminToken);
        alert('更新成功！');
        onSuccess?.();
        onClose();
      } catch (error: any) {
        console.error('更新失败:', error);
        alert('更新失败: ' + (error?.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    } else {
      await handleFinalize();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'ai-generation':
        return (
          <AIGenerationStep
            sessionId={sessionId}
            adminToken={adminToken}
            onComplete={handleAIGenerationComplete}
            onBack={undefined}
          />
        );
      case 'creation-method':
        return (
          <CreationMethodSelectionStep
            onSelect={handleCreationMethodSelect}
          />
        );
      case 'file-import':
        return (
          <FileImportStep
            sessionId={sessionId}
            adminToken={adminToken}
            onComplete={handleFileImportComplete}
            onBack={() => setCurrentStep('ai-generation')}
          />
        );
      case 'template':
        return (
          <TemplateSelectionStep
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelect={handleTemplateSelect}
            onSkip={() => setCurrentStep('basic')}
          />
        );
      case 'basic':
        return (
          <BasicInfoStep
            formData={formData}
            onChange={updateFormData}
          />
        );
      case 'metadata':
        return (
          <MetadataStep
            formData={formData}
            onChange={updateFormData}
          />
        );
      case 'instruction':
        return (
          <InstructionStep
            formData={formData}
            onChange={updateFormData}
            onValidate={handleValidate}
            onAnalyzeQuality={handleAnalyzeQuality}
            validationResult={validationResult}
            qualityReport={qualityReport}
          />
        );
      case 'mcp':
        return (
          <McpToolConfigStep
            formData={formData}
            mcpTools={mcpTools}
            onChange={updateFormData}
            onValidate={async (mcpConfigId, toolNames) => {
              const result = await creatorService.validateMcpTool(mcpConfigId, toolNames, adminToken);
              setValidationResult(result);
              return result;
            }}
            validationResult={validationResult}
          />
        );
      case 'execution':
        return (
          <ExecutionConfigStep
            formData={formData}
            onChange={updateFormData}
          />
        );
      case 'resources':
        return (
          <ResourcesStep
            skillId={formData.skillId}
            formData={formData}
            onChange={updateFormData}
            adminToken={adminToken}
          />
        );
      case 'preview':
        return (
          <PreviewStep
            formData={formData}
            validationResult={validationResult}
            qualityReport={qualityReport}
            onValidate={handleValidate}
            onValidateEnhanced={async () => {
              if (formData.skillId) {
                try {
                  const result = await creatorService.validateEnhanced(formData.skillId, adminToken);
                  return result;
                } catch (error: any) {
                  console.error('增强验证失败:', error);
                  return null;
                }
              }
              return null;
            }}
            adminToken={adminToken}
          />
        );
      case 'single-table':
        return (
          <SingleTableView
            formData={formData}
            onChange={updateFormData}
            resources={resourcesList}
            onSave={handleSaveFromSingleTable}
            onBack={editingSkillId ? undefined : handleBackToGenerate}
            isEditMode={!!editingSkillId}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = (step?: Step) => {
    const stepToUse = step || currentStep;
    const titles: Record<Step, string> = {
      'creation-method': '选择创建方式',
      'ai-generation': 'AI生成',
      'file-import': '文件导入',
      template: '选择模板',
      basic: '基础信息',
      metadata: '元数据配置',
      instruction: '指令编写',
      mcp: 'MCP工具配置',
      execution: '执行配置',
      resources: '资源管理',
      preview: '预览与验证',
      'single-table': '单表视图',
    };
    return titles[stepToUse];
  };

  const stepsForNav: Step[] = ['creation-method', 'ai-generation', 'file-import', 'template', 'basic', 'metadata', 'instruction', 'mcp', 'execution', 'resources', 'preview', 'single-table'];
  const currentStepIndex = stepsForNav.indexOf(currentStep);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>专业技能创建器</h2>
        <Button onClick={onClose}>关闭</Button>
      </div>

      {/* 步骤内容（无 tab，仅 AI 一键生成 → 单表编辑） */}
      <div style={{ minHeight: '400px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
        {loading ? (
          <div>加载中...</div>
        ) : (
          renderStep()
        )}
      </div>

      {/* 仅非单表且非 AI 生成步骤时显示上一步/下一步（保留手动编辑等分支的导航） */}
      {currentStep !== 'single-table' && currentStep !== 'ai-generation' && currentStep !== 'creation-method' && currentStep !== 'file-import' && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handlePrevious} disabled={currentStepIndex === 0}>
            上一步
          </Button>
          <div>
            {currentStep === 'preview' ? (
              <>
                <Button onClick={handleValidate} style={{ marginRight: '10px' }}>
                  验证
                </Button>
                <Button onClick={handleFinalize} disabled={loading}>
                  完成创建
                </Button>
              </>
            ) : (
              <Button onClick={handleNext} disabled={loading}>
                下一步
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 模板选择步骤
const TemplateSelectionStep: React.FC<{
  templates: SkillTemplate[];
  selectedTemplate: SkillTemplate | null;
  onSelect: (template: SkillTemplate) => void;
  onSkip: () => void;
}> = ({ templates, selectedTemplate, onSelect, onSkip }) => {
  return (
    <div>
      <h3>选择技能模板（可选）</h3>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        选择一个模板可以快速开始，或者跳过直接创建
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {templates.map(template => (
          <div
            key={template.id}
            onClick={() => onSelect(template)}
            style={{
              padding: '15px',
              border: selectedTemplate?.id === template.id ? '2px solid #4CAF50' : '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: selectedTemplate?.id === template.id ? '#f0f8f0' : 'white',
            }}
          >
            <h4>{template.name}</h4>
            <p style={{ fontSize: '12px', color: '#666' }}>{template.description}</p>
            <span style={{ fontSize: '11px', color: '#999' }}>{template.category}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <Button onClick={onSkip}>跳过，直接创建</Button>
      </div>
    </div>
  );
};

// 基础信息步骤
const BasicInfoStep: React.FC<{
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}> = ({ formData, onChange }) => {
  return (
    <div>
      <h3>基础信息</h3>
      <InputGroup>
        <TextInput
          label="技能ID *"
          value={formData.skillId || ''}
          onChange={(e) => onChange('skillId', e.target.value)}
          placeholder="例如: weather-query, file-manager, data-analyzer"
        />
        <small style={{ color: '#666' }}>
          只能包含小写字母、数字和单连字符，1-64字符。格式要求：小写字母开头，可以使用连字符分隔单词。
          <br />
          示例：my-skill-123, weather-query, file-manager
        </small>
      </InputGroup>
      <InputGroup>
        <TextInput
          label="技能名称 *"
          value={formData.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="例如: 天气查询、文件管理器、数据分析工具"
        />
        <small style={{ color: '#666' }}>技能的中文或英文名称，用于显示和识别</small>
      </InputGroup>
      <InputGroup>
        <TextArea
          label="技能描述 *"
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="详细描述技能的功能、使用场景和预期效果。例如：这是一个天气查询技能，可以根据城市名称查询当前天气和未来7天的天气预报，支持中文和英文城市名称。"
          rows={5}
        />
        <small style={{ color: '#666' }}>
          建议包含：功能说明、使用场景、输入输出格式、预期效果。长度要求：1-1024字符。
          <br />
          提示：详细的描述有助于AI更好地理解和调用该技能。
        </small>
      </InputGroup>
      <InputGroup>
        <Select
          label="技能分类"
          value={formData.category || ''}
          onChange={(e) => onChange('category', e.target.value)}
        >
          <option value="">请选择</option>
          <option value="UTILITY">工具类</option>
          <option value="HEALTHCARE">健康医疗</option>
          <option value="EDUCATION">教育学习</option>
          <option value="SOCIAL">社交互动</option>
          <option value="CREATIVE">创作</option>
        </Select>
      </InputGroup>
      <InputGroup>
        <Select
          label="技能类型"
          value={formData.skillType || 'ACTIVE'}
          onChange={(e) => onChange('skillType', e.target.value)}
        >
          <option value="ACTIVE">主动</option>
          <option value="PASSIVE">被动</option>
          <option value="AUTOMATIC">自动</option>
        </Select>
      </InputGroup>
    </div>
  );
};

// 元数据配置步骤
const MetadataStep: React.FC<{
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}> = ({ formData, onChange }) => {
  return (
    <div>
      <h3>元数据配置</h3>
      <InputGroup>
        <TextInput
          label="许可证"
          value={formData.license || ''}
          onChange={(e) => onChange('license', e.target.value)}
          placeholder="例如: MIT, Apache-2.0"
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          label="兼容性信息（JSON）"
          value={formData.compatibility || ''}
          onChange={(e) => onChange('compatibility', e.target.value)}
          placeholder='例如: {"minVersion": "1.0.0"}'
        />
      </InputGroup>
      <InputGroup>
        <TextArea
          label="自定义元数据（JSON）"
          value={formData.metadata || ''}
          onChange={(e) => onChange('metadata', e.target.value)}
          placeholder='例如: {"tags": ["ai", "utility"]}'
          rows={3}
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          label="版本号"
          value={formData.version || '1.0.0'}
          onChange={(e) => onChange('version', e.target.value)}
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          label="作者"
          value={formData.author || ''}
          onChange={(e) => onChange('author', e.target.value)}
        />
      </InputGroup>
    </div>
  );
};

// 指令编写步骤
const InstructionStep: React.FC<{
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onValidate: () => void;
  onAnalyzeQuality: () => void;
  validationResult: SkillValidationResult | null;
  qualityReport: SkillQualityReport | null;
}> = ({ formData, onChange, onValidate, onAnalyzeQuality, validationResult, qualityReport }) => {
  return (
    <div>
      <h3>指令编写</h3>
      <p style={{ marginBottom: '15px', color: '#666' }}>
        使用 Markdown 格式编写技能指令。注意：技能应返回实际执行结果，不能返回 FunctionCall 格式。
      </p>
      <InputGroup>
        <TextArea
          label="指令内容（Markdown）"
          value={formData.instruction || ''}
          onChange={(e) => onChange('instruction', e.target.value)}
          placeholder={`# 技能指令

请详细描述技能的执行逻辑、使用方法和注意事项。

## 使用场景
描述什么情况下应该使用这个技能。

## 输入参数
- 参数1：说明
- 参数2：说明

## 执行步骤
1. 第一步
2. 第二步
3. 第三步

## 输出格式
描述返回结果的格式和内容。

## 注意事项
- 注意事项1
- 注意事项2`}
          rows={15}
        />
        <small style={{ color: '#666' }}>
          使用 Markdown 格式编写详细的技能指令。建议包含：使用场景、输入参数、执行步骤、输出格式、注意事项。
          <br />
          提示：清晰的指令有助于AI正确理解和使用该技能。
        </small>
      </InputGroup>
      {/* 质量报告 */}
      {qualityReport && (
        <div style={{ marginTop: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px', marginBottom: '10px' }}>
            <h4 style={{ marginTop: 0 }}>质量分析报告</h4>
            <p><strong>综合评分:</strong> {qualityReport.totalScore}/100 ({qualityReport.descriptionLevel})</p>
            <p><strong>描述评分:</strong> {qualityReport.descriptionScore}/100</p>
            <p><strong>完整性评分:</strong> {qualityReport.completenessScore}/100</p>
            {qualityReport.descriptionSuggestions.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong>描述改进建议:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {qualityReport.descriptionSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {qualityReport.completenessSuggestions.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong>完整性建议:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {qualityReport.completenessSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {validationResult && (
        <div style={{ marginTop: '15px' }}>
          {validationResult.warnings.length > 0 && (
            <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '10px' }}>
              <strong>警告：</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {validationResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <Button onClick={onAnalyzeQuality}>分析质量</Button>
        <Button onClick={onValidate}>验证指令</Button>
      </div>
    </div>
  );
};

// MCP工具配置步骤
const McpToolConfigStep: React.FC<{
  formData: Record<string, any>;
  mcpTools: McpToolInfo[];
  onChange: (field: string, value: any) => void;
  onValidate: (mcpConfigId: number, toolNames: string[]) => Promise<SkillValidationResult>;
  validationResult: SkillValidationResult | null;
}> = ({ formData, mcpTools, onChange, onValidate, validationResult }) => {
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // 按MCP配置分组工具
  const toolsByConfig = mcpTools.reduce((acc, tool) => {
    if (!acc[tool.mcpConfigId]) {
      acc[tool.mcpConfigId] = [];
    }
    acc[tool.mcpConfigId].push(tool);
    return acc;
  }, {} as Record<number, McpToolInfo[]>);

  const handleConfigSelect = (configId: number) => {
    setSelectedConfigId(configId);
    setSelectedTools([]);
  };

  const handleToolToggle = (toolName: string) => {
    setSelectedTools(prev => 
      prev.includes(toolName) 
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
  };

  const handleSaveConfig = async () => {
    if (!selectedConfigId || selectedTools.length === 0) {
      alert('请选择MCP配置和至少一个工具');
      return;
    }

    const config = {
      mcpConfigId: selectedConfigId,
      tools: selectedTools.map(name => ({ name })),
      parameterMapping: {},
    };
    onChange('mcpToolConfig', JSON.stringify(config, null, 2));

    // 验证
    const result = await onValidate(selectedConfigId, selectedTools);
    if (!result.valid) {
      alert('MCP工具验证失败: ' + result.errors.join(', '));
    }
  };

  return (
    <div>
      <h3>MCP工具配置</h3>
      <p style={{ marginBottom: '15px', color: '#666' }}>
        选择可用的MCP工具。系统会自动验证工具是否可用。
      </p>

      {/* MCP配置选择 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          选择MCP服务器配置
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.keys(toolsByConfig).map(configIdStr => {
            const configId = Number(configIdStr);
            const configTools = toolsByConfig[configId];
            const configName = configTools[0]?.mcpConfigName || `配置 ${configId}`;
            return (
              <div
                key={configId}
                onClick={() => handleConfigSelect(configId)}
                style={{
                  padding: '15px',
                  border: selectedConfigId === configId ? '2px solid #4CAF50' : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: selectedConfigId === configId ? '#f0f8f0' : 'white',
                }}
              >
                <strong>{configName}</strong>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {configTools.length} 个工具
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 工具选择 */}
      {selectedConfigId && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            选择工具
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
            {toolsByConfig[selectedConfigId]?.map(tool => (
              <div
                key={tool.toolName}
                onClick={() => handleToolToggle(tool.toolName)}
                style={{
                  padding: '10px',
                  border: selectedTools.includes(tool.toolName) ? '2px solid #4CAF50' : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: selectedTools.includes(tool.toolName) ? '#f0f8f0' : 'white',
                }}
              >
                <strong>{tool.toolName}</strong>
                {tool.toolDescription && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {tool.toolDescription}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 配置预览 */}
      {formData.mcpToolConfig && (
        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            MCP工具配置（JSON）
          </label>
          <TextArea
            value={formData.mcpToolConfig}
            onChange={(e) => onChange('mcpToolConfig', e.target.value)}
            rows={8}
          />
        </div>
      )}

      {/* 验证结果 */}
      {validationResult && (
        <div style={{ marginTop: '15px' }}>
          {validationResult.errors.length > 0 && (
            <div style={{ padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '10px' }}>
              <strong>错误：</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {validationResult.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {validationResult.warnings.length > 0 && (
            <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
              <strong>警告：</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {validationResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '15px' }}>
        <Button onClick={handleSaveConfig} disabled={!selectedConfigId || selectedTools.length === 0}>
          保存并验证配置
        </Button>
      </div>
    </div>
  );
};

// 执行配置步骤（仅支持指令驱动，与 Claude Skill 一致，无需选择执行方式）
const ExecutionConfigStep: React.FC<{
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}> = ({ formData, onChange }) => {
  return (
    <div>
      <h3>执行配置</h3>
      <p style={{ color: 'var(--text-secondary, #94a3b8)', marginBottom: '16px', fontSize: '14px' }}>
        技能由 AI 按「指令编写」中的内容执行，与 Claude Skill 一致。仅当需要多步骤 workflow 时，可在下方填写执行参数。
      </p>
      <InputGroup>
        <TextArea
          label="执行参数（可选）"
          value={formData.executionConfig || ''}
          onChange={(e) => onChange('executionConfig', e.target.value)}
          placeholder='仅需多步骤时填写，例如: {"workflow": {"default": {"steps": ["step1", "step2"]}}}'
          rows={3}
        />
      </InputGroup>
    </div>
  );
};

// 资源管理步骤
const ResourcesStep: React.FC<{
  skillId: string;
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
  adminToken: string | null;
}> = ({ skillId, formData, onChange, adminToken }) => {
  const [resources, setResources] = useState<SkillResource[]>([]);
  const [selectedResourceType, setSelectedResourceType] = useState<'SCRIPT' | 'REFERENCE' | 'ASSET'>('SCRIPT');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingResource, setEditingResource] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resourceService = new SkillResourceService();

  useEffect(() => {
    if (skillId) {
      loadResources();
    }
  }, [skillId]);

  const loadResources = async () => {
    if (!skillId) return;
    
    setLoading(true);
    try {
      const data = await resourceService.getResources(skillId, undefined, adminToken);
      setResources(data);
    } catch (error: any) {
      console.error('加载资源列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !skillId) return;

    setUploading(true);
    try {
      await resourceService.uploadResource(skillId, file, selectedResourceType, undefined, adminToken);
      await loadResources();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('上传资源失败:', error);
      alert('上传资源失败: ' + (error.message || '未知错误'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId: number) => {
    if (!skillId || !confirm('确定要删除这个资源吗？')) return;

    try {
      await resourceService.deleteResource(skillId, resourceId, adminToken);
      await loadResources();
    } catch (error: any) {
      console.error('删除资源失败:', error);
      alert('删除资源失败: ' + (error.message || '未知错误'));
    }
  };

  const handleEdit = (resource: SkillResource) => {
    setEditingResource(resource.id);
    setEditDescription(resource.description || '');
  };

  const handleSaveEdit = async (resourceId: number) => {
    if (!skillId) return;

    try {
      await resourceService.updateResource(skillId, resourceId, { description: editDescription }, adminToken);
      setEditingResource(null);
      setEditDescription('');
      await loadResources();
    } catch (error: any) {
      console.error('更新资源失败:', error);
      alert('更新资源失败: ' + (error.message || '未知错误'));
    }
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
    setEditDescription('');
  };

  const filteredResources = resources.filter(r => r.resourceType === selectedResourceType);

  if (!skillId) {
    return (
      <div>
        <h3>资源管理</h3>
        <p style={{ color: '#999', marginTop: '15px' }}>
          请先填写技能ID（在"基础信息"步骤中），然后才能上传资源。
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3>资源管理（可选）</h3>
      <p style={{ marginBottom: '15px', color: '#666' }}>
        可以上传脚本、参考文档、资产文件等资源。这些资源将存储在技能资源表中。
      </p>

      {/* 资源类型切换 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <Button
          variant={selectedResourceType === 'SCRIPT' ? 'primary' : 'secondary'}
          onClick={() => setSelectedResourceType('SCRIPT')}
        >
          Scripts
        </Button>
        <Button
          variant={selectedResourceType === 'REFERENCE' ? 'primary' : 'secondary'}
          onClick={() => setSelectedResourceType('REFERENCE')}
        >
          References
        </Button>
        <Button
          variant={selectedResourceType === 'ASSET' ? 'primary' : 'secondary'}
          onClick={() => setSelectedResourceType('ASSET')}
        >
          Assets
        </Button>
      </div>

      {/* 文件上传区域 */}
      <div
        style={{
          padding: '30px',
          border: '2px dashed #666',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '20px',
          backgroundColor: '#1a1a1a',
          cursor: 'pointer',
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#4CAF50';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = '#666';
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#666';
          const file = e.dataTransfer.files[0];
          if (file && skillId) {
            setUploading(true);
            try {
              await resourceService.uploadResource(skillId, file, selectedResourceType, undefined, adminToken);
              await loadResources();
            } catch (error: any) {
              console.error('上传资源失败:', error);
              alert('上传资源失败: ' + (error.message || '未知错误'));
            } finally {
              setUploading(false);
            }
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        {uploading ? (
          <p style={{ color: '#4CAF50' }}>上传中...</p>
        ) : (
          <>
            <p style={{ color: '#999', marginBottom: '10px' }}>
              拖拽文件到此处或点击上传
            </p>
            <p style={{ color: '#666', fontSize: '12px' }}>
              {selectedResourceType === 'SCRIPT' && '支持: .py, .sh, .js, .ts, .java 等'}
              {selectedResourceType === 'REFERENCE' && '支持: .md, .txt, .json, .yaml 等'}
              {selectedResourceType === 'ASSET' && '支持: .pptx, .html, .png, .ttf 等'}
            </p>
          </>
        )}
      </div>

      {/* 资源列表 */}
      {loading ? (
        <p style={{ color: '#999' }}>加载中...</p>
      ) : filteredResources.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>暂无 {selectedResourceType} 类型的资源</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '15px', color: '#fff' }}>
            {selectedResourceType} 资源 ({filteredResources.length})
          </h4>
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              style={{
                padding: '15px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <strong style={{ color: '#fff' }}>{resource.resourceName}</strong>
                    {resource.fileSize && (
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        ({(resource.fileSize / 1024).toFixed(2)} KB)
                      </span>
                    )}
                  </div>
                  {editingResource === resource.id ? (
                    <div style={{ marginTop: '10px' }}>
                      <TextArea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="资源描述"
                        rows={2}
                      />
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <Button variant="primary" onClick={() => handleSaveEdit(resource.id)}>
                          保存
                        </Button>
                        <Button variant="secondary" onClick={handleCancelEdit}>
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {resource.description && (
                        <p style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>
                          {resource.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <Button variant="secondary" onClick={() => handleEdit(resource)}>
                          编辑描述
                        </Button>
                        <Button variant="secondary" onClick={() => handleDelete(resource.id)}>
                          删除
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 预览步骤
const PreviewStep: React.FC<{
  formData: Record<string, any>;
  validationResult: SkillValidationResult | null;
  qualityReport: SkillQualityReport | null;
  onValidate: () => void;
  onValidateEnhanced?: () => Promise<any>;
  adminToken: string | null;
}> = ({ formData, validationResult, qualityReport, onValidate, onValidateEnhanced, adminToken }) => {
  const [enhancedValidationResult, setEnhancedValidationResult] = useState<any | null>(null);
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);

  const handleEnhancedValidate = async () => {
    if (!onValidateEnhanced) return;
    
    setLoadingEnhanced(true);
    try {
      const result = await onValidateEnhanced();
      setEnhancedValidationResult(result);
    } catch (error: any) {
      console.error('增强验证失败:', error);
      alert('增强验证失败: ' + (error.message || '未知错误'));
    } finally {
      setLoadingEnhanced(false);
    }
  };
  // 深色主题下高对比度：卡片背景与文字色
  const cardStyle = { padding: '15px', backgroundColor: '#334155', borderRadius: '8px', border: '1px solid #475569', color: '#e2e8f0' };
  const headingStyle = { color: '#f1f5f9', marginBottom: '8px', fontSize: '1rem' };
  const labelStyle = { color: '#94a3b8' };

  return (
    <div style={{ color: '#e2e8f0' }}>
      <h3 style={{ color: '#f8fafc', marginBottom: '16px' }}>预览与验证</h3>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={headingStyle}>技能信息</h4>
        <div style={cardStyle}>
          <p style={{ margin: '4px 0' }}><strong style={labelStyle}>技能ID:</strong> <span style={{ color: '#f1f5f9' }}>{formData.skillId}</span></p>
          <p style={{ margin: '4px 0' }}><strong style={labelStyle}>名称:</strong> <span style={{ color: '#f1f5f9' }}>{formData.name}</span></p>
          <p style={{ margin: '4px 0' }}><strong style={labelStyle}>分类:</strong> <span style={{ color: '#f1f5f9' }}>{formData.category || '未设置'}</span></p>
          <p style={{ margin: '4px 0' }}><strong style={labelStyle}>类型:</strong> <span style={{ color: '#f1f5f9' }}>{formData.skillType}</span></p>
          <p style={{ margin: '4px 0' }}><strong style={labelStyle}>版本:</strong> <span style={{ color: '#f1f5f9' }}>{formData.version}</span></p>
        </div>
      </div>

      {formData.instruction && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={headingStyle}>指令预览</h4>
          <div style={{ ...cardStyle, whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6, color: '#cbd5e1' }}>
            {formData.instruction}
          </div>
        </div>
      )}

      {/* 质量报告 */}
      {qualityReport && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={headingStyle}>质量分析报告</h4>
          <div style={{ ...cardStyle, borderColor: '#3b82f6' }}>
            <p style={{ margin: '4px 0' }}><strong style={labelStyle}>综合评分:</strong> <span style={{ color: '#f1f5f9' }}>{qualityReport.totalScore}/100</span></p>
            <p style={{ margin: '4px 0' }}><strong style={labelStyle}>描述评分:</strong> <span style={{ color: '#f1f5f9' }}>{qualityReport.descriptionScore}/100 ({qualityReport.descriptionLevel})</span></p>
            <p style={{ margin: '4px 0' }}><strong style={labelStyle}>完整性评分:</strong> <span style={{ color: '#f1f5f9' }}>{qualityReport.completenessScore}/100</span></p>
            {qualityReport.descriptionSuggestions.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong style={labelStyle}>描述改进建议:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#cbd5e1' }}>
                  {qualityReport.descriptionSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {qualityReport.completenessSuggestions.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong style={labelStyle}>完整性建议:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#cbd5e1' }}>
                  {qualityReport.completenessSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {validationResult && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={headingStyle}>验证结果</h4>
          {validationResult.valid ? (
            <div style={{ padding: '15px', backgroundColor: '#14532d', borderRadius: '8px', color: '#bbf7d0', border: '1px solid #22c55e' }}>
              ✓ 验证通过
            </div>
          ) : (
            <div style={{ padding: '15px', backgroundColor: '#450a0a', borderRadius: '8px', color: '#fecaca', border: '1px solid #ef4444' }}>
              ✗ 验证失败
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                {validationResult.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {validationResult.warnings.length > 0 && (
            <div style={{ padding: '15px', backgroundColor: '#422006', borderRadius: '8px', marginTop: '10px', color: '#fde68a', border: '1px solid #f59e0b' }}>
              <strong>警告:</strong>
              <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                {validationResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 两种验证说明 */}
      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
        <strong style={{ color: '#cbd5e1' }}>重新验证</strong>：用当前表单数据做创建期校验（ID、描述、MCP 配置、指令格式等），不依赖是否已保存。<br />
        <strong style={{ color: '#cbd5e1' }}>执行增强验证</strong>：对<strong>已保存到库</strong>的技能做全面校验（基础 / 结构 / 质量 / 渐进式披露），需先完成创建或保存后再试。
      </p>

      {/* 增强验证 */}
      {formData.skillId && onValidateEnhanced && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={headingStyle}>增强验证</h4>
          <div style={{ marginBottom: '10px' }}>
            <Button 
              onClick={handleEnhancedValidate} 
              disabled={loadingEnhanced}
              variant="primary"
            >
              {loadingEnhanced ? '验证中...' : '执行增强验证'}
            </Button>
          </div>
          
          {enhancedValidationResult && (
            <div>
              <div style={{ 
                padding: '15px', 
                backgroundColor: enhancedValidationResult.valid ? '#14532d' : '#450a0a', 
                borderRadius: '8px',
                color: enhancedValidationResult.valid ? '#bbf7d0' : '#fecaca',
                marginBottom: '15px',
                border: enhancedValidationResult.valid ? '1px solid #22c55e' : '1px solid #ef4444'
              }}>
                <strong>{enhancedValidationResult.valid ? '✓ 增强验证通过' : '✗ 增强验证失败'}</strong>
              </div>

              {/* 基础验证 */}
              {enhancedValidationResult.basicValidation && (
                <div style={{ marginBottom: '15px', padding: '15px', ...cardStyle }}>
                  <h5 style={{ color: '#f1f5f9', marginBottom: '10px' }}>基础验证</h5>
                  <div style={{ color: enhancedValidationResult.basicValidation.passed ? '#4CAF50' : '#f44336' }}>
                    {enhancedValidationResult.basicValidation.passed ? '✓ 通过' : '✗ 失败'}
                  </div>
                  {enhancedValidationResult.basicValidation.errors.length > 0 && (
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#f44336' }}>
                      {enhancedValidationResult.basicValidation.errors.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                  {enhancedValidationResult.basicValidation.warnings.length > 0 && (
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#ff9800' }}>
                      {enhancedValidationResult.basicValidation.warnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* 结构验证 */}
              {enhancedValidationResult.structureValidation && (
                <div style={{ marginBottom: '15px', padding: '15px', ...cardStyle }}>
                  <h5 style={{ color: '#f1f5f9', marginBottom: '10px' }}>结构验证</h5>
                  <div style={{ color: enhancedValidationResult.structureValidation.passed ? '#4CAF50' : '#f44336' }}>
                    {enhancedValidationResult.structureValidation.passed ? '✓ 通过' : '✗ 失败'}
                  </div>
                  {enhancedValidationResult.structureValidation.errors.length > 0 && (
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#f44336' }}>
                      {enhancedValidationResult.structureValidation.errors.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                  {enhancedValidationResult.structureValidation.warnings.length > 0 && (
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#ff9800' }}>
                      {enhancedValidationResult.structureValidation.warnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* 质量验证 */}
              {enhancedValidationResult.qualityValidation && (
                <div style={{ marginBottom: '15px', padding: '15px', ...cardStyle }}>
                  <h5 style={{ color: '#f1f5f9', marginBottom: '10px' }}>质量验证</h5>
                  <div style={{ color: enhancedValidationResult.qualityValidation.passed ? '#4CAF50' : '#f44336' }}>
                    {enhancedValidationResult.qualityValidation.passed ? '✓ 通过' : '✗ 失败'}
                  </div>
                  {enhancedValidationResult.qualityValidation.errors.length > 0 && (
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#f44336' }}>
                      {enhancedValidationResult.qualityValidation.errors.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                  {enhancedValidationResult.qualityValidation.warnings.length > 0 && (
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#ff9800' }}>
                      {enhancedValidationResult.qualityValidation.warnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* 渐进式披露验证 */}
              {enhancedValidationResult.progressiveDisclosureValidation && (
                <div style={{ marginBottom: '15px', padding: '15px', ...cardStyle }}>
                  <h5 style={{ color: '#f1f5f9', marginBottom: '10px' }}>渐进式披露验证</h5>
                  <div style={{ color: enhancedValidationResult.progressiveDisclosureValidation.passed ? '#4CAF50' : '#f44336' }}>
                    {enhancedValidationResult.progressiveDisclosureValidation.passed ? '✓ 通过' : '✗ 失败'}
                  </div>
                  {enhancedValidationResult.progressiveDisclosureValidation.errors.length > 0 && (
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#f44336' }}>
                      {enhancedValidationResult.progressiveDisclosureValidation.errors.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                  {enhancedValidationResult.progressiveDisclosureValidation.warnings.length > 0 && (
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#ff9800' }}>
                      {enhancedValidationResult.progressiveDisclosureValidation.warnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* 所有错误和警告汇总 */}
              {(enhancedValidationResult.allErrors?.length > 0 || enhancedValidationResult.allWarnings?.length > 0) && (
                <div style={{ marginTop: '20px', padding: '15px', ...cardStyle }}>
                  <h5 style={{ color: '#f1f5f9', marginBottom: '10px' }}>汇总</h5>
                  {enhancedValidationResult.allErrors.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: '#f44336' }}>错误 ({enhancedValidationResult.allErrors.length}):</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#f44336' }}>
                        {enhancedValidationResult.allErrors.map((e: string, i: number) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {enhancedValidationResult.allWarnings.length > 0 && (
                    <div>
                      <strong style={{ color: '#ff9800' }}>警告 ({enhancedValidationResult.allWarnings.length}):</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#ff9800' }}>
                        {enhancedValidationResult.allWarnings.map((w: string, i: number) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <Button onClick={onValidate}>重新验证</Button>
      </div>
    </div>
  );
};
