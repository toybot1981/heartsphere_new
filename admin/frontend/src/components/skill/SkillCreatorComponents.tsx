import React, { useState, useRef } from 'react';
import { SkillCreatorService } from '../../services/skill/SkillCreatorService';
import { Button } from '../Button';
import { TextArea, InputGroup } from '../AdminUIComponents';

type CreationMethod = 'ai' | 'file' | 'manual' | null;

// 创建方式选择步骤
export const CreationMethodSelectionStep: React.FC<{
  onSelect: (method: CreationMethod) => void;
}> = ({ onSelect }) => {
  return (
    <div>
      <h3>选择创建方式</h3>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        请选择您希望使用的技能创建方式。我们推荐使用 AI 生成，它可以根据您的描述自动生成完整的技能定义。
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* AI生成 */}
        <div
          style={{
            padding: '30px',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9',
            transition: 'all 0.3s',
          }}
          onClick={() => onSelect('ai')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
          <h4 style={{ marginBottom: '10px', color: '#4CAF50' }}>AI 自动生成（推荐）</h4>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            输入自然语言描述，AI 将自动生成完整的技能定义，包括基础信息、指令、MCP 配置等。
          </p>
          <div style={{ fontSize: '12px', color: '#999' }}>
            ✓ 快速便捷<br />
            ✓ 自动填充所有字段<br />
            ✓ 符合规范要求
          </div>
        </div>

        {/* 文件导入 */}
        <div
          style={{
            padding: '30px',
            border: '2px solid #2196F3',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9',
            transition: 'all 0.3s',
          }}
          onClick={() => onSelect('file')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📄</div>
          <h4 style={{ marginBottom: '10px', color: '#2196F3' }}>文件导入</h4>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            上传已有的 skill.md 文件或直接粘贴 Markdown 内容，系统将自动解析并填充表单。
          </p>
          <div style={{ fontSize: '12px', color: '#999' }}>
            ✓ 支持 .md 文件<br />
            ✓ 支持文本粘贴<br />
            ✓ 自动解析 YAML 和 Markdown
          </div>
        </div>

        {/* 手动编辑 */}
        <div
          style={{
            padding: '30px',
            border: '2px solid #FF9800',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9',
            transition: 'all 0.3s',
          }}
          onClick={() => onSelect('manual')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>✏️</div>
          <h4 style={{ marginBottom: '10px', color: '#FF9800' }}>手动编辑</h4>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            使用分步骤表单手动创建技能，适合需要精细控制的场景。
          </p>
          <div style={{ fontSize: '12px', color: '#999' }}>
            ✓ 完全自定义<br />
            ✓ 分步骤填写<br />
            ✓ 详细提示和示例
          </div>
        </div>
      </div>
    </div>
  );
};

// 追加思考过程并延迟一帧，便于 UI 更新
const appendThinking = (setLog: React.Dispatch<React.SetStateAction<string[]>>, line: string) => {
  setLog((prev) => [...prev, line]);
};

// AI生成步骤：无 tab，带独立「思考过程」区域
export const AIGenerationStep: React.FC<{
  sessionId: string | null;
  adminToken: string | null;
  onComplete: (data: Record<string, any>) => void;
  onBack?: () => void;
}> = ({ sessionId, adminToken, onComplete, onBack }) => {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thinkingLog, setThinkingLog] = useState<string[]>([]);
  const thinkingEndRef = useRef<HTMLDivElement>(null);
  const creatorService = new SkillCreatorService();

  // 生成时滚动到底部
  React.useEffect(() => {
    thinkingEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thinkingLog]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('请输入技能描述');
      return;
    }
    if (!sessionId) {
      setError('会话ID不存在，请重新开始');
      return;
    }

    setGenerating(true);
    setError(null);
    setThinkingLog([]);
    console.info('[技能创建] 前端 开始AI生成:', { descriptionLength: description.length, sessionId });

    const add = (line: string) => appendThinking(setThinkingLog, line);

    add('正在分析您的描述…');
    await new Promise((r) => setTimeout(r, 300));
    add('正在调用 AI 生成技能结构…');

    try {
      const data = await creatorService.generateFromDescription(description, sessionId, adminToken);
      console.info('[技能创建] 前端 收到生成结果(完整):', JSON.stringify(data, null, 2));
      add('正在解析并填充技能字段…');
      await new Promise((r) => setTimeout(r, 200));
      add('生成完成。');
      setGeneratedData(data);
      onComplete(data);
      console.info('[技能创建] 前端 已调用 onComplete，进入单表视图');
    } catch (err: any) {
      console.error('[技能创建] 前端 AI生成失败(完整):', err?.message ?? err, JSON.stringify({ message: err?.message, stack: err?.stack }, null, 2));
      add('生成失败：' + (err.message || '未知错误'));
      setError(err.message || 'AI生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleContinue = () => {
    if (generatedData) {
      onComplete(generatedData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3>AI 一键生成</h3>
        <p style={{ marginBottom: '16px', color: 'var(--text-secondary, #666)' }}>
          请描述您想要创建的技能，AI 将根据描述生成完整的技能定义。
        </p>

        {!generatedData ? (
          <>
            <TextArea
              label="技能描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：创建一个天气查询技能，可以根据城市名称查询当前天气和未来7天的天气预报，支持中文和英文城市名称。"
              rows={6}
              style={{ marginBottom: '12px' }}
            />
            {error && (
              <div style={{ padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', color: '#721c24', marginBottom: '12px' }}>
                {error}
              </div>
            )}
            <Button onClick={handleGenerate} disabled={generating || !description.trim()}>
              {generating ? '生成中…' : 'AI 一键生成'}
            </Button>
          </>
        ) : (
          <>
            <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724', marginBottom: '16px' }}>
              ✓ 技能生成成功！可查看下方内容后继续编辑或保存。
            </div>
            <div style={{ marginBottom: '16px' }}>
              <h4>生成内容预览</h4>
              <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px', maxHeight: '320px', overflow: 'auto', border: '1px solid #e5e7eb' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#1f2937', fontSize: '13px', lineHeight: 1.5 }}>
                  {JSON.stringify(generatedData, null, 2)}
                </pre>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {onBack && (
                <Button onClick={onBack} variant="secondary">返回</Button>
              )}
              <Button onClick={handleContinue} variant="primary">继续编辑</Button>
            </div>
          </>
        )}
      </div>

      {/* 思考过程：独立区域，生成过程中显示 */}
      <div
        style={{
          marginTop: '8px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-secondary, #1e293b)',
          borderRadius: '8px',
          border: '1px solid var(--border, #334155)',
          minHeight: '120px',
          maxHeight: '220px',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', marginBottom: '8px', fontWeight: 600 }}>
          生成过程
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text, #e2e8f0)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {thinkingLog.length === 0 && !generating && (
            <span style={{ color: 'var(--text-secondary, #64748b)' }}>点击「AI 一键生成」后，此处将显示生成过程。</span>
          )}
          {thinkingLog.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          <div ref={thinkingEndRef} />
        </div>
      </div>
    </div>
  );
};

// 文件导入步骤
export const FileImportStep: React.FC<{
  sessionId: string | null;
  adminToken: string | null;
  onComplete: (data: Record<string, any>) => void;
  onBack: () => void;
}> = ({ sessionId, adminToken, onComplete, onBack }) => {
  const [importMode, setImportMode] = useState<'file' | 'paste'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedData, setImportedData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const creatorService = new SkillCreatorService();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.md')) {
        setError('只支持 .md 文件');
        return;
      }
      if (selectedFile.size > 1024 * 1024) {
        setError('文件大小不能超过1MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!sessionId) {
      setError('会话ID不存在，请重新开始');
      return;
    }

    setImporting(true);
    setError(null);
    try {
      let data: Record<string, any>;
      if (importMode === 'file') {
        if (!file) {
          setError('请选择文件');
          setImporting(false);
          return;
        }
        data = await creatorService.parseFromMdFile(file, sessionId, adminToken);
      } else {
        if (!pasteContent.trim()) {
          setError('请输入Markdown内容');
          setImporting(false);
          return;
        }
        data = await creatorService.parseFromMdContent(pasteContent, sessionId, adminToken);
      }
      setImportedData(data);
      // 导入完成后直接进入单表视图（与需求「文件导入完成后应直接进入单表视图」一致）
      onComplete(data);
    } catch (err: any) {
      setError(err.message || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleContinue = () => {
    if (importedData) {
      onComplete(importedData);
    }
  };

  return (
    <div>
      <h3>文件导入技能</h3>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        上传 skill.md 文件或直接粘贴 Markdown 内容，系统将自动解析并填充表单。
      </p>

      {/* 导入方式切换 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setImportMode('file')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: importMode === 'file' ? '2px solid #2196F3' : 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: importMode === 'file' ? '#2196F3' : '#666',
            fontWeight: importMode === 'file' ? 'bold' : 'normal',
          }}
        >
          上传文件
        </button>
        <button
          onClick={() => setImportMode('paste')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: importMode === 'paste' ? '2px solid #2196F3' : 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: importMode === 'paste' ? '#2196F3' : '#666',
            fontWeight: importMode === 'paste' ? 'bold' : 'normal',
          }}
        >
          粘贴内容
        </button>
      </div>

      {!importedData ? (
        <>
          {importMode === 'file' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '40px',
                  border: '2px dashed #2196F3',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f9f9f9',
                  marginBottom: '15px',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                <p style={{ color: '#666' }}>
                  {file ? `已选择: ${file.name}` : '点击选择 .md 文件或拖拽文件到此处'}
                </p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  支持 .md 文件，最大 1MB
                </p>
              </div>
            </div>
          ) : (
            <TextArea
              label="粘贴 Markdown 内容"
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="粘贴 skill.md 的内容，包括 YAML front matter 和 Markdown 指令部分..."
              rows={15}
              style={{ marginBottom: '15px' }}
            />
          )}

          {error && (
            <div style={{ padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', color: '#721c24', marginBottom: '15px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={onBack} variant="secondary">
              返回
            </Button>
            <Button onClick={handleImport} disabled={importing || (importMode === 'file' ? !file : !pasteContent.trim())}>
              {importing ? '导入中...' : '导入'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724', marginBottom: '20px' }}>
            ✓ 导入成功！您可以查看解析的内容，然后继续编辑或直接使用。
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>解析的内容预览：</h4>
            <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px', maxHeight: '400px', overflow: 'auto', border: '1px solid #e5e7eb' }}>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#1f2937', fontSize: '13px', lineHeight: 1.5 }}>
                {JSON.stringify(importedData, null, 2)}
              </pre>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={onBack} variant="secondary">
              返回
            </Button>
            <Button onClick={handleContinue} variant="primary">
              继续编辑
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

/** 单表视图：技能元数据 + 指令内容 + 资源列表，与生成结果/编辑页统一 */
export const SingleTableView: React.FC<{
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
  resources: Array<{ id: number; resourceType: string; resourceName: string; orderIndex?: number }>;
  onSave: () => void;
  onBack?: () => void;
  isEditMode: boolean;
  loading?: boolean;
}> = ({ formData, onChange, resources, onSave, onBack, isEditMode, loading }) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    color: '#1e293b',
    backgroundColor: '#fff',
  };
  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <h3>技能信息（单表视图）</h3>
      <p style={{ marginBottom: '15px', color: '#666' }}>
        {isEditMode ? '编辑技能主信息与指令，保存后生效。' : '查看或修改生成结果，确认后保存创建。'}
      </p>
      <div style={{ display: 'grid', gap: '12px' }}>
        <InputGroup label="技能ID *">
          <input
            type="text"
            value={formData.skillId || ''}
            onChange={(e) => onChange('skillId', e.target.value)}
            placeholder="例如: my-skill"
            disabled={isEditMode}
            style={inputStyle}
          />
        </InputGroup>
        <InputGroup label="名称 *">
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="技能显示名称"
            style={inputStyle}
          />
        </InputGroup>
        <InputGroup label="描述 *">
          <textarea
            value={formData.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="技能描述"
            rows={3}
            style={inputStyle}
          />
        </InputGroup>
        <InputGroup label="分类">
          <select
            value={formData.category || ''}
            onChange={(e) => onChange('category', e.target.value)}
            style={inputStyle}
          >
            <option value="">请选择</option>
            <option value="UTILITY">工具类</option>
            <option value="HEALTHCARE">健康医疗</option>
            <option value="EDUCATION">教育学习</option>
            <option value="SOCIAL">社交互动</option>
            <option value="CREATIVE">创作</option>
          </select>
        </InputGroup>
        <InputGroup label="技能类型">
          <select
            value={formData.skillType || 'ACTIVE'}
            onChange={(e) => onChange('skillType', e.target.value)}
            style={inputStyle}
          >
            <option value="ACTIVE">主动</option>
            <option value="PASSIVE">被动</option>
            <option value="AUTOMATIC">自动</option>
          </select>
        </InputGroup>
        <InputGroup label="指令内容（Markdown / skill_content）">
          <textarea
            value={formData.skillContent ?? formData.instruction ?? ''}
            onChange={(e) => {
              onChange('skillContent', e.target.value);
              onChange('instruction', e.target.value);
            }}
            placeholder="SKILL.md 正文或指令 Markdown"
            rows={12}
            style={{ ...inputStyle, fontFamily: 'monospace' }}
          />
        </InputGroup>
        {resources.length > 0 && (
          <InputGroup label="Bundled Resources">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>类型</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>名称</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>排序</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '6px' }}>{r.resourceType}</td>
                    <td style={{ padding: '6px' }}>{r.resourceName}</td>
                    <td style={{ padding: '6px' }}>{r.orderIndex ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </InputGroup>
        )}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
        {onBack && (
          <Button onClick={onBack} variant="secondary">
            返回
          </Button>
        )}
        <Button onClick={onSave} disabled={loading}>
          {loading ? '保存中...' : isEditMode ? '保存更新' : '保存创建'}
        </Button>
      </div>
    </div>
  );
};
