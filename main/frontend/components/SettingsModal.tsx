
import React, { useRef, useState, useEffect } from 'react';
import { AppSettings, GameState, UserProfile, DialogueStyle, AIProvider as AppAIProvider } from '../types';
import { Button } from './Button';
import { storageService } from '../services/storage';
import { showAlert, showConfirm } from '../utils/dialog';
import { constructUserAvatarPrompt } from '../utils/promptConstructors';
import { AIConfigManager } from '../services/ai/config';
import { AIMode, UserAIConfig, AIProvider } from '../services/ai/types';
import { ThemeSelector } from './ThemeSelector';

interface SettingsModalProps {
  settings: AppSettings;
  gameState: GameState; // Pass full state for backup
  onSettingsChange: (newSettings: AppSettings) => void;
  onUpdateProfile?: (profile: UserProfile) => void; // New prop for profile updates
  onClose: () => void;
  onLogout: () => void;
  onBindAccount: () => void;
  onOpenRecycleBin?: () => void; // 打开回收站
  onOpenMembership?: () => void; // 打开会员管理
}

const Toggle: React.FC<{ label: string; description: string; enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ label, description, enabled, onChange }) => (
  <div 
    className="flex justify-between items-center p-4 rounded-lg border"
    style={{
      backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 0.5))',
      borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
    }}
  >
    <div>
      <h4 
        className="font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </h4>
      <p 
        className="text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {description}
      </p>
    </div>
    <button 
      onClick={() => onChange(!enabled)} 
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
      style={{
        backgroundColor: enabled ? 'var(--color-primary, #4f46e5)' : 'var(--bg-overlay, rgba(75, 85, 99, 1))',
      }}
    >
      <span 
        className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ${enabled ? 'transform translate-x-6' : ''}`}
        style={{ backgroundColor: 'var(--text-primary)' }}
      />
    </button>
  </div>
);

const ConfigInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; placeholder: string; type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div className="flex flex-col gap-1">
        <label 
          className="text-[10px] uppercase font-bold tracking-wider"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {label}
        </label>
        <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border rounded px-3 py-2 text-xs outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary, #1e293b)',
              borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#ec4899';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
            }}
        />
    </div>
);

const ConfigSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4 last:mb-0">
        <h6 
          className="text-[10px] font-bold border-b pb-1 mb-2 uppercase tracking-widest"
          style={{
            color: 'var(--text-tertiary)',
            borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 0.5))',
          }}
        >
          {title}
        </h6>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, gameState, onSettingsChange, onUpdateProfile, onClose, onLogout, onBindAccount, onOpenRecycleBin, onOpenMembership }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [backupMsg, setBackupMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'models' | 'backup'>('general');
  const [aiConfig, setAiConfig] = useState<UserAIConfig>(AIConfigManager.getUserConfigSync());
  const [localApiKeys, setLocalApiKeys] = useState<Record<import('../services/ai/types').AIProvider, string | undefined>>(
    AIConfigManager.getLocalApiKeys()
  );
  const [loading, setLoading] = useState(false);

  // 加载AI配置
  useEffect(() => {
    const loadConfig = async () => {
      const config = await AIConfigManager.getUserConfig();
      const keys = AIConfigManager.getLocalApiKeys();
      // 确保如果没有配置，默认使用统一接入模式
      if (!config.mode || config.mode === 'local' && !localStorage.getItem('ai_service_config')) {
        // 如果localStorage中没有保存过配置，强制使用统一接入模式
        const defaultConfig = { ...config, mode: 'unified' as AIMode };
        setAiConfig(defaultConfig);
        // 保存默认配置
        await AIConfigManager.saveUserConfig(defaultConfig);
      } else {
        setAiConfig(config);
      }
      setLocalApiKeys(keys);
    };
    loadConfig();
  }, []);

  const handleExportBackup = () => {
    // We use the current in-memory state for export, which is the most up-to-date
    const data = storageService.exportBackup(gameState);
    if (!data) {
        showAlert("没有可备份的数据！", "提示", "warning");
        return;
    }
    
    // Create a Blob and trigger download
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    link.download = `HeartSphere_Backup_${date}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setBackupMsg('备份已下载到您的设备。');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Confirm before overwriting
    const confirmed = await showConfirm("警告：恢复备份将覆盖当前的日记、角色和进度。确定要继续吗？", "恢复备份", "warning");
    if (!confirmed) {
        // Reset input so change event can fire again if they choose same file later
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (content) {
            setBackupMsg('正在恢复...');
            const success = await storageService.restoreBackup(content);
            if (success) {
                showAlert("记忆核心恢复成功！系统将重新启动。", "恢复成功", "success");
                window.location.reload();
            } else {
                showAlert("恢复失败：文件格式错误或已损坏。", "恢复失败", "error");
                setBackupMsg('');
            }
        }
    };
    reader.readAsText(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!gameState.userProfile || !onUpdateProfile) return;
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateProfile({ ...gameState.userProfile!, avatarUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleGetAvatarPrompt = async () => {
      if (!gameState.userProfile) return;
      const prompt = constructUserAvatarPrompt(gameState.userProfile.nickname);
      try {
          await navigator.clipboard.writeText(prompt);
          showAlert("头像提示词已复制！", "提示", "success");
      } catch (e) {
          showAlert("复制失败: " + prompt, "错误", "error");
      }
  };

  // Helper to update specific provider config
  const updateProviderConfig = (provider: AIProvider, key: string, value: string) => {
      const configKey = provider === 'gemini' ? 'geminiConfig' : provider === 'openai' ? 'openaiConfig' : provider === 'doubao' ? 'doubaoConfig' : 'qwenConfig';
      const currentConfig = settings[configKey];
      onSettingsChange({
          ...settings,
          [configKey]: { ...currentConfig, [key]: value }
      });
  };

  const PROVIDERS: {id: AIProvider, name: string}[] = [
      { id: 'gemini', name: 'Gemini (Google)' },
      { id: 'openai', name: 'ChatGPT (OpenAI)' },
      { id: 'qwen', name: '通义千问 (Qwen)' },
      { id: 'doubao', name: '豆包 (Volcengine)' }
  ];

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.8))' }}
    >
      <div 
        className="rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--bg-card, #1e293b)',
          borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
        }}
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 
              className="text-xl font-bold text-transparent bg-clip-text"
              style={{ backgroundImage: 'var(--gradient-text)' }}
            >
            系统设置
            </h3>
            <button 
              onClick={onClose} 
              className="text-2xl"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              &times;
            </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="flex border-b mb-6 shrink-0"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
            <button 
                onClick={() => setActiveTab('general')}
                className="flex-1 pb-3 text-sm font-bold transition-colors"
                style={{
                  color: activeTab === 'general' ? '#f472b6' : 'var(--text-tertiary)',
                  borderBottom: activeTab === 'general' ? '2px solid #f472b6' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'general') {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'general') {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
            >
                通用设置
            </button>
            <button 
                onClick={() => setActiveTab('models')}
                className="flex-1 pb-3 text-sm font-bold transition-colors"
                style={{
                  color: activeTab === 'models' ? '#f472b6' : 'var(--text-tertiary)',
                  borderBottom: activeTab === 'models' ? '2px solid #f472b6' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'models') {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'models') {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
            >
                AI 模型配置
            </button>
            <button 
                onClick={() => setActiveTab('backup')}
                className="flex-1 pb-3 text-sm font-bold transition-colors"
                style={{
                  color: activeTab === 'backup' ? '#f472b6' : 'var(--text-tertiary)',
                  borderBottom: activeTab === 'backup' ? '2px solid #f472b6' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'backup') {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'backup') {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
            >
                记忆备份
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 min-h-0">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
                <div className="space-y-4">
                     {/* Account Section */}
                    <div 
                      className="p-4 rounded-lg border flex justify-between items-center mb-4"
                      style={{
                        backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 0.5))',
                        borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                      }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                                <div 
                                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden shadow-lg border-2"
                                  style={{
                                    background: 'var(--gradient-button)',
                                    borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
                                    color: 'var(--text-primary)',
                                  }}
                                >
                                    {gameState.userProfile?.avatarUrl ? (
                                        <img src={gameState.userProfile.avatarUrl} className="w-full h-full object-cover" alt="User Avatar" />
                                    ) : (
                                        gameState.userProfile?.nickname?.[0] || 'G'
                                    )}
                                </div>
                                <div 
                                  className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.6))' }}
                                >
                                    <span 
                                      className="text-xs"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                      上传
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <p 
                                  className="font-bold text-lg"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  {gameState.userProfile?.nickname || '访客'}
                                </p>
                                <p 
                                  className="text-xs"
                                  style={{ color: 'var(--text-tertiary)' }}
                                >
                                    {gameState.userProfile?.isGuest ? '访客身份 (未绑定)' : `已登录 (${gameState.userProfile?.phoneNumber || 'WeChat'})`}
                                </p>
                                <button 
                                  onClick={handleGetAvatarPrompt} 
                                  className="text-[10px] hover:underline mt-1 mr-2"
                                  style={{ color: 'var(--color-primary)' }}
                                >
                                    📋 复制 AI 头像提示词
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                             {gameState.userProfile && !gameState.userProfile.isGuest && onOpenMembership && (
                                <Button 
                                  variant="ghost" 
                                  onClick={() => { onOpenMembership(); onClose(); }} 
                                  className="text-xs border"
                                  style={{
                                    color: 'var(--color-warning)',
                                    borderColor: 'var(--border-color-overlay)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-warning-alpha)';
                                    e.currentTarget.style.color = 'var(--text-warning-light)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--color-warning)';
                                  }}
                                >
                                    💎 会员管理
                                </Button>
                             )}
                             {gameState.userProfile && !gameState.userProfile.isGuest && onOpenRecycleBin && (
                                <Button 
                                  variant="ghost" 
                                  onClick={() => { onOpenRecycleBin(); onClose(); }} 
                                  className="text-xs border"
                                  style={{
                                    color: 'var(--text-tertiary)',
                                    borderColor: 'var(--border-color-overlay)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-tertiary)';
                                  }}
                                >
                                    🗑️ 回收站
                                </Button>
                             )}
                             {gameState.userProfile?.isGuest && (
                                <Button 
                                  variant="ghost" 
                                  onClick={onBindAccount} 
                                  className="text-xs border"
                                  style={{
                                    color: 'var(--color-primary)',
                                    borderColor: 'var(--border-color-overlay)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
                                    e.currentTarget.style.color = 'var(--color-primary-light)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--color-primary)';
                                  }}
                                >
                                    绑定账号
                                </Button>
                             )}
                             <Button 
                               variant="ghost" 
                               onClick={onLogout} 
                               className="text-xs"
                               style={{ color: 'var(--color-error)' }}
                               onMouseEnter={(e) => {
                                 e.currentTarget.style.backgroundColor = 'var(--bg-error-alpha)';
                                 e.currentTarget.style.color = 'var(--text-error-light)';
                               }}
                               onMouseLeave={(e) => {
                                 e.currentTarget.style.backgroundColor = 'transparent';
                                 e.currentTarget.style.color = 'var(--color-error)';
                               }}
                             >
                                退出登录
                             </Button>
                        </div>
                    </div>


                    <Toggle 
                        label="自动生成首页形象"
                        description="开启后，进入选择页会自动为角色生成新的AI形象。关闭可节省Token。"
                        enabled={settings.autoGenerateAvatars}
                        onChange={(enabled) => onSettingsChange({ ...settings, autoGenerateAvatars: enabled })}
                    />
                    <Toggle 
                        label="自动生成故事场景"
                        description="开启后，在故事模式中会自动生成与情节匹配的背景图片。关闭可节省Token。"
                        enabled={settings.autoGenerateStoryScenes}
                        onChange={(enabled) => onSettingsChange({ ...settings, autoGenerateStoryScenes: enabled })}
                    />
                    <Toggle 
                        label="自动生成日记配图"
                        description="开启后，保存日记时会自动分析情绪并生成抽象配图。关闭可节省Token。"
                        enabled={settings.autoGenerateJournalImages}
                        onChange={(enabled) => onSettingsChange({ ...settings, autoGenerateJournalImages: enabled })}
                    />
                    <Toggle 
                        label="显示笔记同步按钮"
                        description="开启后，在日记页面显示笔记同步按钮，可以将日记同步到 Notion 等外部平台。"
                        enabled={settings.showNoteSync ?? false}
                        onChange={(enabled) => onSettingsChange({ ...settings, showNoteSync: enabled })}
                    />
                    <Toggle 
                        label="开发者调试模式"
                        description="在屏幕底部显示实时 AI 请求/响应日志。"
                        enabled={settings.debugMode}
                        onChange={(enabled) => onSettingsChange({ ...settings, debugMode: enabled })}
                    />

                    {/* 对话风格配置 */}
                    <div 
                      className="p-4 rounded-lg border space-y-2"
                      style={{
                        backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 0.5))',
                        borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                      }}
                    >
                        <label 
                          className="font-bold text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          对话风格
                        </label>
                        <p 
                          className="text-xs"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          选择 AI 角色的回复风格，影响回复长度、语气和格式。
                        </p>
                        <select 
                            value={settings.dialogueStyle || 'mobile-chat'}
                            onChange={(e) => onSettingsChange({ ...settings, dialogueStyle: e.target.value as DialogueStyle })}
                            className="w-full border rounded px-3 py-2 text-sm outline-none mt-1"
                            style={{
                              backgroundColor: 'var(--bg-secondary, #0f172a)',
                              borderColor: 'var(--bg-overlay, rgba(100, 116, 139, 1))',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#ec4899';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(100, 116, 139, 1))';
                            }}
                        >
                            <option value="mobile-chat">📱 即时网聊 (Mobile Chat)</option>
                            <option value="visual-novel">📖 沉浸小说 (Visual Novel)</option>
                            <option value="stage-script">🎭 剧本独白 (Stage Script)</option>
                            <option value="poetic">📜 诗意留白 (Poetic)</option>
                        </select>
                        <div 
                          className="mt-2 p-2 rounded text-xs"
                          style={{
                            backgroundColor: 'var(--bg-secondary, rgba(17, 24, 39, 0.5))',
                            color: 'var(--text-tertiary)',
                          }}
                        >
                            {(!settings.dialogueStyle || settings.dialogueStyle === 'mobile-chat') && (
                                <p>短句、Emoji、动作用 *action*，像微信聊天，快节奏。</p>
                            )}
                            {settings.dialogueStyle === 'visual-novel' && (
                                <p>侧重心理描写、环境渲染，辞藻优美，更有代入感，像读轻小说。</p>
                            )}
                            {settings.dialogueStyle === 'stage-script' && (
                                <p>格式严格，[动作] 台词，干脆利落，适合以此为大纲进行二次创作。</p>
                            )}
                            {settings.dialogueStyle === 'poetic' && (
                                <p>极简、隐晦、富有哲理，像《主要还是看气质》或《光遇》的风格。</p>
                            )}
                        </div>
                    </div>

                    {/* 主题选择器 */}
                    <div 
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 0.5))',
                        borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                      }}
                    >
                        <ThemeSelector />
                    </div>
                </div>
            )}

            {/* MODELS TAB */}
            {activeTab === 'models' && (
                <div className="space-y-8">
                    
                    {/* 0. AI接入模式选择 */}
                    <div 
                      className="p-5 rounded-xl border shadow-lg"
                      style={{
                        background: 'var(--gradient-card)',
                        borderColor: 'var(--border-info-alpha)',
                      }}
                    >
                        <h4 
                          className="text-sm font-bold mb-4 uppercase tracking-widest border-b pb-2"
                          style={{
                            color: 'var(--color-info)',
                            borderColor: 'var(--border-info-alpha)',
                          }}
                        >
                            AI接入模式 (AI Access Mode)
                        </h4>
                        
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <label 
                                  className="flex items-start gap-3 cursor-pointer flex-1 p-4 rounded-lg border-2 transition-all"
                                  style={{
                                    borderColor: aiConfig.mode === 'unified' ? 'var(--color-info)' : 'var(--border-color-overlay)',
                                    backgroundColor: aiConfig.mode === 'unified' ? 'var(--bg-info-alpha)' : 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (aiConfig.mode !== 'unified') {
                                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (aiConfig.mode !== 'unified') {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                  }}
                                >
                                    <input
                                        type="radio"
                                        name="aiMode"
                                        value="unified"
                                        checked={aiConfig.mode === 'unified'}
                                        onChange={async (e) => {
                                            const newConfig = { ...aiConfig, mode: 'unified' as AIMode };
                                            setAiConfig(newConfig);
                                            setLoading(true);
                                            try {
                                                await AIConfigManager.saveUserConfig(newConfig);
                                                showAlert('已切换到统一接入模式', '模式切换', 'success');
                                            } catch (error) {
                                                console.error('[SettingsModal] 模式切换失败:', error);
                                                showAlert('切换失败: ' + (error instanceof Error ? error.message : String(error)), '错误', 'error');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="mt-1 w-4 h-4"
                                        style={{
                                          accentColor: 'var(--color-info)',
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color-overlay)',
                                        }}
                                        disabled={loading}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span 
                                              className="font-bold"
                                              style={{ color: 'var(--text-primary)' }}
                                            >
                                              统一接入模式
                                            </span>
                                            <span 
                                              className="text-xs px-2 py-0.5 rounded"
                                              style={{
                                                backgroundColor: 'var(--bg-info-alpha)',
                                                color: 'var(--color-info)',
                                              }}
                                            >
                                              推荐
                                            </span>
                                        </div>
                                        <p 
                                          className="text-xs leading-relaxed"
                                          style={{ color: 'var(--text-secondary)' }}
                                        >
                                            通过后台API统一接入，费用由系统承担，无需配置API Key。
                                            所有AI请求将通过后台统一处理，支持使用量统计和配额管理。
                                        </p>
                                    </div>
                                </label>
                                
                                <label 
                                  className="flex items-start gap-3 cursor-pointer flex-1 p-4 rounded-lg border-2 transition-all"
                                  style={{
                                    borderColor: aiConfig.mode === 'local' ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                                    backgroundColor: aiConfig.mode === 'local' ? 'var(--bg-secondary-alpha)' : 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (aiConfig.mode !== 'local') {
                                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (aiConfig.mode !== 'local') {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                  }}
                                >
                                    <input
                                        type="radio"
                                        name="aiMode"
                                        value="local"
                                        checked={aiConfig.mode === 'local'}
                                        onChange={async (e) => {
                                            const newConfig = { ...aiConfig, mode: 'local' as AIMode };
                                            setAiConfig(newConfig);
                                            setLoading(true);
                                            try {
                                                await AIConfigManager.saveUserConfig(newConfig);
                                                showAlert('已切换到本地配置模式，请配置API Key', '模式切换', 'success');
                                            } catch (error) {
                                                console.error('[SettingsModal] 模式切换失败:', error);
                                                showAlert('切换失败: ' + (error instanceof Error ? error.message : String(error)), '错误', 'error');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="mt-1 w-4 h-4"
                                        style={{
                                          accentColor: 'var(--color-primary)',
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color-overlay)',
                                        }}
                                        disabled={loading}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span 
                                              className="font-bold"
                                              style={{ color: 'var(--text-primary)' }}
                                            >
                                              本地配置模式
                                            </span>
                                            <span 
                                              className="text-xs px-2 py-0.5 rounded"
                                              style={{
                                                backgroundColor: 'var(--bg-secondary-alpha)',
                                                color: 'var(--color-primary)',
                                              }}
                                            >
                                              高级
                                            </span>
                                        </div>
                                        <p 
                                          className="text-xs leading-relaxed"
                                          style={{ color: 'var(--text-secondary)' }}
                                        >
                                            直接调用模型API，需要自行申请API Key并承担费用。
                                            适合有API Key且希望直接控制AI服务的用户。
                                        </p>
                                    </div>
                                </label>
                            </div>
                            
                            {aiConfig.mode === 'unified' && (
                                <div 
                                  className="mt-4 p-3 border rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--bg-info-alpha)',
                                    borderColor: 'var(--border-info-alpha)',
                                  }}
                                >
                                    <p 
                                      className="text-sm flex items-center gap-2"
                                      style={{ color: 'var(--color-info)' }}
                                    >
                                        <span>✅</span>
                                        <span>当前使用统一接入模式，所有AI请求将通过后台API处理，无需配置API Key。</span>
                                    </p>
                                </div>
                            )}
                            
                            {aiConfig.mode === 'local' && (
                                <div 
                                  className="mt-4 p-3 border rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--bg-secondary-alpha)',
                                    borderColor: 'var(--border-color-overlay)',
                                  }}
                                >
                                    <p 
                                      className="text-sm flex items-center gap-2"
                                      style={{ color: 'var(--color-primary)' }}
                                    >
                                        <span>⚠️</span>
                                        <span>当前使用本地配置模式，请在下方配置各提供商的API Key。</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* 1. API KEY CONFIGURATION - 仅在本地模式下显示 */}
                    {aiConfig.mode === 'local' && (
                    <div className="space-y-6">
                        <h4 
                          className="text-sm font-bold border-b pb-2"
                          style={{
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color-overlay)',
                          }}
                        >
                          API 密钥 & 模型参数
                        </h4>
                        
                        {/* Gemini Config */}
                        <div 
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-overlay-alpha)',
                            borderColor: 'var(--border-color-overlay)',
                          }}
                        >
                             <h5 
                               className="text-sm font-bold mb-4 flex items-center gap-2"
                               style={{ color: 'var(--color-primary)' }}
                             >
                                <span 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: 'var(--color-primary)' }}
                                ></span>
                                Gemini (Google)
                             </h5>
                             <ConfigSection title="Authentication">
                                <ConfigInput 
                                    label="API Key" 
                                    value={localApiKeys.gemini || ''} 
                                    onChange={(v) => setLocalApiKeys({ ...localApiKeys, gemini: v })} 
                                    placeholder="sk-..." type="password" 
                                />
                             </ConfigSection>
                             <ConfigSection title="Text Generation">
                                <ConfigInput 
                                    label="Text Model Name" 
                                    value={settings.geminiConfig.modelName} 
                                    onChange={(v) => updateProviderConfig('gemini', 'modelName', v)} 
                                    placeholder="gemini-2.5-flash" 
                                />
                             </ConfigSection>
                             <ConfigSection title="Visual Generation">
                                <div className="grid grid-cols-2 gap-3">
                                    <ConfigInput 
                                        label="Image Model" 
                                        value={settings.geminiConfig.imageModel || ''} 
                                        onChange={(v) => updateProviderConfig('gemini', 'imageModel', v)} 
                                        placeholder="gemini-2.5-flash-image" 
                                    />
                                    <ConfigInput 
                                        label="Video Model" 
                                        value={settings.geminiConfig.videoModel || ''} 
                                        onChange={(v) => updateProviderConfig('gemini', 'videoModel', v)} 
                                        placeholder="veo-3.1-fast-generate-preview" 
                                    />
                                </div>
                             </ConfigSection>
                        </div>

                        {/* OpenAI Config */}
                        <div 
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-overlay-alpha)',
                            borderColor: 'var(--border-color-overlay)',
                          }}
                        >
                             <h5 
                               className="text-sm font-bold mb-4 flex items-center gap-2"
                               style={{ color: 'var(--color-success)' }}
                             >
                                <span 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: 'var(--color-success)' }}
                                ></span>
                                ChatGPT (OpenAI)
                             </h5>
                             <ConfigSection title="Authentication">
                                <ConfigInput 
                                    label="API Key" 
                                    value={localApiKeys.openai || ''} 
                                    onChange={(v) => setLocalApiKeys({ ...localApiKeys, openai: v })} 
                                    placeholder="sk-..." type="password" 
                                />
                                <ConfigInput 
                                    label="Base URL (Optional)" 
                                    value={settings.openaiConfig.baseUrl || ''} 
                                    onChange={(v) => updateProviderConfig('openai', 'baseUrl', v)} 
                                    placeholder="https://api.openai.com/v1" 
                                />
                             </ConfigSection>
                             <ConfigSection title="Text Generation">
                                <ConfigInput 
                                    label="Text Model Name" 
                                    value={settings.openaiConfig.modelName} 
                                    onChange={(v) => updateProviderConfig('openai', 'modelName', v)} 
                                    placeholder="gpt-4o" 
                                />
                             </ConfigSection>
                        </div>

                        {/* Qwen Config */}
                        <div 
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-overlay-alpha)',
                            borderColor: 'var(--border-color-overlay)',
                          }}
                        >
                             <h5 
                               className="text-sm font-bold mb-4 flex items-center gap-2"
                               style={{ color: 'var(--color-primary)' }}
                             >
                                <span 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: 'var(--color-primary)' }}
                                ></span>
                                通义千问 (Qwen)
                             </h5>
                             <ConfigSection title="Authentication">
                                <ConfigInput 
                                    label="DashScope API Key" 
                                    value={localApiKeys.qwen || ''} 
                                    onChange={(v) => setLocalApiKeys({ ...localApiKeys, qwen: v })} 
                                    placeholder="sk-..." type="password" 
                                />
                             </ConfigSection>
                             <ConfigSection title="Text Generation">
                                <ConfigInput 
                                    label="Text Model Name" 
                                    value={settings.qwenConfig.modelName} 
                                    onChange={(v) => updateProviderConfig('qwen', 'modelName', v)} 
                                    placeholder="qwen-max" 
                                />
                             </ConfigSection>
                             <ConfigSection title="Visual Generation">
                                <div className="grid grid-cols-2 gap-3">
                                    <ConfigInput 
                                        label="Image Model" 
                                        value={settings.qwenConfig.imageModel || ''} 
                                        onChange={(v) => updateProviderConfig('qwen', 'imageModel', v)} 
                                        placeholder="qwen-image-plus" 
                                    />
                                    <ConfigInput 
                                        label="Video Model" 
                                        value={settings.qwenConfig.videoModel || ''} 
                                        onChange={(v) => updateProviderConfig('qwen', 'videoModel', v)} 
                                        placeholder="wanx-video" 
                                    />
                                </div>
                             </ConfigSection>
                        </div>

                         {/* Doubao Config */}
                        <div 
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-overlay-alpha)',
                            borderColor: 'var(--border-color-overlay)',
                          }}
                        >
                             <div 
                               className="flex justify-between items-center mb-4 border-b pb-2"
                               style={{ borderColor: 'var(--border-color-overlay)' }}
                             >
                                 <h5 
                                   className="text-sm font-bold flex items-center gap-2"
                                   style={{ color: 'var(--color-info)' }}
                                 >
                                    <span 
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: 'var(--color-info)' }}
                                    ></span>
                                    豆包 (Doubao)
                                 </h5>
                                 <a 
                                   href="https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="text-[10px] flex items-center gap-1"
                                   style={{ color: 'var(--text-tertiary)' }}
                                   onMouseEnter={(e) => {
                                     e.currentTarget.style.color = 'var(--color-info)';
                                   }}
                                   onMouseLeave={(e) => {
                                     e.currentTarget.style.color = 'var(--text-tertiary)';
                                   }}
                                 >
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                     </svg>
                                     Get API Key
                                 </a>
                             </div>
                             <ConfigSection title="Authentication">
                                <ConfigInput 
                                    label="API Key" 
                                    value={localApiKeys.doubao || ''} 
                                    onChange={(v) => setLocalApiKeys({ ...localApiKeys, doubao: v })} 
                                    placeholder="xxxxxxxx-xxxx-..." type="password" 
                                />
                                <ConfigInput 
                                    label="Base URL" 
                                    value={settings.doubaoConfig.baseUrl || ''} 
                                    onChange={(v) => updateProviderConfig('doubao', 'baseUrl', v)} 
                                    placeholder="https://ark.cn-beijing.volces.com/api/v3" 
                                />
                             </ConfigSection>
                             <ConfigSection title="Text Generation">
                                <ConfigInput 
                                    label="Text Model (Endpoint ID)" 
                                    value={settings.doubaoConfig.modelName} 
                                    onChange={(v) => updateProviderConfig('doubao', 'modelName', v)} 
                                    placeholder="ep-2024..." 
                                />
                             </ConfigSection>
                             <ConfigSection title="Visual Generation">
                                <div className="grid grid-cols-2 gap-3">
                                    <ConfigInput 
                                        label="Image Model" 
                                        value={settings.doubaoConfig.imageModel || ''} 
                                        onChange={(v) => updateProviderConfig('doubao', 'imageModel', v)} 
                                        placeholder="doubao-image-v1" 
                                    />
                                    <ConfigInput 
                                        label="Video Model" 
                                        value={settings.doubaoConfig.videoModel || ''} 
                                        onChange={(v) => updateProviderConfig('doubao', 'videoModel', v)} 
                                        placeholder="doubao-video-v1" 
                                    />
                                </div>
                             </ConfigSection>
                        </div>
                        
                        {/* 保存API Keys按钮 */}
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        // 保存配置
                                        await AIConfigManager.saveUserConfig(aiConfig);
                                        // 保存API Keys
                                        AIConfigManager.saveLocalApiKeys(localApiKeys);
                                        
                                        // 同步 localApiKeys 到 settings 的各个 config 中，以便 aiService 可以读取
                                        const updatedSettings: AppSettings = {
                                            ...settings,
                                            geminiConfig: {
                                                ...settings.geminiConfig,
                                                apiKey: localApiKeys.gemini || settings.geminiConfig.apiKey
                                            },
                                            openaiConfig: {
                                                ...settings.openaiConfig,
                                                apiKey: localApiKeys.openai || settings.openaiConfig.apiKey
                                            },
                                            qwenConfig: {
                                                ...settings.qwenConfig,
                                                apiKey: localApiKeys.qwen || settings.qwenConfig.apiKey
                                            },
                                            doubaoConfig: {
                                                ...settings.doubaoConfig,
                                                apiKey: localApiKeys.doubao || settings.doubaoConfig.apiKey
                                            }
                                        };
                                        
                                        onSettingsChange(updatedSettings);
                                        showAlert('配置已保存', '成功', 'success');
                                    } catch (error) {
                                        showAlert('保存失败: ' + (error instanceof Error ? error.message : String(error)), '错误', 'error');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="px-6 py-2 transition-colors"
                                style={{
                                  background: 'var(--gradient-button)',
                                  color: 'var(--text-primary)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '0.9';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                            >
                                {loading ? '保存中...' : '保存配置'}
                            </Button>
                        </div>
                    </div>
                    )}
                    
                    {/* 统一接入模式下的提示信息 */}
                    {aiConfig.mode === 'unified' && (
                    <div className="space-y-6">
                        <div 
                          className="p-6 rounded-xl border"
                          style={{
                            backgroundColor: 'var(--bg-info-alpha)',
                            borderColor: 'var(--border-info-alpha)',
                          }}
                        >
                            <div className="text-center space-y-4">
                                <div 
                                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                                  style={{ backgroundColor: 'var(--bg-info-alpha)' }}
                                >
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      strokeWidth={1.5} 
                                      stroke="currentColor" 
                                      className="w-8 h-8"
                                      style={{ color: 'var(--color-info)' }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 
                                      className="text-lg font-bold mb-2"
                                      style={{ color: 'var(--color-info)' }}
                                    >
                                      统一接入模式已启用
                                    </h4>
                                    <p 
                                      className="text-sm leading-relaxed"
                                      style={{ color: 'var(--text-secondary)' }}
                                    >
                                        所有AI请求将通过后台API统一处理，无需额外配置。
                                        <br />
                                        系统会自动选择最优的模型提供商，费用由系统承担。
                                    </p>
                                </div>
                                <div 
                                  className="pt-4 border-t"
                                  style={{ borderColor: 'var(--border-info-alpha)' }}
                                >
                                    <p 
                                      className="text-xs"
                                      style={{ color: 'var(--text-tertiary)' }}
                                    >
                                        如需自定义配置或使用自己的API Key，请切换到"本地配置模式"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                    
                    {/* 2. ROUTING STRATEGY & FALLBACK */}
                    <div 
                      className="p-5 rounded-xl border shadow-lg"
                      style={{
                        backgroundColor: 'var(--bg-overlay-alpha)',
                        borderColor: 'var(--border-info-alpha)',
                      }}
                    >
                        <h4 
                          className="text-sm font-bold mb-4 uppercase tracking-widest border-b pb-2"
                          style={{
                            color: 'var(--color-info)',
                            borderColor: 'var(--border-info-alpha)',
                          }}
                        >
                          策略路由与容灾 (Strategy & Backup)
                        </h4>
                        
                        <div className="space-y-4 mb-6">
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              选择不同任务类型的首选模型提供商。
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label 
                                      className="block text-[10px] uppercase font-bold mb-1"
                                      style={{ color: 'var(--text-tertiary)' }}
                                    >
                                      Text Chat (对话)
                                    </label>
                                    <select 
                                        value={settings.textProvider} 
                                        onChange={(e) => onSettingsChange({...settings, textProvider: e.target.value as AppAIProvider})}
                                        className="w-full rounded px-2 py-2 text-xs outline-none"
                                        style={{
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color-overlay)',
                                          color: 'var(--text-primary)',
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--color-info)';
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                                        }}
                                    >
                                        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label 
                                      className="block text-[10px] uppercase font-bold mb-1"
                                      style={{ color: 'var(--text-tertiary)' }}
                                    >
                                      Image Gen (绘图)
                                    </label>
                                    <select 
                                        value={settings.imageProvider} 
                                        onChange={(e) => onSettingsChange({...settings, imageProvider: e.target.value as AppAIProvider})}
                                        className="w-full rounded px-2 py-2 text-xs outline-none"
                                        style={{
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color-overlay)',
                                          color: 'var(--text-primary)',
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--color-info)';
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                                        }}
                                    >
                                        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label 
                                      className="block text-[10px] uppercase font-bold mb-1"
                                      style={{ color: 'var(--text-tertiary)' }}
                                    >
                                      Video Gen (视频)
                                    </label>
                                    <select 
                                        value={settings.videoProvider} 
                                        onChange={(e) => onSettingsChange({...settings, videoProvider: e.target.value as AppAIProvider})}
                                        className="w-full rounded px-2 py-2 text-xs outline-none"
                                        style={{
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color-overlay)',
                                          color: 'var(--text-primary)',
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--color-info)';
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                                        }}
                                    >
                                        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label 
                                      className="block text-[10px] uppercase font-bold mb-1"
                                      style={{ color: 'var(--text-tertiary)' }}
                                    >
                                      Speech/TTS (语音)
                                    </label>
                                    <select 
                                        value={settings.audioProvider} 
                                        onChange={(e) => onSettingsChange({...settings, audioProvider: e.target.value as AppAIProvider})}
                                        className="w-full rounded px-2 py-2 text-xs outline-none"
                                        style={{
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color-overlay)',
                                          color: 'var(--text-primary)',
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--color-info)';
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                                        }}
                                    >
                                        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                    </div>

                    <Toggle
                            label="自动降级 (Auto Fallback)" 
                            description="如果首选模型调用失败（如配额耗尽），自动尝试其他已配置的提供商。"
                            enabled={settings.enableFallback}
                            onChange={(enabled) => onSettingsChange({ ...settings, enableFallback: enabled })}
                        />
                    </div>
                </div>
            )}

            {/* BACKUP TAB */}
            {activeTab === 'backup' && (
                <div className="space-y-6 text-center py-8">
                    <div 
                      className="p-6 rounded-2xl border"
                      style={{
                        backgroundColor: 'var(--bg-overlay-alpha)',
                        borderColor: 'var(--border-color-overlay)',
                      }}
                    >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                            <span className="text-2xl">💾</span>
                        </div>
                        <h4 
                          className="text-lg font-bold mb-2"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          导出记忆核心
                        </h4>
                        <p 
                          className="text-sm mb-6"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          将您的所有角色、日记和进度保存为本地文件。
                        </p>
                        <Button 
                          onClick={handleExportBackup} 
                          fullWidth 
                          style={{ background: 'var(--gradient-primary-button)' }}
                        >
                          下载备份文件 (.json)
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div 
                              className="w-full border-t"
                              style={{ borderColor: 'var(--border-color-overlay)' }}
                            ></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span 
                              className="px-2 text-xs uppercase"
                              style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-tertiary)',
                              }}
                            >
                              OR
                            </span>
                        </div>
                    </div>

                    <div 
                      className="p-6 rounded-2xl border"
                      style={{
                        backgroundColor: 'var(--bg-overlay-alpha)',
                        borderColor: 'var(--border-color-overlay)',
                      }}
                    >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                            <span className="text-2xl">♻️</span>
                        </div>
                        <h4 
                          className="text-lg font-bold mb-2"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          恢复记忆核心
                        </h4>
                        <p 
                          className="text-sm mb-6"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          从备份文件恢复数据。警告：这将覆盖当前进度。
                        </p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                        <Button 
                          onClick={handleImportClick} 
                          variant="secondary" 
                          fullWidth
                          style={{ borderColor: 'var(--border-color-overlay)' }}
                        >
                            选择备份文件...
                        </Button>
                    </div>
                    
                    {backupMsg && (
                      <p 
                        className="text-sm font-bold animate-pulse"
                        style={{ color: 'var(--color-success)' }}
                      >
                        {backupMsg}
                      </p>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};