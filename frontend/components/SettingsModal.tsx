
import React, { useRef, useState, useEffect } from 'react';
import { AppSettings, GameState, AIProvider, UserProfile, DialogueStyle } from '../types';
import { Button } from './Button';
import { storageService } from '../services/storage';
import { showAlert, showConfirm } from '../utils/dialog';
import { constructUserAvatarPrompt } from '../utils/promptConstructors';
import { AIConfigManager } from '../services/ai/config';
import { AIMode, UserAIConfig } from '../services/ai/types';

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
  <div className="flex justify-between items-center p-4 rounded-lg bg-gray-800/50 border border-gray-700">
    <div>
      <h4 className="font-bold text-white">{label}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
    <button onClick={() => onChange(!enabled)} className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-indigo-600' : 'bg-gray-600'}`}>
      <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${enabled ? 'transform translate-x-6' : ''}`} />
    </button>
  </div>
);

const ConfigInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; placeholder: string; type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500">{label}</label>
        <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs text-white focus:border-pink-500 outline-none transition-colors"
        />
    </div>
);

const ConfigSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4 last:mb-0">
        <h6 className="text-[10px] font-bold text-gray-400 border-b border-gray-700/50 pb-1 mb-2 uppercase tracking-widest">{title}</h6>
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
  const [localApiKeys, setLocalApiKeys] = useState<Record<AIProvider, string | undefined>>(
    AIConfigManager.getLocalApiKeys()
  );
  const [loading, setLoading] = useState(false);

  // 加载AI配置
  useEffect(() => {
    const loadConfig = async () => {
      const config = await AIConfigManager.getUserConfig();
      const keys = AIConfigManager.getLocalApiKeys();
      setAiConfig(config);
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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
            系统设置
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6 shrink-0">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'general' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-500 hover:text-white'}`}
            >
                通用设置
            </button>
            <button 
                onClick={() => setActiveTab('models')}
                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'models' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-500 hover:text-white'}`}
            >
                AI 模型配置
            </button>
            <button 
                onClick={() => setActiveTab('backup')}
                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'backup' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-500 hover:text-white'}`}
            >
                记忆备份
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 min-h-0">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
                <div className="space-y-4">
                     {/* Account Section */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg border-2 border-white/20">
                                    {gameState.userProfile?.avatarUrl ? (
                                        <img src={gameState.userProfile.avatarUrl} className="w-full h-full object-cover" alt="User Avatar" />
                                    ) : (
                                        gameState.userProfile?.nickname?.[0] || 'G'
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs">上传</span>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-white font-bold text-lg">{gameState.userProfile?.nickname || '访客'}</p>
                                <p className="text-xs text-gray-400">
                                    {gameState.userProfile?.isGuest ? '访客身份 (未绑定)' : `已登录 (${gameState.userProfile?.phoneNumber || 'WeChat'})`}
                                </p>
                                <button onClick={handleGetAvatarPrompt} className="text-[10px] text-pink-400 hover:underline mt-1 mr-2">
                                    📋 复制 AI 头像提示词
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                             {gameState.userProfile && !gameState.userProfile.isGuest && onOpenMembership && (
                                <Button variant="ghost" onClick={() => { onOpenMembership(); onClose(); }} className="text-xs text-yellow-400 hover:bg-yellow-900/20 hover:text-yellow-300 border border-yellow-500/30">
                                    💎 会员管理
                                </Button>
                             )}
                             {gameState.userProfile && !gameState.userProfile.isGuest && onOpenRecycleBin && (
                                <Button variant="ghost" onClick={() => { onOpenRecycleBin(); onClose(); }} className="text-xs text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-slate-700">
                                    🗑️ 回收站
                                </Button>
                             )}
                             {gameState.userProfile?.isGuest && (
                                <Button variant="ghost" onClick={onBindAccount} className="text-xs text-pink-400 hover:bg-pink-900/20 hover:text-pink-300 border border-pink-500/30">
                                    绑定账号
                                </Button>
                             )}
                             <Button variant="ghost" onClick={onLogout} className="text-xs text-red-400 hover:bg-red-900/20 hover:text-red-300">
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
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-2">
                        <label className="font-bold text-white text-sm">对话风格</label>
                        <p className="text-xs text-gray-400">选择 AI 角色的回复风格，影响回复长度、语气和格式。</p>
                        <select 
                            value={settings.dialogueStyle || 'mobile-chat'}
                            onChange={(e) => onSettingsChange({ ...settings, dialogueStyle: e.target.value as DialogueStyle })}
                            className="w-full bg-gray-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-pink-500 outline-none mt-1"
                        >
                            <option value="mobile-chat">📱 即时网聊 (Mobile Chat)</option>
                            <option value="visual-novel">📖 沉浸小说 (Visual Novel)</option>
                            <option value="stage-script">🎭 剧本独白 (Stage Script)</option>
                            <option value="poetic">📜 诗意留白 (Poetic)</option>
                        </select>
                        <div className="mt-2 p-2 bg-gray-900/50 rounded text-xs text-gray-400">
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
                </div>
            )}

            {/* MODELS TAB */}
            {activeTab === 'models' && (
                <div className="space-y-8">
                    
                    {/* 0. AI接入模式选择 */}
                    <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-5 rounded-xl border border-indigo-500/30 shadow-lg">
                        <h4 className="text-sm font-bold text-indigo-300 mb-4 uppercase tracking-widest border-b border-indigo-500/20 pb-2">
                            AI接入模式 (AI Access Mode)
                        </h4>
                        
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <label className="flex items-start gap-3 cursor-pointer flex-1 p-4 rounded-lg border-2 transition-all hover:bg-indigo-900/20"
                                    style={{
                                        borderColor: aiConfig.mode === 'unified' ? 'rgb(99, 102, 241)' : 'rgb(55, 65, 81)',
                                        backgroundColor: aiConfig.mode === 'unified' ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
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
                                                showAlert('切换失败: ' + (error instanceof Error ? error.message : String(error)), '错误', 'error');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="mt-1 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                                        disabled={loading}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-bold">统一接入模式</span>
                                            <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">推荐</span>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            通过后台API统一接入，费用由系统承担，无需配置API Key。
                                            所有AI请求将通过后台统一处理，支持使用量统计和配额管理。
                                        </p>
                                    </div>
                                </label>
                                
                                <label className="flex items-start gap-3 cursor-pointer flex-1 p-4 rounded-lg border-2 transition-all hover:bg-purple-900/20"
                                    style={{
                                        borderColor: aiConfig.mode === 'local' ? 'rgb(168, 85, 247)' : 'rgb(55, 65, 81)',
                                        backgroundColor: aiConfig.mode === 'local' ? 'rgba(168, 85, 247, 0.1)' : 'transparent'
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
                                                showAlert('切换失败: ' + (error instanceof Error ? error.message : String(error)), '错误', 'error');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="mt-1 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                                        disabled={loading}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-bold">本地配置模式</span>
                                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">高级</span>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            直接调用模型API，需要自行申请API Key并承担费用。
                                            适合有API Key且希望直接控制AI服务的用户。
                                        </p>
                                    </div>
                                </label>
                            </div>
                            
                            {aiConfig.mode === 'unified' && (
                                <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-700/50 rounded-lg">
                                    <p className="text-sm text-indigo-300 flex items-center gap-2">
                                        <span>✅</span>
                                        <span>当前使用统一接入模式，所有AI请求将通过后台API处理，无需配置API Key。</span>
                                    </p>
                                </div>
                            )}
                            
                            {aiConfig.mode === 'local' && (
                                <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                                    <p className="text-sm text-purple-300 flex items-center gap-2">
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
                        <h4 className="text-sm font-bold text-gray-300 border-b border-gray-700 pb-2">API 密钥 & 模型参数</h4>
                        
                        {/* Gemini Config */}
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                             <h5 className="text-sm font-bold text-pink-400 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
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
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                             <h5 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
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
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                             <h5 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
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
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                             <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                                 <h5 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    豆包 (Doubao)
                                 </h5>
                                 <a href="https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-500 hover:text-blue-300 flex items-center gap-1">
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
                                        
                                        // 同步 localApiKeys 到 settings 的各个 config 中，以便 geminiService 可以读取
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
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {loading ? '保存中...' : '保存配置'}
                            </Button>
                        </div>
                    </div>
                    )}
                    
                    {/* 统一接入模式下的提示信息 */}
                    {aiConfig.mode === 'unified' && (
                    <div className="space-y-6">
                        <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-700/50">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-indigo-300 mb-2">统一接入模式已启用</h4>
                                    <p className="text-sm text-indigo-200/80 leading-relaxed">
                                        所有AI请求将通过后台API统一处理，无需额外配置。
                                        <br />
                                        系统会自动选择最优的模型提供商，费用由系统承担。
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-indigo-700/50">
                                    <p className="text-xs text-indigo-300/60">
                                        如需自定义配置或使用自己的API Key，请切换到"本地配置模式"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                    
                    {/* 2. ROUTING STRATEGY & FALLBACK */}
                    <div className="bg-gray-800/80 p-5 rounded-xl border border-indigo-500/30 shadow-lg">
                        <h4 className="text-sm font-bold text-indigo-300 mb-4 uppercase tracking-widest border-b border-indigo-500/20 pb-2">
                           策略路由与容灾 (Strategy & Backup)
                        </h4>
                        
                        <div className="space-y-4 mb-6">
                            <p className="text-xs text-gray-400">选择不同任务类型的首选模型提供商。</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Text Chat (对话)</label>
                                    <select 
                                        value={settings.textProvider} 
                                        onChange={(e) => onSettingsChange({...settings, textProvider: e.target.value as AIProvider})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                                    >
                                        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Image Gen (绘图)</label>
                                    <select 
                                        value={settings.imageProvider} 
                                        onChange={(e) => onSettingsChange({...settings, imageProvider: e.target.value as AIProvider})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                                    >
                                        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Video Gen (视频)</label>
                                    <select 
                                        value={settings.videoProvider} 
                                        onChange={(e) => onSettingsChange({...settings, videoProvider: e.target.value as AIProvider})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                                    >
                                        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Speech/TTS (语音)</label>
                                    <select 
                                        value={settings.audioProvider} 
                                        onChange={(e) => onSettingsChange({...settings, audioProvider: e.target.value as AIProvider})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-xs text-white focus:border-indigo-500 outline-none"
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
                    <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">💾</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">导出记忆核心</h4>
                        <p className="text-sm text-gray-400 mb-6">将您的所有角色、日记和进度保存为本地文件。</p>
                        <Button onClick={handleExportBackup} fullWidth className="bg-gradient-to-r from-pink-600 to-purple-600">
                            下载备份文件 (.json)
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-800 px-2 text-xs text-gray-500 uppercase">OR</span>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">♻️</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">恢复记忆核心</h4>
                        <p className="text-sm text-gray-400 mb-6">从备份文件恢复数据。警告：这将覆盖当前进度。</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                        <Button onClick={handleImportClick} variant="secondary" fullWidth className="border-gray-600">
                            选择备份文件...
                        </Button>
                    </div>
                    
                    {backupMsg && <p className="text-green-400 text-sm font-bold animate-pulse">{backupMsg}</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};